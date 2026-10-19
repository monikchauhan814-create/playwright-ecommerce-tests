import { getProductIdByName, expectCartItemPersisted } from '../helpers/cartDbAssertions';
import { queryRows } from '../../utils/dbTyped';
import { cleanupTestCustomer } from '../helpers/cleanupTestCustomer';
import type { CartIdRow } from '../helpers/cartQueryTypes';
import { test, expect } from '@playwright/test';
import { queryDB } from '../../utils/db.js';
import { registerUser } from '../helpers/registerUser.ts';

test('registered user should remove cart item through API and database should delete the cart row', async ({ page }) => {
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

  const cartRows = await queryRows<CartIdRow>(
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
      const rows = await queryRows<CartIdRow>(
        `SELECT cart_id
         FROM oc_cart
         WHERE customer_id = ? AND product_id = ?`,
        [customerId, productId]
      );

      return rows.length;
    })
    .toBe(0);

  const removedRows = await queryRows<CartIdRow>(
    `SELECT cart_id
     FROM oc_cart
     WHERE customer_id = ? AND product_id = ?`,
    [customerId, productId]
  );

  expect(removedRows.length).toBe(0);

  console.log('CART ITEM REMOVED FROM DB');
  } finally {
    await cleanupTestCustomer(customerId);
  }
});
