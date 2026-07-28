import { test, expect } from '@playwright/test';
import { queryDB } from '../../utils/db.js';
import { registerUser } from '../helpers/registerUser.js';

test('registered user should add product to cart and database should store cart item', async ({ page }) => {
  const { customerId } = await registerUser(page);

  await page.goto(
    'http://localhost:8080/index.php?route=product/product&language=en-gb&product_id=43'
  );

  await page.getByRole('button', { name: 'Add to Cart' }).click();

  

  await expect
    .poll(async () => {
      const rows = await queryDB(
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

  const cartRows = await queryDB(
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

const remainingCartRows = await queryDB(
  `SELECT cart_id
   FROM oc_cart
   WHERE customer_id = ?`,
  [customerId]
);

const remainingCustomerRows = await queryDB(
  `SELECT customer_id
   FROM oc_customer
   WHERE customer_id = ?`,
  [customerId]
);

expect(remainingCartRows.length).toBe(0);
expect(remainingCustomerRows.length).toBe(0);
});