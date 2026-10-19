import { expect } from '@playwright/test';
import { queryRows } from '../../utils/dbTyped';
import type { ProductIdRow, CartIdRow } from './cartQueryTypes';

export async function getProductIdByName(
  name: string
): Promise<number> {
  const rows = await queryRows<ProductIdRow>(
    `SELECT product_id
     FROM oc_product_description
     WHERE name = ?`,
    [name]
  );

  expect(rows.length).toBeGreaterThan(0);
  return rows[0].product_id;
}

export async function expectCartItemPersisted(
  customerId: number,
  productId: number
): Promise<void> {
  await expect.poll(async () => {
    const rows = await queryRows<CartIdRow>(
      `SELECT cart_id
       FROM oc_cart
       WHERE customer_id = ? AND product_id = ?`,
      [customerId, productId]
    );
    return rows.length;
  }).toBeGreaterThan(0);
}
