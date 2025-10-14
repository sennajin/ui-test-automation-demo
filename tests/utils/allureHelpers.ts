/**
 * Allure Reporter Helper Utilities
 * 
 * Provides helper functions for test categorization and metadata in Allure reports.
 * Organizes tests by test type (smoke, regression) as primary grouping with
 * device/browser configuration as secondary grouping.
 * 
 * @module tests/utils/allureHelpers
 */

/**
 * Gets the test suite name (test type)
 * Determines if tests are smoke, regression, integration, etc.
 * 
 * @param testFilePath - Path to the test file (optional)
 * @returns Suite name for Allure categorization (e.g., "Smoke Tests")
 */
export function getTestSuite(testFilePath?: string): string {
  // For now, all tests in tests/smoke are smoke tests
  if (testFilePath?.includes('/smoke/') || testFilePath?.includes('\\smoke\\')) {
    return 'Smoke Tests';
  }
  
  if (testFilePath?.includes('/regression/') || testFilePath?.includes('\\regression\\')) {
    return 'Regression Tests';
  }
  
  if (testFilePath?.includes('/integration/') || testFilePath?.includes('\\integration\\')) {
    return 'Integration Tests';
  }
  
  return 'Test Suite';
}

/**
 * Gets the feature name from the project configuration
 * Maps Playwright project names to human-readable device names
 * 
 * @param projectName - Playwright project name (e.g., "iphone-12-safari")
 * @returns Feature name (device/browser configuration)
 */
export function getTestFeature(projectName: string): string {
  const featureMap: Record<string, string> = {
    // Desktop
    'small-desktop': 'Desktop - Small (1280x720)',
    'standard-laptop': 'Desktop - Laptop (1366x768)',
    'full-hd': 'Desktop - Full HD (1920x1080)',
    'large-desktop': 'Desktop - Large (2560x1440)',
    
    // iOS Mobile
    'iphone-12-safari': 'Mobile - iPhone 12 (Safari)',
    'iphone-13-pro-safari': 'Mobile - iPhone 13 Pro (Safari)',
    'ipad-pro-safari': 'Mobile - iPad Pro (Safari)',
    
    // Android Mobile
    'pixel-5-chrome': 'Mobile - Pixel 5 (Chrome)',
    'pixel-7-chrome': 'Mobile - Pixel 7 (Chrome)',
    'galaxy-s21-chrome': 'Mobile - Galaxy S21 (Chrome)',
  };
  
  return featureMap[projectName] || projectName;
}

/**
 * Gets the story name from the test file or describe block
 * Extracts meaningful story name from test context
 * 
 * @param testFileOrStory - Test file name or story description
 * @returns Story name for Allure categorization
 */
export function getTestStory(testFileOrStory: string): string {
  // Extract from test file name (e.g., "cart.spec.ts" -> "Cart Operations")
  const storyMap: Record<string, string> = {
    'cart': 'Cart Operations',
    'collection': 'Collection & Product Discovery',
    'homepage': 'Homepage & Navigation',
    'product': 'Product Details',
    'checkout': 'Checkout Flow',
  };
  
  for (const [key, value] of Object.entries(storyMap)) {
    if (testFileOrStory.toLowerCase().includes(key)) {
      return value;
    }
  }
  
  return testFileOrStory;
}

/**
 * Gets categorization metadata for a test
 * 
 * @param projectName - Playwright project name
 * @param testFilePath - Path to the test file
 * @param storyName - Story or describe block name
 * @returns Categorization metadata
 */
export function getTestMetadata(projectName: string, testFilePath: string, storyName?: string) {
  return {
    suite: getTestSuite(testFilePath),
    feature: getTestFeature(projectName),
    story: getTestStory(storyName || testFilePath)
  };
}

