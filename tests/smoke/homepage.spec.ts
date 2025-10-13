import { test, expect } from '@playwright/test';
import { HomePage } from '../page-objects/HomePage';
import { cleanupCart } from '../utils/cleanup';
import { enableCartMocking } from '../utils/mockCart';

/**
 * Test Scenario 1: Homepage & Navigation
 * Validates FR1 (Brand Title) and FR2 (Primary Navigation)
 * 
 * Constitutional Principle 2: Guaranteed cleanup in afterEach
 * Constitutional Principle 3: Explicit waits, semantic selectors
 * 
 * NOTE: Cart mocking enabled to avoid rate limiting during cleanup
 */
test.describe('Homepage & Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Enable cart API mocking to avoid Cloudflare rate limits during cleanup
    await enableCartMocking(page, { logRequests: false });
  });

  test.afterEach(async ({ page }) => {
    // Cart cleanup (defensive, even though homepage tests don't modify cart)
    // Implements Constitution Principle 2: No residue
    await cleanupCart(page);
  });

  /**
   * FR1: Homepage brand title visible
   * Acceptance Criteria:
   * - Page loads successfully (< 10 seconds)
   * - Brand title contains "Promethea Mosaic"
   * - No critical JavaScript errors
   */
  test('should display brand title "Promethea Mosaic" on homepage', async ({ page }) => {
    const homePage = new HomePage(page);
    
    // Navigate to homepage
    await homePage.goto();
    
    // Assert brand title visible
    const brandTitle = await homePage.getBrandTitle();
    await expect(brandTitle).toBeVisible({ timeout: 5000 });
    
    // Check if it's an image (logo) or text element
    const tagName = await brandTitle.evaluate(el => el.tagName.toLowerCase());
    
    if (tagName === 'img') {
      // Logo is an image - check alt attribute
      await expect(brandTitle).toHaveAttribute('alt', /Promethea/i, { timeout: 5000 });
      console.log('[HOMEPAGE] Brand logo found (image with alt text)');
    } else {
      // Logo is text - check text content
      await expect(brandTitle).toContainText('Promethea Mosaic', { 
        ignoreCase: true,
        timeout: 5000
      });
      console.log('[HOMEPAGE] Brand title found (text element)');
    }
    
    // Verify no critical JavaScript errors (check console)
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Wait a moment for any late-loading errors
    await page.waitForTimeout(1000);
    
    // Assert no errors (excluding common third-party noise)
    const criticalErrors = consoleErrors.filter(
      error => !error.includes('favicon') && !error.includes('analytics')
    );
    expect(criticalErrors.length).toBe(0);
  });

  /**
   * FR2: Primary navigation visible with collections link
   * Acceptance Criteria:
   * - Navigation visible
   * - Navigation has ≥3 links
   * - Collections/Shop link present and visible
   */
  test('should display primary navigation with collections link', async ({ page }) => {
    const homePage = new HomePage(page);
    
    // Navigate to homepage
    await homePage.goto();
    
    // Assert navigation visible
    const navigation = await homePage.getNavigation();
    await expect(navigation).toBeVisible({ timeout: 5000 });
    
    // Assert navigation has ≥3 links (FR2 requirement)
    const navLinks = await homePage.getNavigationLinks();
    const linkCount = await navLinks.count();
    expect(linkCount).toBeGreaterThanOrEqual(3);
    
    // Assert collections/shop link present
    const collectionsLink = await homePage.getCollectionsLink();
    await expect(collectionsLink).toBeVisible({ timeout: 5000 });
  });

  /**
   * FR2: Navigation clickable
   * Acceptance Criteria:
   * - Collections link is clickable
   * - Navigation succeeds (URL contains /collections)
   * - No navigation errors
   */
  test('should navigate to collections page when clicking collections link', async ({ page }) => {
    const homePage = new HomePage(page);
    
    // Navigate to homepage
    await homePage.goto();
    
    // Click collections link
    await homePage.clickCollectionsLink();
    
    // Assert navigation successful (URL contains /collections)
    await expect(page).toHaveURL(/\/collections/, { timeout: 10000 });
    
    // Verify page loaded (not error page)
    const bodyText = await page.textContent('body');
    expect(bodyText).not.toContain('404');
    expect(bodyText).not.toContain('Page not found');
  });
});

