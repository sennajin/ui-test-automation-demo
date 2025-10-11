# Quick Start: Next Implementation Steps

**Your immediate goal:** Implement Phase 2 (utilities and Page Object Models) to enable test writing.

---

## Start Here: Task T008

### File to Create: `tests/utils/selectors.ts`

Copy this complete code:

```typescript
import { Page, Locator } from '@playwright/test';

export interface SelectorConfig {
  primary: string;
  fallback: string[];
  timeout: number;
}

export const SELECTORS = {
  brandTitle: {
    primary: 'h1:has-text("Promethea Mosaic")',
    fallback: ['[data-test-id="site-title"]', 'title'],
    timeout: 5000
  },
  navigation: {
    primary: 'nav[role="navigation"]',
    fallback: ['header nav', '.main-nav'],
    timeout: 5000
  },
  collectionsLink: {
    primary: 'nav a[href*="/collections"]',
    fallback: ['a:has-text("Collections")', 'a:has-text("Shop")'],
    timeout: 5000
  },
  bookmarksCollectionLink: {
    primary: 'a[href="/collections/bookmarks"]',
    fallback: ['a:has-text("Bookmarks")'],
    timeout: 5000
  },
  productCard: {
    primary: '[data-test-id="product-card"]',
    fallback: ['.product-card', '.product-item'],
    timeout: 10000
  },
  productTitle: {
    primary: '[data-test-id="product-title"]',
    fallback: ['.product-card h3', '.product-title', 'h1'],
    timeout: 5000
  },
  productPrice: {
    primary: '[data-test-id="product-price"]',
    fallback: ['.price', '.product-price'],
    timeout: 5000
  },
  addToCartButton: {
    primary: 'button:has-text("Add to Cart")',
    fallback: ['[name="add"]', 'button[type="submit"]'],
    timeout: 5000
  },
  cartIcon: {
    primary: '[data-test-id="cart-icon"]',
    fallback: ['a[href="/cart"]', '.cart-link'],
    timeout: 5000
  },
  cartCount: {
    primary: '[data-test-id="cart-count"]',
    fallback: ['.cart-icon .count', '.cart-count'],
    timeout: 5000
  },
  removeFromCart: {
    primary: 'button:has-text("Remove")',
    fallback: ['[name="updates[]"][value="0"]'],
    timeout: 5000
  }
};

// Utility function to get element with progressive fallback (T009)
export async function getElement(
  page: Page,
  selectorConfig: SelectorConfig
): Promise<Locator> {
  try {
    const locator = page.locator(selectorConfig.primary);
    await locator.waitFor({ timeout: selectorConfig.timeout });
    return locator;
  } catch {
    for (const fallback of selectorConfig.fallback) {
      try {
        const locator = page.locator(fallback);
        await locator.waitFor({ timeout: selectorConfig.timeout });
        console.log(`[SELECTOR] Fallback used: ${fallback}`);
        return locator;
      } catch {
        continue;
      }
    }
    throw new Error(
      `Element not found: ${selectorConfig.primary} (all fallbacks exhausted)`
    );
  }
}
```

**This completes T008 and T009!**

---

## Task T010: Wait Conditions

### File to Create: `tests/utils/waitConditions.ts`

```typescript
import { Page, expect } from '@playwright/test';
import { SELECTORS, getElement } from './selectors';

export async function waitForPageLoad(page: Page, url: string) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
  await page.waitForLoadState('networkidle', { timeout: 10000 });
}

export async function waitForCartCount(page: Page, expectedCount: number, timeout = 5000) {
  const cartCountLocator = page.locator(SELECTORS.cartCount.primary);
  await expect(cartCountLocator).toHaveText(expectedCount.toString(), { timeout });
}

export async function waitForProductCard(page: Page) {
  const productCard = page.locator(SELECTORS.productCard.primary).first();
  await productCard.waitFor({ state: 'visible', timeout: 10000 });
  
  // Ensure image is loaded (not broken)
  const img = productCard.locator('img').first();
  await expect(img).toHaveJSProperty('complete', true, { timeout: 5000 });
}

export async function waitForNavigation(page: Page) {
  const navigation = await getElement(page, SELECTORS.navigation);
  await navigation.waitFor({ state: 'visible', timeout: 5000 });
}

export async function waitForCartPageLoad(page: Page) {
  await expect(page).toHaveURL(/\/cart/, { timeout: 10000 });
  await page.waitForLoadState('networkidle', { timeout: 10000 });
}
```

