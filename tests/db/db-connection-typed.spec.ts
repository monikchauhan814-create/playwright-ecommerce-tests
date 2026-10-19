import { test, expect } from '@playwright/test';
import type { RowDataPacket } from 'mysql2';
import { queryRows } from '../../utils/dbTyped';

type DatabaseRow = RowDataPacket & { database_name: string };

test('database connection works', async () => {
  const rows = await queryRows<DatabaseRow>('SELECT DATABASE() AS database_name');

  console.log(rows);

  expect(rows[0].database_name).toBe('opencart');
});