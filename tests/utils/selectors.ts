import { Page, Locator } from '@playwright/test';

/**
 * Selector configuration with fallback strategy
 * Implements Constitution Principle 3: Stable selectors with progressive fallback
 */
export interface SelectorConfig {
  primary: string;
  fallback: string[];
  timeout: number;
}

/**
 * Centralized selector definitions for all UI elements
 * Each selector has primary + fallback array to handle theme updates
 * 
 * Theme: Shopify Dawn (detected from quick test)
 * Updated: 2025-10-11 based on live store structure
 */
export const SELECTORS = {
  // FR1: Brand Title
  brandTitle: {
    primary: '.header__heading-link',  // Dawn theme standard
    fallback: ['h1:has-text("Promethea")', 'img[alt*="Promethea"]', 'header h1'],
    timeout: 5000
  },

  // FR2: Primary Navigation
  navigation: {
    primary: 'header .header__inline-menu',  // Dawn desktop nav (visible)
    fallback: ['nav:visible', '.header__menu', 'nav:not(.menu-drawer__navigation)'],
    timeout: 5000
  },

  collectionsLink: {
    primary: '.header__inline-menu a[href*="/collections"]',  // Dawn theme in visible nav
    fallback: ['header a:has-text("Shop")', 'header a:has-text("Collections"):visible', 'a[href*="/collections"]:visible'],
    timeout: 5000
  },

  // FR3: Collection Page Elements
  bookmarksCollectionLink: {
    primary: 'a[href*="/collections/bookmarks"]',
    fallback: ['a:has-text("Bookmarks")', '[data-collection="bookmarks"]'],
    timeout: 5000
  },

  productCard: {
    primary: '.card-wrapper',  // Dawn theme visible card container
    fallback: ['.grid__item', '.product-card', 'li.grid__item', 'article.product'],
    timeout: 10000
  },

  productTitle: {
    primary: 'h1',  // Product detail page typically uses h1
    fallback: [
      'h3',              // Collection page cards use h3
      '.product__title',  // Generic product title class
      'h2',              // Alternative heading
      '.card__heading'   // Card heading
    ],
    timeout: 5000
  },

  productPrice: {
    primary: '.price-item',  // Dawn theme price
    fallback: ['.price', 'span:has-text("$")', '.money'],
    timeout: 5000
  },

  // FR4: Product Detail Page
  addToCartButton: {
    primary: 'button[name="add"]',  // Shopify standard, works across themes
    fallback: ['button:has-text("Add to cart")', '[data-add-to-cart]', 'button.product-form__submit'],
    timeout: 5000
  },

  // FR4, FR5: Cart Elements
  cartIcon: {
    primary: 'a#cart-icon-bubble',  // Dawn theme cart icon
    fallback: ['a[href="/cart"]', '.header__icon--cart', '[data-cart-icon]'],
    timeout: 5000
  },

  cartCount: {
    primary: '.cart-count-bubble',  // Dawn theme cart count badge
    fallback: ['#cart-count', '.cart-count', '[data-cart-count]', 'span.count'],
    timeout: 5000
  },

  removeFromCart: {
    primary: 'cart-remove-button',  // Dawn theme custom element
    fallback: [
      '[href*="change?"][href*="quantity=0"]',  // Link that changes quantity to 0
      '[aria-label*="Remove"]',                  // Accessible label
      'button:has-text("Remove")',                // Text-based remove button
      'a:has-text("Remove")',                    // Link with "Remove" text
      '.cart-item__remove',                      // Generic cart item remove class
      '[data-remove-item]'                       // Data attribute
    ],
    timeout: 5000
  }
};

/**
 * Get element with progressive fallback strategy
 * Tries primary selector first, falls back through array if not found
 * 
 * @param page - Playwright Page instance
 * @param selectorConfig - Selector configuration with primary + fallbacks
 * @returns Locator for the found element
 * @throws Error if all selectors (primary + fallbacks) fail
 */
export async function getElement(
  page: Page, 
  selectorConfig: SelectorConfig
): Promise<Locator> {
  // Try primary selector first
  try {
    const locator = page.locator(selectorConfig.primary);
    await locator.waitFor({ timeout: selectorConfig.timeout });
    return locator;
  } catch {
    // Primary failed, try fallbacks in order
    for (const fallback of selectorConfig.fallback) {
      try {
        const locator = page.locator(fallback);
        await locator.waitFor({ timeout: selectorConfig.timeout });
        console.log(`[SELECTOR] Fallback used: ${fallback} (primary: ${selectorConfig.primary})`);
        return locator;
      } catch {
        // This fallback failed, try next
        continue;
      }
    }
    
    // All selectors exhausted
    throw new Error(
      `Element not found: ${selectorConfig.primary} (all ${selectorConfig.fallback.length} fallbacks exhausted). ` +
      `This may indicate a theme update or page structure change. Please update selectors in tests/utils/selectors.ts`
    );
  }
}

/**
 * Get first matching element from selector config
 * Useful for collections where we need first available item
 */
export async function getFirstElement(
  page: Page,
  selectorConfig: SelectorConfig
): Promise<Locator> {
  const element = await getElement(page, selectorConfig);
  return element.first();
}

/**
 * Check if element exists without waiting (for conditional logic)
 */
export async function elementExists(
  page: Page,
  selectorConfig: SelectorConfig
): Promise<boolean> {
  try {
    const locator = page.locator(selectorConfig.primary);
    await locator.waitFor({ timeout: 1000 });
    return true;
  } catch {
    return false;
  }
}

