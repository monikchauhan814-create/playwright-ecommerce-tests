import { getProductIdByName, expectCartItemPersisted } from '../helpers/cartDbAssertions';
import { test, expect } from '@playwright/test';
import { queryRows } from '../../utils/dbTyped';
import type { CartDetailsRow } from '../helpers/cartQueryTypes';
import { cleanupTestCustomer } from '../helpers/cleanupTestCustomer';
import { registerUser } from '../helpers/registerUser.ts';

test('registered user should add product to cart through API and database should store cart item', async ({ page }) => {
  const { customerId } = await registerUser(page);
  try {

  const productId = await getProductIdByName('MacBook');

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

  await expectCartItemPersisted(customerId, productId);

  const cartRows = await queryRows<CartDetailsRow>(
    `SELECT cart_id, customer_id, product_id, quantity
     FROM oc_cart
     WHERE customer_id = ? AND product_id = ?`,
    [customerId, productId]
  );

  expect(cartRows[0].customer_id).toBe(customerId);
  expect(cartRows[0].product_id).toBe(productId);
  expect(cartRows[0].quantity).toBe(1);

  console.log('CART DB ROW:', cartRows[0]);
  } finally {
    await cleanupTestCustomer(customerId);
  }
});
