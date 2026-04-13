import { test, expect } from '@playwright/test';
import { goToLogin } from '../helpers/navigation';

const VALID_USER = {
  email: 'testerguru1@protonmail.com',
  password: 'testerguru1'
};

test.describe('Login Tests', () => {

  test('User should login successfully with valid credentials', async ({ page }) => {

    await goToLogin(page);

    await page.locator('#input-email').fill(VALID_USER.email);
    await page.locator('#input-password').fill(VALID_USER.password);

    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL(/account/);
  });

  test('User should not login with invalid credentials', async ({ page }) => {

    await goToLogin(page);

    await page.locator('#input-email').fill('wrong@email.com');
    await page.locator('#input-password').fill('wrongpassword');

    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.locator('.alert-danger'))
      .toContainText('Warning: No match');
  });

});