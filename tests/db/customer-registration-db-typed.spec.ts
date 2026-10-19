import { test, expect } from '@playwright/test';
import type { RowDataPacket } from 'mysql2';
import { queryRows } from '../../utils/dbTyped';
import { registerUser } from '../helpers/registerUser.ts';
import { cleanupTestCustomer } from '../helpers/cleanupTestCustomer';

type RegisteredCustomerRow = RowDataPacket & {
  customer_id: number;
  firstname: string;
  lastname: string;
  email: string;
  status: number;
  customer_group: string;
};

test('registered user should be saved in database', async ({ page }) => {
  const { email, customerId } = await registerUser(page);
  try {
    const rows = await queryRows<RegisteredCustomerRow>(
      `SELECT
          c.customer_id,
          c.firstname,
          c.lastname,
          c.email,
          c.status,
          c.date_added,
          cgd.name AS customer_group
       FROM oc_customer c
       JOIN oc_customer_group_description cgd
         ON c.customer_group_id = cgd.customer_group_id
       WHERE c.email = ?`,
      [email]
    );

    expect(rows.length).toBe(1);
    expect(rows[0].customer_id).toBe(customerId);
    expect(rows[0].firstname).toBe('Test');
    expect(rows[0].lastname).toBe('User');
    expect(rows[0].email).toBe(email);
    expect(rows[0].status).toBe(1);
    expect(rows[0].customer_group).toBe('Default');
  } finally {
    await cleanupTestCustomer(customerId);
  }
});
