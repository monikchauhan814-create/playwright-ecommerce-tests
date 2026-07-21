import { test, expect } from '@playwright/test';
import { queryDB } from '../../utils/db.js';

test('database connection works', async () => {
  const rows = await queryDB('SELECT DATABASE() AS database_name');

  console.log(rows);

  expect(rows[0].database_name).toBe('opencart');
});