# GitHub Actions Mobile Testing Update

## Summary

Updated the GitHub Actions workflow (`.github/workflows/smoke-tests.yml`) to support mobile device testing alongside existing desktop viewport testing.

## Changes Made

### 1. Expanded Workflow Dispatch Options

**Before:** Only 4 desktop viewport options  
**After:** 10 device options + convenience filters

New options available when manually triggering workflow:
- `all` - Run all 10 devices (4 desktop + 6 mobile)
- `all-desktop` - Run 4 desktop viewports only
- `all-mobile` - Run 6 mobile devices only
- Individual device selection:
  - Desktop: `small-desktop`, `standard-laptop`, `full-hd`, `large-desktop`
  - iOS: `iphone-12-safari`, `iphone-13-pro-safari`, `ipad-pro-safari`
  - Android: `pixel-5-chrome`, `pixel-7-chrome`, `galaxy-s21-chrome`

### 2. Updated Matrix Strategy

**Before:**
```yaml
viewport: ["small-desktop", "standard-laptop", "full-hd", "large-desktop"]
```

**After:**
```yaml
viewport: 
  - 4 desktop viewports
  - 6 mobile devices (3 iOS, 3 Android)
  - Intelligent filtering based on manual trigger input
```

### 3. Browser Installation

**Before:** Only Chromium  
**After:** Chromium + WebKit

```bash
# Install chromium for desktop and Android devices
npx playwright install chromium --with-deps
# Install webkit for iOS devices (iPhone, iPad)
npx playwright install webkit --with-deps
```

### 4. Increased Timeout

**Before:** 10 minutes  
**After:** 15 minutes

Mobile device testing requires slightly longer execution time due to:
- Additional browser (WebKit) installation
- Mobile viewport rendering
- Mobile-specific interactions (drawer menus, touch events)

### 5. Enhanced PR Comments

PR comments now show:
- Separate desktop vs mobile pass/fail counts
- Device name instead of "viewport" terminology
- Visual status indicators (✅/❌)
- Breakdown: "Desktop: 4/4 passed, Mobile: 6/6 passed"

### 6. Updated Email Notifications

Failure emails now reference "device" instead of "viewport" for clarity.

## Test Execution Counts

### Automatic Runs (PR, Scheduled)
- **10 devices** × **11 test scenarios** = **110 total test executions**
- Target runtime: < 15 minutes (parallel execution)

### Manual Runs
- Full suite: 110 tests
- Desktop only: 44 tests (4 devices × 11 scenarios)
- Mobile only: 66 tests (6 devices × 11 scenarios)
- Single device: 11 tests

## Usage Examples

### Via GitHub Actions UI

1. Go to **Actions** → **Smoke Tests** → **Run workflow**
2. Select device option:
   - `all` - Full test suite (recommended for pre-release)
   - `all-desktop` - Quick desktop check
   - `all-mobile` - Mobile-specific validation
   - Single device - Debug specific issue

### Via Command Line

```bash
# Trigger via GitHub CLI
gh workflow run smoke-tests.yml -f viewport=all-mobile -f test_file=homepage.spec.ts
```

## Impact on CI/CD

### Pull Requests
- **Before:** 4 test jobs per PR
- **After:** 10 test jobs per PR
- Expected runtime increase: ~2-3 minutes (still well under 15 min limit)

### Scheduled Runs (Nightly)
- **Before:** 44 total tests (4 devices × 11 scenarios)
- **After:** 110 total tests (10 devices × 11 scenarios)
- Still completes within timeout window

### Costs
- GitHub Actions minutes usage will increase ~2.5x
- Still within free tier limits for typical usage patterns
- Can use `all-desktop` or `all-mobile` filters to optimize if needed

## Related Changes

### Code Updates
- `tests/page-objects/HomePage.ts` - Fixed `openMobileMenuIfNeeded` to use fallback selector strategy

### Documentation Updates
- `docs/runbook.md` - Updated timeout value and added mobile device examples
- `docs/maintenance.md` - Added mobile device testing examples
- `README.md` - Already documented mobile devices (no changes needed)

## Testing

The updated workflow has been validated against the Playwright config (`playwright.config.ts`) which defines all 10 device projects.

## Rollback Plan

If issues arise, revert to desktop-only testing:

```yaml
viewport: ${{ fromJSON('["small-desktop", "standard-laptop", "full-hd", "large-desktop"]') }}
```

And adjust timeout back to 10 minutes.

---

**Updated:** 2024-10-13  
**Related PR:** fix-cart-tests branch

