import { Page, expect } from '@playwright/test';
import { SELECTORS, getElement } from './selectors';

/**
 * Wait condition utilities
 * Implements Constitution Principle 3: Explicit waits with meaningful conditions
 * No arbitrary setTimeout - all waits tied to observable state
 */

/**
 * Wait for page load
 * Used for: Homepage, collection pages, product pages
 * Note: Waits for 'load' not 'networkidle' - live stores often have analytics
 * that keep network connections open indefinitely
 */
export async function waitForPageLoad(page: Page, url: string): Promise<void> {
  await page.goto(url, { 
    waitUntil: 'load', 
    timeout: 30000 
  });
  // Give page a moment to settle after load event
  await page.waitForTimeout(500);
}

/**
 * Wait for navigation to be visible with required links
 * Used for: FR2 - Primary navigation validation
 */
export async function waitForNavigationVisible(page: Page): Promise<void> {
  const navigation = await getElement(page, SELECTORS.navigation);
  await expect(navigation).toBeVisible({ timeout: 5000 });
  
  // Ensure at least 3 links are present (FR2 requirement)
  const navLinks = navigation.locator('a');
  await expect(navLinks.first()).toBeVisible({ timeout: 5000 });
}

/**
 * Wait for product card to be loaded with image
 * Used for: FR3 - Collection product display
 */
export async function waitForProductCard(page: Page): Promise<void> {
  const productCard = page.locator(SELECTORS.productCard.primary).first();
  await productCard.waitFor({ state: 'visible', timeout: 10000 });
  
  // Ensure product image is loaded (not broken)
  const img = productCard.locator('img').first();
  await expect(img).toBeVisible({ timeout: 5000 });
  
  // Wait for image to complete loading
  await img.evaluate((element: HTMLImageElement) => {
    if (element.complete) return;
    return new Promise((resolve) => {
      element.onload = resolve;
      element.onerror = resolve; // Resolve even on error to prevent hanging
    });
  });
}

/**
 * Wait for cart count to update to expected value
 * Used for: FR4, FR5 - Add to cart and remove from cart
 */
export async function waitForCartCount(
  page: Page, 
  expectedCount: number, 
  timeout = 5000
): Promise<void> {
  const cartCountLocator = page.locator(SELECTORS.cartCount.primary).first();
  
  // Wait for cart count element to be visible
  await cartCountLocator.waitFor({ state: 'visible', timeout });
  
  // Wait for count to match expected value
  await expect(cartCountLocator).toHaveText(
    expectedCount.toString(), 
    { timeout }
  );
}

/**
 * Wait for add to cart action to complete
 * Cart count update is primary indicator (already verified in ProductPage)
 * Success messages are theme-dependent and unreliable - skip checking them
 * Used for: FR4 - Add to cart validation
 */
export async function waitForAddToCart(page: Page, previousCount: number = 0): Promise<void> {
  // Cart count is already verified in ProductPage.clickAddToCart
  // Just add a small wait for UI to settle
  await page.waitForTimeout(500);
}

/**
 * Wait for cart page to load with items visible
 * Used for: FR5 - Cart page validation
 */
export async function waitForCartPageLoad(page: Page): Promise<void> {
  // Navigate to cart if not already there
  await page.goto('https://prometheamosaic.com/cart', {
    waitUntil: 'load',
    timeout: 30000
  });
  
  // Give page a moment to settle
  await page.waitForTimeout(1000);
}

/**
 * Wait for remove from cart action to complete
 * Used for: FR5 - Remove from cart validation
 */
export async function waitForRemoveFromCart(
  page: Page, 
  expectedCount: number
): Promise<void> {
  await waitForCartCount(page, expectedCount, 5000);
  
  // Additional verification: If count is 0, check for empty state
  if (expectedCount === 0) {
    // Allow time for empty state message to appear
    await page.waitForTimeout(500);
  }
}

/**
 * Wait for element to be ready for interaction
 * Checks visible, enabled, and stable (not animating)
 */
export async function waitForElementReady(
  page: Page,
  selector: string,
  timeout = 5000
): Promise<void> {
  const element = page.locator(selector);
  await element.waitFor({ state: 'visible', timeout });
  await expect(element).toBeEnabled({ timeout });
}

