/**
 * validate_gov_form tool — checks generated government form HTML for consistency.
 *
 * Verifies the output uses CivUI components correctly and follows
 * the standard VA form flow.
 */

export interface GovFormViolation {
  rule: string;
  severity: 'error' | 'warning';
  message: string;
}

export interface ValidateGovFormResult {
  valid: boolean;
  violations: GovFormViolation[];
  summary: string;
}

/**
 * Validate government form HTML for consistency with CivUI patterns.
 */
export function validateGovForm(html: string): ValidateGovFormResult {
  const violations: GovFormViolation[] = [];

  // Check for raw HTML inputs (should use CivUI components)
  const rawInputs = html.match(/<input\s/g);
  if (rawInputs) {
    // Filter out inputs inside CivUI components (they render their own)
    // We're checking for raw inputs NOT inside a civ-* parent
    const standaloneInputs = html.match(/<input\s+(?!type="hidden")[^>]*(?:type="text"|type="email"|type="tel"|type="number")[^>]*>/g);
    if (standaloneInputs && standaloneInputs.length > 0) {
      violations.push({
        rule: 'use-civui-components',
        severity: 'warning',
        message: `Found ${standaloneInputs.length} raw <input> element(s). Use civ-text-input, civ-select, etc. instead.`,
      });
    }
  }

  // Check for raw <select> elements
  if (/<select\s/.test(html) && !/<civ-select/.test(html)) {
    violations.push({
      rule: 'use-civui-select',
      severity: 'warning',
      message: 'Found raw <select> element. Use civ-select instead.',
    });
  }

  // Check for civ-list hub (task list pattern)
  if (!/<civ-list\b/.test(html)) {
    violations.push({
      rule: 'has-task-list',
      severity: 'error',
      message: 'Missing civ-list hub. Every VA form needs a list of chapters (task list pattern) for navigation.',
    });
  }

  // Check for civ-summary review page
  if (!/<civ-summary/.test(html)) {
    violations.push({
      rule: 'has-review-page',
      severity: 'error',
      message: 'Missing civ-summary review page.',
    });
  }

  // Check for civ-signature
  if (!/<civ-signature/.test(html)) {
    violations.push({
      rule: 'has-signature',
      severity: 'error',
      message: 'Missing civ-signature statement of truth.',
    });
  }

  // Check for intro page
  if (!/<div class="civ-form-intro"/.test(html) && !/civ-process-list/.test(html)) {
    violations.push({
      rule: 'has-intro-page',
      severity: 'error',
      message: 'Missing introduction page with process list.',
    });
  }

  // Check for confirmation page
  if (!/variant="success"/.test(html) && !/confirmation/.test(html)) {
    violations.push({
      rule: 'has-confirmation',
      severity: 'warning',
      message: 'Missing confirmation page with success alert.',
    });
  }

  // Check for inline heading styles instead of civ-heading-*
  const inlineHeadings = html.match(/class="[^"]*civ-text-(lg|xl|2xl)[^"]*civ-font-bold[^"]*"/g);
  if (inlineHeadings) {
    violations.push({
      rule: 'use-heading-classes',
      severity: 'warning',
      message: `Found ${inlineHeadings.length} inline heading style(s). Use civ-heading-xl/lg/md/sm instead.`,
    });
  }

  // Check for civ-text-secondary (should be civ-text-muted)
  if (/civ-text-secondary/.test(html)) {
    violations.push({
      rule: 'use-text-muted',
      severity: 'warning',
      message: 'Found civ-text-secondary. Use civ-text-muted instead (civ-text-secondary is not defined).',
    });
  }

  // Check for progress indicator
  if (!/<civ-progress-bar/.test(html) && !/<civ-progress-steps/.test(html)) {
    violations.push({
      rule: 'has-progress',
      severity: 'warning',
      message: 'Missing progress indicator (civ-progress-bar or civ-progress-steps).',
    });
  }

  // Check for OMB information
  if (!/OMB/.test(html)) {
    violations.push({
      rule: 'has-omb-info',
      severity: 'warning',
      message: 'Missing OMB control number and respondent burden information.',
    });
  }

  const errorCount = violations.filter(v => v.severity === 'error').length;
  const warningCount = violations.filter(v => v.severity === 'warning').length;

  return {
    valid: errorCount === 0,
    violations,
    summary: violations.length === 0
      ? 'No violations found. Form follows all CivUI VA patterns.'
      : `${errorCount} error(s), ${warningCount} warning(s) found.`,
  };
}
