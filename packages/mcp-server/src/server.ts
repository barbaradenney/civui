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
  CHANGELOG,
  DECISION_TREE,
  COMPLEX_PATTERNS,
} from './resources/index.js';
import {
  lookupStyle,
  ELEMENT_TYPES,
  suggestFix,
  diffForms,
  formToSchema,
  exportSchema,
  validateForms,
  checkContrast,
  estimateBurden,
  generateTests,
  generateStory,
  extractStrings,
  composeForms,
  generateCompanionJs,
  validateCrossField,
  analyzeRelationships,
  generateWizard,
  generatePrefillJs,
  generateSummary,
  visualizeFormFlow,
  generatePrintCss,
  migrateSavedData,
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
  REVIEW_FORM_UX_NAME,
  REVIEW_FORM_UX_DESCRIPTION,
  reviewFormUxPrompt,
  CONDITIONAL_FORM_NAME,
  CONDITIONAL_FORM_DESCRIPTION,
  conditionalFormPrompt,
  BUILD_COMPLEX_FORM_NAME,
  BUILD_COMPLEX_FORM_DESCRIPTION,
  buildComplexFormPrompt,
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

  server.resource('changelog', 'civui://changelog', async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: 'text/markdown',
        text: CHANGELOG,
      },
    ],
  }));

  server.resource('decision-tree', 'civui://decision-tree', async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: 'text/markdown',
        text: DECISION_TREE,
      },
    ],
  }));

  server.resource('complex-patterns', 'civui://complex-patterns', async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: 'text/markdown',
        text: COMPLEX_PATTERNS,
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

  server.tool(
    'check_contrast',
    'Check WCAG 2.1 contrast ratio between two colors. ' +
      'Accepts hex colors (#005ea2) or CivUI token names (primary, text-primary, civ-bg-error-light). ' +
      'Returns ratio, AA/AAA pass status for normal and large text, and overall WCAG level.',
    {
      foreground: z
        .string()
        .describe('Foreground color — hex (#005ea2) or token name (primary, text-primary)'),
      background: z
        .string()
        .describe('Background color — hex (#ffffff) or token name (white, bg-base-lightest)'),
    },
    async ({ foreground, background }) => {
      try {
        const result = checkContrast(foreground, background);
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
              text: `Error checking contrast: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'estimate_burden',
    'Estimate PRA burden for a government form schema. ' +
      'Calculates total/required/optional fields, estimated completion time, ' +
      'complexity level (low/medium/high), and reading level assessment.',
    {
      schema: FormSchema.describe('Form schema to estimate burden for'),
    },
    async ({ schema }) => {
      try {
        const result = estimateBurden(schema);
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
              text: `Error estimating burden: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'generate_tests',
    'Generate a Vitest test file from CivUI HTML markup. ' +
      'Creates rendering tests, label/legend tests, required field tests, ' +
      'event listener tests, and keyboard navigation tests.',
    {
      html: z
        .string()
        .max(MAX_HTML_LENGTH, 'HTML exceeds 10 MB size limit')
        .describe('CivUI HTML markup to generate tests for'),
      suiteName: z
        .string()
        .optional()
        .describe('Name for the test suite (default: "Form")'),
    },
    async ({ html, suiteName }) => {
      try {
        const result = generateTests(html, suiteName);
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
              text: `Error generating tests: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'generate_story',
    'Generate a Storybook CSF3 story file from CivUI HTML or FormSchema. ' +
      'Creates Default, WithErrors, and Filled story variants with argTypes.',
    {
      html: z
        .string()
        .max(MAX_HTML_LENGTH, 'HTML exceeds 10 MB size limit')
        .optional()
        .describe('CivUI HTML markup (provide html or schema, not both)'),
      schema: FormSchema.optional().describe(
        'FormSchema object (provide html or schema, not both)',
      ),
      componentName: z
        .string()
        .optional()
        .describe('Name for the component in Storybook (default: schema title or "Form")'),
    },
    async ({ html, schema, componentName }) => {
      try {
        const result = generateStory({ html, schema }, componentName);
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
              text: `Error generating story: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'extract_strings',
    'Extract translatable strings from CivUI HTML markup for i18n. ' +
      'Finds all text attributes (label, legend, hint, error, required-message, placeholder) ' +
      'and option labels. Returns a keyed string map for translation files.',
    {
      html: z
        .string()
        .max(MAX_HTML_LENGTH, 'HTML exceeds 10 MB size limit')
        .describe('CivUI HTML markup to extract strings from'),
    },
    async ({ html }) => {
      try {
        const result = extractStrings(html);
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
              text: `Error extracting strings: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'compose_forms',
    'Merge multiple FormSchemas into one unified schema. ' +
      'Resolves ref sections from subForms dictionary, applies namespace prefixes, ' +
      'and validates no name collisions. Returns merged schema, namespaces, resolved refs, and field count.',
    {
      primary: FormSchema.describe('Primary form schema'),
      subForms: z
        .record(
          z.string(),
          z.object({
            schema: FormSchema.describe('Schema to merge'),
            namespace: z.string().describe('Namespace prefix for field names'),
          }),
        )
        .optional()
        .describe('Additional schemas to merge with namespaces'),
    },
    async ({ primary, subForms }) => {
      try {
        const result = composeForms(primary, subForms);
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
              text: `Error composing forms: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'generate_companion_js',
    'Generate client-side JavaScript for repeatable sections and conditional visibility. ' +
      'Produces a self-contained IIFE handling add/remove/re-index for repeatable sections, ' +
      'show/hide for conditional fields, and conditional required toggling.',
    {
      schema: FormSchema.describe('Form schema to generate JavaScript for'),
    },
    async ({ schema }) => {
      try {
        const result = generateCompanionJs(schema);
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
              text: `Error generating companion JS: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'validate_cross_field',
    'Evaluate cross-field rules and conditional requirements against field values. ' +
      'Checks crossFieldRules and per-field requiredWhen/visibleWhen conditions. ' +
      'Returns fired rules, conditionally required/visible/hidden fields, and errors.',
    {
      schema: FormSchema.describe('Form schema with cross-field rules'),
      values: z
        .record(z.string(), z.union([z.string(), z.array(z.string())]))
        .describe('Field values to evaluate against (name → value)'),
    },
    async ({ schema, values }) => {
      try {
        const result = validateCrossField(schema, values);
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
              text: `Error validating cross-field rules: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'analyze_relationships',
    'Analyze a FormSchema and produce an entity-relationship summary. ' +
      'Identifies entities from sections, detects one-to-many from repeatable sections, ' +
      'conditional dependencies from visibleWhen/requiredWhen, and cross-field rule relationships. ' +
      'Infers entity types from field name patterns.',
    {
      schema: FormSchema.describe('Form schema to analyze'),
    },
    async ({ schema }) => {
      try {
        const result = analyzeRelationships(schema);
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
              text: `Error analyzing relationships: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'generate_wizard',
    'Generate a multi-step wizard form from a FormSchema with steps defined. ' +
      'Produces HTML with step containers, progress indicator, and navigation buttons, ' +
      'plus companion JavaScript for step management. Returns step summary with field counts.',
    {
      schema: FormSchema.describe('Form schema with steps array'),
    },
    async ({ schema }) => {
      try {
        const result = generateWizard(schema);
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
              text: `Error generating wizard: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'generate_prefill_js',
    'Generate client-side JavaScript to prefill a CivUI form from saved values. ' +
      'Handles text inputs, radios, checkboxes, selects, and toggles. ' +
      'Includes window.civSerializeForm() for save-resume serialization.',
    {
      schema: FormSchema.describe('Form schema'),
      values: z
        .record(z.string(), z.union([z.string(), z.array(z.string())]))
        .describe('Field values to prefill (name → value)'),
    },
    async ({ schema, values }) => {
      try {
        const result = generatePrefillJs(schema, values);
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
              text: `Error generating prefill JS: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'generate_summary',
    'Generate a read-only HTML summary of form values for review pages. ' +
      'Groups by section with <dl> elements, handles repeatable sections, ' +
      'and adds edit links for wizard forms.',
    {
      schema: FormSchema.describe('Form schema'),
      values: z
        .record(z.string(), z.union([z.string(), z.array(z.string())]))
        .describe('Field values to summarize (name → value)'),
    },
    async ({ schema, values }) => {
      try {
        const result = generateSummary(schema, values);
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
              text: `Error generating summary: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'visualize_form_flow',
    'Generate a Mermaid flowchart visualizing a form\'s conditional logic, ' +
      'wizard steps, cascading options, and cross-field rules. ' +
      'Returns Mermaid syntax plus node/edge counts and a summary.',
    {
      schema: FormSchema.describe('Form schema to visualize'),
    },
    async ({ schema }) => {
      try {
        const result = visualizeFormFlow(schema);
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
              text: `Error visualizing form flow: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'generate_print_css',
    'Generate a @media print stylesheet for a CivUI form schema. ' +
      'Includes base print styles plus feature-specific rules for wizards, ' +
      'repeatable sections, conditional visibility, and table layouts.',
    {
      schema: FormSchema.describe('Form schema to generate print CSS for'),
    },
    async ({ schema }) => {
      try {
        const result = generatePrintCss(schema);
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
              text: `Error generating print CSS: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'migrate_saved_data',
    'Migrate saved form values from an old schema to a new schema. ' +
      'Handles direct matches, explicit renames via fieldMappings, ' +
      'repeatable field index preservation, and type mismatch warnings.',
    {
      oldSchema: FormSchema.describe('Previous version of the form schema'),
      newSchema: FormSchema.describe('Current version of the form schema'),
      savedValues: z
        .record(z.string(), z.union([z.string(), z.array(z.string())]))
        .describe('Saved field values from the old form (name → value)'),
      fieldMappings: z
        .record(z.string(), z.string())
        .optional()
        .describe('Optional old field name → new field name mappings for renamed fields'),
    },
    async ({ oldSchema, newSchema, savedValues, fieldMappings }) => {
      try {
        const result = migrateSavedData(oldSchema, newSchema, savedValues, fieldMappings);
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
              text: `Error migrating saved data: ${err instanceof Error ? err.message : String(err)}`,
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

  server.prompt(
    REVIEW_FORM_UX_NAME,
    REVIEW_FORM_UX_DESCRIPTION,
    {
      markup: z
        .string()
        .describe('CivUI HTML markup to review'),
    },
    async ({ markup }) => reviewFormUxPrompt(markup),
  );

  server.prompt(
    CONDITIONAL_FORM_NAME,
    CONDITIONAL_FORM_DESCRIPTION,
    {
      description: z
        .string()
        .describe('Plain-English description of the conditional form requirements'),
    },
    async ({ description }) => conditionalFormPrompt(description),
  );

  server.prompt(
    BUILD_COMPLEX_FORM_NAME,
    BUILD_COMPLEX_FORM_DESCRIPTION,
    {
      description: z
        .string()
        .describe('Plain-English description of the complex form requirements'),
    },
    async ({ description }) => buildComplexFormPrompt(description),
  );

  return server;
}
