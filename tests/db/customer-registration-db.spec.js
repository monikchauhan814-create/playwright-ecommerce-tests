import { test, expect } from '@playwright/test';
import { queryDB } from '../../utils/db.js';

test('registered user should be saved in database', async ({ page }) => {
  const email = `test${Date.now()}@mail.com`;

  await page.goto(
    'http://localhost:8080/index.php?route=account/register&language=en-gb'
  );

  const cookies = await page.context().cookies();
  const sessionCookie = cookies.find(
    cookie => cookie.name === 'OCSESSID'
  );

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
  await page.locator('#input-password').fill('Test12345!');
  await page.locator("input[name='agree']").check();

  await page.getByRole('button', { name: 'Continue' }).click();

  await expect
    .poll(async () => {
      const rows = await queryDB(
        `SELECT customer_id
         FROM oc_customer
         WHERE email = ?`,
        [email]
      );

      return rows.length;
    })
    .toBe(1);

  const rows = await queryDB(
    `SELECT customer_id, firstname, lastname, email
     FROM oc_customer
     WHERE email = ?`,
    [email]
  );

  expect(rows.length).toBe(1);
  expect(rows[0].firstname).toBe('Test');
  expect(rows[0].lastname).toBe('User');
  expect(rows[0].email).toBe(email);

  console.log('REGISTERED DB USER:', rows[0]);
});