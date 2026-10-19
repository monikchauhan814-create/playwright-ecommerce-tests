import { test, expect } from '@playwright/test';
import { registerUser } from './helpers/registerUser';
import { cleanupTestCustomer } from './helpers/cleanupTestCustomer';

const loginUrl =
  'http://localhost:8080/index.php?route=account/login&language=en-gb';

const logoutUrl =
  'http://localhost:8080/index.php?route=account/logout&language=en-gb';

test.describe('Login Tests', () => {

  test('User should login successfully with valid credentials',
    async ({ page }) => {
      const { email, password, customerId } = await registerUser(page);

      try {
        await page.goto(logoutUrl);
        await page.goto(loginUrl);

        await page.locator('#input-email').fill(email);
        await page.locator('#input-password').fill(password);
        await page.getByRole('button', { name: 'Login' }).click();

        await expect(
          page.getByRole('link', {
            name: 'Edit your account information'
          })
        ).toBeVisible();
      } finally {
        await cleanupTestCustomer(customerId);
      }
    }
  );

  const invalidCases = [
    'unregistered email',
    'empty email',
    'empty password'
  ] as const;

  for (const scenario of invalidCases) {
    test(`User should not login with ${scenario}`,
      async ({ page }) => {
        const { email, password, customerId } =
          await registerUser(page);

        try {
          await page.goto(logoutUrl);
          await page.goto(loginUrl);

          const enteredEmail =
            scenario === 'empty email' ? '' :
            scenario === 'unregistered email'
              ? `wrong-${Date.now()}@example.com`
              : email;

          const enteredPassword =
            scenario === 'empty password' ? '' : password;

          await page.locator('#input-email').fill(enteredEmail);
          await page.locator('#input-password').fill(enteredPassword);

          await page.getByRole('button', { name: 'Login' }).click();

          await expect(page.locator('.alert-danger'))
            .toContainText('Warning: No match');

          await expect(page).toHaveURL(/route=account\/login/);
        } finally {
          await cleanupTestCustomer(customerId);
        }
      }
    );
  }
});
