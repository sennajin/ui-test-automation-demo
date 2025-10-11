# Selector Tuning Cheat Sheet

**Quick reference for updating selectors after inspecting live store**

---

## 🚀 Quick Start (5 Minutes)

### 1. Open Store & DevTools
```
URL: https://prometheamosaic.com/
Press F12 to open DevTools
```

### 2. Click Inspector Tool
```
Top-left icon in DevTools OR Ctrl+Shift+C
```

### 3. Click Element → Note Selector
```
Right-click in DevTools → Copy → Copy selector
```

### 4. Update `tests/utils/selectors.ts`

### 5. Test
```bash
npm test -- homepage.spec.ts --project=full-hd
```

---

## 📋 Selector Update Template

Copy-paste this into `tests/utils/selectors.ts` and fill in the blanks:

```typescript
export const SELECTORS = {
  // ============ HOMEPAGE ============
  brandTitle: {
    primary: '______________________',  // What you found in DevTools
    fallback: [
      'h1:has-text("Promethea")',
      'img[alt*="Promethea"]',
      '.header__heading-link'
    ],
    timeout: 5000
  },

  navigation: {
    primary: '______________________',  // e.g., '.header__menu'
    fallback: [
      '[role="navigation"]',
      'header nav',
      '.main-nav'
    ],
    timeout: 5000
  },

  collectionsLink: {
    primary: 'nav a[href*="/collections"]',  // Usually works as-is
    fallback: [
      'a:has-text("Collections")',
      'a:has-text("Shop")',
      'a:has-text("Products")'
    ],
    timeout: 5000
  },

  // ============ COLLECTION PAGE ============
  productCard: {
    primary: '______________________',  // e.g., '.product-card'
    fallback: [
      '.grid__item',
      'article.product-item',
      '.collection__item'
    ],
    timeout: 10000
  },

  productTitle: {
    primary: '______________________',  // e.g., '.product-card__title'
    fallback: ['h3', 'h2', '.product__title'],
    timeout: 5000
  },

  productPrice: {
    primary: '______________________',  // e.g., '.product-card__price'
    fallback: ['.price', 'span:has-text("$")', '.money'],
    timeout: 5000
  },

  // ============ PRODUCT PAGE ============
  addToCartButton: {
    primary: 'button[name="add"]',  // Shopify standard, usually works
    fallback: [
      'button:has-text("Add to Cart")',
      '.product-form__submit',
      '[data-add-to-cart]'
    ],
    timeout: 5000
  },

  // ============ CART ============
  cartIcon: {
    primary: 'a[href="/cart"]',  // Generic, usually works
    fallback: [
      '.header__icon--cart',
      '.cart-link',
      '[data-cart-icon]'
    ],
    timeout: 5000
  },

  cartCount: {
    primary: '______________________',  // e.g., '.cart-count'
    fallback: [
      '.cart-count-bubble',
      '#cart-count',
      '[data-cart-count]'
    ],
    timeout: 5000
  },

  removeFromCart: {
    primary: 'button:has-text("Remove")',  // Text-based is stable
    fallback: [
      '.cart-item__remove',
      '.cart__remove',
      '[data-cart-item-remove]'
    ],
    timeout: 5000
  }
};
```

---

## 🎯 Most Common Shopify Selectors

### If Using **Dawn Theme** (Shopify's Default):

```typescript
brandTitle: { primary: '.header__heading-link' }
navigation: { primary: '.header__menu' }
productCard: { primary: '.card-wrapper' }
productTitle: { primary: '.card__heading' }
productPrice: { primary: '.price-item' }
addToCartButton: { primary: 'button[name="add"]' }
cartCount: { primary: '.cart-count-bubble' }
```

### If Using **Debut Theme**:

```typescript
brandTitle: { primary: '.site-header__logo' }
navigation: { primary: '.site-nav' }
productCard: { primary: '.grid__item' }
addToCartButton: { primary: '.product-form__cart-submit' }
cartCount: { primary: '#CartCount' }
```

### If Using **Brooklyn/Narrative Theme**:

```typescript
brandTitle: { primary: '.site-header__logo-link' }
navigation: { primary: '.site-nav__list' }
productCard: { primary: '.grid-product' }
addToCartButton: { primary: '.product-form__add-button' }
cartCount: { primary: '.cart-link__count' }
```

---

## 🔧 Testing Individual Selectors

```bash
# Test one selector at a time
npm test -- homepage.spec.ts --grep "brand title"

# Headed mode (see what's happening)
npm run test:headed -- homepage.spec.ts

# Debug mode (step through)
npm run test:debug -- homepage.spec.ts
```

---

## 💡 Pro Tips

### 1. **Start with Text-Based Selectors** (Most Stable)
```typescript
// ✅ GOOD - Works even if classes change
primary: 'button:has-text("Add to Cart")'

// ❌ LESS STABLE - Breaks if theme changes
primary: '.product-form__cart-submit-button-wrapper button'
```

### 2. **Use Browser Console to Test**
```javascript
// Paste in browser console to test selector
document.querySelector('.product-card')

// Count matches
document.querySelectorAll('.product-card').length

// Get text content
document.querySelector('.cart-count')?.textContent
```

### 3. **Check Multiple Pages**
- Homepage: Navigation, brand title
- Collection: Product cards, titles, prices
- Product Page: Add to cart button
- Cart Page: Remove button, empty state

### 4. **Look for Patterns**
```
If you see:     → Likely using:      → Try selector:
-----------       ---------------      ----------------
card-wrapper      Dawn theme          .card-wrapper
grid__item        Debut theme         .grid__item
grid-product      Brooklyn theme      .grid-product
```

---

## ⚠️ Common Issues

### "Can't find navigation element"
**Solution:** Navigation might be inside a `<header>` without `role="navigation"`
```typescript
navigation: {
  primary: 'header nav',  // Try this
  fallback: ['nav', '.header__menu', '.main-menu']
}
```

### "Product cards not found"
**Solution:** Collection might use different wrapper
```typescript
productCard: {
  primary: '.grid__item',  // Try Shopify standard
  fallback: ['li.product', 'article', '[data-product]']
}
```

### "Cart count shows 0 even after adding"
**Solution:** Element might be hidden when cart is empty
```typescript
// Check if element exists first
const el = document.querySelector('.cart-count');
console.log('Element:', el);
console.log('Display:', getComputedStyle(el).display);
```

---

## ✅ Validation Checklist

After updating selectors:

- [ ] Run homepage tests: `npm test -- homepage.spec.ts`
- [ ] Run collection tests: `npm test -- collection.spec.ts`
- [ ] Run cart tests: `npm test -- cart.spec.ts`
- [ ] Run full suite: `npm test`
- [ ] Check timing (should be < 5 minutes)
- [ ] Run 3 times to check for flakiness

---

## 🆘 Still Stuck?

1. **Check screenshots** in `test-results/` folder
2. **View trace**: `npx playwright show-trace test-results/*/trace.zip`
3. **See detailed guide**: `docs/SELECTOR_TUNING_GUIDE.md`
4. **Check runbook**: `docs/runbook.md` → "Issue: Selector Not Found"

---

## 📞 Next Steps After Tuning

Once all selectors work:

```bash
# 1. Run 10 consecutive times
for i in {1..10}; do npm test; done

# 2. Check performance
npm test -- --reporter=list

# 3. Update IMPLEMENTATION_STATUS.md

# 4. Commit changes
git add tests/utils/selectors.ts
git commit -m "fix: Update selectors for Promethea Mosaic store structure"
```

---

**Quick Reference Only** - See full guide: `docs/SELECTOR_TUNING_GUIDE.md`

