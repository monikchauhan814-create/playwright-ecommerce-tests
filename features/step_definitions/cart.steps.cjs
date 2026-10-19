const { Given, When, Then, After, setDefaultTimeout } = require('@cucumber/cucumber');
setDefaultTimeout(30000);
const { request, expect, chromium } = require('@playwright/test');
const Ajv = require('ajv');

Given('the OpenCart storefront is available', async function () {
  this.api = await request.newContext({
    baseURL: 'http://localhost:8080'
  });

  const response = await this.api.get('/');
  expect(response.ok()).toBeTruthy();
});

When('I add product {int} to the cart through the API', async function (productId) {
  this.response = await this.api.post(
    '/index.php?route=checkout/cart%7Cadd&language=en-gb',
    {
      form: {
        product_id: productId,
        quantity: 1
      },
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    }
  );
});

Then('the cart API should confirm the product was added', async function () {
  expect(this.response.status()).toBe(200);

  const body = await this.response.json();

  const schema = {
    type: 'object',
    required: ['success'],
    properties: {
      success: { type: 'string', minLength: 1 },
      total: { type: 'string' }
    },
    additionalProperties: true
  };

  const validate = new Ajv().compile(schema);

  expect(validate(body), JSON.stringify(validate.errors)).toBe(true);
  expect(body.success).toContain('You have added');
});



// Registered-customer API + MySQL acceptance tests.

async function dbRows(sql, params) {
  const module = await import('../../utils/db.js');
  const queryDB = module.queryDB || module.default?.queryDB;
  const result = await queryDB(sql, params);
  return Array.isArray(result[0]) ? result[0] : result;
}

async function cartRows(world) {
  return dbRows(
    `SELECT cart_id, quantity
     FROM oc_cart
     WHERE customer_id = ? AND product_id = ?`,
    [world.bddCustomerId, world.bddProductId]
  );
}

Given('I am a registered OpenCart customer for product {int}',
  async function (productId) {
    this.bddProductId = productId;
    this.standaloneApi = this.api;

    this.browser = await chromium.launch({ headless: true });
    this.context = await this.browser.newContext({
      baseURL: 'http://localhost:8080'
    });

    this.page = await this.context.newPage();

    await this.page.goto(
      '/index.php?route=account/register&language=en-gb'
    );

    const cookies = await this.context.cookies();
    const session = cookies.find(c => c.name === 'OCSESSID');
    if (!session) throw new Error('OCSESSID not found');

    await this.context.clearCookies();

    await this.context.addCookies([
      {
        name: 'OCSESSID',
        value: session.value,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false,
        sameSite: 'Strict'
      },
      {
        name: 'currency',
        value: 'USD',
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false,
        sameSite: 'Lax'
      }
    ]);

    await this.page.reload();

    this.bddEmail =
      `bdd${Date.now()}${Math.random().toString(36).slice(2, 8)}@mail.com`;

    await this.page.locator('#input-firstname').fill('BDD');
    await this.page.locator('#input-lastname').fill('Tester');
    await this.page.locator('#input-email').fill(this.bddEmail);
    await this.page.locator('#input-password').fill('Test12345!');
    await this.page.locator("input[name='agree']").check();

    await this.page.getByRole('button', { name: 'Continue' }).click();

    await this.page.waitForURL(/route=account\/success/, {
      timeout: 15000
    });

    await expect.poll(async () => {
      const rows = await dbRows(
        'SELECT customer_id FROM oc_customer WHERE email = ?',
        [this.bddEmail]
      );
      return rows.length;
    }, { timeout: 15000 }).toBe(1);

    const customers = await dbRows(
      'SELECT customer_id FROM oc_customer WHERE email = ?',
      [this.bddEmail]
    );

    this.bddCustomerId = customers[0].customer_id;

    // Share the browser's authenticated cookies with API requests.
    this.api = this.context.request;
  }
);

Then('MySQL should store quantity {int} for my cart product',
  async function (quantity) {
    await expect.poll(async () => {
      const rows = await cartRows(this);
      return rows.length ? Number(rows[0].quantity) : null;
    }, { timeout: 10000 }).toBe(quantity);
  }
);

When('I update my cart product to quantity {int} through the API',
  async function (quantity) {
    const rows = await cartRows(this);
    expect(rows).toHaveLength(1);

    this.response = await this.api.post(
      '/index.php?route=checkout/cart%7Cedit&language=en-gb',
      {
        form: { key: rows[0].cart_id, quantity },
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      }
    );
  }
);

Then('the cart API should confirm the quantity was updated',
  async function () {
    expect(this.response.status()).toBe(200);

    const body = await this.response.text();

    expect(
      body.includes('modified your shopping cart') ||
      body.includes('"redirect"')
    ).toBe(true);
  }
);

When('I remove my cart product through the API',
  async function () {
    const rows = await cartRows(this);
    expect(rows).toHaveLength(1);

    this.response = await this.api.post(
      '/index.php?route=checkout/cart%7Cremove&language=en-gb',
      {
        form: { key: rows[0].cart_id },
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      }
    );
  }
);

Then('the cart API should confirm the product was removed',
  async function () {
    expect(this.response.status()).toBe(200);
    expect(await this.response.text()).toContain('redirect');
  }
);

Then('MySQL should have no row for my cart product',
  async function () {
    await expect.poll(async () => {
      return (await cartRows(this)).length;
    }, { timeout: 10000 }).toBe(0);
  }
);

After(async function () {
  try {
    let customerId = this.bddCustomerId;

    if (!customerId && this.bddEmail) {
      const rows = await dbRows(
        'SELECT customer_id FROM oc_customer WHERE email = ?',
        [this.bddEmail]
      );
      customerId = rows[0]?.customer_id;
    }

    if (customerId) {
      await dbRows(
        'DELETE FROM oc_cart WHERE customer_id = ?',
        [customerId]
      );

      await dbRows(
        'DELETE FROM oc_customer WHERE customer_id = ?',
        [customerId]
      );
    }
  } finally {
    if (this.context) await this.context.close();
    if (this.browser) await this.browser.close();

    if (this.standaloneApi) {
      await this.standaloneApi.dispose();
    } else if (this.api && !this.context) {
      await this.api.dispose();
    }
  }
});
