# Runbook: Common Issues & Solutions

**Purpose:** Troubleshooting guide for Promethea Mosaic smoke test suite  
**Owner:** Test Automation Team  
**Last Updated:** 2025-10-11

---

## Quick Reference

| Issue | Severity | First Action |
|-------|----------|--------------|
| Cart Cleanup Fails | Medium | Manual cart cleanup via store URL |
| Selector Not Found | High | Inspect page, update selectors.ts |
| Bookmarks Collection Empty | High | Add products or update collection handle |
| Theme Update Breaks Tests | Critical | Update selectors per new theme |
| Slow Execution (> 5 min) | Medium | Verify parallel execution enabled |

---

## Issue: Cart Cleanup Fails

### Symptoms
- Console shows `[CLEANUP] Failed to clean cart`
- Cart residue visible after test run
- Cart count doesn't reach 0

### Root Causes
- Store theme changed cart removal mechanism
- Network timeout during cleanup
- Selector for "Remove" button outdated

### Solution Steps

1. **Immediate Action - Manual Cleanup:**
   ```
   Navigate to: https://prometheamosaic.com/cart
   Click "Remove" button for each item manually
   Verify cart count shows "0"
   ```

2. **Inspect Current Cart Structure:**
   - Open browser DevTools (F12)
   - Navigate to cart page
   - Find "Remove" button element
   - Note the selector (class, data attribute, etc.)

3. **Update Selector:**
   - Open `tests/utils/selectors.ts`
   - Update `removeFromCart` selector:
     ```typescript
     removeFromCart: {
       primary: 'button:has-text("Remove")',  // Update this
       fallback: ['[data-remove-item]', '.cart__remove'],  // Add new fallback
       timeout: 5000
     }
     ```

4. **Test Cleanup:**
   ```bash
   # Add 1 item to cart manually, then run cleanup test
   npm test -- cart.spec.ts -g "idempotent cleanup"
   ```

5. **Verify:**
   - Check console logs for `[CLEANUP] Cart cleaned successfully`
   - Manually inspect cart (should be empty)

---

## Issue: Selector Not Found

### Symptoms
- Error: `Element not found: ... (all fallbacks exhausted)`
- Test fails during element interaction
- Screenshot shows element is visible but not found

### Root Causes
- Theme update changed HTML structure
- Shopify app injection altered DOM
- Dynamic content loading changed timing

### Solution Steps

1. **Identify Affected Element:**
   - Review test failure message (shows primary + fallback selectors tried)
   - Open screenshot from test artifacts
   - Note which element failed (e.g., "Add to Cart" button)

2. **Inspect Live Page:**
   - Navigate to page in browser
   - Open DevTools (F12) → Elements tab
   - Find the element visually
   - Right-click → Inspect
   - Note new selector (class, ID, text content)

3. **Update Selectors File:**
   - Open `tests/utils/selectors.ts`
   - Find selector definition for failed element
   - Update `primary` selector or add to `fallback` array:
     ```typescript
     addToCartButton: {
       primary: 'button[name="add"]:has-text("Add to")',
       fallback: [
         'button:has-text("Add to Cart")',
         '[data-add-to-cart]',
         'button.product-form__submit',
         'button.new-theme-add-button'  // Add new fallback
       ],
       timeout: 5000
     }
     ```

4. **Prioritize Fallbacks:**
   - Most specific first (data attributes)
   - Text-based second (stable across themes)
   - Class-based last (theme-dependent)

5. **Test Fix:**
   ```bash
   # Run affected test scenario
   npm test -- homepage.spec.ts  # or collection, cart
   ```

---

## Issue: Bookmarks Collection Empty

### Symptoms
- Test fails: `Bookmarks collection contains no products`
- Collection page loads but shows "No products"
- Test log shows `Found 0 product(s)`

### Root Causes
- Products removed from Bookmarks collection
- Collection renamed or deleted
- Collection temporarily hidden (published status)

### Solution Steps

1. **Verify Collection Exists:**
   ```
   Navigate to: https://prometheamosaic.com/collections/bookmarks
   ```
   - If 404: Collection renamed or deleted (see Solution A)
   - If empty: No products assigned (see Solution B)

2. **Solution A - Update Collection Handle:**
   - Choose new anchor collection (must have ≥1 product)
   - Update `.env` file:
     ```env
     ANCHOR_COLLECTION_HANDLE=new-collection-handle
     ```
   - Or update test files directly (search for `'bookmarks'`)

3. **Solution B - Add Products:**
   - Log in to Shopify admin
   - Go to Products → Collections → Bookmarks
   - Add at least 1 product to collection
   - Verify product is published and in stock

4. **Verify Fix:**
   ```bash
   npm test -- collection.spec.ts
   ```

---

## Issue: Theme Update Breaks Tests

### Symptoms
- Multiple selector not found errors after theme update
- Tests that previously passed now fail
- Page structure changed visually

### Root Causes
- Shopify theme updated (new version installed)
- Custom theme changes deployed
- HTML structure/class names changed

### Solution Steps

1. **Identify Theme Changes:**
   - Review theme update notes from shop owner
   - Compare screenshots (before vs. after)
   - Inspect DOM structure in browser

