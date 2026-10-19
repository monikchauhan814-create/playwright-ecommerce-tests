import type { Page } from '@playwright/test';
import { test, expect } from './fixtures/auth.fixture.ts';
import { addMacBookToCart } from '../helpers/cartTyped';

test.describe('Cart Tests', () => {
  async function login(page: Page) {
    await page.goto('');
    await page.getByRole('link', { name: 'My Account' }).first().click();
    await page.getByRole('link', { name: 'Login' }).click();

    await page.locator('#input-email').fill('testerguru1@protonmail.com');
    await page.locator('#input-password').fill('testerguru1');

    await page.getByRole('button', { name: 'Login' }).click();
  }

  test('User should add product to cart successfully', async ({ authenticatedPage: page }) => {
    await addMacBookToCart(page);
  });

  test('Product should be visible in cart', async ({ authenticatedPage: page }) => {
    await addMacBookToCart(page);

    await page.goto('index.php?route=checkout/cart');

    const cartTable = page.getByRole('table').filter({ hasText: 'Unit Price' });
    await expect(cartTable.locator('tbody tr').filter({ hasText: 'MacBook' })).toBeVisible();
  });

  test('User should update product quantity in cart',async ({ authenticatedPage: page }) => {
    await addMacBookToCart(page);

    await page.goto('index.php?route=checkout/cart');

    const cartTable = page.getByRole('table').filter({ hasText: 'Unit Price' });
    const cartRow = cartTable.locator('tbody tr').filter({ hasText: 'MacBook' }).first();

    await cartRow.locator("input[type='text']").fill('3');
    await cartRow.locator("button[title='Update'], button[data-original-title='Update']").click();

    await expect(page.locator('.alert-success')).toBeVisible();
    await expect(cartRow.locator("input[type='text']")).toHaveValue('3');
  });

  test('User should remove product from cart', async ({ authenticatedPage: page }) => {
    await addMacBookToCart(page);

    await page.goto('index.php?route=checkout/cart');

    const cartTable = page.getByRole('table').filter({ hasText: 'Unit Price' });
    const cartRow = cartTable.locator('tbody tr').filter({ hasText: 'MacBook' }).first();

    await cartRow.locator("button[title='Remove'], button[data-original-title='Remove']").click();

    await expect(cartRow).toHaveCount(0);
  });


test('User should reach checkout order confirmation', async ({ authenticatedPage: page }) => {
  // Find the verified in-stock product
  await page.goto(
    'index.php?route=product/search&search=HTC%20Touch%20HD'
  );

  await page.getByRole('link', { name: 'HTC Touch HD' })
    .first()
    .click();

  await page.locator('#button-cart').click();
  await expect(page.locator('.alert-success')).toBeVisible();

  // Verify the cart is eligible for checkout
  await page.goto('index.php?route=checkout/cart');

  await expect(page.locator('body'))
    .not.toContainText('not available in the desired quantity');

  await page.locator('.buttons a.btn-primary:has-text("Checkout")')
    .click();

  // Billing details
  await page.locator('#button-payment-address').click();

  // Delivery details
  await page.locator('#button-shipping-address').click();

  // Shipping method
  await page.locator('#button-shipping-method').click();

  // Payment method
  await expect(page.locator('#collapse-payment-method'))
    .toContainText('Cash On Delivery');

  await page.locator("input[name='agree']").check();
  await page.locator('#button-payment-method').click();

  // Verify order confirmation without submitting the order
  await expect(page.locator('#collapse-checkout-confirm'))
    .toContainText('HTC Touch HD');

  await expect(page.locator('#button-confirm')).toBeVisible();
});

});