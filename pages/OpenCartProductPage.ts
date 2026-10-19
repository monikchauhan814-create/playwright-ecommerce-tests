import type { Page } from '@playwright/test';

export class OpenCartProductPage {
  constructor(private readonly page: Page) {}

  async openMacBook(): Promise<void> {
    await this.page.goto(
      'http://localhost:8080/index.php?route=product/product&language=en-gb&product_id=43'
    );
  }

  async addToCart(): Promise<void> {
    await this.page.getByRole('button', {
      name: 'Add to Cart'
    }).click();
  }
}
