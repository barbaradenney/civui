import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { FormSchema } from './schema/index.js';
import { parseHTML, parsePDF } from './parsers/index.js';
import { generateCivUI } from './generator/index.js';
import {
  COMPONENT_CATALOG,
  GOVERNMENT_PATTERNS,
  TAILWIND_REFERENCE,
  FORM_TEMPLATES,
} from './resources/index.js';
import {
  lookupStyle,
  ELEMENT_TYPES,
  suggestFix,
  diffForms,
  formToSchema,
  exportSchema,
  validateForms,
} from './tools/index.js';
import { validateForm } from './validators/index.js';
import {
  CONVERT_LEGACY_FORM_NAME,
  CONVERT_LEGACY_FORM_DESCRIPTION,
  convertLegacyFormPrompt,
  BUILD_GOVERNMENT_FORM_NAME,
  BUILD_GOVERNMENT_FORM_DESCRIPTION,
  buildGovernmentFormPrompt,
  AUDIT_508_COMPLIANCE_NAME,
  AUDIT_508_COMPLIANCE_DESCRIPTION,
  audit508CompliancePrompt,
  ADD_FIELD_NAME,
  ADD_FIELD_DESCRIPTION,
  FIELD_TYPES,
  addFieldPrompt,
  MIGRATE_FORM_NAME,
  MIGRATE_FORM_DESCRIPTION,
  migrateFormPrompt,
} from './prompts/index.js';

/** 50 MB base64 ≈ ~37.5 MB decoded PDF — generous but bounded. */
const MAX_PDF_BASE64_LENGTH = 50 * 1024 * 1024;

/** 10 MB HTML — large enough for any real form page, prevents memory issues. */
const MAX_HTML_LENGTH = 10 * 1024 * 1024;

