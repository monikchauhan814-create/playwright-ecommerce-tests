import { getProductIdByName, expectCartItemPersisted } from '../helpers/cartDbAssertions';
import { queryRows } from '../../utils/dbTyped';
import { cleanupTestCustomer } from '../helpers/cleanupTestCustomer';
import type { CartIdRow } from '../helpers/cartQueryTypes';
import { OpenCartProductPage } from '../../pages/OpenCartProductPage';
import { OpenCartCartPage } from '../../pages/OpenCartCartPage';
import { test, expect } from '@playwright/test';
import { queryDB } from '../../utils/db.js';
import { registerUser } from '../helpers/registerUser.ts';

test('registered user should remove product from cart and database should delete the cart row', async ({ page }) => {
  const { customerId } = await registerUser(page);
  try {

  const productPage = new OpenCartProductPage(page);
  await productPage.openMacBook();
  await productPage.addToCart();

  const cartPage = new OpenCartCartPage(page);
  await cartPage.open();

  await expect(page.getByRole('button', { name: 'Remove' })).toBeVisible();

  const productId = await getProductIdByName('MacBook');

  await expectCartItemPersisted(customerId, productId);

  await cartPage.removeProduct();

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

  const cartRows = await queryRows<CartIdRow>(
    `SELECT cart_id
     FROM oc_cart
     WHERE customer_id = ? AND product_id = ?`,
    [customerId, productId]
  );

  expect(cartRows.length).toBe(0);

  console.log('CART ITEM REMOVED FROM DB');
  } finally {
    await cleanupTestCustomer(customerId);
  }
});
