# Selector Tuning Guide

**Purpose:** Step-by-step guide to update selectors for Promethea Mosaic store  
**Time Required:** 30-60 minutes  
**Prerequisites:** Chrome/Edge browser with DevTools

---

## Quick Start

### Step 1: Open Live Store in Browser

```
https://prometheamosaic.com/
```

### Step 2: Open DevTools

- **Windows:** Press `F12` or `Ctrl+Shift+I`
- **Mac:** Press `Cmd+Option+I`

### Step 3: Use Inspector Tool

Click the "Select element" icon (top-left of DevTools) or press `Ctrl+Shift+C`

---

## Selector Update Workflow

### 1. Brand Title (Homepage)

**What to Find:** The main site title/logo text

**How to Inspect:**
1. Navigate to https://prometheamosaic.com/
2. Click inspector tool in DevTools
3. Click on the "Promethea Mosaic" text/logo
4. Note the element structure in DevTools

**Common Patterns:**
```html
<!-- Option A: Logo as heading -->
<h1 class="site-header__logo">
  <a href="/">Promethea Mosaic</a>
</h1>

<!-- Option B: Logo as link with span -->
<a class="header__heading-link" href="/">
  <span class="h2">Promethea Mosaic</span>
</a>

<!-- Option C: Logo as image with alt text -->
<a class="site-header__logo-link">
  <img src="logo.png" alt="Promethea Mosaic">
</a>
```

**Update `tests/utils/selectors.ts`:**

```typescript
brandTitle: {
  primary: '.site-header__logo',  // Update this
  fallback: [
    'h1:has-text("Promethea")',
    'img[alt*="Promethea"]',
    '.header__heading-link',
    'a[href="/"] h1'
  ],
  timeout: 5000
}
```

**Test It:**
```bash
npm test -- homepage.spec.ts --grep "brand title" --project=full-hd
```

---

### 2. Primary Navigation (Homepage)

**What to Find:** Main navigation menu (usually in header)

**How to Inspect:**
1. Click inspector on any navigation link
2. Find the parent `<nav>` or `<ul>` element
3. Note the class names or data attributes

**Common Patterns:**
```html
<!-- Option A: Nav with role -->
<nav role="navigation" class="header__menu">
  <ul class="header__menu-list">
    <li><a href="/collections">Shop</a></li>
    ...
  </ul>
</nav>

<!-- Option B: Nav without role -->
<div class="main-menu">
  <ul class="menu-list">
    <li><a href="/collections">Collections</a></li>
    ...
  </ul>
</div>

<!-- Option C: Header nav -->
<header>
  <nav class="navigation">
    <a href="/collections">Shop</a>
    ...
  </nav>
</header>
```

**Update `tests/utils/selectors.ts`:**

```typescript
navigation: {
  primary: 'nav.header__menu',  // Update based on what you see
  fallback: [
    '[role="navigation"]',
    'header nav',
    '.main-menu',
    '.navigation'
  ],
  timeout: 5000
}
```

**Test It:**
```bash
npm test -- homepage.spec.ts --grep "navigation" --project=full-hd
```

---

### 3. Collections Link (Homepage)

**What to Find:** Link to collections/shop page

**How to Inspect:**
1. Find the "Collections" or "Shop" link in navigation
2. Note the href attribute and any classes
3. Check the link text

**Common Patterns:**
```html
<!-- Option A: Direct link -->
<a href="/collections" class="header__menu-item">Collections</a>

<!-- Option B: Link with nested structure -->
<li class="menu-item">
  <a href="/collections/all">Shop</a>
</li>

<!-- Option C: Different text -->
<a href="/collections">Products</a>
```

**Update `tests/utils/selectors.ts`:**

```typescript
collectionsLink: {
  primary: 'a[href*="/collections"]',  // Keep this generic
  fallback: [
    'nav a:has-text("Collections")',
    'nav a:has-text("Shop")',
    'nav a:has-text("Products")',
    '.header__menu-item[href*="/collections"]'
  ],
  timeout: 5000
}
```

**Pro Tip:** Text-based selectors (`:has-text()`) are often more stable than classes.

---

### 4. Product Card (Collection Page)

**What to Find:** Individual product items in grid

**How to Inspect:**
1. Navigate to https://prometheamosaic.com/collections/bookmarks
2. Click inspector on any product card
3. Find the container element (usually `<div>`, `<article>`, or `<li>`)

**Common Patterns:**
```html
<!-- Option A: Grid item -->
<div class="grid__item">
  <div class="product-card">
    <img src="product.jpg" alt="Product Name">
    <h3 class="product-card__title">Product Name</h3>
    <span class="product-card__price">$12.00</span>
  </div>
</div>

<!-- Option B: Article element -->
<article class="product-item">
  <a href="/products/handle">
    <img src="product.jpg">
    <h3>Product Name</h3>
    <span class="price">$12.00</span>
  </a>
</article>

<!-- Option C: List item -->
<li class="collection__item">
  <div class="product">
    <!-- product details -->
  </div>
</li>
```

