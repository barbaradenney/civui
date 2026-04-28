/**
 * MCP prompt: migrate-form
 * End-to-end chained workflow that parses, generates, validates, fixes, diffs, and presents.
 */
import {
  COMPONENT_CATALOG,
  GOVERNMENT_PATTERNS,
} from '../resources/index.js';

export const MIGRATE_FORM_NAME = 'migrate-form';

export const MIGRATE_FORM_DESCRIPTION =
  'End-to-end migration workflow: parse a legacy form, generate CivUI markup, ' +
  'validate, auto-fix violations, diff original vs fixed, and present a compliance report.';

export function migrateFormPrompt(source: 'html' | 'pdf') {
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
          text: `# Migrate Form (${source.toUpperCase()} source)

You are performing an end-to-end migration of a legacy ${source.toUpperCase()} form into accessible CivUI web components. Follow these steps in order:

## Step 1: Parse the legacy form
Call the \`${parseTool}\` tool with ${inputDesc} provided by the user as the \`${inputParam}\` parameter.

## Step 2: Generate CivUI markup
Call the \`generate_civui_form\` tool with the extracted schema. Set \`wrapInCivForm: true\`.

## Step 3: Validate the generated markup
Call the \`validate_form\` tool with the generated HTML. Note all errors and warnings.

## Step 4: Auto-fix violations
Call the \`suggest_fix\` tool with the generated HTML. This will automatically correct violations like:
- Missing labels, legends, required-messages
- Missing autocomplete, hints, and name attributes
- Abbreviations, physical CSS properties, deprecated focus classes

## Step 5: Diff original vs fixed
Call the \`diff_forms\` tool with the original generated markup as \`before\` and the fixed markup as \`after\`.
This shows exactly what changed during auto-fix.

## Step 6: Re-validate
Call the \`validate_form\` tool again on the fixed HTML to confirm all issues are resolved.
If violations remain, fix them manually and explain each change.

## Step 7: Present results
Show the user:
1. **Final CivUI markup** — the validated, fixed HTML ready to use
2. **Diff summary** — what changed during auto-fix (from Step 5)
3. **Compliance report** — validation status, any remaining warnings, Section 508 notes
4. **Field summary** — total fields, types used, accessibility features added`,
        },
      },
    ],
  };
}
