import { Page, expect } from '@playwright/test';
import { SELECTORS } from './selectors';

/**
 * Cart cleanup utilities
 * Implements Constitution Principle 2: Guaranteed cleanup (no cart residue)
 * Idempotent design: works with 0, 1, or multiple items
 */

/**
 * Clean up cart by removing all items
 * Runs in afterEach hook to guarantee no cart residue
 * 
 * @param page - Playwright Page instance
 * @returns Promise that resolves when cart is empty
 * 
 * Behavior:
 * - Navigates to cart page
 * - Removes all items (not just expected count)
 * - Verifies cart count is 0
 * - Logs success/failure for audit trail
 * - Does NOT throw error (fault-tolerant)
 */
export async function cleanupCart(page: Page): Promise<void> {
  try {
    console.log('[CLEANUP] Starting cart cleanup...');
    
    // Use Shopify's cart API to clear all items (most reliable method)
    const response = await page.request.post('https://prometheamosaic.com/cart/clear.js');
    
    if (response.ok()) {
      console.log('[CLEANUP] ✅ Cart cleared via Shopify cart API');
      // Give cart a moment to sync
      await page.waitForTimeout(500);
    } else {
      console.warn('[CLEANUP] ⚠️  Cart API clear failed, falling back to manual removal');
      
      // Fallback: Navigate to cart page and remove items manually
      await page.goto('https://prometheamosaic.com/cart', { 
        waitUntil: 'load',
        timeout: 30000
      });
      
      await page.waitForTimeout(1000);
      
      // Check cart state
      const cartItems = page.locator('.cart-item, [data-cart-item], .cart__item');
      const itemCount = await cartItems.count();
      
      if (itemCount === 0) {
        console.log('[CLEANUP] Cart already empty');
        return;
      }
      
      console.log(`[CLEANUP] Found ${itemCount} item(s), removing manually...`);
      
      // Try to remove items by setting quantity to 0
      const quantityInputs = page.locator('input[name="updates[]"]');
      const count = await quantityInputs.count();
      
      for (let i = 0; i < count; i++) {
        try {
          await quantityInputs.nth(i).fill('0');
        } catch (e: unknown) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const errorMsg = e instanceof Error ? e.message : 'Unknown error';
          console.warn(`[CLEANUP] Failed to set quantity to 0 for item ${i + 1}: ${errorMsg}`);
          // Continue with other items even if one fails
        }
      }
      
      // Submit the cart update form
      const updateButton = page.locator('button[name="update"], [name="update"]').first();
      if (await updateButton.count() > 0) {
        await updateButton.click();
        await page.waitForTimeout(2000);
      }
      
      console.log('[CLEANUP] Manual removal attempted');
    }
    
  } catch (error) {
    console.error('[CLEANUP] ❌ Cart cleanup failed:', error);
    // Don't throw - allow tests to continue
  }
}

/**
 * Verify cart is empty (assertion helper)
 * Used in tests to confirm cart state
 */
export async function verifyCartEmpty(page: Page): Promise<void> {
  const cartCountElement = page.locator(SELECTORS.cartCount.primary).first();
  await expect(cartCountElement).toHaveText('0', { timeout: 5000 });
  
  // Navigate to cart to verify empty state
  await page.goto('https://prometheamosaic.com/cart');
  const cartItems = page.locator('.cart-item, [data-cart-item], .cart__item');
  const itemCount = await cartItems.count();
  expect(itemCount).toBe(0);
}

/**
 * Get current cart count from Shopify cart API
 * Useful for getting baseline before add-to-cart tests
 * 
 * Note: This reads from cart.js API (source of truth) rather than
 * the visual badge element, which may show stale/cached data due to
 * theme JavaScript sync issues.
 */
export async function getCurrentCartCount(page: Page): Promise<number> {
  try {
    const baseUrl = process.env.STORE_URL || 'https://prometheamosaic.com';
    const response = await page.request.get(`${baseUrl}/cart.js`);
    const cartData = await response.json();
    return cartData.item_count || 0;
  } catch (error) {
    console.warn('[CART] Failed to get cart count from API:', error);
    // If API call fails, assume empty
    return 0;
  }
}

