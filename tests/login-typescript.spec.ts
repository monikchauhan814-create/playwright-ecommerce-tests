
import { test, expect } from '@playwright/test';
import { goToLogin } from '../helpers/navigationTyped';

type LoginData = {
  name: string;
  email: string;
  password: string;
};

const invalidLogins: LoginData[] = [
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

test.describe('TypeScript Login Tests', () => {
  for (const data of invalidLogins) {
    test(`Reject ${data.name}`, async ({ page }) => {
      await goToLogin(page);

      await page.locator('#input-email').fill(data.email);
      await page.locator('#input-password').fill(data.password);
      await page.getByRole('button', { name: 'Login' }).click();

      await expect(page.locator('.alert-danger'))
        .toContainText('Warning: No match');
    });
  }
});
