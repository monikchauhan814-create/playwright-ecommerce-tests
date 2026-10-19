import { test, expect } from '@playwright/test';
import { goToLogin } from '../helpers/navigationTyped';

const VALID_USER = {
  email: 'testerguru1@protonmail.com',
  password: 'testerguru1'
};

const INVALID_LOGIN_DATA = [
  {
    name: 'unregistered email',
    email: `wrong-${Date.now()}@example.com`,
    password: 'wrongpassword',
  },
  {
    name: 'empty email',
    email: '',
    password: 'wrongpassword',
  },
  {
    name: 'empty password',
    email: 'testerguru1@protonmail.com',
    password: '',
  },
];

test.describe('Login Tests', () => {

  test('User should login successfully with valid credentials', async ({ page }) => {

    await goToLogin(page);

    await page.locator('#input-email').fill(VALID_USER.email);
    await page.locator('#input-password').fill(VALID_USER.password);

    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL(/account/);
  });

  for (const data of INVALID_LOGIN_DATA) {
  test(`User should not login with ${data.name}`, async ({ page }) => {
    await goToLogin(page);

    await page.locator('#input-email').fill(data.email);
    await page.locator('#input-password').fill(data.password);

    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.locator('.alert-danger'))
      .toContainText('Warning: No match');
  });
}

})