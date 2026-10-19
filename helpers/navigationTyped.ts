
import type { Page } from '@playwright/test';

export async function goToLogin(page: Page): Promise<void> {
  await page.goto('');
  await page.getByRole('link', { name: 'My Account' }).first().click();
  await page.getByRole('link', { name: 'Login' }).click();
}
