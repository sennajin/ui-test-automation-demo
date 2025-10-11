import { Page, Locator, expect } from '@playwright/test';
import { SELECTORS } from '../utils/selectors';
import { waitForCartPageLoad, waitForCartCount } from '../utils/waitConditions';

/**
 * CartPage Page Object Model
 * Represents cart page (https://prometheamosaic.com/cart)
 * 
 * Test Scenarios: FR5 (Cart Operations - Remove & Empty State)
 */
export class CartPage {
  private readonly url: string;

  constructor(private readonly page: Page) {
    const baseUrl = process.env.STORE_URL || 'https://prometheamosaic.com';
    this.url = `${baseUrl}/cart`;
  }

  /**
   * Navigate to cart page and wait for load
   */
  async goto(): Promise<void> {
    await waitForCartPageLoad(this.page);
  }

  /**
   * Get all cart item elements on the cart page
   * Returns empty locator if cart is empty
   * 
   * Note: Uses :visible filter to avoid matching hidden cart drawer items
   */
  async getCartItems(): Promise<Locator> {
    return this.page.locator('.cart-item:visible, [data-cart-item]:visible, .cart__item:visible');
  }

  /**
   * Get current cart item count from Shopify cart API
   * Returns 0 if cart is empty or API call fails
   * 
   * Note: This reads from cart.js API (source of truth) rather than
   * the visual badge element, which may show stale/cached data due to
   * theme JavaScript sync issues.
   */
  async getCartCount(): Promise<number> {
    try {
      const response = await this.page.request.get(`${this.url}.js`);
      const cartData = await response.json();
      return cartData.item_count || 0;
    } catch (error) {
      console.warn('[CART] Failed to get cart count from API:', error);
      return 0;
    }
  }

  /**
   * Get remove button for specific cart item
   */
  async getRemoveButton(item: Locator): Promise<Locator> {
    return item.locator(SELECTORS.removeFromCart.primary).first();
  }

  /**
   * Click remove button and wait for cart update
   */
  async clickRemoveButton(item: Locator): Promise<void> {
    const currentCount = await this.getCartCount();
    const button = await this.getRemoveButton(item);
    await button.click();
    
    // Wait for cart count to decrease
    await waitForCartCount(this.page, currentCount - 1);
    
    console.log(`[CART] Removed item - count: ${currentCount} → ${currentCount - 1}`);
  }

  /**
   * Remove all items from cart (idempotent cleanup)
   * Used in cart cleanup utility
   */
  async removeAllItems(): Promise<void> {
    const items = await this.getCartItems();
    const itemCount = await items.count();
    
    if (itemCount === 0) {
      console.log('[CART] Cart already empty');
      return;
    }
    
    console.log(`[CART] Removing ${itemCount} item(s) from cart...`);
    
    for (let i = 0; i < itemCount; i++) {
      // Always remove first item (list reflows)
      const firstItem = items.first();
      await this.clickRemoveButton(firstItem);
    }
    
    console.log('[CART] All items removed');
  }

  /**
   * Check if cart is empty
   * Returns true if cart count is 0
   */
  async isEmpty(): Promise<boolean> {
    const count = await this.getCartCount();
    return count === 0;
  }

  /**
   * Get empty cart message element
   * Should be visible when cart is empty
   */
  async getEmptyStateMessage(): Promise<Locator> {
    return this.page.locator(
      '[data-test-id="empty-cart-message"], .cart--empty, .cart__empty-text, p:has-text("Your cart is empty")'
    ).first();
  }

  /**
   * Verify empty state visible
   * Checks both count = 0 and empty message displayed
   */
  async verifyEmptyState(): Promise<void> {
    const isEmpty = await this.isEmpty();
    expect(isEmpty).toBe(true);
    
    const emptyMessage = await this.getEmptyStateMessage();
    await expect(emptyMessage).toBeVisible({ timeout: 5000 });
  }

  /**
   * Get cart item count from page
   * Differs from getCartCount() - this counts DOM elements
   */
  async getCartItemCount(): Promise<number> {
    const items = await this.getCartItems();
    return items.count();
  }
}

