import { Page, Locator } from '@playwright/test';
import { getElement, SELECTORS } from '../utils/selectors';
import { waitForPageLoad } from '../utils/waitConditions';

/**
 * HomePage Page Object Model
 * Represents homepage (https://prometheamosaic.com/)
 * 
 * Test Scenarios: FR1 (Brand Title), FR2 (Primary Navigation)
 */
export class HomePage {
  private readonly url: string;

  constructor(private readonly page: Page) {
    this.url = process.env.STORE_URL || 'https://prometheamosaic.com/';
  }

  /**
   * Navigate to homepage and wait for load
   */
  async goto(): Promise<void> {
    await waitForPageLoad(this.page, this.url);
  }

  /**
   * Get brand title element
   * Expected text: "Promethea Mosaic"
   */
  async getBrandTitle(): Promise<Locator> {
    return getElement(this.page, SELECTORS.brandTitle);
  }

  /**
   * Get primary navigation element
   * Should contain ≥3 clickable links
   */
  async getNavigation(): Promise<Locator> {
    return getElement(this.page, SELECTORS.navigation);
  }

  /**
   * Get collections link from navigation
   * May be labeled "Collections", "Shop", or "Products"
   */
  async getCollectionsLink(): Promise<Locator> {
    return getElement(this.page, SELECTORS.collectionsLink);
  }

  /**
   * Click collections link and wait for navigation
   * Navigates to /collections or /collections/all
   */
  async clickCollectionsLink(): Promise<void> {
    const link = await this.getCollectionsLink();
    await link.click();
    await this.page.waitForLoadState('load', { timeout: 30000 });
    await this.page.waitForTimeout(500); // Let page settle
  }

  /**
   * Get all navigation links
   * Used for FR2 validation (≥3 links required)
   */
  async getNavigationLinks(): Promise<Locator> {
    const navigation = await this.getNavigation();
    return navigation.locator('a');
  }

  /**
   * Get navigation link count
   * Used for FR2 validation (≥3 required)
   */
  async getNavigationLinkCount(): Promise<number> {
    const links = await this.getNavigationLinks();
    return links.count();
  }
}

