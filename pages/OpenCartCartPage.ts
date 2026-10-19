import { expect, type Page } from '@playwright/test';

export class OpenCartCartPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto(
      'http://localhost:8080/index.php?route=checkout/cart&language=en-gb'
    );
  }

  async updateQuantity(quantity: number): Promise<void> {
    const input = this.page.locator('input[name="quantity"]');
    await expect(input).toBeVisible();
    await input.fill(String(quantity));
    await this.page.getByRole('button', { name: 'Update' }).click();
  }

  async removeProduct(): Promise<void> {
    await this.page.getByRole('button', { name: 'Remove' }).click();
  }
}
