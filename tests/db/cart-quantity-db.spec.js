import { test, expect } from '@playwright/test';
import { queryDB } from '../../utils/db.js';
import { registerUser } from '../helpers/registerUser.js';

test('registered user should update cart quantity and database should store updated quantity', async ({ page }) => {
  const { customerId } = await registerUser(page);

  await page.goto(
    'http://localhost:8080/index.php?route=product/product&language=en-gb&product_id=43'
  );

  await page.getByRole('button', { name: 'Add to Cart' }).click();

  await page.goto(
    'http://localhost:8080/index.php?route=checkout/cart&language=en-gb'
  );

  await expect(page.locator('input[name="quantity"]')).toBeVisible();

  await page.locator('input[name="quantity"]').fill('2');

  await page.getByRole('button', { name: 'Update' }).click();

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
        `SELECT quantity
         FROM oc_cart
         WHERE customer_id = ? AND product_id = ?`,
        [customerId, productId]
      );

      return rows[0]?.quantity;
    })
    .toBe(2);

  const cartRows = await queryDB(
    `SELECT cart_id, customer_id, product_id, quantity
     FROM oc_cart
     WHERE customer_id = ? AND product_id = ?`,
    [customerId, productId]
  );

  expect(cartRows.length).toBeGreaterThan(0);
  expect(cartRows[0].customer_id).toBe(customerId);
  expect(cartRows[0].product_id).toBe(productId);
  expect(cartRows[0].quantity).toBe(2);

  console.log('UPDATED CART DB ROW:', cartRows[0]);
});