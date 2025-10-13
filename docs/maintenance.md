# Maintenance Guide

**Purpose:** Guide for maintaining and extending the Promethea Mosaic smoke test suite  
**Audience:** Future maintainers, contributors  
**Last Updated:** 2025-10-11

---

## Table of Contents

1. [Adding New Test Scenarios](#adding-new-test-scenarios)
2. [Updating Selectors After Theme Changes](#updating-selectors-after-theme-changes)
3. [Updating Bookmarks Collection Anchor](#updating-bookmarks-collection-anchor)
4. [Quarterly Review Checklist](#quarterly-review-checklist)
5. [When to Update Constitution](#when-to-update-constitution)
6. [Dependency Updates](#dependency-updates)

---

## Adding New Test Scenarios

### Before You Start

1. **Review Constitution:** Read [Project Constitution](../.specify/memory/constitution.md)
2. **Check Alignment:** Ensure new test aligns with all 8 constitutional principles
3. **Assess Impact:** Consider performance (suite must stay < 5 min)
4. **Define Success:** Write acceptance criteria before implementation

### Step-by-Step Process

#### 1. Create Test File

```bash
# Create new test file in tests/smoke/
touch tests/smoke/new-scenario.spec.ts
```

#### 2. Follow Test Template

```typescript
import { test, expect } from '@playwright/test';
import { HomePage } from '../page-objects/HomePage';
import { cleanupCart } from '../utils/cleanup';

test.describe('New Scenario Name', () => {
  test.afterEach(async ({ page }) => {
    // REQUIRED: Cart cleanup (Constitution Principle 2)
    await cleanupCart(page);
  });

  test('should [action] [expected outcome]', async ({ page }) => {
    // 1. Arrange: Set up test data/state
    const homePage = new HomePage(page);
    
    // 2. Act: Perform action
    await homePage.goto();
    
    // 3. Assert: Verify outcome
    const title = await homePage.getBrandTitle();
    await expect(title).toBeVisible({ timeout: 5000 });
  });
});
```

#### 3. Follow Naming Conventions

- **Test file:** `kebab-case.spec.ts` (e.g., `checkout-flow.spec.ts`)
- **Test describe:** Human-readable scenario name
- **Test name:** `should [action] [expected outcome]`
  - Good: `should add product to cart and update count to 1`
  - Bad: `test add to cart`

#### 4. Use Page Object Models

- **Never** use raw selectors in test files
- **Always** use POM methods:
  ```typescript
  // ❌ BAD
  await page.locator('button.add-to-cart').click();
  
  // ✅ GOOD
  const productPage = new ProductPage(page);
  await productPage.clickAddToCart();
  ```

#### 5. Add Cleanup Hook

```typescript
test.afterEach(async ({ page }) => {
  // If test modifies cart, MUST clean up
  await cleanupCart(page);
});
```

#### 6. Test Locally

```bash
# Run new test file only
npx playwright test tests/smoke/new-scenario.spec.ts

# Run across all desktop viewports
npx playwright test tests/smoke/new-scenario.spec.ts --project=small-desktop
npx playwright test tests/smoke/new-scenario.spec.ts --project=standard-laptop
npx playwright test tests/smoke/new-scenario.spec.ts --project=full-hd
npx playwright test tests/smoke/new-scenario.spec.ts --project=large-desktop

# Run across mobile devices
npx playwright test tests/smoke/new-scenario.spec.ts --project=iphone-12-safari
npx playwright test tests/smoke/new-scenario.spec.ts --project=pixel-7-chrome
```

#### 7. Verify 10 Consecutive Passes

```bash
# Constitution requirement (NFR3)
for i in {1..10}; do
  echo "=== Run $i/10 ==="
  npm test -- tests/smoke/new-scenario.spec.ts
  if [ $? -ne 0 ]; then
    echo "❌ Run $i failed!"
    break
  fi
done
```

#### 8. Update Documentation

- Add test scenario to `README.md` Test Scenarios section
- Update `tasks.md` if part of feature implementation
- Document any new selectors in `tests/utils/selectors.ts`

---

## Updating Selectors After Theme Changes

### When to Update

- After Shopify theme update (new theme version)
- When tests fail with "Element not found" errors
- When store owner reports visual changes

### Detection Process

1. **Monitor Test Failures:**
   - Check GitHub Actions for selector failures
   - Review failure email screenshots
   - Look for pattern: multiple tests failing same selector

2. **Confirm Theme Change:**
   - Ask shop owner: "Did theme update recently?"
   - Check Shopify admin → Online Store → Themes → History
   - Compare before/after screenshots

### Update Process

#### 1. Inspect Live Page

```bash
# Open browser with DevTools
# Navigate to affected page (e.g., product page)
# Right-click failing element → Inspect
# Note new selector (class, data attribute, structure)
```

#### 2. Update Selectors File

Open `tests/utils/selectors.ts`:

```typescript
export const SELECTORS = {
  addToCartButton: {
    primary: 'button.new-theme-add-button',  // Updated primary
    fallback: [
      'button[name="add"]:has-text("Add to")',  // Old primary becomes fallback
      'button:has-text("Add to Cart")',
      '[data-add-to-cart]',
    ],
    timeout: 5000
  }
};
```

**Strategy:**
- Move old primary selector to top of fallback array
- Add new selector as primary
- Keep fallbacks for theme rollback support

#### 3. Test Affected Scenarios

```bash
# Run scenarios using updated selector
npm test -- --grep "Add to Cart"

# Or run full suite
npm test
```

#### 4. Document Changes

```bash
git add tests/utils/selectors.ts
git commit -m "fix: Update add-to-cart selector for theme v2.0.3

- Primary selector changed from button[name='add'] to .new-theme-add-button
- Old selector added to fallback array
- Tested across all 4 viewports

Related: Theme update on 2025-10-11"
```

---

## Updating Bookmarks Collection Anchor

### Scenario: Collection Renamed or Removed

#### Option A: Update Environment Variable

1. **Choose New Anchor Collection:**
   - Must have ≥1 product
   - Should be stable (not seasonal)
   - Recommended: Featured collection or permanent category

2. **Update `.env` File:**
   ```env
   # Old:
   ANCHOR_COLLECTION_HANDLE=bookmarks
   
   # New:
   ANCHOR_COLLECTION_HANDLE=featured-products
   ```

3. **Update `.env.example`:**
   ```env
   # Collection to use for product discovery tests
   # Must have at least 1 product
   ANCHOR_COLLECTION_HANDLE=featured-products
   ```

4. **Test:**
   ```bash
   npm test -- collection.spec.ts
   ```

#### Option B: Update Test Files Directly

If multiple collections needed or per-test customization:

```typescript
// tests/smoke/collection.spec.ts
const collectionPage = new CollectionPage(page, 'new-collection-handle');
```

#### Option C: Use Multiple Collections

For comprehensive coverage:

```typescript
test.describe('Collection Discovery', () => {
  const collections = ['featured', 'bookmarks', 'new-arrivals'];
  
  for (const handle of collections) {
    test(`should load ${handle} collection`, async ({ page }) => {
      const collectionPage = new CollectionPage(page, handle);
      await collectionPage.goto();
      const hasProducts = await collectionPage.hasProducts();
      expect(hasProducts).toBe(true);
    });
  }
});
```

---

## Quarterly Review Checklist

**Per Constitution Principle 8:** Review suite every 3 months

### Review Date: [YYYY-MM-DD]

#### 1. Constitutional Alignment

- [ ] **Principle 1:** Tests prioritize evidence clarity over breadth?
- [ ] **Principle 2:** Cart cleanup success rate 100%?
- [ ] **Principle 3:** All selectors have fallbacks? No arbitrary waits?
- [ ] **Principle 4:** All core flows still covered (homepage, nav, collection, cart)?
- [ ] **Principle 5:** Performance < 5 minutes?
- [ ] **Principle 6:** Reports still readable by non-engineers?
- [ ] **Principle 7:** Safety > Clarity > Reliability > Breadth maintained?
- [ ] **Principle 8:** Risk mitigations still valid?

#### 2. Technical Health

- [ ] Run 10 consecutive passes (NFR3 validation)
- [ ] Review cart cleanup logs (any failures?)
- [ ] Check average runtime (still < 5 min?)
- [ ] Review selector fallback usage (frequent fallbacks = update primary)
- [ ] Check dependency versions (Playwright, TypeScript, Node)
- [ ] Review GitHub Actions runner logs (infrastructure issues?)

#### 3. Selector Audit

- [ ] Homepage selectors still work?
- [ ] Navigation selectors still work?
- [ ] Collection selectors still work?
- [ ] Product page selectors still work?
- [ ] Cart selectors still work?
- [ ] Any new theme elements need data attributes?

#### 4. Documentation Review

- [ ] README accurate (metrics, commands)?
- [ ] Runbook covers recent issues encountered?
- [ ] Maintenance guide up-to-date?
- [ ] Performance benchmarks documented?
- [ ] Links working (constitution, plan, spec)?

#### 5. Risk Assessment

Review original risks:

- [ ] Cart cleanup failure mitigation still effective?
- [ ] Collection content churn handled gracefully?
- [ ] Theme updates handled with fallback selectors?
- [ ] Store availability monitored?

New risks identified: [List any new risks and mitigation plans]

---

## When to Update Constitution

### Triggers for Amendment

1. **New Principle Identified:**
   - Pattern observed across multiple features
   - Trade-off precedence conflict discovered
   - Missing guidance causing confusion

2. **Principle Conflict:**
   - Two principles contradict
   - Real-world scenario reveals gap
   - Community feedback challenges assumption

3. **Technology Shift:**
   - Framework change (e.g., Cypress → Playwright)
   - CI/CD platform change (e.g., GitHub Actions → GitLab CI)
   - New testing paradigm (e.g., visual regression added)

### Amendment Procedure

1. **Draft Amendment:**
   ```markdown
   ## Proposed Amendment: [Title]
   
   **Version:** X.Y.Z → X+1.0.0 (MAJOR) | X.Y+1.0 (MINOR) | X.Y.Z+1 (PATCH)
   **Date:** YYYY-MM-DD
   **Author:** [Name]
   
   ### Rationale
   [Why is this change needed?]
   
   ### Current State
   [What does constitution currently say?]
   
   ### Proposed Change
   [Exact wording of new/updated principle]
   
   ### Impact Assessment
   [Which features affected? What needs updating?]
   ```

2. **Review Process:**
   - Share with project maintainer
   - Get feedback from ≥1 contributor
   - Review against existing principles (conflicts?)

3. **Approval:**
   - Maintainer + 1 contributor must approve
   - For MAJOR version: All active contributors must approve

4. **Implementation:**
   - Update `.specify/memory/constitution.md`
   - Increment version number (MAJOR/MINOR/PATCH)
   - Update affected test files/documentation
   - Add entry to Amendment Log

5. **Propagation:**
   - Update plan.md references
   - Update tasks.md if principles change implementation approach
   - Update this maintenance guide if procedures change

---

## Dependency Updates

### Playwright Framework

#### Check for Updates

```bash
npm outdated @playwright/test
```

#### Update Process

1. **Review Release Notes:**
   - Visit https://github.com/microsoft/playwright/releases
   - Look for breaking changes
   - Note new features

2. **Update in Feature Branch:**
   ```bash
   git checkout -b update/playwright-1.41
   npm install @playwright/test@^1.41.0
   npx playwright install chromium
   ```

3. **Test Locally:**
   ```bash
   npm test  # Full suite
   ```

4. **Run 10 Consecutive Passes:**
   ```bash
   for i in {1..10}; do npm test; done
   ```

5. **Update CI/CD:**
   - Verify GitHub Actions workflow still works
   - Check artifact uploads
   - Test email notifications

6. **Document:**
   ```bash
   git add package.json package-lock.json
   git commit -m "chore: Update Playwright to v1.41.0

   - No breaking changes affecting our tests
   - Verified 10 consecutive passes
   - Tested in CI/CD

   Release notes: [link]"
   ```

### Node.js Version

Follow LTS schedule: https://nodejs.org/en/about/releases/

**Current:** Node.js 18 LTS  
**Next Review:** When Node 20 LTS available

---

## Useful Scripts

### Run Specific Test Pattern

```bash
# All "Add to Cart" tests
npm test -- --grep "Add to Cart"

# All cart tests
npm test -- cart.spec.ts

# Single test by name
npm test -- --grep "should add product to cart and update cart count to 1"
```

### Debug Failing Test

```bash
# Run in headed mode with slowMo
npx playwright test --headed --slow-mo=1000 cart.spec.ts

# Debug with Playwright Inspector
npx playwright test --debug cart.spec.ts

# Generate trace
npx playwright test --trace on cart.spec.ts
npx playwright show-trace trace.zip
```

### Performance Analysis

```bash
# Run with timing reporter
npx playwright test --reporter=list

# Review duration column for slow tests (>30s)
```

---

## Related Documentation

- [Runbook](./runbook.md) - Troubleshooting guide
- [Plan](../specs/001-build-an-mvp/plan.md) - Architecture decisions
- [Tasks](../specs/001-build-an-mvp/tasks.md) - Implementation breakdown
- [Constitution](../.specify/memory/constitution.md) - Guiding principles

---

**Last Updated:** 2025-10-11  
**Next Review:** 2026-01-11 (Quarterly)