2. **Audit All Selectors:**
   - Open `tests/utils/selectors.ts`
   - For each selector, verify on live site:
     - Homepage: brand title, navigation, collections link
     - Collection: product cards, title, price
     - Product: add to cart button
     - Cart: cart icon, count, remove button

3. **Update Selectors Systematically:**
   - Update primary selector if structure changed
   - Add new fallbacks for theme-specific elements
   - Keep old selectors as fallbacks (theme might revert)

4. **Request Data Attributes (Optional):**
   - Ask theme developer to add `data-test-id` attributes:
     ```html
     <button data-test-id="add-to-cart">Add to Cart</button>
     ```
   - Update selectors to use stable data attributes:
     ```typescript
     primary: '[data-test-id="add-to-cart"]'
     ```

5. **Run Full Suite:**
   ```bash
   npm test  # All scenarios, all viewports
   ```

6. **Document Changes:**
   - Update this runbook if new patterns emerge
   - Commit selector changes with theme version in message

---

## Issue: Slow Execution (> 5 minutes)

### Symptoms
- Full suite takes longer than 5 minutes
- Tests appear to run sequentially (not parallel)
- CI/CD times out or takes 10+ minutes

### Root Causes
- Parallel execution disabled
- Workers set to 1 (sequential mode)
- Store response times degraded
- CI runner under-resourced

### Solution Steps

1. **Verify Parallel Execution:**
   ```bash
   npx playwright test
   ```
   - Look for: `Running X tests using 4 workers`
   - If shows `using 1 worker`: Parallel disabled

2. **Check Playwright Config:**
   - Open `playwright.config.ts`
   - Verify `fullyParallel: true` is set
   - Verify `workers` not hardcoded to 1

3. **Check Project Configuration:**
   - Ensure 4 viewport projects defined
   - Verify tests not marked `.only` (forces sequential)

4. **Check Store Performance:**
   ```bash
   # Test store response times
   curl -w "@curl-format.txt" -o /dev/null -s https://prometheamosaic.com/
   ```
   - If > 3 seconds: Store slow (contact Shopify support)

5. **Optimize Wait Conditions:**
   - Review `tests/utils/waitConditions.ts`
   - Ensure timeouts not excessive (< 10 seconds each)
   - Remove any arbitrary `waitForTimeout` calls

6. **CI-Specific Issues:**
   - Check GitHub Actions runner logs
   - Verify browser installation not timing out
   - Consider increasing `timeout-minutes` in workflow (currently 10)

---

## Issue: Email Notifications Not Received

### Symptoms
- Tests fail but no email sent
- GitHub Actions shows success but email missing
- SMTP errors in workflow logs

### Root Causes
- SMTP credentials expired or incorrect
- Gmail app password revoked
- Email action failed but didn't block workflow

### Solution Steps

1. **Check GitHub Secrets:**
   - Navigate to repo → Settings → Secrets and variables → Actions
   - Verify `SMTP_USERNAME` and `SMTP_PASSWORD` exist
   - Values should not be empty

2. **Verify Gmail App Password:**
   - Log in to Gmail account
   - Go to Security → 2-Step Verification → App passwords
   - Generate new app password if expired
   - Update `SMTP_PASSWORD` secret in GitHub

3. **Test Email Manually:**
   - Trigger workflow manually (Actions → Smoke Tests → Run workflow)
   - Manually fail a test to trigger email
   - Check workflow logs for email send step

4. **Fallback - Check GitHub Actions UI:**
   - Even without email, results visible in:
     - Actions tab → Smoke Tests → Latest run
     - Download artifacts (HTML reports, screenshots)

5. **Alternative Notification (Future):**
   - Consider Slack/Discord webhook integration
   - Or GitHub mobile app notifications

---

## Emergency Contacts

| Role | Contact | When to Escalate |
|------|---------|-----------------|
| Shop Owner | johnsonjrre@gmail.com | False positive blocking PR, store issues |
| Test Maintainer | [TBD] | Selector updates, framework issues |
| Shopify Support | support.shopify.com | Store performance, checkout issues |

---

## Useful Commands

```bash
# Run all tests
npm test

# Run specific scenario
npm test -- homepage.spec.ts
npm test -- collection.spec.ts
npm test -- cart.spec.ts

# Run specific viewport
npm test -- --project=full-hd

# Run in headed mode (see browser)
npm test -- --headed

# Debug mode (pause at each step)
npm test -- --debug

# View last test report
npm run test:report

# Clean install (if dependencies corrupted)
rm -rf node_modules package-lock.json
npm install
npx playwright install chromium
```

---

## Related Documentation

- [Maintenance Guide](./maintenance.md) - How to add tests, update selectors quarterly
- [Plan](../specs/001-build-an-mvp/plan.md) - Architecture and design decisions
- [Constitution](../.specify/memory/constitution.md) - Guiding principles
- [Playwright Docs](https://playwright.dev/docs/intro) - Framework reference

---

**Last Updated:** 2025-10-11  
**Next Review:** Quarterly (per Constitution Principle 8)

