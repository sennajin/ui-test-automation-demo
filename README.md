# UI Test Automation Demo

## Overview

This project provides end-to-end smoke tests for a live Shopify store. My testing approach is designed to build user trust through safe, transparent, and maintainable practices while providing clear evidence of system health for both technical and non-technical stakeholders.

**Key Characteristics:**

- **Safe for Live Store**: Read-only operations with guaranteed cleanup for state changes
- **Clear Evidence**: Human-readable reports with screenshots and videos on failure
- **Resilient to Change**: Stable selectors with fallbacks, content-churn resistant
- **Fast Smoke Suite**: Completes in < 5 minutes for routine PR checks
- **Maintainable**: Readable tests with explicit intent and deterministic execution

---

## Testing Philosophy

1. **Priority Hierarchy**: User trust, evidence clarity, and sustainable maintenance over feature breadth
2. **Code Quality Standards**: Readable tests with deterministic setup/teardown that leave no residue
3. **Testing Standards**: Stable selectors, explicit waits, data hygiene, and repeatable outcomes
4. **User Experience Consistency**: Core pages load, navigation works, product discovery possible, cart state visible
5. **Performance Requirements**: Fast smoke suite suitable for routine PR use
6. **Governance Decision Rules**: Safety over coverage, resilience to content churn, human-readable reports
7. **Trade-off Precedence**: Safety > Clarity > Reliability > Breadth
8. **Risk Management**: Changes increasing risk require mitigation and rollback plans

---

## What is Tested

### Core User Flows (Smoke Suite)

**Framework:** Playwright with TypeScript  
**Browsers:** Chromium (desktop + Android), WebKit (iOS/Safari)  
**Device Configurations:** 
- 4 desktop resolutions (1280x720, 1366x768, 1920x1080, 2560x1440)
- 3 iOS devices (iPhone 12, iPhone 13 Pro, iPad Pro)
- 3 Android devices (Pixel 5, Pixel 7, Galaxy S21)

**Total Test Executions:** 110 (11 scenarios × 10 device configurations)  
**Target Runtime:** < 10 minutes (parallel execution with 6 workers)

#### Test Scenario 1: Homepage & Navigation
Brand title "Promethea Mosaic" visible on homepage  
Primary navigation visible with ≥3 links  
Collections link present and clickable  

#### Test Scenario 2: Collection & Product Discovery
Bookmarks collection loads with products  
Product cards display image, title, and price  
Product cards clickable, navigate to detail page  
Product detail page shows title, price, add-to-cart button  

#### Test Scenario 3: Cart Operations
Add product to cart (count updates to "1")  
Cart page displays added item  
Remove product from cart (count updates to "0")  
Empty cart state visible  
**Cart cleanup verified** (idempotent, runs even on test failure)

### What ISN'T Tested

**Checkout Submission**: Tests stop before final checkout to avoid orders  
**Account Creation**: No persistent accounts created on live store  
**Payment Processing**: No real transactions executed  
**Inventory-Dependent Scenarios**: Tests use dynamic product selection (no hardcoded IDs)  

---

## Quick Start

### Prerequisites

