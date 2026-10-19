
import { test as base, expect, type Page } from '@playwright/test';
import { goToLogin } from '../../helpers/navigationTyped';

type AuthFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    await goToLogin(page);

    await page.locator('#input-email')
      .fill('testerguru1@protonmail.com');

    await page.locator('#input-password')
      .fill('testerguru1');

    await page.getByRole('button', { name: 'Login' }).click();

    await expect(
      page.getByRole('link', { name: 'Logout' }).first()
    ).toBeVisible();

    await use(page);
  },
});

export { expect };
