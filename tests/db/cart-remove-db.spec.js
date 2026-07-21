import { test, expect } from '@playwright/test';
import { queryDB } from '../../utils/db.js';
import { registerUser } from '../helpers/registerUser.js';

test('registered user should remove product from cart and database should delete the cart row', async ({ page }) => {
  const { customerId } = await registerUser(page);

  await page.goto(
    'http://localhost:8080/index.php?route=product/product&language=en-gb&product_id=43'
  );

  await page.getByRole('button', { name: 'Add to Cart' }).click();

  await page.goto(
    'http://localhost:8080/index.php?route=checkout/cart&language=en-gb'
  );

  await expect(page.getByRole('button', { name: 'Remove' })).toBeVisible();

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

  await page.getByRole('button', { name: 'Remove' }).click();

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

  const cartRows = await queryDB(
    `SELECT cart_id
     FROM oc_cart
     WHERE customer_id = ? AND product_id = ?`,
    [customerId, productId]
  );

  expect(cartRows.length).toBe(0);

  console.log('CART ITEM REMOVED FROM DB');
});