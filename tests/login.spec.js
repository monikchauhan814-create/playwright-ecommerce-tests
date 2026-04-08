import { test, expect } from '@playwright/test';

// reusable function
async function goToLogin(page) {
  await page.goto('https://awesomeqa.com/ui/');
  await page.locator("//span[text()='My Account']").click();
  await page.locator("//a[text()='Login']").click();
}

test('User should login successfully with valid credentials', async ({ page }) => {

  await goToLogin(page);

  await page.locator('#input-email').fill('testerguru1@protonmail.com');
  await page.locator('#input-password').fill('testerguru1');

  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL(/account/);
});

test('User should not login with invalid credentials', async ({ page }) => {

  await goToLogin(page);

  await page.locator('#input-email').fill('wrong@email.com');
  await page.locator('#input-password').fill('wrongpassword');

  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.locator('.alert-danger')).toBeVisible();
});