- Node.js 18+ (LTS recommended)
- Access to Promethea Mosaic store (https://prometheamosaic.com)
- Modern browser (Chromium bundled with Playwright)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd ui-test-automation-demo

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium webkit  # Chromium for desktop/Android, WebKit for iOS

# Configure environment (optional - defaults to prometheamosaic.com)
cp .env.example .env
# Edit .env to customize store URL or collection handle
```

### Running Tests Locally

#### Quick Commands

```bash
# Run full smoke suite (all scenarios, all viewports)
npm test

# Run with UI mode (interactive debugging)
npx playwright test --ui

# View last test report (HTML with videos/screenshots)
npm run test:report
```

#### By Test Scenario

```bash
# Run specific test file
npm test -- homepage.spec.ts
npm test -- collection.spec.ts
npm test -- cart.spec.ts

# Run specific test by name (grep pattern)
npx playwright test --grep "should display brand title"
```

#### By Device/Viewport

```bash
# All mobile devices
npm run test:mobile

# Mobile by platform
npm run test:ios        # All iOS devices
npm run test:android    # All Android devices

# Individual mobile devices
npm run test:iphone-12
npm run test:iphone-13-pro
npm run test:ipad-pro
npm run test:pixel-5
npm run test:pixel-7
npm run test:galaxy-s21

# Desktop viewports
npm run test:small-desktop
npm run test:standard-laptop
npm run test:full-hd
npm run test:large-desktop
```

#### By Viewport (Project)

```bash
# Run all tests on specific viewport
npm run test:small-desktop      # 1280×720
npm run test:standard-laptop    # 1366×768
npm run test:full-hd            # 1920×1080 (recommended)
npm run test:large-desktop      # 2560×1440

# Or use Playwright directly
npx playwright test --project=full-hd
npx playwright test --project=small-desktop
```

#### Debug & Development

```bash
# Run with visible browser (headed mode)
npm run test:headed
npx playwright test --headed

# Debug mode with Playwright Inspector (pause/step through)
npm run test:debug
npx playwright test --debug

# Run specific test in debug mode
npx playwright test homepage.spec.ts --debug

# Run with trace recording (detailed timeline)
npx playwright test --trace on

# Show browser console logs
npx playwright test --reporter=list
```

#### Advanced Options

```bash
# Run with retries (flaky test detection)
npx playwright test --retries=2

# Run in parallel (faster execution)
npx playwright test --workers=4

# Run specific test by line number
npx playwright test homepage.spec.ts:26

# Update snapshots (if using visual regression)
npx playwright test --update-snapshots

# Clear cart before running (manual cleanup)
curl -X POST https://prometheamosaic.com/cart/clear.js
npm test
```

#### Environment Configuration

```bash
# Override store URL (test different store)
STORE_URL=https://example.myshopify.com npm test

# Override collection handle (test different collection)
ANCHOR_COLLECTION_HANDLE=featured npm test

# Run with custom .env file
cp .env.production .env
npm test
```

---

## Project Structure

```
ui-test-automation-demo/
├── .github/workflows/
│   └── smoke-tests.yml         # CI/CD workflow (PR, nightly, manual triggers)
├── docs/
│   ├── runbook.md              # Troubleshooting guide
│   └── maintenance.md          # Maintenance guide
├── tests/
│   ├── smoke/
│   │   ├── homepage.spec.ts    # FR1, FR2: Homepage & Navigation
│   │   ├── collection.spec.ts  # FR3, FR4: Collection & Product Discovery
│   │   └── cart.spec.ts        # FR4, FR5: Cart Operations
│   ├── page-objects/
│   │   ├── HomePage.ts         # Homepage POM
│   │   ├── CollectionPage.ts   # Collection page POM
│   │   ├── ProductPage.ts      # Product detail POM
│   │   └── CartPage.ts         # Cart page POM
│   └── utils/
│       ├── selectors.ts        # Centralized selectors with fallbacks
│       ├── waitConditions.ts   # Explicit wait utilities
│       └── cleanup.ts          # Cart cleanup utilities
├── playwright-report/          # HTML reports (auto-generated)
├── test-results/               # Screenshots, videos (auto-generated)
├── .env.example                # Environment template
├── playwright.config.ts        # Playwright configuration (4 viewport projects)
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies
└── README.md                   # This file
```

---

## Writing Tests

### Example Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { CollectionPage } from '../page-objects/CollectionPage';
import { ProductPage } from '../page-objects/ProductPage';
import { CartPage } from '../page-objects/CartPage';
import { cleanupCart } from '../utils/cleanup';

test.describe('Cart Operations', () => {
  // CRITICAL: Cleanup runs even on test failure (Constitution Principle 2)
  test.afterEach(async ({ page }) => {
    await cleanupCart(page);
  });

  test('should add product to cart and update cart count to 1', async ({ page }) => {
    // Arrange: Navigate using Page Object Models
    const collectionPage = new CollectionPage(page, 'bookmarks');
    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);
    
    await collectionPage.goto();
    const productCard = await collectionPage.getFirstProductCard();
    await collectionPage.clickProduct(productCard);
    
    // Act: Add to cart
    await productPage.clickAddToCart();
    
    // Assert: Cart count updated
    const cartCount = await cartPage.getCartCount();
    expect(cartCount).toBe(1);
  });
});
```

### Key Principles in Practice

- **Page Object Models**: All interactions through POM methods (no raw selectors in tests)
- **Centralized Selectors**: Selectors defined in `tests/utils/selectors.ts` with fallback strategies
- **Explicit Waits**: Use `waitFor({ state: 'visible' })` instead of arbitrary `waitForTimeout()`
- **Guaranteed Cleanup**: `afterEach` hook runs even on failure (no cart residue on live store)
- **Clear Assertions**: One assertion per logical check; descriptive failure messages
- **No Checkout**: Tests stop before submitting orders (URL guard assertions)
- **Dynamic Selection**: Tests select "first available product" (no hardcoded IDs)

---

## Running Tests in CI/CD

### GitHub Actions (Built-in)

**Workflow File:** `.github/workflows/smoke-tests.yml`

#### Automatic Triggers

1. **Pull Requests** (on open/update to `main` branch):
   ```
   - Runs full smoke suite (all scenarios × 4 viewports)
   - Posts results as PR comment with pass/fail summary
   - Uploads test artifacts (reports, screenshots, videos)
   ```

2. **Nightly Schedule** (2:00 AM UTC daily):
   ```
   - Validates live store health
   - Sends email alerts on failure (johnsonjrre@gmail.com)
   - Useful for catching theme updates or store issues
   ```

3. **Manual Dispatch** (on-demand):
   ```
   GitHub → Actions → "Smoke Tests" → "Run workflow" → Select branch
   ```

#### Viewport Matrix

Tests run in parallel across 4 viewport configurations:
- Small Desktop (1280×720)
- Standard Laptop (1366×768)
- Full HD (1920×1080)
- Large Desktop (2560×1440)

**Total Executions per Run:** 11 tests × 4 viewports = 44 test executions  
**Target Runtime:** < 5 minutes (with parallelization)  
**Current Runtime:** ~3-5 minutes depending on live store performance

#### Evidence Collection

- **HTML Reports**: Full Playwright HTML report with test timeline
- **Screenshots**: Captured on test failure (PNG format)
- **Videos**: Full session recording for failed tests (WebM format)
- **Trace Files**: Detailed execution timeline for debugging (`.zip`)
- **Retention**: All artifacts kept for 7 days

#### Accessing Results

1. **Via PR Comment** (for PR-triggered runs):
   - Automated comment posts pass/fail summary table
   - Links to GitHub Actions run for full details

2. **Via GitHub Actions UI**:
   - Navigate to **Actions** → **Smoke Tests** → Select run
   - Download artifacts: `playwright-report.zip`
   - View logs for console output

3. **Via Email** (nightly runs only):
   - Failure alerts sent to configured email
   - Includes run URL and failure summary

### Integrating with Other CI/CD Platforms

#### Jenkins

```groovy
// Jenkinsfile
pipeline {
    agent any
    
    stages {
        stage('Install') {
            steps {
                sh 'npm ci'
                sh 'npx playwright install chromium'
            }
        }
        
        stage('Test') {
            steps {
                sh 'npm test'
            }
        }
        
        stage('Publish Report') {
            steps {
                publishHTML([
                    reportDir: 'playwright-report',
                    reportFiles: 'index.html',
                    reportName: 'Playwright Test Report'
                ])
            }
        }
    }
    
    post {
        always {
            archiveArtifacts artifacts: 'test-results/**/*', allowEmptyArchive: true
        }
    }
}
```

#### GitLab CI

```yaml
# .gitlab-ci.yml
test:
  image: mcr.microsoft.com/playwright:v1.40.0
  stage: test
  script:
    - npm ci
    - npx playwright install chromium
    - npm test
  artifacts:
    when: always
    paths:
      - playwright-report/
      - test-results/
    expire_in: 7 days
  only:
    - merge_requests
    - main
```

### Docker Integration

```dockerfile
# Dockerfile
FROM mcr.microsoft.com/playwright:v1.40.0

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

CMD ["npm", "test"]
```

**Run tests in Docker:**
```bash
docker build -t ui-tests .
docker run --rm -v $(pwd)/playwright-report:/app/playwright-report ui-tests
```

### Environment Variables for CI

Required environment variables (set in your CI platform):

```bash
# Store configuration
STORE_URL=https://prometheamosaic.com
ANCHOR_COLLECTION_HANDLE=bookmarks

# CI-specific settings
CI=true                    # Enables CI-optimized settings
PLAYWRIGHT_JUNIT_OUTPUT_NAME=results.xml  # For test result publishing
```

### Performance Requirements

- **Full Suite Runtime**: < 5 minutes (constitutional requirement)
- **Single Test Runtime**: < 30 seconds average
- **Parallel Workers**: 4 (one per viewport project)
- **Browser Launch**: Headless Chromium only (faster than headed)

### Monitoring & Alerts

Configure your CI platform to:
1. **Fail builds** on test failure (block PR merge)
2. **Send notifications** to Slack/Email on failure
3. **Track metrics** (pass rate, runtime, flakiness)
4. **Schedule regular runs** (nightly for live store health checks)

---

## Evidence & Reporting

On test failure, the following evidence is automatically collected:

- **Screenshot** at failure point
- **Video recording** of entire test (optional)
- **Console logs** from browser
- **Network request logs**
- **Full page HTML**

Reports are human-readable and designed for non-engineers to assess results quickly.

---

---

*This project adheres to a constitutional governance model. All testing decisions prioritize safety, clarity, and reliability. See [Constitution](.specify/memory/constitution.md) for details.*

