import { test, expect } from '@playwright/test';
import { queryDB } from '../../utils/db.js';
import { registerUser } from '../helpers/registerUser.js';

test('registered user should add product to cart and database should store cart item', async ({ page }) => {
  const { customerId } = await registerUser(page);

  await page.goto(
    'http://localhost:8080/index.php?route=product/product&language=en-gb&product_id=43'
  );

  await page.getByRole('button', { name: 'Add to Cart' }).click();

  const productRows = await queryDB(
    `SELECT product_id
     FROM oc_product_description
     WHERE name = ?`,
    ['MacBook']
  );

  expect(productRows.length).toBeGreaterThan(0);

  const productId = productRows[0].product_id;

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