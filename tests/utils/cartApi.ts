import { Page } from '@playwright/test';

/**
 * Cart API utilities that work with both real and mocked cart endpoints
 * Uses page.evaluate() to make requests from page context (interceptable by route mocking)
 * instead of page.request (which bypasses route mocking)
 */

/**
 * Get cart data from Shopify cart.js API
 * Works with both real and mocked endpoints
 */
export async function getCartData(page: Page): Promise<any> {
  const baseUrl = process.env.STORE_URL || 'https://prometheamosaic.com';
  
  return await page.evaluate(async (url) => {
    const response = await fetch(`${url}/cart.js`);
    return await response.json();
  }, baseUrl);
}

/**
 * Get current cart item count
 * Works with both real and mocked endpoints
 */
export async function getCartCount(page: Page): Promise<number> {
  try {
    const cartData = await getCartData(page);
    return cartData.item_count || 0;
  } catch (error) {
    console.warn('[CART API] Failed to get cart count:', error);
    return 0;
  }
}

/**
 * Wait for cart count to reach expected value
 * Works with both real and mocked endpoints
 */
export async function waitForCartCount(
  page: Page,
  expectedCount: number,
  timeout = 5000
): Promise<void> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    try {
      const currentCount = await getCartCount(page);
      
      if (currentCount === expectedCount) {
        return; // Success!
      }
    } catch (error) {
      // Ignore errors and retry
    }
    
    // Wait before retrying
    await page.waitForTimeout(100);
  }
  
  // Timeout reached - throw error with current state
  const currentCount = await getCartCount(page);
  throw new Error(
    `Cart count did not reach ${expectedCount} within ${timeout}ms. Current count: ${currentCount}`
  );
}

/**
 * Clear cart using Shopify cart API
 * Works with both real and mocked endpoints
 */
export async function clearCart(page: Page): Promise<boolean> {
  const baseUrl = process.env.STORE_URL || 'https://prometheamosaic.com';
  
  try {
    const result = await page.evaluate(async (url) => {
      const response = await fetch(`${url}/cart/clear.js`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.ok;
    }, baseUrl);
    
    return result;
  } catch (error) {
    console.warn('[CART API] Failed to clear cart:', error);
    return false;
  }
}

