/**
 * MCP prompt: convert-legacy-form
 * Walks through parse → review → generate → validate workflow for legacy form migration.
 */
import {
  COMPONENT_CATALOG,
  GOVERNMENT_PATTERNS,
} from '../resources/index.js';

export const CONVERT_LEGACY_FORM_NAME = 'convert-legacy-form';

export const CONVERT_LEGACY_FORM_DESCRIPTION =
  'Step-by-step workflow to convert a legacy HTML or PDF form into accessible CivUI web components. ' +
  'Guides you through parsing, reviewing the extracted schema, generating CivUI markup, and validating compliance.';

export function convertLegacyFormPrompt(source: 'html' | 'pdf') {
  const parseTool = source === 'html' ? 'parse_html_form' : 'parse_pdf_form';
  const inputParam = source === 'html' ? 'html' : 'pdfBase64';
  const inputDesc =
    source === 'html'
      ? 'the raw HTML string'
      : 'the base64-encoded PDF content';

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
          text: `# Convert Legacy Form (${source.toUpperCase()} source)

You are converting a legacy ${source.toUpperCase()} form into accessible CivUI web components. Follow these steps in order:

## Step 1: Parse the legacy form
Call the \`${parseTool}\` tool with ${inputDesc} provided by the user as the \`${inputParam}\` parameter.

## Step 2: Review the extracted schema
Examine the FormSchema returned by the parser. Check for:
- Correct field types (especially date, SSN, and phone fields)
- Labels that use plain language (not abbreviations)
- Required fields that need required-message text
- Fields that should have autocomplete attributes
- Radio/checkbox groups properly identified

Present the schema summary to the user and ask if any corrections are needed before generating.

## Step 3: Generate CivUI markup
Call the \`generate_civui_form\` tool with the (possibly corrected) schema. Set \`wrapInCivForm: true\`.

## Step 4: Validate compliance
Call the \`validate_form\` tool with the generated HTML markup. Review all errors and warnings:
- **Errors** are Section 508 violations that must be fixed
- **Warnings** are best-practice issues that should be addressed

If there are violations, fix the markup and explain each change. Re-validate until clean.

## Step 5: Present the final markup
Show the validated CivUI markup to the user with a summary of:
- Total fields converted
- Any field type changes made (e.g., date-input → memorable-date)
- Accessibility improvements added (hints, autocomplete, required-messages)`,
        },
      },
    ],
  };
}
