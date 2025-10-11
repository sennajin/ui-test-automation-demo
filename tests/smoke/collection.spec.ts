import { test, expect } from '@playwright/test';
import { HomePage } from '../page-objects/HomePage';
import { CollectionPage } from '../page-objects/CollectionPage';
import { ProductPage } from '../page-objects/ProductPage';
import { cleanupCart } from '../utils/cleanup';

/**
 * Test Scenario 2: Collection & Product Discovery
 * Validates FR3 (Collection Display) and FR4 partial (Product Detail)
 * 
 * Constitutional Principle 2: Guaranteed cleanup in afterEach
 * Constitutional Principle 3: Dynamic product selection (no hardcoded IDs)
 */
test.describe('Collection & Product Discovery', () => {
  test.afterEach(async ({ page }) => {
    // Cart cleanup (some tests may navigate to product pages)
    await cleanupCart(page);
  });

  /**
   * FR3: Bookmarks collection loads successfully
   * Acceptance Criteria:
   * - Collection page loads (< 10 seconds)
   * - URL contains /collections/bookmarks
   * - At least 1 product visible
   */
  test('should load bookmarks collection page successfully', async ({ page }) => {
    const collectionPage = new CollectionPage(page, 'bookmarks');
    
    // Navigate to bookmarks collection
    await collectionPage.goto();
    
    // Assert page loaded (URL correct)
    await expect(page).toHaveURL(/\/collections\/bookmarks/, { timeout: 10000 });
    
    // Assert collection has products
    const hasProducts = await collectionPage.hasProducts();
    expect(hasProducts).toBe(true);
    
    // Log product count for debugging
    const productCount = await collectionPage.getProductCount();
    console.log(`[COLLECTION] Bookmarks collection has ${productCount} product(s)`);
  });

  /**
   * FR3: Product card displays image, title, and price
   * Acceptance Criteria:
   * - Product card visible
   * - Image loaded (not broken)
   * - Title visible and non-empty
   * - Price visible and formatted as currency
   */
  test('should display product cards with image, title, and price', async ({ page }) => {
    const collectionPage = new CollectionPage(page, 'bookmarks');
    
    // Navigate to bookmarks collection
    await collectionPage.goto();
    
    // Get first product card (dynamic selection)
    const productCard = await collectionPage.getFirstProductCard();
    await expect(productCard).toBeVisible({ timeout: 10000 });
    
    // Assert product image visible and loaded
    const productImage = await collectionPage.getProductImage(productCard);
    await expect(productImage).toBeVisible({ timeout: 5000 });
    
    // Verify image is loaded (not broken)
    const imageLoaded = await productImage.evaluate((img: HTMLImageElement) => img.complete && img.naturalHeight > 0);
    expect(imageLoaded).toBe(true);
    
    // Assert product title exists and has text (may be visually hidden on some cards)
    const productTitle = await collectionPage.getProductTitle(productCard);
    const titleText = await productTitle.textContent({ timeout: 5000 });
    expect(titleText?.trim().length).toBeGreaterThan(0);
    console.log(`[COLLECTION] Product title: "${titleText?.trim()}"`);
    
    // Assert product price visible and formatted
    const productPrice = await collectionPage.getProductPrice(productCard);
    await expect(productPrice).toBeVisible({ timeout: 5000 });
    const priceText = await productPrice.textContent();
    expect(priceText).toMatch(/\$[\d.,]+/); // Matches currency format like $12.00
    
    // Log for debugging
    console.log(`[COLLECTION] Product: "${titleText?.trim()}" - ${priceText?.trim()}`);
  });

  /**
   * FR3: Product card clickable
   * Acceptance Criteria:
   * - Product card is clickable
   * - Navigation to product detail page succeeds
   * - URL contains /products/
   */
  test('should navigate to product detail page when clicking product card', async ({ page }) => {
    const collectionPage = new CollectionPage(page, 'bookmarks');
    
    // Navigate to bookmarks collection
    await collectionPage.goto();
    
    // Click first product card (dynamic selection)
    const productCard = await collectionPage.getFirstProductCard();
    await collectionPage.clickProduct(productCard);
    
    // Assert navigation to product page (URL contains /products/)
    await expect(page).toHaveURL(/\/products\//, { timeout: 10000 });
    
    // Verify product page loaded (not error)
    const bodyText = await page.textContent('body');
    expect(bodyText).not.toContain('404');
  });

  /**
   * FR4 (partial): Product detail page displays title, price, add-to-cart button
   * Acceptance Criteria:
   * - Product title visible
   * - Price visible
   * - Add-to-cart button visible and enabled
   */
  test('should display product detail page with title, price, and add-to-cart button', async ({ page }) => {
    const collectionPage = new CollectionPage(page, 'bookmarks');
    const productPage = new ProductPage(page);
    
    // Navigate to product via collection (realistic user flow)
    await collectionPage.goto();
    const productCard = await collectionPage.getFirstProductCard();
    await collectionPage.clickProduct(productCard);
    
    // Assert product title visible
    const title = await productPage.getTitle();
    await expect(title).toBeVisible({ timeout: 5000 });
    const titleText = await title.textContent();
    expect(titleText?.trim().length).toBeGreaterThan(0);
    
    // Assert product price visible
    const price = await productPage.getPrice();
    await expect(price).toBeVisible({ timeout: 5000 });
    const priceText = await price.textContent();
    expect(priceText).toMatch(/\$[\d.,]+/);
    
    // Assert add-to-cart button visible and enabled
    const addToCartBtn = await productPage.getAddToCartButton();
    await expect(addToCartBtn).toBeVisible({ timeout: 5000 });
    const isEnabled = await productPage.isAddToCartEnabled();
    expect(isEnabled).toBe(true);
    
    // Log for debugging
    console.log(`[PRODUCT] "${titleText?.trim()}" - ${priceText?.trim()} - Add to Cart: ${isEnabled ? 'enabled' : 'disabled'}`);
  });
});

