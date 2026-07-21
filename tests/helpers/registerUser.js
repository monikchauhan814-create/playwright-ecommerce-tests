import { expect } from '@playwright/test';
import { queryDB } from '../../utils/db.js';

export async function registerUser(page) {
  const email = `user${Date.now()}@mail.com`;
  const password = 'Test12345!';

  await page.goto(
    'http://localhost:8080/index.php?route=account/register&language=en-gb'
  );

  const cookies = await page.context().cookies();
  const sessionCookie = cookies.find(cookie => cookie.name === 'OCSESSID');

  expect(sessionCookie).toBeTruthy();

  await page.context().clearCookies();

  await page.context().addCookies([
    {
      name: 'OCSESSID',
      value: sessionCookie.value,
      domain: 'localhost',
      path: '/',
      httpOnly: false,
      secure: false,
      sameSite: 'Strict',
    },
    {
      name: 'currency',
      value: 'USD',
      domain: 'localhost',
      path: '/',
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    },
  ]);

  await page.reload();

  await page.locator('#input-firstname').fill('Test');
  await page.locator('#input-lastname').fill('User');
  await page.locator('#input-email').fill(email);
  await page.locator('#input-password').fill(password);
  await page.locator("input[name='agree']").check();

  await page.getByRole('button', { name: 'Continue' }).click();

  await page.waitForTimeout(5000);

  const rows = await queryDB(
    `SELECT customer_id, firstname, lastname, email
     FROM oc_customer
     WHERE email = ?`,
    [email]
  );

  expect(rows.length).toBe(1);

  return {
    email,
    password,
    customerId: rows[0].customer_id,
  };
}