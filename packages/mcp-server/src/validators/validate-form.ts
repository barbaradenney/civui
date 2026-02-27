/**
 * CivUI form markup validator.
 * Loads HTML via cheerio and runs all validation rules.
 */
import { load } from 'cheerio';
import { RULES, type Violation } from './rules.js';

export interface ValidationResult {
  valid: boolean;
  errors: Violation[];
  warnings: Violation[];
  summary: string;
}

/**
 * Validate CivUI HTML markup against Section 508 rules and best practices.
 *
 * @param html - CivUI HTML markup string
 * @returns Structured validation result
 */
export function validateForm(html: string): ValidationResult {
  const $ = load(html);
  const violations: Violation[] = [];

  for (const rule of RULES) {
    rule.check($, violations);
  }

  const errors = violations.filter((v) => v.severity === 'error');
  const warnings = violations.filter((v) => v.severity === 'warning');

  const parts: string[] = [];
  if (errors.length === 0 && warnings.length === 0) {
    parts.push('No issues found.');
  } else {
    if (errors.length > 0) {
      parts.push(`${errors.length} error${errors.length === 1 ? '' : 's'}`);
    }
    if (warnings.length > 0) {
      parts.push(
        `${warnings.length} warning${warnings.length === 1 ? '' : 's'}`,
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    summary: parts.join(', '),
  };
}
