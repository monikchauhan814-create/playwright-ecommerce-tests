import { test, expect } from '@playwright/test';
import { registerUser } from '../helpers/registerUser.js';

test('registered user should login successfully', async ({ page }) => {
  const { email, password, customerId } = await registerUser(page);

  console.log('CUSTOMER ID:', customerId);

  await page.goto(
    'http://localhost:8080/index.php?route=account/logout&language=en-gb'
  );

  await page.goto(
    'http://localhost:8080/index.php?route=account/login&language=en-gb'
  );

  await page.locator('#input-email').fill(email);
  await page.locator('#input-password').fill(password);

  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.getByRole('link', { name: 'Edit your account information' }))
    .toBeVisible();

  await expect(page.getByRole('link', { name: 'Logout' }))
    .toBeVisible();

  console.log('LOGIN TEST EMAIL:', email);
});