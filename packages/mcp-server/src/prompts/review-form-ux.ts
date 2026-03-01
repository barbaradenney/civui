/**
 * MCP prompt: review-form-ux
 * Chains validate_form → estimate_burden → check_contrast → synthesized report.
 */
import {
  COMPONENT_CATALOG,
  GOVERNMENT_PATTERNS,
} from '../resources/index.js';

export const REVIEW_FORM_UX_NAME = 'review-form-ux';

export const REVIEW_FORM_UX_DESCRIPTION =
  'Comprehensive UX review of a CivUI form. ' +
  'Chains validate_form, estimate_burden, and check_contrast to produce a prioritized report ' +
  'covering compliance, burden assessment, contrast results, and recommendations.';

export function reviewFormUxPrompt(markup: string) {
  const safeMarkup = markup.replace(/`{3,}/g, (m) => m.replace(/`/g, '\\`'));

  return {
    messages: [
      {
        role: 'user' as const,
        content: {
          type: 'resource' as const,
          resource: {
            uri: 'civui://catalog',
            mimeType: 'text/markdown',
            text: COMPONENT_CATALOG,
          },
        },
      },
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
          text: `# Review Form UX

## Instructions

You are performing a comprehensive UX review of the following CivUI form markup. Follow these steps to produce a prioritized report.

### Step 1: Validate compliance
Call the \`validate_form\` tool with the markup below. Record all errors and warnings.

### Step 2: Analyze burden
Call the \`form_to_schema\` tool to extract the schema, then call the \`estimate_burden\` tool with the resulting schema. Record the burden estimate including total fields, required fields, estimated time, and complexity.

### Step 3: Check contrast
Call the \`check_contrast\` tool for these 4 key color pairs:
1. \`primary\` on \`white\` (primary text on white background)
2. \`error\` on \`white\` (error text on white background)
3. \`base-dark\` on \`white\` (body text on white background)
4. \`white\` on \`primary\` (inverse text on primary background)

Record each ratio and WCAG level.

### Step 4: Synthesize report
Combine all results into a prioritized report with these sections:

**Compliance Score**: X/Y rules passed. List any errors (Section 508 violations) first, then warnings.

**Critical Issues**: Any errors that must be fixed before deployment.

**Warnings**: Best-practice issues that should be addressed.

**Burden Assessment**: Total fields, required vs optional, estimated completion time, complexity level, reading level.

**Contrast Results**: Table of all 4 color pair ratios and WCAG levels.

**Recommendations**: Prioritized list of improvements, starting with the most impactful.

## Markup to review

\`\`\`html
${safeMarkup}
\`\`\``,
        },
      },
    ],
  };
}
