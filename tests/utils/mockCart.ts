import { Page, Route } from '@playwright/test';

/**
 * Mock cart state manager
 * Simulates Shopify cart.js API responses without hitting the real server
 */
class MockCartState {
  private items: any[] = [];
  private itemCount = 0;
  private readonly token = 'mock-cart-token-' + Date.now();

  addItem(variantId: string, quantity: number = 1): any {
    // Add or update item
    const existingItem = this.items.find(item => item.variant_id === variantId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({
        id: variantId,
        variant_id: variantId,
        quantity: quantity,
        title: 'Mock Product',
        price: 1200,
        line_price: 1200 * quantity,
        sku: 'MOCK-SKU',
        grams: 100,
        vendor: 'Mock Vendor',
        properties: {},
        gift_card: false,
        url: '/products/mock-product',
        image: 'https://via.placeholder.com/150',
        handle: 'mock-product',
        requires_shipping: true,
        product_title: 'Mock Product',
        product_description: 'A mocked product for testing',
        product_type: 'Test',
        variant_title: 'Default',
        variant_options: ['Default'],
      });
    }
    
    this.itemCount = this.items.reduce((sum, item) => sum + item.quantity, 0);
    
    return this.getCartResponse();
  }

  removeItem(lineIndex: number): any {
    if (lineIndex >= 0 && lineIndex < this.items.length) {
      this.items.splice(lineIndex, 1);
    }
    
    this.itemCount = this.items.reduce((sum, item) => sum + item.quantity, 0);
    
    return this.getCartResponse();
  }

  updateItem(lineIndex: number, quantity: number): any {
    if (lineIndex >= 0 && lineIndex < this.items.length) {
      if (quantity === 0) {
        return this.removeItem(lineIndex);
      }
      this.items[lineIndex].quantity = quantity;
      this.items[lineIndex].line_price = this.items[lineIndex].price * quantity;
    }
    
    this.itemCount = this.items.reduce((sum, item) => sum + item.quantity, 0);
    
    return this.getCartResponse();
  }

  clear(): any {
    this.items = [];
    this.itemCount = 0;
    
    return this.getCartResponse();
  }

  getCartResponse(): any {
    const totalPrice = this.items.reduce((sum, item) => sum + item.line_price, 0);
    
    return {
      token: this.token,
      note: null,
      attributes: {},
      original_total_price: totalPrice,
      total_price: totalPrice,
      total_discount: 0,
      total_weight: this.items.reduce((sum, item) => sum + (item.grams * item.quantity), 0),
      item_count: this.itemCount,
      items: this.items,
      requires_shipping: this.items.some(item => item.requires_shipping),
      currency: 'USD',
      items_subtotal_price: totalPrice,
      cart_level_discount_applications: []
    };
  }
}

/**
 * Enable cart API mocking for a page
 * Intercepts Shopify cart API calls and returns mock responses
 * Mocks both page navigation routes AND API request context
 * 
 * @param page - Playwright page instance
 * @param options - Mock options
 */
export async function enableCartMocking(
  page: Page,
  options: {
    logRequests?: boolean;
    simulateRateLimit?: boolean;
  } = {}
): Promise<MockCartState> {
  const cartState = new MockCartState();
  const logRequests = options.logRequests ?? true;

  // Mock cart.js API (GET cart state)
  // This handles both page.goto() and fetch() from page context
  await page.route('**/cart.js', async (route: Route) => {
    if (logRequests) {
      console.log('[MOCK CART] GET /cart.js (page route)');
    }
    
    const response = cartState.getCartResponse();
    
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response)
    });
  });

  // Also mock for page.request.get() calls (API request context)
  await page.context().route('**/cart.js', async (route: Route) => {
    if (logRequests) {
      console.log('[MOCK CART] GET /cart.js (request context)');
    }
    
    const response = cartState.getCartResponse();
    
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response)
    });
  });

  // Mock cart/add.js API (POST add to cart)
  const handleCartAdd = async (route: Route, context: string) => {
    if (logRequests) {
      console.log(`[MOCK CART] POST /cart/add.js (${context})`);
    }
    
    const request = route.request();
    const postData = request.postDataJSON();
    
    const variantId = postData?.id || postData?.variant_id || 'mock-variant-id';
    const quantity = postData?.quantity || 1;
    
    const response = cartState.addItem(variantId, quantity);
    
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response.items[response.items.length - 1])
    });
  };

  await page.route('**/cart/add.js', (route) => handleCartAdd(route, 'page route'));
  await page.context().route('**/cart/add.js', (route) => handleCartAdd(route, 'request context'));

  // Mock cart/add (POST form submission)
  await page.route('**/cart/add', async (route: Route) => {
    if (logRequests) {
      console.log('[MOCK CART] POST /cart/add');
    }
    
    const request = route.request();
    const postData = request.postData();
    
    // Parse form data
    let variantId = 'mock-variant-id';
    let quantity = 1;
    
    if (postData) {
      const params = new URLSearchParams(postData);
      variantId = params.get('id') || variantId;
      quantity = parseInt(params.get('quantity') || '1', 10);
    }
    
    cartState.addItem(variantId, quantity);
    
    // Return redirect response (typical Shopify behavior)
    await route.fulfill({
      status: 303,
      headers: {
        'Location': '/cart'
      },
      body: ''
    });
  });

  // Mock cart/change.js API (POST update cart)
  await page.route('**/cart/change.js', async (route: Route) => {
    if (logRequests) {
      console.log('[MOCK CART] POST /cart/change.js');
    }
    
    const request = route.request();
    const postData = request.postDataJSON();
    
    const line = postData?.line || 1;
    const quantity = postData?.quantity || 0;
    
    const response = cartState.updateItem(line - 1, quantity);
    
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response)
    });
  });

  // Mock cart/clear.js API (POST clear cart)
  await page.route('**/cart/clear.js', async (route: Route) => {
    if (logRequests) {
      console.log('[MOCK CART] POST /cart/clear.js');
    }
    
    const response = cartState.clear();
    
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response)
    });
  });

  if (logRequests) {
    console.log('[MOCK CART] ✅ Cart API mocking enabled');
  }

  return cartState;
}

/**
 * Disable cart API mocking for a page
 */
export async function disableCartMocking(page: Page): Promise<void> {
  await page.unroute('**/cart.js');
  await page.unroute('**/cart/add.js');
  await page.unroute('**/cart/add');
  await page.unroute('**/cart/change.js');
  await page.unroute('**/cart/clear.js');
  
  console.log('[MOCK CART] ❌ Cart API mocking disabled');
}

