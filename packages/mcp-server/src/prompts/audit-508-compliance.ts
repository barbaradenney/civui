/**
 * MCP prompt: audit-508-compliance
 * Run validate_form → explain violations with WCAG refs → provide corrected markup.
 */
import { GOVERNMENT_PATTERNS } from '../resources/index.js';

export const AUDIT_508_COMPLIANCE_NAME = 'audit-508-compliance';

export const AUDIT_508_COMPLIANCE_DESCRIPTION =
  'Audit CivUI markup for Section 508 and WCAG 2.1 AA compliance. ' +
  'Runs the validate_form tool, explains each violation with WCAG references, and provides corrected markup.';

export function audit508CompliancePrompt(markup: string) {
  // Escape any triple-backtick sequences to prevent code fence breakout
  const safeMarkup = markup.replace(/`{3,}/g, (m) => m.replace(/`/g, '\\`'));

  return {
    messages: [
      {
        role: 'user' as const,
        content: {
          type: 'resource' as const,
          resource: {
            uri: 'civui://gov-patterns',
            mimeType: 'text/markdown',
            text: GOVERNMENT_PATTERNS,
          },
        },
      },
      {
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `# Audit Section 508 Compliance

## Instructions

You are auditing the following CivUI markup for Section 508 and WCAG 2.1 AA compliance.

### Step 1: Run validation
Call the \`validate_form\` tool with the markup below.

### Step 2: Explain violations
For each violation found:
- **Errors**: Explain the Section 508 / WCAG criterion violated, why it matters for users with disabilities, and exactly how to fix it.
- **Warnings**: Explain the best-practice issue and the recommended fix.

Map each rule to its WCAG criterion:
- missing-label / missing-legend → WCAG 1.3.1, 3.3.2
- placeholder-as-label → WCAG 1.3.1, 3.3.2
- missing-required-message → WCAG 3.3.1, 3.3.3
- orphaned-radio / orphaned-segment → WCAG 1.3.1
- label-on-group / legend-on-single → WCAG 1.3.1
- missing-autocomplete → WCAG 1.3.5
- abbreviation-in-label → Plain language (Section 508 E205)
- deprecated-focus-class → WCAG 2.4.7
- physical-css-property → RTL/i18n accessibility

### Step 3: Provide corrected markup
Show the corrected CivUI markup with all errors fixed and warnings addressed. Highlight each change with a comment.

### Step 4: Re-validate
Call \`validate_form\` again on the corrected markup to confirm it passes.

## Markup to audit

\`\`\`html
${safeMarkup}
\`\`\``,
        },
      },
    ],
  };
}
