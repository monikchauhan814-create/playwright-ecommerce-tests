import { test, expect } from '@playwright/test';
import { addMacBookToCart } from '../helpers/cart';

test.describe('Cart Tests', () => {
  async function login(page) {
    await page.goto('');
    await page.getByRole('link', { name: 'My Account' }).first().click();
    await page.getByRole('link', { name: 'Login' }).click();

    await page.locator('#input-email').fill('testerguru1@protonmail.com');
    await page.locator('#input-password').fill('testerguru1');

    await page.getByRole('button', { name: 'Login' }).click();
  }

  test('User should add product to cart successfully', async ({ page }) => {
    await login(page);
    await addMacBookToCart(page);
  });

  test('Product should be visible in cart', async ({ page }) => {
    await login(page);
    await addMacBookToCart(page);

    await page.goto('index.php?route=checkout/cart');

    const cartTable = page.getByRole('table').filter({ hasText: 'Unit Price' });
    await expect(cartTable.locator('tbody tr').filter({ hasText: 'MacBook' })).toBeVisible();
  });

  test('User should update product quantity in cart', async ({ page }) => {
    await login(page);
    await addMacBookToCart(page);

    await page.goto('index.php?route=checkout/cart');

    const cartTable = page.getByRole('table').filter({ hasText: 'Unit Price' });
    const cartRow = cartTable.locator('tbody tr').filter({ hasText: 'MacBook' }).first();

    await cartRow.locator("input[type='text']").fill('3');
    await cartRow.locator("button[title='Update'], button[data-original-title='Update']").click();

    await expect(page.locator('.alert-success')).toBeVisible();
    await expect(cartRow.locator("input[type='text']")).toHaveValue('3');
  });

  test('User should remove product from cart', async ({ page }) => {
    await login(page);
    await addMacBookToCart(page);

    await page.goto('index.php?route=checkout/cart');

    const cartTable = page.getByRole('table').filter({ hasText: 'Unit Price' });
    const cartRow = cartTable.locator('tbody tr').filter({ hasText: 'MacBook' }).first();

    await cartRow.locator("button[title='Remove'], button[data-original-title='Remove']").click();

    await expect(cartRow).toHaveCount(0);
  });

  test('User should see payment method warning during checkout', async ({ page }) => {
    await login(page);
    await addMacBookToCart(page);

    await page.goto('index.php?route=checkout/cart');
    await page.locator('.buttons a.btn-primary:has-text("Checkout")').click();
    await page.locator('#button-payment-address').click();
    await page.locator("input[name='agree']").check();
    await page.locator('#button-payment-method').click();

    await expect(page.locator('.alert-danger')).toContainText('Payment method required');
  });
});