**This completes T010!**

---

## Task T011: Cart Cleanup

### File to Create: `tests/utils/cleanup.ts`

```typescript
import { Page, expect } from '@playwright/test';
import { SELECTORS, getElement } from './selectors';
import { waitForCartCount } from './waitConditions';

export async function cleanupCart(page: Page) {
  try {
    await page.goto('https://prometheamosaic.com/cart', {
      waitUntil: 'domcontentloaded',
      timeout: 10000
    });

    // Check if cart has items
    const cartItems = page.locator('.cart-item');
    const itemCount = await cartItems.count();

    if (itemCount === 0) {
      console.log('[CLEANUP] Cart already empty');
      return;
    }

    // Remove all items (idempotent: works even if test added multiple items)
    for (let i = 0; i < itemCount; i++) {
      const removeBtn = await getElement(page, SELECTORS.removeFromCart);
      await removeBtn.click();
      await waitForCartCount(page, itemCount - i - 1);
    }

    // Verify empty state
    const cartCountLocator = await getElement(page, SELECTORS.cartCount);
    await expect(cartCountLocator).toHaveText('0');
    console.log('[CLEANUP] Cart cleaned successfully');

  } catch (error) {
    console.error('[CLEANUP] Failed to clean cart:', error);
    // Log warning but don't fail test (allows manual review)
  }
}
```

**This completes T011!**

---

## Task T012: HomePage POM

### File to Create: `tests/page-objects/HomePage.ts`

```typescript
import { Page, Locator } from '@playwright/test';
import { getElement, SELECTORS } from '../utils/selectors';

export class HomePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async getBrandTitle(): Promise<Locator> {
    return getElement(this.page, SELECTORS.brandTitle);
  }

  async getNavigation(): Promise<Locator> {
    return getElement(this.page, SELECTORS.navigation);
  }

  async getCollectionsLink(): Promise<Locator> {
    return getElement(this.page, SELECTORS.collectionsLink);
  }

  async clickCollectionsLink() {
    const link = await this.getCollectionsLink();
    await link.click();
    await this.page.waitForLoadState('networkidle');
  }
}
```

**This completes T012!**

---

## Task T013: CollectionPage POM

### File to Create: `tests/page-objects/CollectionPage.ts`

```typescript
import { Page, Locator } from '@playwright/test';
import { getElement, SELECTORS } from '../utils/selectors';

export class CollectionPage {
  private collectionHandle: string;
  private url: string;

  constructor(private page: Page, collectionHandle = 'bookmarks') {
    this.collectionHandle = collectionHandle;
    this.url = `https://prometheamosaic.com/collections/${collectionHandle}`;
  }

  async goto() {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('networkidle');
  }

  async getProductCards(): Promise<Locator> {
    return this.page.locator(SELECTORS.productCard.primary);
  }

  async getFirstProductCard(): Promise<Locator> {
    const cards = await this.getProductCards();
    return cards.first();
  }

  async getProductTitle(card: Locator): Promise<Locator> {
    return card.locator(SELECTORS.productTitle.primary);
  }

  async getProductPrice(card: Locator): Promise<Locator> {
    return card.locator(SELECTORS.productPrice.primary);
  }

  async getProductImage(card: Locator): Promise<Locator> {
    return card.locator('img').first();
  }

  async clickProduct(card: Locator) {
    await card.click();
    await this.page.waitForLoadState('networkidle');
  }

  async hasProducts(): Promise<boolean> {
    const cards = await this.getProductCards();
    const count = await cards.count();
    return count > 0;
  }
}
```

**This completes T013!**

---

## Task T014: ProductPage POM

### File to Create: `tests/page-objects/ProductPage.ts`

```typescript
import { Page, Locator } from '@playwright/test';
import { getElement, SELECTORS } from '../utils/selectors';
import { waitForCartCount } from '../utils/waitConditions';

