/**
 * Test script to verify new implementations
 */

// Test 1: Verify sanitization rules
console.log('🧪 Testing Sanitization Rules...\n');

const testData = {
  envSecret: 'API_KEY=sk_live_1234567890abcdefghijklmnop',
  bearerToken: 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
  apiKey: 'api-key: abc123def456ghi789jkl012',
  urlParam: 'https://example.com?token=secret123&id=456',
  email: 'user@prometheamosaic.com',
  stripeKey: 'pk_live_abcdefghijklmnopqrstuvwxyz'
};

// Import sanitization
const { sanitizeReportData, SANITIZATION_RULES } = require('./tests/utils/reportSanitizer.ts');

console.log('Sanitization Rules Loaded:', SANITIZATION_RULES.length);
SANITIZATION_RULES.forEach(rule => {
  console.log(`  - ${rule.name}: ${rule.description}`);
});

console.log('\nTest Cases:');
Object.entries(testData).forEach(([name, value]) => {
  console.log(`  ${name}:`);
  console.log(`    Before: ${value}`);
  console.log(`    After:  ${sanitizeReportData(value)}`);
});

// Test 2: Verify Allure helpers
console.log('\n\n🧪 Testing Allure Helpers...\n');

const { getTestSuite, getTestFeature, getTestStory, getTestMetadata } = require('./tests/utils/allureHelpers.ts');

const testCases = [
  {
    projectName: 'iphone-12-safari',
    testFile: 'tests/smoke/cart.spec.ts',
    story: 'Cart Operations'
  },
  {
    projectName: 'full-hd',
    testFile: 'tests/smoke/homepage.spec.ts',
    story: 'Homepage & Navigation'
  },
  {
    projectName: 'pixel-5-chrome',
    testFile: 'tests/smoke/collection.spec.ts'
  }
];

testCases.forEach((tc, i) => {
  console.log(`Test Case ${i + 1}:`);
  console.log(`  Project: ${tc.projectName}`);
  console.log(`  Suite: ${getTestSuite(tc.testFile)}`);
  console.log(`  Feature: ${getTestFeature(tc.projectName)}`);
  console.log(`  Story: ${getTestStory(tc.story || tc.testFile)}`);
  console.log(`  Metadata:`, getTestMetadata(tc.projectName, tc.testFile, tc.story));
  console.log('');
});

console.log('✅ All tests completed!');

