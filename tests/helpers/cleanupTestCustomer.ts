import { queryDB } from '../../utils/db.js';

export async function cleanupTestCustomer(
  customerId: number
): Promise<void> {
  await queryDB(
    'DELETE FROM oc_cart WHERE customer_id = ?',
    [customerId]
  );

  await queryDB(
    'DELETE FROM oc_customer WHERE customer_id = ?',
    [customerId]
  );
}