**Update `tests/utils/selectors.ts`:**

```typescript
productCard: {
  primary: '.product-card',  // Update to match store
  fallback: [
    '.grid__item',
    'article.product-item',
    '.collection__item',
    '[data-product-card]'
  ],
  timeout: 10000
}
```

---

### 5. Product Title (Within Product Card)

**What to Find:** Product name within the card

**Common Patterns:**
```html
<h3 class="product-card__title">Product Name</h3>
<h2 class="product__title">Product Name</h2>
<a class="product-link">Product Name</a>
```

**Update `tests/utils/selectors.ts`:**

```typescript
productTitle: {
  primary: '.product-card__title',  // Update
  fallback: [
    'h3',
    'h2',
    '.product__title',
    'a.product-link'
  ],
  timeout: 5000
}
```

---

### 6. Product Price (Within Product Card)

**What to Find:** Price text/element

**Common Patterns:**
```html
<span class="product-card__price">$12.00 USD</span>
<div class="price"><span class="money">$12.00</span></div>
<span class="price-item">$12.00</span>
```

**Update `tests/utils/selectors.ts`:**

```typescript
productPrice: {
  primary: '.product-card__price',  // Update
  fallback: [
    '.price',
    'span:has-text("$")',
    '.money',
    '.price-item'
  ],
  timeout: 5000
}
```

---

### 7. Add to Cart Button (Product Page)

**What to Find:** "Add to Cart" button on product detail page

**How to Inspect:**
1. Navigate to any product page
2. Find the add to cart button
3. Note `name` attribute, classes, and text

**Common Patterns:**
```html
<button name="add" class="product-form__submit">Add to Cart</button>
<button type="submit" class="btn-add-to-cart">Add to Cart</button>
<button data-add-to-cart>Add to Cart</button>
```

**Update `tests/utils/selectors.ts`:**

```typescript
addToCartButton: {
  primary: 'button[name="add"]',  // Shopify standard
  fallback: [
    'button:has-text("Add to Cart")',
    '.product-form__submit',
    '[data-add-to-cart]',
    'button.btn-add-to-cart'
  ],
  timeout: 5000
}
```

---

### 8. Cart Icon (Header)

**What to Find:** Cart icon/link in header (usually top-right)

**Common Patterns:**
```html
<a href="/cart" class="header__icon--cart">
  <svg>...</svg>
  <span class="cart-count">0</span>
</a>

<a class="cart-link" href="/cart">
  Cart <span class="count">0</span>
</a>
```

**Update `tests/utils/selectors.ts`:**

```typescript
cartIcon: {
  primary: 'a[href="/cart"]',  // Generic, usually works
  fallback: [
    '.header__icon--cart',
    '.cart-link',
    'a:has-text("Cart")',
    '[data-cart-icon]'
  ],
  timeout: 5000
}
```

---

### 9. Cart Count (Badge on Cart Icon)

**What to Find:** Number badge showing cart item count

**Common Patterns:**
```html
<span class="cart-count">1</span>
<span class="cart-count-bubble">1</span>
<span id="cart-count">1</span>
```

**Update `tests/utils/selectors.ts`:**

```typescript
cartCount: {
  primary: '.cart-count',  // Update based on store
  fallback: [
    '.cart-count-bubble',
    '#cart-count',
    '[data-cart-count]',
    'a[href="/cart"] span'
  ],
  timeout: 5000
}
```

**Important:** This element must contain the numeric count (e.g., "1", "2") for tests to work.

---

### 10. Remove from Cart Button (Cart Page)

**What to Find:** Button to remove item from cart

**How to Inspect:**
1. Add item to cart (manually)
2. Navigate to https://prometheamosaic.com/cart
3. Find the "Remove" button
4. Note classes, text, or data attributes

**Common Patterns:**
```html
<button class="cart-item__remove" data-index="1">Remove</button>
<a href="#" class="cart__remove">Remove</a>
<button type="button" data-cart-item-remove>×</button>
```

**Update `tests/utils/selectors.ts`:**

```typescript
removeFromCart: {
  primary: 'button:has-text("Remove")',  // Text-based is stable
  fallback: [
    '.cart-item__remove',
    '.cart__remove',
    '[data-cart-item-remove]',
    'a:has-text("Remove")'
  ],
  timeout: 5000
}
```

---

## Testing Strategy

### Test Each Selector Individually

