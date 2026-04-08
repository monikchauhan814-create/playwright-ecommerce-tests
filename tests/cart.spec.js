import { test, expect } from '@playwright/test';

async function login(page) {
  await page.goto('https://awesomeqa.com/ui/');
  await page.locator("//span[text()='My Account']").click();
  await page.locator("//a[text()='Login']").click();

  await page.locator('#input-email').fill('testerguru1@protonmail.com');
  await page.locator('#input-password').fill('testerguru1');

  await page.getByRole('button', { name: 'Login' }).click();
}

test('User should add product to cart successfully', async ({ page }) => {
  await login(page);

  await page.goto('https://awesomeqa.com/ui/');

  await page.getByRole('link', { name: 'MacBook' }).first().click();
  await page.locator('#button-cart').click();

  await expect(page.locator('.alert-success')).toBeVisible();
});

test('Product should be visible in cart', async ({ page }) => {
  await login(page);

  await page.goto('https://awesomeqa.com/ui/');
  await page.getByRole('link', { name: 'MacBook' }).first().click();
  await page.locator('#button-cart').click();
  await expect(page.locator('.alert-success')).toBeVisible();

  await page.goto('https://awesomeqa.com/ui/index.php?route=checkout/cart');

  await expect(
    page.locator('table tbody').getByRole('link', { name: 'MacBook' }).first()
  ).toBeVisible ;
});

test('User should update product quantity in cart', async ({ page }) => {
  await page.goto('https://awesomeqa.com/ui/');
  await page.getByRole('link', { name: 'MacBook' }).first().click();
  await page.locator('#button-cart').click();
  await expect(page.locator('.alert-success')).toBeVisible();

  await page.goto('https://awesomeqa.com/ui/index.php?route=checkout/cart');

  const cartTable = page.getByRole('table').filter({ hasText: 'Unit Price' });
  const cartRow = cartTable.locator('tbody tr').filter({ hasText: 'MacBook' }).first();

  await cartRow.locator("input[type='text']").fill('3');
  await cartRow.locator("button[title='Update'], button[data-original-title='Update']").click();

  await expect(page.locator('.alert-success')).toBeVisible();
  await expect(cartRow.locator("input[type='text']")).toHaveValue('3');
});

test('User should remove product from cart', async ({ page }) => {
  await login(page);

  await page.goto('https://awesomeqa.com/ui/');
  await page.getByRole('link', { name: 'MacBook' }).first().click();
  await page.locator('#button-cart').click();
  await expect(page.locator('.alert-success')).toBeVisible();

  await page.goto('https://awesomeqa.com/ui/index.php?route=checkout/cart');

  const cartTable = page.getByRole('table').filter({ hasText: 'Unit Price' });
  const cartRow = cartTable.locator('tbody tr').filter({ hasText: 'MacBook' }).first();
  await cartRow.locator("button[title='Remove'], button[data-original-title='Remove']").click();

  await expect(page.locator('body')).not.toContainText('MacBook');
});

test('User should see payment method warning during checkout', async ({ page }) => {
  await login(page);
  await page.goto('https://awesomeqa.com/ui/');
  await page.getByRole('link', { name: 'MacBook' }).first().click();
  await page.locator('#button-cart').click();
  await expect(page.locator('.alert-success')).toBeVisible();
  await page.goto('https://awesomeqa.com/ui/index.php?route=checkout/cart');
  await page.locator('.buttons a.btn-primary:has-text("Checkout")').click();
  await page.locator('#button-payment-address').click();
  await page.locator("input[name='agree']").check();
  await page.locator('#button-payment-method').click();
  await expect(page.locator('.alert-danger')).toContainText('Payment method required');
});


