/**
 * Test sanitization functionality
 */
import fs from 'fs';

// Inline the sanitization rules from our implementation
const SANITIZATION_RULES = [
  {
    name: 'env-secrets',
    pattern: /([A-Z_]+_(KEY|TOKEN|SECRET|PASSWORD|API_KEY))\s*[:=]\s*(['"]?)([^'"\s]+)\3/gi,
    replacement: '$1=$3[REDACTED]$3',
    description: 'Redacts environment variables containing secrets'
  },
  {
    name: 'bearer-tokens',
    pattern: /(bearer\s+)([a-zA-Z0-9_\-\.]{20,})/gi,
    replacement: '$1[TOKEN_REDACTED]',
    description: 'Redacts Bearer authentication tokens'
  },
  {
    name: 'api-keys',
    pattern: /(api[_-]?key|apikey)\s*[:=]\s*(['"]?)([a-zA-Z0-9_\-]{20,})\2/gi,
    replacement: '$1=$2[API_KEY_REDACTED]$2',
    description: 'Redacts API keys in various formats'
  },
  {
    name: 'url-params',
    pattern: /(\?[a-zA-Z0-9_]+=)([^&\s"']+)/g,
    replacement: '$1[PARAM_REDACTED]',
    description: 'Redacts URL query parameters'
  },
  {
    name: 'emails',
    pattern: /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
    replacement: 'user@example.com',
    description: 'Redacts email addresses'
  },
  {
    name: 'stripe-keys',
    pattern: /(sk|pk)_live_[a-zA-Z0-9]{24,}/g,
    replacement: '[STRIPE_KEY_REDACTED]',
    description: 'Redacts Stripe live API keys'
  }
];

function sanitizeReportData(data) {
  let sanitized = data;
  for (const rule of SANITIZATION_RULES) {
    sanitized = sanitized.replace(rule.pattern, rule.replacement);
  }
  return sanitized;
}

// Test the sanitization
console.log('🧪 Testing Sanitization\n');
console.log('Rules loaded:', SANITIZATION_RULES.length);
SANITIZATION_RULES.forEach(rule => {
  console.log(`  ✓ ${rule.name}: ${rule.description}`);
});

console.log('\n📄 Test File: test-sanitization.json\n');

const original = fs.readFileSync('test-sanitization.json', 'utf-8');
const sanitized = sanitizeReportData(original);

console.log('BEFORE SANITIZATION:');
console.log('─'.repeat(60));
console.log(original);

console.log('\n\nAFTER SANITIZATION:');
console.log('─'.repeat(60));
console.log(sanitized);

console.log('\n\n✅ Sanitization Test Complete!');
console.log(`   Original length: ${original.length} bytes`);
console.log(`   Sanitized length: ${sanitized.length} bytes`);
console.log(`   Changes detected: ${original !== sanitized ? 'YES ✓' : 'NO ✗'}`);

