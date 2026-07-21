import { test, expect } from '@playwright/test';
import { queryDB } from '../../utils/db.js';

test('user should register through API and be saved in database', async ({ page }) => {
  const email = `api${Date.now()}@mail.com`;
  const password = 'Test12345!';

  await page.goto(
    'http://localhost:8080/index.php?route=account/register&language=en-gb'
  );

  const cookies = await page.context().cookies();
  const sessionCookie = cookies.find(
    cookie => cookie.name === 'OCSESSID'
  );

  expect(sessionCookie).toBeTruthy();
  expect(apiStatus).toBe(200);

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

  let apiResponseText;
  let apiStatus;

  await page.route('**/*route=account/register|register*', async route => {
    const response = await route.fetch();

    apiStatus = response.status();
    apiResponseText = await response.text();

    console.log('API STATUS:', apiStatus);
    console.log('API RESPONSE:', apiResponseText);

    await route.fulfill({
      response,
      body: apiResponseText,
    });
  });

  await page.locator('#input-firstname').fill('API');
  await page.locator('#input-lastname').fill('Tester');
  await page.locator('#input-email').fill(email);
  await page.locator('#input-password').fill(password);
  await page.locator("input[name='agree']").check();

  await page.getByRole('button', { name: 'Continue' }).click();

  await expect.poll(() => apiResponseText).toBeTruthy();

  const rows = await queryDB(
    `SELECT customer_id, firstname, lastname, email
     FROM oc_customer
     WHERE email = ?`,
    [email]
  );

  expect(rows.length).toBe(1);
  expect(rows[0].firstname).toBe('API');
  expect(rows[0].lastname).toBe('Tester');
  expect(rows[0].email).toBe(email);

  console.log('API REGISTERED USER:', rows[0]);
});