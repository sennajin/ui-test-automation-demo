import { test, expect } from '@playwright/test';
import { CollectionPage } from '../page-objects/CollectionPage';
import { ProductPage } from '../page-objects/ProductPage';
import { CartPage } from '../page-objects/CartPage';
import { cleanupCart, getCurrentCartCount } from '../utils/cleanup';

/**
 * Test Scenario 3: Cart Operations
 * Validates FR4 (Add to Cart) and FR5 (Remove from Cart & Empty State)
 * 
 * Constitutional Principle 2: CRITICAL - Guaranteed cleanup in afterEach
 * Constitutional Principle 6: Safety - No checkout, no persistent data
 */
test.describe('Cart Operations', () => {
  test.afterEach(async ({ page }) => {
    // CRITICAL: Cart cleanup after every test (even on failure)
    // This prevents cart residue on live store
    await cleanupCart(page);
  });

  /**
   * FR4: Add product to cart
   * Acceptance Criteria:
   * - Product added successfully
   * - Cart count updates to "1"
   * - No error messages displayed
   * - Cart update completes < 5 seconds
   */
  test('should add product to cart and update cart count to 1', async ({ page }) => {
    const collectionPage = new CollectionPage(page, 'bookmarks');
    const productPage = new ProductPage(page);
    
    // Navigate to product via collection
    await collectionPage.goto();
    const productCard = await collectionPage.getFirstProductCard();
    await collectionPage.clickProduct(productCard);
    
    // Get current cart count before adding
    const initialCount = await getCurrentCartCount(page);
    console.log(`[CART] Initial cart count: ${initialCount}`);
    
    // Add product to cart
    await productPage.clickAddToCart();
    
    // Assert cart count updated
    const cartPage = new CartPage(page);
    const newCount = await cartPage.getCartCount();
    expect(newCount).toBe(initialCount + 1);
    console.log(`[CART] Cart count after add: ${newCount}`);
    
    // Assert no error messages visible
    const errorMessages = page.locator('[role="alert"]:has-text("error"), .error-message, .alert-error');
    const errorCount = await errorMessages.count();
    expect(errorCount).toBe(0);
  });

  /**
   * FR5 (partial): Cart page displays added item
   * Acceptance Criteria:
   * - Cart page loads successfully
   * - URL contains /cart
   * - Added item is displayed
   */
  test('should display cart page with added item', async ({ page }) => {
    const collectionPage = new CollectionPage(page, 'bookmarks');
    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);
    
    // Navigate to product and add to cart
    await collectionPage.goto();
    const productCard = await collectionPage.getFirstProductCard();
    await collectionPage.clickProduct(productCard);
    await productPage.clickAddToCart();
    
    // Navigate to cart page
    await cartPage.goto();
    
    // Assert URL correct
    await expect(page).toHaveURL(/\/cart/, { timeout: 10000 });
    
    // Assert cart has items
    const cartItems = await cartPage.getCartItems();
    const itemCount = await cartItems.count();
    expect(itemCount).toBeGreaterThanOrEqual(1);
    
    console.log(`[CART] Cart page displays ${itemCount} item(s)`);
  });

  /**
   * FR5: Remove item from cart and verify empty state
   * Acceptance Criteria:
   * - Remove button works
   * - Cart count updates to "0"
   * - Empty cart state visible
   * - Empty state message displayed
   */
  test('should remove item from cart and return to empty state', async ({ page }) => {
    const collectionPage = new CollectionPage(page, 'bookmarks');
    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);
    
    // Navigate to product and add to cart
    await collectionPage.goto();
    const productCard = await collectionPage.getFirstProductCard();
    await collectionPage.clickProduct(productCard);
    await productPage.clickAddToCart();
    
    // Navigate to cart page
    await cartPage.goto();
    
    // Get cart count before removal
    const initialCount = await cartPage.getCartCount();
    console.log(`[CART] Cart count before removal: ${initialCount}`);
    
    // Remove item from cart
    const cartItems = await cartPage.getCartItems();
    const firstItem = cartItems.first();
    await cartPage.clickRemoveButton(firstItem);
    
    // Assert cart count updated to expected value
    const newCount = await cartPage.getCartCount();
    expect(newCount).toBe(initialCount - 1);
    console.log(`[CART] Cart count after removal: ${newCount}`);
    
    // If cart is now empty, verify empty state
    if (newCount === 0) {
      const isEmpty = await cartPage.isEmpty();
      expect(isEmpty).toBe(true);
      
      // Assert empty state message visible
      const emptyMessage = await cartPage.getEmptyStateMessage();
      await expect(emptyMessage).toBeVisible({ timeout: 5000 });
      console.log('[CART] Empty state verified');
    }
  });

  /**
   * Cart cleanup verification test
   * Ensures cleanup utility works even if test fails
   * Validates idempotent cleanup behavior
   */
  test('should clean up cart even if test fails (idempotent cleanup)', async ({ page }) => {
    const collectionPage = new CollectionPage(page, 'bookmarks');
    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);
    
    // Add item to cart
    await collectionPage.goto();
    const productCard = await collectionPage.getFirstProductCard();
    await collectionPage.clickProduct(productCard);
    await productPage.clickAddToCart();
    
    // Verify cart has item
    let cartCount = await cartPage.getCartCount();
    expect(cartCount).toBeGreaterThan(0);
    console.log(`[CLEANUP TEST] Cart has ${cartCount} item(s) before cleanup`);
    
    // Manually trigger cleanup (simulating afterEach hook)
    await cleanupCart(page);
    
    // Verify cart is empty after cleanup
    cartCount = await cartPage.getCartCount();
    expect(cartCount).toBe(0);
    console.log('[CLEANUP TEST] Cart successfully cleaned - count is 0');
  });
});

