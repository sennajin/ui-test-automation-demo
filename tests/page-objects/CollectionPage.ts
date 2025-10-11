import { Page, Locator } from '@playwright/test';
import { SELECTORS } from '../utils/selectors';
import { waitForPageLoad, waitForProductCard } from '../utils/waitConditions';

/**
 * CollectionPage Page Object Model
 * Represents collection page (default: Bookmarks collection)
 * 
 * Test Scenarios: FR3 (Collection & Product Discovery)
 */
export class CollectionPage {
  private readonly collectionHandle: string;
  private readonly url: string;

  constructor(
    private readonly page: Page, 
    collectionHandle: string = process.env.ANCHOR_COLLECTION_HANDLE || 'bookmarks'
  ) {
    this.collectionHandle = collectionHandle;
    const baseUrl = process.env.STORE_URL || 'https://prometheamosaic.com';
    this.url = `${baseUrl}/collections/${collectionHandle}`;
  }

  /**
   * Navigate to collection page and wait for products to load
   */
  async goto(): Promise<void> {
    await waitForPageLoad(this.page, this.url);
    
    // Wait for at least one product card to be visible
    try {
      await waitForProductCard(this.page);
    } catch {
      // If no products found, log warning but don't fail navigation
      console.warn(`[COLLECTION] No products found in ${this.collectionHandle} collection`);
    }
  }

  /**
   * Get all product card elements
   * Returns empty locator if no products
   */
  async getProductCards(): Promise<Locator> {
    return this.page.locator(SELECTORS.productCard.primary);
  }

  /**
   * Get first visible product card
   * Used for dynamic product selection (no hardcoded IDs)
   */
  async getFirstProductCard(): Promise<Locator> {
    const cards = await this.getProductCards();
    return cards.first();
  }

  /**
   * Get product title from card
   * Collection cards use h3 (not h1 like product pages)
   */
  async getProductTitle(card: Locator): Promise<Locator> {
    return card.locator('h3').first();
  }

  /**
   * Get product price from card
   * Using flexible selector for cross-theme compatibility
   */
  async getProductPrice(card: Locator): Promise<Locator> {
    return card.locator('.price, .price-item, span:has-text("$")').first();
  }

  /**
   * Get product image from card
   */
  async getProductImage(card: Locator): Promise<Locator> {
    return card.locator('img').first();
  }

  /**
   * Click product card to navigate to detail page
   */
  async clickProduct(card: Locator): Promise<void> {
    await card.click();
    await this.page.waitForLoadState('load', { timeout: 30000 });
    
    // Verify navigation to product page
    await this.page.waitForURL(/\/products\//, { timeout: 10000 });
    await this.page.waitForTimeout(500); // Let page settle
  }

  /**
   * Check if collection has products
   * Returns true if ≥1 product card visible
   */
  async hasProducts(): Promise<boolean> {
    const cards = await this.getProductCards();
    const count = await cards.count();
    return count > 0;
  }

  /**
   * Get product count in collection
   * Used for validation and logging
   */
  async getProductCount(): Promise<number> {
    const cards = await this.getProductCards();
    return cards.count();
  }

  /**
   * Get product card at specific index
   * Default behavior: get first product (index 0)
   */
  async getProductCardAt(index: number = 0): Promise<Locator> {
    const cards = await this.getProductCards();
    return cards.nth(index);
  }
}

