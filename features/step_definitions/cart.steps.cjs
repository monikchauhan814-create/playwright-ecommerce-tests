const { Given, When, Then, After } = require('@cucumber/cucumber');
const { request, expect } = require('@playwright/test');
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

After(async function () {
  if (this.api) {
    await this.api.dispose();
  }
});
