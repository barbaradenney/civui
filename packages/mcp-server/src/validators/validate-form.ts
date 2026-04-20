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

export interface ValidationConfig {
  /** Rule IDs whose severity should be promoted from warning to error. */
  promoteWarnings?: string[];
  /** Rule IDs to skip entirely. */
  suppressRules?: string[];
}

/**
 * Validate CivUI HTML markup against Section 508 rules and best practices.
 *
 * @param html - CivUI HTML markup string
 * @param config - Optional config to suppress or promote rules
 * @returns Structured validation result
 */
export function validateForm(
  html: string,
  config?: ValidationConfig,
): ValidationResult {
  const $ = load(html);
  const violations: Violation[] = [];

  const suppressSet = new Set(config?.suppressRules ?? []);
  const promoteSet = new Set(config?.promoteWarnings ?? []);

  const activeRules = suppressSet.size > 0
    ? RULES.filter((r) => !suppressSet.has(r.id))
    : RULES;

  for (const rule of activeRules) {
    rule.check($, violations, html);
  }

  // Promote warnings to errors if configured
  if (promoteSet.size > 0) {
    for (const v of violations) {
      if (v.severity === 'warning' && promoteSet.has(v.rule)) {
        v.severity = 'error';
      }
    }
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
