import { OpenCartProductPage } from '../../pages/OpenCartProductPage';

import type { RowDataPacket } from 'mysql2';
import { queryRows } from '../../utils/dbTyped';

type CartRow = RowDataPacket & {
  customer_id: number;
  product_id: number;
  quantity: number;
  product_name: string;
  price: string;
  status: number;
};

type CartIdRow = RowDataPacket & {
  cart_id: number;
};

type CustomerIdRow = RowDataPacket & {
  customer_id: number;
};

import { test, expect } from '@playwright/test';
import { queryDB } from '../../utils/db.js';
import { registerUser } from '../helpers/registerUser.ts';

test('registered user should add product to cart and database should store cart item', async ({ page }) => {
  const { customerId } = await registerUser(page);
  try {

  const productPage = new OpenCartProductPage(page);
  await productPage.openMacBook();
  await productPage.addToCart();



  await expect
    .poll(async () => {
      const rows = await queryRows<CartIdRow>(
        `SELECT cart_id
 FROM oc_cart
 WHERE customer_id = ?
   AND product_id = (
     SELECT product_id
     FROM oc_product_description
     WHERE name = ?
       AND language_id = 1
   )`,
[customerId, 'MacBook']
      );

      return rows.length;
    })
    .toBeGreaterThan(0);

  const cartRows = await queryRows<CartRow>(
  `SELECT
      c.customer_id,
      c.product_id,
      c.quantity,
      pd.name AS product_name,
      p.price,
      p.status
   FROM oc_cart c
   JOIN oc_product p
     ON c.product_id = p.product_id
   JOIN oc_product_description pd
     ON p.product_id = pd.product_id
   WHERE c.customer_id = ?
  AND c.product_id = (
      SELECT product_id
      FROM oc_product_description
      WHERE name = 'MacBook'
        AND language_id = 1
  )`,
  [customerId]
);
  expect(cartRows.length).toBeGreaterThan(0);
expect(cartRows[0].customer_id).toBe(customerId);
expect(cartRows[0].product_name).toBe('MacBook');
expect(Number(cartRows[0].quantity)).toBe(1);
expect(Number(cartRows[0].status)).toBe(1);

  console.log('CART DB ROW:', cartRows[0]);

  } finally {

  await queryDB(
  `DELETE FROM oc_cart
   WHERE customer_id = ?`,
  [customerId]
);

await queryDB(
  `DELETE FROM oc_customer
   WHERE customer_id = ?`,
  [customerId]
);

const remainingCartRows = await queryRows<CartIdRow>(
  `SELECT cart_id
   FROM oc_cart
   WHERE customer_id = ?`,
  [customerId]
);

const remainingCustomerRows = await queryRows<CustomerIdRow>(
  `SELECT customer_id
   FROM oc_customer
   WHERE customer_id = ?`,
  [customerId]
);

expect(remainingCartRows.length).toBe(0);
expect(remainingCustomerRows.length).toBe(0);

}
});