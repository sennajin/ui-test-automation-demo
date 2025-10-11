/**
 * Selector Inspector Script
 * 
 * Run in browser console on Promethea Mosaic store to test selectors
 * 
 * Usage:
 * 1. Open https://prometheamosaic.com/ in browser
 * 2. Open DevTools (F12)
 * 3. Copy-paste this entire script into Console
 * 4. Run: inspectSelectors()
 */

function inspectSelectors() {
  console.log('🔍 Promethea Mosaic Selector Inspector\n');
  
  const results = {
    homepage: {},
    collection: {},
    product: {},
    cart: {}
  };
  
  // Brand Title
  console.log('📌 Brand Title:');
  const brandSelectors = [
    'h1:has-text("Promethea Mosaic")',
    '.site-header__logo',
    'header h1',
    '.header__heading-link',
    'a[href="/"] h1',
    'img[alt*="Promethea"]'
  ];
  
  brandSelectors.forEach(sel => {
    try {
      // Convert Playwright syntax to standard CSS
      const cssSelector = sel.replace(':has-text', '').replace(/\(.*\)/, '');
      const el = document.querySelector(cssSelector);
      if (el) {
        console.log(`✅ ${sel}`);
        console.log(`   Text: "${el.textContent?.trim().substring(0, 50)}"`);
        console.log(`   Classes: ${el.className}`);
        results.homepage.brandTitle = sel;
      } else {
        console.log(`❌ ${sel}`);
      }
    } catch (e) {
      console.log(`⚠️  ${sel} - Invalid selector`);
    }
  });
  
  // Navigation
  console.log('\n📌 Primary Navigation:');
  const navSelectors = [
    'nav[role="navigation"]',
    'header nav',
    '.header__menu',
    '.main-nav',
    '.site-nav'
  ];
  
  navSelectors.forEach(sel => {
    const el = document.querySelector(sel);
    if (el) {
      console.log(`✅ ${sel}`);
      const links = el.querySelectorAll('a');
      console.log(`   Links found: ${links.length}`);
      console.log(`   First 3 links: ${Array.from(links).slice(0, 3).map(a => a.textContent?.trim()).join(', ')}`);
      results.homepage.navigation = sel;
    } else {
      console.log(`❌ ${sel}`);
    }
  });
  
  // Collections Link
  console.log('\n📌 Collections Link:');
  const collectionsSelectors = [
    'nav a[href*="/collections"]',
    'a:contains("Collections")',
    'a:contains("Shop")',
    'a:contains("Products")'
  ];
  
  collectionsSelectors.forEach(sel => {
    let cssSelector = sel.replace(':contains', '');
    const el = document.querySelector(cssSelector);
    if (el) {
      console.log(`✅ ${sel}`);
      console.log(`   Text: "${el.textContent?.trim()}"`);
      console.log(`   href: ${el.href}`);
      results.homepage.collectionsLink = sel;
    } else {
      console.log(`❌ ${sel}`);
    }
  });
  
  // Check if on collection page
  if (window.location.pathname.includes('/collections/')) {
    console.log('\n📌 Product Cards (Collection Page):');
    const productSelectors = [
      '.product-card',
      '.grid__item',
      'article.product-item',
      '.collection__item',
      '[data-product-card]'
    ];
    
    productSelectors.forEach(sel => {
      const els = document.querySelectorAll(sel);
      if (els.length > 0) {
        console.log(`✅ ${sel} - Found ${els.length} products`);
        results.collection.productCard = sel;
      } else {
        console.log(`❌ ${sel}`);
      }
    });
  }
  
  // Check if on product page
  if (window.location.pathname.includes('/products/')) {
    console.log('\n📌 Add to Cart Button (Product Page):');
    const buttonSelectors = [
      'button[name="add"]',
      'button:contains("Add to Cart")',
      '.product-form__submit',
      '[data-add-to-cart]'
    ];
    
    buttonSelectors.forEach(sel => {
      let cssSelector = sel.replace(':contains', '');
      const el = document.querySelector(cssSelector);
      if (el) {
        console.log(`✅ ${sel}`);
        console.log(`   Text: "${el.textContent?.trim()}"`);
        console.log(`   Enabled: ${!el.disabled}`);
        results.product.addToCartButton = sel;
      } else {
        console.log(`❌ ${sel}`);
      }
    });
  }
  
  // Cart Icon (available on all pages)
  console.log('\n📌 Cart Icon:');
  const cartSelectors = [
    'a[href="/cart"]',
    '.header__icon--cart',
    '.cart-link',
    '[data-cart-icon]'
  ];
  
  cartSelectors.forEach(sel => {
    const el = document.querySelector(sel);
    if (el) {
      console.log(`✅ ${sel}`);
      results.cart.cartIcon = sel;
    } else {
      console.log(`❌ ${sel}`);
    }
  });
  
  // Cart Count
  console.log('\n📌 Cart Count Badge:');
  const countSelectors = [
    '.cart-count',
    '.cart-count-bubble',
    '#cart-count',
    '[data-cart-count]',
    'a[href="/cart"] span'
  ];
  
  countSelectors.forEach(sel => {
    const el = document.querySelector(sel);
    if (el) {
      console.log(`✅ ${sel}`);
      console.log(`   Current value: "${el.textContent?.trim()}"`);
      results.cart.cartCount = sel;
    } else {
      console.log(`❌ ${sel}`);
    }
  });
  
  // Summary
  console.log('\n\n📊 SUMMARY - Copy these into tests/utils/selectors.ts:\n');
  console.log('```typescript');
  if (results.homepage.brandTitle) {
    console.log(`brandTitle: { primary: '${results.homepage.brandTitle}', fallback: [...], timeout: 5000 }`);
  }
  if (results.homepage.navigation) {
    console.log(`navigation: { primary: '${results.homepage.navigation}', fallback: [...], timeout: 5000 }`);
  }
  if (results.homepage.collectionsLink) {
    console.log(`collectionsLink: { primary: '${results.homepage.collectionsLink}', fallback: [...], timeout: 5000 }`);
  }
  if (results.collection.productCard) {
    console.log(`productCard: { primary: '${results.collection.productCard}', fallback: [...], timeout: 10000 }`);
  }
  if (results.product.addToCartButton) {
    console.log(`addToCartButton: { primary: '${results.product.addToCartButton}', fallback: [...], timeout: 5000 }`);
  }
  if (results.cart.cartIcon) {
    console.log(`cartIcon: { primary: '${results.cart.cartIcon}', fallback: [...], timeout: 5000 }`);
  }
  if (results.cart.cartCount) {
    console.log(`cartCount: { primary: '${results.cart.cartCount}', fallback: [...], timeout: 5000 }`);
  }
  console.log('```');
  
  console.log('\n💡 Tip: Visit different pages to inspect all selectors:');
  console.log('   - Homepage: https://prometheamosaic.com/');
  console.log('   - Collection: https://prometheamosaic.com/collections/bookmarks');
  console.log('   - Product: Click any product from collection');
  console.log('   - Cart: https://prometheamosaic.com/cart');
  
  return results;
}

// Auto-run
console.log('Run: inspectSelectors() to analyze current page');

