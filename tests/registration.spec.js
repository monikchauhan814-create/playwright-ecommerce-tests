import { test, expect } from '@playwright/test';
async function goToRegister(page) {
  await page.goto('https://awesomeqa.com/ui/');
  await page.locator("//span[text()='My Account']").click();
  await page.locator("//a[text()='Register']").click();
}

test('User should register successfully with valid details', async ({ page }) => {
  const email = `test${Date.now()}@mail.com`;

  await goToRegister(page);

  await page.locator('#input-firstname').fill('Test');
  await page.locator('#input-lastname').fill('User');
  await page.locator('#input-email').fill(email);
  await page.locator('#input-telephone').fill('1234567890');
  await page.locator('#input-password').fill('test1234');
  await page.locator('#input-confirm').fill('test1234');
  await page.locator("input[name='agree']").check();

  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page.locator('#content')).toContainText('Your Account Has Been Created');
});

test('User should not register with existing email', async ({ page }) => {
  await goToRegister(page);

  await page.locator('#input-firstname').fill('Test');
  await page.locator('#input-lastname').fill('User');
  await page.locator('#input-email').fill('testerguru1@protonmail.com');
  await page.locator('#input-telephone').fill('1234567890');
  await page.locator('#input-password').fill('test1234');
  await page.locator('#input-confirm').fill('test1234');

  await page.locator("input[name='agree']").check();
  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page.locator('.alert-danger')).toBeVisible();
});

test('User should not register with password mismatch', async ({ page }) => {
  const email = `test${Date.now()}@mail.com`;

  await goToRegister(page);

  await page.locator('#input-firstname').fill('Test');
  await page.locator('#input-lastname').fill('User');
  await page.locator('#input-email').fill(email);
  await page.locator('#input-telephone').fill('1234567890');

  await page.locator('#input-password').fill('test1234');
  await page.locator('#input-confirm').fill('wrong1234');

  await page.locator("input[name='agree']").check();
  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page.locator('.text-danger')).toBeVisible();
});