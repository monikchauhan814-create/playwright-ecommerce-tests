import { test, expect } from '@playwright/test';
import { queryDB } from '../../utils/db.js';
import { registerUser } from '../helpers/registerUser.js';

test('registered user should remove cart item through API and database should delete the cart row', async ({ page }) => {
  const { customerId } = await registerUser(page);

  const productRows = await queryDB(
    `SELECT product_id
     FROM oc_product_description
     WHERE name = ?`,
    ['MacBook']
  );

  expect(productRows.length).toBeGreaterThan(0);

  const productId = productRows[0].product_id;

  const addResponse = await page.request.post(
    'http://localhost:8080/index.php?route=checkout/cart|add&language=en-gb',
    {
      form: {
        product_id: productId,
        quantity: 1,
      },
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
    }
  );

  expect(addResponse.status()).toBe(200);

  await expect
    .poll(async () => {
      const rows = await queryDB(
        `SELECT cart_id
         FROM oc_cart
         WHERE customer_id = ? AND product_id = ?`,
        [customerId, productId]
      );

      return rows.length;
    })
    .toBeGreaterThan(0);

  const cartRows = await queryDB(
    `SELECT cart_id
     FROM oc_cart
     WHERE customer_id = ? AND product_id = ?`,
    [customerId, productId]
  );

  const cartId = cartRows[0].cart_id;

  const removeResponse = await page.request.post(
    'http://localhost:8080/index.php?route=checkout/cart|remove&language=en-gb',
    {
      form: {
        key: cartId,
      },
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
    }
  );

  expect(removeResponse.status()).toBe(200);

  const responseBody = await removeResponse.text();

  expect(responseBody).toContain('redirect');

  await expect
    .poll(async () => {
      const rows = await queryDB(
        `SELECT cart_id
         FROM oc_cart
         WHERE customer_id = ? AND product_id = ?`,
        [customerId, productId]
      );

      return rows.length;
    })
    .toBe(0);

  const removedRows = await queryDB(
    `SELECT cart_id
     FROM oc_cart
     WHERE customer_id = ? AND product_id = ?`,
    [customerId, productId]
  );

  expect(removedRows.length).toBe(0);

  console.log('CART ITEM REMOVED FROM DB');
});