export class ProductPage {
  constructor(private page: Page) {}

  async getTitle(): Promise<Locator> {
    return getElement(this.page, SELECTORS.productTitle);
  }

  async getPrice(): Promise<Locator> {
    return getElement(this.page, SELECTORS.productPrice);
  }

  async getAddToCartButton(): Promise<Locator> {
    return getElement(this.page, SELECTORS.addToCartButton);
  }

  async clickAddToCart() {
    const button = await this.getAddToCartButton();
    await button.click();
    // Wait for cart count to update
    await waitForCartCount(this.page, 1);
  }

  async isAddToCartEnabled(): Promise<boolean> {
    const button = await this.getAddToCartButton();
    return await button.isEnabled();
  }
}
```

**This completes T014!**

---

## Task T015: CartPage POM

### File to Create: `tests/page-objects/CartPage.ts`

```typescript
import { Page, Locator } from '@playwright/test';
import { getElement, SELECTORS } from '../utils/selectors';
import { waitForCartCount } from '../utils/waitConditions';

export class CartPage {
  private url = 'https://prometheamosaic.com/cart';

  constructor(private page: Page) {}

  async goto() {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('networkidle');
  }

  async getCartItems(): Promise<Locator> {
    return this.page.locator('.cart-item');
  }

  async getCartCount(): Promise<number> {
    const cartCountLocator = await getElement(this.page, SELECTORS.cartCount);
    const text = await cartCountLocator.textContent();
    return parseInt(text || '0', 10);
  }

  async getRemoveButton(item: Locator): Promise<Locator> {
    return item.locator(SELECTORS.removeFromCart.primary).first();
  }

  async clickRemoveButton(item: Locator) {
    const currentCount = await this.getCartCount();
    const button = await this.getRemoveButton(item);
    await button.click();
    await waitForCartCount(this.page, currentCount - 1);
  }

  async removeAllItems() {
    const items = await this.getCartItems();
    const itemCount = await items.count();

    for (let i = 0; i < itemCount; i++) {
      const firstItem = items.first();
      await this.clickRemoveButton(firstItem);
    }
  }

  async isEmpty(): Promise<boolean> {
    const count = await this.getCartCount();
    return count === 0;
  }

  async getEmptyStateMessage(): Promise<Locator> {
    return this.page.locator('[data-test-id="empty-cart-message"]');
  }
}
```

**This completes T015!**

---

## Phase 2 Complete! 🎉

**After creating all 8 files above, you've completed Phase 2 (100%)!**

### Verify Phase 2 Completion

Run this quick test to verify everything works:

**File:** `tests/smoke/test-pom.spec.ts` (temporary test file)

```typescript
import { test, expect } from '@playwright/test';
import { HomePage } from '../page-objects/HomePage';
import { CollectionPage } from '../page-objects/CollectionPage';

test('verify POMs work', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();

  const brandTitle = await homePage.getBrandTitle();
  await expect(brandTitle).toBeVisible();
  console.log('✅ HomePage POM works!');

  const collectionPage = new CollectionPage(page);
  await collectionPage.goto();

  const hasProducts = await collectionPage.hasProducts();
  expect(hasProducts).toBe(true);
  console.log('✅ CollectionPage POM works!');
});
```

**Run it:**
```bash
npx playwright test tests/smoke/test-pom.spec.ts --project=full-hd
```

If this passes, **Phase 2 is complete!** Delete `test-pom.spec.ts` and move to Phase 3.

---

## Next: Phase 3 - Test Implementation

**T016: Create Homepage Test File Structure**

```bash
# Create test file
touch tests/smoke/homepage.spec.ts
```

See `specs/001-build-an-mvp/tasks.md` for T016-T020 (Homepage tests).

---

**You now have everything you need to complete Phase 2 in ~2-3 hours!** 🚀

