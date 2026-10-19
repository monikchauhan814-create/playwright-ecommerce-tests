import { getProductIdByName, expectCartItemPersisted } from '../helpers/cartDbAssertions';
import { queryRows } from '../../utils/dbTyped';
import { cleanupTestCustomer } from '../helpers/cleanupTestCustomer';
import type { QuantityRow, CartDetailsRow } from '../helpers/cartQueryTypes';
import { test, expect } from '@playwright/test';
import { queryDB } from '../../utils/db.js';
import { registerUser } from '../helpers/registerUser.ts';

test('registered user should update cart quantity through API and database should store updated quantity', async ({ page }) => {
  const { customerId } = await registerUser(page);
  try {

  const productId = await getProductIdByName('MacBook');

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

  await expectCartItemPersisted(customerId, productId);

  let cartRows = await queryRows<CartDetailsRow>(
    `SELECT cart_id, customer_id, product_id, quantity
     FROM oc_cart
     WHERE customer_id = ? AND product_id = ?`,
    [customerId, productId]
  );

  const cartId = cartRows[0].cart_id;

  const updateResponse = await page.request.post(
    'http://localhost:8080/index.php?route=checkout/cart|edit&language=en-gb',
    {
      form: {
        key: cartId,
        quantity: 2,
      },
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
    }
  );

  expect(updateResponse.status()).toBe(200);

  const responseBody = await updateResponse.text();

  expect(responseBody).toContain('modified your shopping cart');

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

  cartRows = await queryRows<CartDetailsRow>(
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
