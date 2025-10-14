/**
 * Report Sanitizer Utility
 * 
 * Sanitizes sensitive data from Allure test reports before public publication.
 * Removes or redacts environment variables, credentials, API keys, tokens, and other
 * sensitive information that could pose security risks.
 * 
 * @module tests/utils/reportSanitizer
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Sanitization rule definition
 */
export interface SanitizationRule {
  name: string;
  pattern: RegExp;
  replacement: string;
  description: string;
}

/**
 * Defined sanitization rules for sensitive data patterns
 */
export const SANITIZATION_RULES: SanitizationRule[] = [
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
    description: 'Redacts URL query parameters to prevent data leakage'
  },
  {
    name: 'emails',
    pattern: /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
    replacement: 'user@example.com',
    description: 'Redacts email addresses in error messages'
  },
  {
    name: 'stripe-keys',
    pattern: /(sk|pk)_live_[a-zA-Z0-9]{24,}/g,
    replacement: '[STRIPE_KEY_REDACTED]',
    description: 'Redacts Stripe live API keys'
  }
];

/**
 * Sanitizes report data by applying defined rules
 * 
 * @param data - Report data to sanitize
 * @returns Sanitized data with sensitive information redacted
 */
export function sanitizeReportData(data: string): string {
  let sanitizedData = data;
  
  for (const rule of SANITIZATION_RULES) {
    sanitizedData = sanitizedData.replace(rule.pattern, rule.replacement);
  }
  
  return sanitizedData;
}

/**
 * Sanitizes all JSON files in the allure-results directory
 * 
 * @param resultsDir - Path to allure-results directory
 * @returns Number of files sanitized
 */
export function sanitizeAllureResults(resultsDir: string = 'allure-results'): number {
  if (!fs.existsSync(resultsDir)) {
    console.warn(`[SANITIZER] Directory not found: ${resultsDir}`);
    return 0;
  }

  const files = fs.readdirSync(resultsDir).filter(f => f.endsWith('.json'));
  let count = 0;

  for (const file of files) {
    const filePath = path.join(resultsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const sanitized = sanitizeReportData(content);
    
    if (content !== sanitized) {
      fs.writeFileSync(filePath, sanitized, 'utf-8');
      console.log(`[SANITIZER] Sanitized: ${file}`);
      count++;
    }
  }

  console.log(`[SANITIZER] Complete: ${count} file(s) sanitized`);
  return count;
}

/**
 * Gets the defined sanitization rules
 * 
 * @returns Array of sanitization rules
 */
export function getSanitizationRules(): SanitizationRule[] {
  return SANITIZATION_RULES;
}

