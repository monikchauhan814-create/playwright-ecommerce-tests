import { expect, type Page } from '@playwright/test';
import { queryDB } from '../../utils/db.js';

type CustomerRow = {
  customer_id: number;
};

type RegistrationResult = {
  email: string;
  password: string;
  customerId: number;
};

export async function registerUser(
  page: Page
): Promise<RegistrationResult> {
  const email = `user${Date.now()}@mail.com`;
  const password = 'Test12345!';

  await page.goto(
    'http://localhost:8080/index.php?route=account/register&language=en-gb'
  );

  const cookies = await page.context().cookies();
  const sessionCookie = cookies.find(cookie => cookie.name === 'OCSESSID');

  if (!sessionCookie) {
  throw new Error('OCSESSID cookie not found');
}

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

await page.waitForURL(/route=account\/success/, {
  waitUntil: 'load',
  timeout: 15000
});

await expect.poll(async () => {
  const rows = await queryDB(
    `SELECT customer_id
     FROM oc_customer
     WHERE email = ?`,
    [email]
  );

  return (rows as CustomerRow[]).length;
}, {
  timeout: 15000,
  intervals: [250, 500, 1000]
}).toBe(1);

const rows = await queryDB(
  `SELECT customer_id, firstname, lastname, email
   FROM oc_customer
   WHERE email = ?`,
  [email]
);

  expect((rows as CustomerRow[]).length).toBe(1);

  return {
    email,
    password,
    customerId: (rows as CustomerRow[])[0].customer_id,
  };
}