```bash
# Homepage tests
npm test -- homepage.spec.ts --project=full-hd --retries=0

# Collection tests
npm test -- collection.spec.ts --project=full-hd --retries=0

# Cart tests
npm test -- cart.spec.ts --project=full-hd --retries=0
```

### Use Headed Mode to See What's Happening

```bash
npm run test:headed -- homepage.spec.ts
```

### Debug Mode (Pause at Each Step)

```bash
npm run test:debug -- homepage.spec.ts
```

---

## Quick Selector Testing in Browser Console

You can test selectors directly in the browser console:

```javascript
// Test if selector finds element
document.querySelector('.site-header__logo')

// Test Playwright text selector equivalent
document.querySelector('h1:has(a:contains("Promethea"))')

// Count matches
document.querySelectorAll('.product-card').length

// Verify cart count element
document.querySelector('.cart-count')?.textContent
```

---

## Common Shopify Theme Selectors

If Promethea Mosaic uses a standard Shopify theme, try these:

### Dawn Theme (Shopify's default)
```typescript
brandTitle: '.header__heading-link',
navigation: '.header__menu',
productCard: '.card-wrapper',
addToCartButton: 'button[name="add"]',
cartCount: '.cart-count-bubble'
```

### Debut Theme
```typescript
brandTitle: '.site-header__logo',
navigation: '.site-nav',
productCard: '.grid__item',
addToCartButton: '.product-form__cart-submit',
cartCount: '#CartCount'
```

### Brooklyn Theme
```typescript
brandTitle: '.site-header__logo-link',
navigation: '.site-nav__list',
productCard: '.grid-product',
addToCartButton: '.product-form__add-button',
cartCount: '.cart-link__count'
```

---

## Selector Best Practices

### Priority Order (Most Stable → Least Stable)

1. **Data Attributes** (most stable)
   ```typescript
   '[data-test-id="product-card"]'
   '[data-product-card]'
   ```

2. **Semantic HTML with ARIA** (very stable)
   ```typescript
   'nav[role="navigation"]'
   'button[name="add"]'
   ```

3. **Text-based** (stable for static text)
   ```typescript
   'button:has-text("Add to Cart")'
   'a:has-text("Collections")'
   ```

4. **Class names** (less stable, theme-dependent)
   ```typescript
   '.product-card__title'
   '.header__menu'
   ```

5. **Generic elements** (least stable, avoid)
   ```typescript
   'h3'  // Too generic
   'div > a'  // Too brittle
   ```

### Write Defensive Selectors

```typescript
// ✅ GOOD: Specific with meaningful fallbacks
productTitle: {
  primary: '.product-card__title',
  fallback: [
    '[data-product-title]',
    'h3.product__title',
    'a.product-link'
  ],
  timeout: 5000
}

// ❌ BAD: No fallbacks, too specific
productTitle: {
  primary: 'div.grid > div.grid__item > div.card > h3.card__title',
  fallback: [],
  timeout: 5000
}
```

---

## Troubleshooting

### "Element not found" even with correct selector

**Possible Causes:**
1. Element loads after timeout (increase `timeout`)
2. Element hidden behind modal/overlay
3. Element in iframe
4. JavaScript not finished rendering

**Solutions:**
```typescript
// Increase timeout
brandTitle: {
  primary: '.site-header__logo',
  fallback: ['h1'],
  timeout: 10000  // Increased from 5000
}
```

### "Multiple elements found" error

**Solution:** Use `.first()` or be more specific

```typescript
// In Page Object Model
async getFirstProductCard(): Promise<Locator> {
  const cards = this.page.locator(SELECTORS.productCard.primary);
  return cards.first();  // Get first match
}
```

### Cart count doesn't update

**Possible Causes:**
1. Shopify uses AJAX to update cart
2. Cart count element replaced (not text updated)
3. Need to wait for network request

**Solution:**
```typescript
// In waitConditions.ts
await page.waitForResponse(resp => 
  resp.url().includes('/cart/add') && resp.status() === 200
);
```

---

## Final Validation

Once all selectors updated:

```bash
# 1. Run full suite once
npm test

# 2. Run 10 consecutive times (reliability test)
for i in {1..10}; do
  echo "Run $i/10"
  npm test
  if [ $? -ne 0 ]; then
    echo "Failed on run $i"
    break
  fi
done

# 3. Check timing
npm test -- --reporter=list
# Should see < 5 minutes total
```

---

## Need Help?

**Common Issues:** See `docs/runbook.md` → "Issue: Selector Not Found"  
**Theme Changes:** See `docs/maintenance.md` → "Updating Selectors After Theme Changes"  
**Questions:** Open issue with screenshot of element in DevTools

---

**Last Updated:** 2025-10-11  
**Next Review:** After each theme update