export function createServer(): McpServer {
  const server = new McpServer({
    name: 'civui-form-converter',
    version: '0.1.0',
  });

  // --- Resources ---

  server.resource('component-catalog', 'civui://catalog', async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: 'text/markdown',
        text: COMPONENT_CATALOG,
      },
    ],
  }));

  server.resource('government-patterns', 'civui://gov-patterns', async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: 'text/markdown',
        text: GOVERNMENT_PATTERNS,
      },
    ],
  }));

  server.resource('tailwind-reference', 'civui://tailwind', async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: 'text/markdown',
        text: TAILWIND_REFERENCE,
      },
    ],
  }));

  server.resource('form-templates', 'civui://templates', async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: 'text/markdown',
        text: FORM_TEMPLATES,
      },
    ],
  }));

  // --- Tools ---

  server.tool(
    'parse_html_form',
    'Parse an HTML form and extract its field structure as a FormSchema. ' +
      'Finds inputs, selects, textareas, fieldsets, and labels. ' +
      'Groups radio buttons and checkboxes by shared name attribute. ' +
      'Infers field types from name heuristics (e.g., "ssn" → SSN, "dob" → memorable-date).',
    {
      html: z
        .string()
        .max(MAX_HTML_LENGTH, 'HTML exceeds 10 MB size limit')
        .describe('Raw HTML string containing one or more <form> elements'),
    },
    async ({ html }) => {
      try {
        const schema = parseHTML(html);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(schema, null, 2),
            },
          ],
        };
      } catch (err) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `Error parsing HTML: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'parse_pdf_form',
    'Parse a PDF form and extract AcroForm fields as a FormSchema. ' +
      'Maps PDF field types (Tx→text, Ch→select, Btn→checkbox/radio). ' +
      'Applies name-based heuristics for SSN, email, date fields. ' +
      'Falls back to returning raw text (truncated to 10k chars) when no AcroForm fields exist.',
    {
      pdfBase64: z
        .string()
        .max(MAX_PDF_BASE64_LENGTH, 'PDF exceeds 50 MB size limit')
        .describe('Base64-encoded PDF file content (max 50 MB)'),
    },
    async ({ pdfBase64 }) => {
      try {
        const buffer = Buffer.from(pdfBase64, 'base64');
        const result = await parsePDF(buffer);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `Error parsing PDF: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'generate_civui_form',
    'Generate accessible CivUI web component markup from a FormSchema. ' +
      'Maps field types to CivUI tags (text→civ-text-input, radio→civ-radio-group, etc.). ' +
      'Auto-generates hints for date/SSN fields, field-specific required-messages, ' +
      'and wraps sections with headings in civ-fieldset. ' +
      'Never generates deprecated civ-date-input.',
    {
      schema: FormSchema.describe('Form schema describing sections and fields'),
      wrapInCivForm: z
        .boolean()
        .optional()
        .default(true)
        .describe('Whether to wrap output in <civ-form> (default: true)'),
    },
    async ({ schema, wrapInCivForm }) => {
      try {
        const html = generateCivUI(schema, { wrapInCivForm });
        return {
          content: [
            {
              type: 'text' as const,
              text: html,
            },
          ],
        };
      } catch (err) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `Error generating CivUI markup: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'style_civui_element',
    'Look up the correct CSS classes, state selectors, and focus ring for a CivUI element. ' +
      'Returns semantic component classes from components.css, state-triggered classes ' +
      '(error, disabled, checked, etc.), and focus ring guidance. ' +
      'Use this to style CivUI elements without guessing class names.',
    {
      element: z
        .enum(ELEMENT_TYPES)
        .describe('The CivUI element type to look up'),
      variant: z
        .string()
        .optional()
        .describe(
          'Optional variant: "tile" (checkbox/radio), "group" (hint/error-text), ' +
            '"horizontal"/"vertical" (group-layout)',
        ),
      state: z
        .array(z.string())
        .optional()
        .describe(
          'Optional state filter: "error", "disabled", "checked", "active", "selected", "dragging". ' +
            'Omit to see all available states.',
        ),
    },
    async ({ element, variant, state }) => {
      try {
        const result = lookupStyle(element, variant, state);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `Error looking up style: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'validate_form',
    'Validate CivUI HTML markup against Section 508 rules and best practices. ' +
      'Checks for missing labels/legends, deprecated components, placeholder-as-label, ' +
      'orphaned children, missing required-messages, abbreviations, autocomplete, and more. ' +
      'Returns { valid, errors, warnings, summary }.',
    {
      html: z
        .string()
        .max(MAX_HTML_LENGTH, 'HTML exceeds 10 MB size limit')
        .describe('CivUI HTML markup string to validate'),
      config: z
        .object({
          promoteWarnings: z
            .array(z.string())
            .optional()
            .describe('Rule IDs whose severity should be promoted from warning to error'),
          suppressRules: z
            .array(z.string())
            .optional()
            .describe('Rule IDs to skip entirely'),
        })
        .optional()
        .describe('Optional validation config'),
    },
    async ({ html, config }) => {
      try {
        const result = validateForm(html, config);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `Error validating form: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'suggest_fix',
    'Auto-correct CivUI validation violations. Parses HTML, applies DOM fixes for ' +
      'known rule violations (missing labels, deprecated tags, abbreviations, etc.), ' +
      'then re-validates. Returns { originalHtml, fixedHtml, appliedFixes, remainingViolations }.',
    {
      html: z
        .string()
        .max(MAX_HTML_LENGTH, 'HTML exceeds 10 MB size limit')
        .describe('CivUI HTML markup to fix'),
      rules: z
        .array(z.string())
        .optional()
        .describe('Optional rule IDs to limit fixes to (default: fix all)'),
    },
    async ({ html, rules }) => {
      try {
        const result = suggestFix(html, rules);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `Error suggesting fixes: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'diff_forms',
    'Compute a structured diff between two CivUI form markups. ' +
      'Matches components by name then position, returns added/removed/changed/unchanged ' +
      'with attribute-level changes and a summary string.',
    {
      before: z
        .string()
        .max(MAX_HTML_LENGTH, 'HTML exceeds 10 MB size limit')
        .describe('Original CivUI HTML markup'),
      after: z
        .string()
        .max(MAX_HTML_LENGTH, 'HTML exceeds 10 MB size limit')
        .describe('Modified CivUI HTML markup'),
    },
    async ({ before, after }) => {
      try {
        const result = diffForms(before, after);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `Error diffing forms: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'form_to_schema',
    'Convert CivUI HTML markup back to a FormSchema object (reverse of generate_civui_form). ' +
      'Extracts form-level attrs, sections from fieldsets, and fields with all attributes.',
    {
      html: z
        .string()
        .max(MAX_HTML_LENGTH, 'HTML exceeds 10 MB size limit')
        .describe('CivUI HTML markup to convert to schema'),
    },
    async ({ html }) => {
      try {
        const schema = formToSchema(html);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(schema, null, 2),
            },
          ],
        };
      } catch (err) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `Error converting to schema: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'export_schema',
    'Export a FormSchema as JSON Schema (Draft-07) or TypeScript interface. ' +
      'JSON Schema includes types, constraints, enums, and required fields. ' +
      'TypeScript generates an interface with camelCase props and union types.',
    {
      schema: FormSchema.describe('FormSchema to export'),
      format: z
        .enum(['json-schema', 'typescript'])
        .describe('Output format'),
    },
    async ({ schema, format }) => {
      try {
        const result = exportSchema(schema, format);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `Error exporting schema: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'validate_forms',
    'Batch validate multiple CivUI form markups at once. ' +
      'Returns individual results plus an overall summary like "3/5 forms valid".',
    {
      forms: z
        .array(
          z.object({
            id: z.string().describe('Identifier for this form'),
            html: z.string().describe('CivUI HTML markup to validate'),
          }),
        )
        .describe('Array of { id, html } objects to validate'),
      config: z
        .object({
          promoteWarnings: z.array(z.string()).optional(),
          suppressRules: z.array(z.string()).optional(),
        })
        .optional()
        .describe('Optional validation config applied to all forms'),
    },
    async ({ forms, config }) => {
      try {
        const result = validateForms(forms, config);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `Error validating forms: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // --- Prompts ---

  server.prompt(
    CONVERT_LEGACY_FORM_NAME,
    CONVERT_LEGACY_FORM_DESCRIPTION,
    {
      source: z
        .enum(['html', 'pdf'])
        .describe('Source format of the legacy form'),
    },
    async ({ source }) => convertLegacyFormPrompt(source),
  );

  server.prompt(
    BUILD_GOVERNMENT_FORM_NAME,
    BUILD_GOVERNMENT_FORM_DESCRIPTION,
    {
      formPurpose: z
        .string()
        .describe('Plain-English description of the form purpose'),
    },
    async ({ formPurpose }) => buildGovernmentFormPrompt(formPurpose),
  );

  server.prompt(
    AUDIT_508_COMPLIANCE_NAME,
    AUDIT_508_COMPLIANCE_DESCRIPTION,
    {
      markup: z
        .string()
        .describe('CivUI HTML markup to audit for compliance'),
    },
    async ({ markup }) => audit508CompliancePrompt(markup),
  );

  server.prompt(
    ADD_FIELD_NAME,
    ADD_FIELD_DESCRIPTION,
    {
      fieldType: z
        .enum(FIELD_TYPES)
        .describe('The type of field to generate'),
      label: z
        .string()
        .describe('The label text for the field'),
    },
    async ({ fieldType, label }) => addFieldPrompt(fieldType, label),
  );

  server.prompt(
    MIGRATE_FORM_NAME,
    MIGRATE_FORM_DESCRIPTION,
    {
      source: z
        .enum(['html', 'pdf'])
        .describe('Source format of the legacy form'),
    },
    async ({ source }) => migrateFormPrompt(source),
  );

  return server;
}
