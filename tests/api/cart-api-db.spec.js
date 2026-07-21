import { test, expect } from '@playwright/test';
import { queryDB } from '../../utils/db.js';
import { registerUser } from '../helpers/registerUser.js';

test('registered user should add product to cart through API and database should store cart item', async ({ page }) => {
  const { customerId } = await registerUser(page);

  const productRows = await queryDB(
    `SELECT product_id
     FROM oc_product_description
     WHERE name = ?`,
    ['MacBook']
  );

  expect(productRows.length).toBeGreaterThan(0);

  const productId = productRows[0].product_id;

  const apiResponse = await page.request.post(
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

  expect(apiResponse.status()).toBe(200);

  const responseBody = await apiResponse.text();

  expect(responseBody).toContain('success');

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
    `SELECT cart_id, customer_id, product_id, quantity
     FROM oc_cart
     WHERE customer_id = ? AND product_id = ?`,
    [customerId, productId]
  );

  expect(cartRows[0].customer_id).toBe(customerId);
  expect(cartRows[0].product_id).toBe(productId);
  expect(cartRows[0].quantity).toBe(1);

  console.log('CART DB ROW:', cartRows[0]);
});