import { getProductIdByName } from '../helpers/cartDbAssertions';
import { queryRows } from '../../utils/dbTyped';
import { cleanupTestCustomer } from '../helpers/cleanupTestCustomer';
import type { CartIdRow, QuantityRow, CartDetailsRow } from '../helpers/cartQueryTypes';
import { OpenCartProductPage } from '../../pages/OpenCartProductPage';
import { OpenCartCartPage } from '../../pages/OpenCartCartPage';
import { test, expect } from '@playwright/test';
import { queryDB } from '../../utils/db.js';
import { registerUser } from '../helpers/registerUser.ts';

test('registered user should update cart quantity and database should store updated quantity', async ({ page }) => {
  const { customerId } = await registerUser(page);
  try {

  const productPage = new OpenCartProductPage(page);
  await productPage.openMacBook();
  await productPage.addToCart();

  // Wait until the cart addition is persisted in MySQL
  await expect.poll(async () => {
    const rows = await queryRows<CartIdRow>(
      `SELECT cart_id
       FROM oc_cart
       WHERE customer_id = ? AND product_id = ?`,
      [customerId, 43]
    );
    return rows.length;
  }, {
    timeout: 15000,
    intervals: [250, 500, 1000]
  }).toBeGreaterThan(0);

  const cartPage = new OpenCartCartPage(page);
  await cartPage.open();

  await cartPage.updateQuantity(2);

  const productId = await getProductIdByName('MacBook');

  await expect
    .poll(async () => {
      const rows = await queryRows<QuantityRow>(
        `SELECT quantity
         FROM oc_cart
         WHERE customer_id = ? AND product_id = ?`,
        [customerId, productId]
      );

      return rows[0]?.quantity;
    })
    .toBe(2);

  const cartRows = await queryRows<CartDetailsRow>(
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
  } finally {
    await cleanupTestCustomer(customerId);
  }
});
