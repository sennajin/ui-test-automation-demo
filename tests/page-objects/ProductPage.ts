import { Page, Locator } from '@playwright/test';
import { getElement, SELECTORS } from '../utils/selectors';
import { waitForAddToCart } from '../utils/waitConditions';
import { getCurrentCartCount } from '../utils/cleanup';

/**
 * ProductPage Page Object Model
 * Represents product detail page (/products/:handle)
 * 
 * Test Scenarios: FR4 (Product Detail & Add to Cart)
 */
export class ProductPage {
  constructor(private readonly page: Page) {}

  /**
   * Get product title element
   * Should be visible and non-empty
   */
  async getTitle(): Promise<Locator> {
    return getElement(this.page, SELECTORS.productTitle);
  }

  /**
   * Get product price element
   * Should be formatted currency (e.g., "$12.00 USD")
   */
  async getPrice(): Promise<Locator> {
    return getElement(this.page, SELECTORS.productPrice);
  }

  /**
   * Get "Add to Cart" button
   * Should be visible and enabled
   */
  async getAddToCartButton(): Promise<Locator> {
    return getElement(this.page, SELECTORS.addToCartButton);
  }

  /**
   * Click "Add to Cart" button and wait for cart update
   * Automatically waits for cart count to increment
   * 
   * Note: Tests use mocked cart API to avoid rate limiting on production
   */
  async clickAddToCart(): Promise<void> {
    // Get current cart count before adding
    const currentCount = await getCurrentCartCount(this.page);
    
    // Click add to cart button
    const button = await this.getAddToCartButton();
    await button.click();
    
    // Wait for cart to update
    await waitForAddToCart(this.page, currentCount);
    
    console.log(`[PRODUCT] Added to cart - count: ${currentCount} → ${currentCount + 1}`);
  }

  /**
   * Check if add to cart button is enabled
   * Returns false if out of stock or variant not selected
   */
  async isAddToCartEnabled(): Promise<boolean> {
    try {
      const button = await this.getAddToCartButton();
      return await button.isEnabled();
    } catch {
      return false;
    }
  }

  /**
   * Check if add to cart button is visible
   * Returns false if button not found (may indicate out of stock)
   */
  async isAddToCartVisible(): Promise<boolean> {
    try {
      const button = await this.getAddToCartButton();
      return await button.isVisible({ timeout: 5000 });
    } catch {
      return false;
    }
  }

  /**
   * Get product URL
   * Useful for logging and verification
   */
  getUrl(): string {
    return this.page.url();
  }

  /**
   * Verify on product detail page
   * Checks URL contains /products/
   */
  async isOnProductPage(): Promise<boolean> {
    const url = this.page.url();
    return url.includes('/products/');
  }
}

