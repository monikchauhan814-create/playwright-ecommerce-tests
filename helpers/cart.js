import { expect } from '@playwright/test';

export async function addMacBookToCart(page) {
  await page.goto('');
  await page.locator('.product-layout').filter({ hasText: 'MacBook' }).locator('h4 a').click();
  await page.locator('#button-cart').click();
  await expect(page.locator('.alert-success')).toBeVisible();
}