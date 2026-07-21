import { test, expect } from '@playwright/test';
import { queryDB } from '../../utils/db.js';
import { registerUser } from '../helpers/registerUser.js';

test('duplicate email should not create another customer', async ({ page }) => {
  const { email, password, customerId } = await registerUser(page);

  let rows = await queryDB(
    `SELECT customer_id, email
     FROM oc_customer
     WHERE email = ?`,
    [email]
  );

  expect(rows.length).toBe(1);

  await page.goto(
    'http://localhost:8080/index.php?route=account/logout&language=en-gb'
  );

  await page.goto(
    'http://localhost:8080/index.php?route=account/register&language=en-gb'
  );

  await expect(page.locator('h1')).toHaveText('Register Account');

  await page.locator('#input-firstname').fill('Test');
  await page.locator('#input-lastname').fill('User');
  await page.locator('#input-email').fill(email);
  await page.locator('#input-password').fill(password);
  await page.locator("input[name='agree']").check();

  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page.locator('body')).toContainText(
    'Warning: E-Mail Address is already registered!'
  );

  await expect(page.locator('h1')).toHaveText('Register Account');

  rows = await queryDB(
    `SELECT customer_id, email
     FROM oc_customer
     WHERE email = ?`,
    [email]
  );

  expect(rows.length).toBe(1);
  expect(rows[0].customer_id).toBe(customerId);

  console.log('DUPLICATE EMAIL BLOCKED:', email);
});