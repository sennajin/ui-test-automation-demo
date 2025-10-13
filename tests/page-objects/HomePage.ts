import { Page, Locator } from '@playwright/test';
import { getElement, SELECTORS } from '../utils/selectors';
import { waitForPageLoad } from '../utils/waitConditions';
import { isMobileViewport } from '../utils/viewport';

/**
 * HomePage Page Object Model
 * Represents homepage (https://prometheamosaic.com/)
 * 
 * Test Scenarios: FR1 (Brand Title), FR2 (Primary Navigation)
 * 
 * Mobile Support: Automatically detects viewport and handles mobile menu drawer
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
   * Open mobile menu drawer if on mobile viewport
   * No-op on desktop or if drawer is already open
   */
  async openMobileMenuIfNeeded(): Promise<void> {
    const isMobile = await isMobileViewport(this.page);
    
    if (!isMobile) {
      return; // Not mobile, nothing to do
    }
    
    try {
      // Check if drawer is already open using fallback strategy
      // We create a temporary selector config with shorter timeout for the quick check
      const drawerCheckConfig = {
        ...SELECTORS.mobileMenuDrawer,
        timeout: 1000
      };
      
      const isDrawerAlreadyOpen = await getElement(this.page, drawerCheckConfig)
        .then(() => true)
        .catch(() => false);
      
      if (isDrawerAlreadyOpen) {
        console.log('[HOMEPAGE] Mobile menu drawer already open');
        return;
      }
      
      // Drawer not open, click menu button to open it
      const menuButton = await getElement(this.page, SELECTORS.mobileMenuButton);
      await menuButton.click();
      
      // Wait for drawer to open using fallback strategy
      await getElement(this.page, SELECTORS.mobileMenuDrawer);
      
      console.log('[HOMEPAGE] Mobile menu drawer opened');
    } catch (error) {
      console.log('[HOMEPAGE] Could not open mobile menu:', error);
      throw error;
    }
  }

  /**
   * Get primary navigation element
   * Should contain ≥3 clickable links
   * Automatically handles mobile drawer if needed
   */
  async getNavigation(): Promise<Locator> {
    const isMobile = await isMobileViewport(this.page);
    
    if (isMobile) {
      // On mobile, open drawer first and return mobile navigation
      await this.openMobileMenuIfNeeded();
      return getElement(this.page, SELECTORS.mobileNavigation);
    } else {
      // On desktop, return standard navigation
      return getElement(this.page, SELECTORS.navigation);
    }
  }

  /**
   * Get collections link from navigation
   * May be labeled "Collections", "Shop", or "Catalog"
   * Automatically handles mobile drawer if needed
   */
  async getCollectionsLink(): Promise<Locator> {
    const isMobile = await isMobileViewport(this.page);
    
    if (isMobile) {
      // On mobile, ensure drawer is open first
      await this.openMobileMenuIfNeeded();
    }
    
    return getElement(this.page, SELECTORS.collectionsLink);
  }

  /**
   * Click collections link and wait for navigation
   * Navigates to /collections or /collections/all
   * Automatically handles mobile drawer if needed
   */
  async clickCollectionsLink(): Promise<void> {
    const isMobile = await isMobileViewport(this.page);
    
    if (isMobile) {
      // On mobile, ensure drawer is open first
      await this.openMobileMenuIfNeeded();
    }
    
    const link = await this.getCollectionsLink();
    await link.click();
    await this.page.waitForLoadState('load', { timeout: 30000 });
    await this.page.waitForTimeout(500); // Let page settle
  }

  /**
   * Get all navigation links
   * Used for FR2 validation (≥3 links required)
   * Automatically handles mobile drawer if needed
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

