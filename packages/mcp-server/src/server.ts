import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { FormSchema, FormField } from './schema/index.js';
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
  WORKFLOW_PATTERNS,
  SCHEMA_REFERENCE,
  AI_GUIDE,
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
  generateErrorMessages,
  generateAnalyticsPlan,
  lintFormLanguage,
  generatePayloadSchema,
  compareSchemas,
  generateValidationSchema,
  generateA11yTests,
  generatePrefillMapping,
  generateWorkflowUi,
  generateLockMatrix,
  generateDelegationSections,
  generateFeedbackUi,
  generateAuditTrail,
  generateSectionProgress,
  generateCaseDashboard,
  generateAddressBlock,
  generateConfirmationPage,
  generateSignatureBlock,
  generateEligibilityScreener,
  generateDocumentChecklist,
  generateDecisionNotice,
  generateAmendmentFlow,
  generateSaveResumeUi,
  generateBilingualForm,
  generateDataTable,
  generateFormChain,
  generateRepeatableSection,
  generateProgressBar,
  generateTimeoutWarning,
  generateConditionalReveal,
  generateHelpPanel,
  validateReadingLevel,
  generatePdfNotice,
  generateFieldDependenciesGraph,
  generateMockData,
  generateApiHandler,
  validateSchema,
  generateE2eTests,
  generateEmailTemplate,
  generateCrossFieldRules,
  inlineSubForms,
  scaffoldFromTemplate,
  generateContentRegistry,
  generateReactNativeForm,
  queryTokens,
  generate508Report,
  generateOpenApiSpec,
  generateReactForm,
  syncContentRegistry,
  generateI18nFiles,
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
  BUILD_WORKFLOW_FORM_NAME,
  BUILD_WORKFLOW_FORM_DESCRIPTION,
  buildWorkflowFormPrompt,
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

  server.resource('workflow-patterns', 'civui://workflow-patterns', async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: 'text/markdown',
        text: WORKFLOW_PATTERNS,
      },
    ],
  }));

  server.resource('schema-reference', 'civui://schema-reference', async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: 'text/markdown',
        text: SCHEMA_REFERENCE,
      },
    ],
  }));

  server.resource('ai-guide', 'civui://ai-guide', async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: 'text/markdown',
        text: AI_GUIDE,
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

  server.tool(
    'generate_error_messages',
    'Generate a complete error message library for every field and constraint in a FormSchema. ' +
      'Produces field-specific messages for required, pattern, length, range, and file constraints. ' +
      'Includes cross-field rule error messages.',
    {
      schema: FormSchema.describe('Form schema to generate error messages for'),
    },
    async ({ schema }) => {
      try {
        const result = generateErrorMessages(schema);
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
              text: `Error generating error messages: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'generate_analytics_plan',
    'Generate an analytics instrumentation plan for a form schema. ' +
      'Produces per-field events, funnel steps with expected completion rates, ' +
      'drop-off risk analysis, and PRA burden metrics.',
    {
      schema: FormSchema.describe('Form schema to generate analytics plan for'),
    },
    async ({ schema }) => {
      try {
        const result = generateAnalyticsPlan(schema);
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
              text: `Error generating analytics plan: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'lint_form_language',
    'Lint a form schema for plain language issues. ' +
      'Checks for jargon, abbreviations, passive voice, high reading level, ' +
      'non-actionable hints, and terminology inconsistency. Returns issues, score, and suggestions.',
    {
      schema: FormSchema.describe('Form schema to lint for language issues'),
    },
    async ({ schema }) => {
      try {
        const result = lintFormLanguage(schema);
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
              text: `Error linting form language: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'generate_payload_schema',
    'Generate the expected JSON submission payload shape for a form schema. ' +
      'Respects structural hierarchy: repeatable sections become arrays, ' +
      'namespaced sections become nested objects. Returns JSON Schema, TypeScript, and example.',
    {
      schema: FormSchema.describe('Form schema to generate payload schema for'),
    },
    async ({ schema }) => {
      try {
        const result = generatePayloadSchema(schema);
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
              text: `Error generating payload schema: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'compare_schemas',
    'Compare two FormSchema versions and produce a structured diff. ' +
      'Detects added, removed, changed, and moved fields/sections/steps/rules. ' +
      'Identifies breaking changes like removed required fields or type changes.',
    {
      before: FormSchema.describe('Previous version of the form schema'),
      after: FormSchema.describe('New version of the form schema'),
    },
    async ({ before, after }) => {
      try {
        const result = compareSchemas(before, after);
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
              text: `Error comparing schemas: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'generate_validation_schema',
    'Generate runtime server-side validation code from a FormSchema. ' +
      'Supports Zod (with superRefine for cross-field rules) and JSON Schema ' +
      '(Draft-07 with if/then for conditional requirements).',
    {
      schema: FormSchema.describe('Form schema to generate validation for'),
      format: z
        .enum(['zod', 'json-schema-validation'])
        .describe('Output format: "zod" or "json-schema-validation"'),
    },
    async ({ schema, format }) => {
      try {
        const result = generateValidationSchema(schema, format);
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
              text: `Error generating validation schema: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'generate_a11y_tests',
    'Generate accessibility-focused Vitest tests from CivUI HTML markup. ' +
      'Creates tests in 6 categories: aria-attributes, keyboard, focus-management, ' +
      'announcements, semantics, and color-independence.',
    {
      html: z
        .string()
        .max(MAX_HTML_LENGTH, 'HTML exceeds 10 MB size limit')
        .describe('CivUI HTML markup to generate accessibility tests for'),
      suiteName: z
        .string()
        .optional()
        .describe('Name for the test suite (default: "Accessibility")'),
    },
    async ({ html, suiteName }) => {
      try {
        const result = generateA11yTests(html, suiteName);
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
              text: `Error generating a11y tests: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'generate_prefill_mapping',
    'Generate intelligent API-to-form field mappings. ' +
      'Matches fields using exact, normalized, label, and type strategies. ' +
      'Accepts JSON Schema or example JSON as API schema. ' +
      'Returns mappings, unmapped fields, confidence score, and mapping code.',
    {
      schema: FormSchema.describe('Form schema with fields to map'),
      apiSchema: z
        .record(z.string(), z.any())
        .describe('API schema — JSON Schema (with properties) or example JSON object'),
      direction: z
        .enum(['api-to-form', 'form-to-api'])
        .optional()
        .default('api-to-form')
        .describe('Mapping direction (default: "api-to-form")'),
    },
    async ({ schema, apiSchema, direction }) => {
      try {
        const result = generatePrefillMapping(schema, apiSchema, direction);
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
              text: `Error generating prefill mapping: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // --- Workflow & Case Tools ---

  server.tool(
    'generate_workflow_ui',
    'Generate workflow status banner, transition buttons, and companion JavaScript ' +
      'for multi-actor form workflows. Shows current state, available actions, and ' +
      'handles confirmation dialogs, comment requirements, and section-complete validation.',
    {
      schema: FormSchema.describe('Form schema with workflow definition'),
      currentState: z
        .string()
        .optional()
        .describe('Current workflow state ID (default: initialState)'),
      currentActor: z
        .string()
        .optional()
        .describe('Current actor ID (default: first actor)'),
    },
    async ({ schema, currentState, currentActor }) => {
      try {
        const result = generateWorkflowUi(schema, currentState, currentActor);
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
              text: `Error generating workflow UI: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'generate_lock_matrix',
    'Generate a state × actor permission matrix showing which sections are editable, ' +
      'readonly, or hidden for each workflow state and actor combination. ' +
      'Returns matrix data, markdown summary table, and data attribute documentation.',
    {
      schema: FormSchema.describe('Form schema with workflow and actors'),
    },
    async ({ schema }) => {
      try {
        const result = generateLockMatrix(schema);
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
              text: `Error generating lock matrix: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'generate_delegation_sections',
    'Generate representative information, attestation, and consent sections for ' +
      'delegation/representative forms. Produces FormSection objects ready to merge, ' +
      'attestation HTML, and cross-field rules for conditional delegation fields.',
    {
      schema: FormSchema.describe('Form schema with delegation configuration'),
      delegationType: z
        .string()
        .optional()
        .describe('Filter to a specific delegation type ID (default: all types)'),
    },
    async ({ schema, delegationType }) => {
      try {
        const result = generateDelegationSections(schema, delegationType);
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
              text: `Error generating delegation sections: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'generate_feedback_ui',
    'Generate inline comment/feedback panels for reviewer and applicant modes. ' +
      'Supports section-level or field-level granularity, existing comments, ' +
      'resolution tracking, and custom events for feedback submission.',
    {
      schema: FormSchema.describe('Form schema with feedback configuration or workflow with allowsFeedback'),
      mode: z
        .enum(['reviewer', 'applicant'])
        .optional()
        .default('reviewer')
        .describe('Feedback mode: reviewer (add comments) or applicant (read-only)'),
      existingComments: z
        .array(
          z.object({
            target: z.string(),
            author: z.string(),
            text: z.string(),
            timestamp: z.string().optional(),
            resolved: z.boolean().optional(),
          }),
        )
        .optional()
        .describe('Existing comments to render'),
    },
    async ({ schema, mode, existingComments }) => {
      try {
        const result = generateFeedbackUi(schema, { mode, existingComments });
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
              text: `Error generating feedback UI: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'generate_audit_trail',
    'Generate a timeline/history component for case-style forms. ' +
      'Renders chronologically sorted entries with timestamps, actor badges, ' +
      'action descriptions, state transitions, and detail text.',
    {
      schema: FormSchema.describe('Form schema with workflow or actors'),
      entries: z
        .array(
          z.object({
            timestamp: z.string().describe('ISO 8601 timestamp'),
            actor: z.string().describe('Actor ID or name'),
            action: z.string().describe('Action description'),
            details: z.string().optional(),
            stateFrom: z.string().optional(),
            stateTo: z.string().optional(),
          }),
        )
        .describe('Audit trail entries to render'),
    },
    async ({ schema, entries }) => {
      try {
        const result = generateAuditTrail(schema, entries);
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
              text: `Error generating audit trail: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'generate_section_progress',
    'Generate a section completion checklist with progress tracking. ' +
      'Shows complete/incomplete/not-started status per section, ' +
      'overall percentage, anchor links, and JavaScript for dynamic updates.',
    {
      schema: FormSchema.describe('Form schema with sections'),
      completedValues: z
        .record(z.string(), z.union([z.string(), z.array(z.string())]))
        .optional()
        .describe('Map of field names to their current values for completion calculation'),
    },
    async ({ schema, completedValues }) => {
      try {
        const result = generateSectionProgress(schema, completedValues);
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
              text: `Error generating section progress: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'generate_case_dashboard',
    'Generate a composed case-style dashboard combining workflow status, ' +
      'section progress, and audit trail into a responsive two-column layout. ' +
      'Returns merged HTML, JavaScript, and feature summary.',
    {
      schema: FormSchema.describe('Form schema with workflow definition'),
      currentState: z
        .string()
        .optional()
        .describe('Current workflow state ID'),
      currentActor: z
        .string()
        .optional()
        .describe('Current actor ID'),
      completedValues: z
        .record(z.string(), z.union([z.string(), z.array(z.string())]))
        .optional()
        .describe('Map of field names to their current values'),
      auditEntries: z
        .array(
          z.object({
            timestamp: z.string(),
            actor: z.string(),
            action: z.string(),
            details: z.string().optional(),
            stateFrom: z.string().optional(),
            stateTo: z.string().optional(),
          }),
        )
        .optional()
        .describe('Audit trail entries'),
    },
    async ({ schema, currentState, currentActor, completedValues, auditEntries }) => {
      try {
        const result = generateCaseDashboard(schema, {
          currentState,
          currentActor,
          completedValues,
          auditEntries,
        });
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
              text: `Error generating case dashboard: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // --- Form Lifecycle Tools ---

  server.tool(
    'generate_eligibility_screener',
    'Generate an eligibility screening questionnaire with disqualification logic. ' +
      'Produces yes-no radios, selects, and number inputs with configurable pass/fail conditions.',
    {
      schema: FormSchema.describe('Form schema with eligibility configuration'),
    },
    async ({ schema }) => {
      try {
        const result = generateEligibilityScreener(schema);
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
              text: `Error generating eligibility screener: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'generate_confirmation_page',
    'Generate a post-submission confirmation page with receipt number, submission summary, ' +
      'next steps, and print/copy controls.',
    {
      schema: FormSchema.describe('Form schema used for field labels and section headings'),
      submissionData: z
        .record(z.string(), z.union([z.string(), z.array(z.string())]))
        .describe('Submitted field values (name → value)'),
      showNextSteps: z
        .boolean()
        .optional()
        .describe('Show next steps section (default: true)'),
      nextSteps: z
        .array(z.string())
        .optional()
        .describe('Custom next steps (overrides defaults)'),
      agency: z
        .string()
        .optional()
        .describe('Agency name for letterhead'),
    },
    async ({ schema, submissionData, showNextSteps, nextSteps, agency }) => {
      try {
        const result = generateConfirmationPage(schema, submissionData, {
          showNextSteps,
          nextSteps,
          agency,
        });
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
              text: `Error generating confirmation page: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'generate_document_checklist',
    'Generate an evidence/document upload checklist with per-requirement file inputs, ' +
      'format and size validation, status tracking, and civ-document-status events.',
    {
      schema: FormSchema.describe('Form schema with documents configuration'),
    },
    async ({ schema }) => {
      try {
        const result = generateDocumentChecklist(schema);
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
              text: `Error generating document checklist: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'generate_address_block',
    'Generate a standalone US address fieldset with autocomplete attributes, ' +
      'ZIP validation, optional territories and military addresses. Returns HTML, JS, and a FormSection.',
    {
      includeTerritories: z
        .boolean()
        .optional()
        .describe('Include US territories (DC, AS, GU, MP, PR, VI)'),
      includeMilitary: z
        .boolean()
        .optional()
        .describe('Include military addresses (AA, AE, AP)'),
      label: z
        .string()
        .optional()
        .describe('Custom legend text (default: "Mailing address")'),
    },
    async ({ includeTerritories, includeMilitary, label }) => {
      try {
        const result = generateAddressBlock({ includeTerritories, includeMilitary, label });
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
              text: `Error generating address block: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'generate_save_resume_ui',
    'Generate save-and-resume UI with auto-save, manual save, draft persistence via localStorage, ' +
      'resume detection, and session timeout dialog with countdown.',
    {
      schema: FormSchema.describe('Form schema (title used for storage key)'),
      autoSaveIntervalMs: z
        .number()
        .optional()
        .describe('Auto-save interval in ms (default: 30000)'),
      sessionTimeoutMs: z
        .number()
        .optional()
        .describe('Session timeout in ms (default: 900000)'),
      warningBeforeTimeoutMs: z
        .number()
        .optional()
        .describe('Warning before timeout in ms (default: 120000)'),
      storageKey: z
        .string()
        .optional()
        .describe('localStorage key (default: slugified title)'),
      showLastSaved: z
        .boolean()
        .optional()
        .describe('Show last-saved timestamp (default: true)'),
    },
    async ({ schema, autoSaveIntervalMs, sessionTimeoutMs, warningBeforeTimeoutMs, storageKey, showLastSaved }) => {
      try {
        const result = generateSaveResumeUi(schema, {
          autoSaveIntervalMs,
          sessionTimeoutMs,
          warningBeforeTimeoutMs,
          storageKey,
          showLastSaved,
        });
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
              text: `Error generating save/resume UI: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'generate_amendment_flow',
    'Generate a post-submission amendment request UI with a diff table showing ' +
      'original vs amended values, optional reason textarea, and approval notice.',
    {
      schema: FormSchema.describe('Form schema for field labels'),
      originalValues: z
        .record(z.string(), z.string())
        .describe('Original submitted values (name → value)'),
      amendedValues: z
        .record(z.string(), z.string())
        .describe('Amended values (name → value)'),
      requiresReason: z
        .boolean()
        .optional()
        .describe('Show reason textarea (default: true)'),
      requiresApproval: z
        .boolean()
        .optional()
        .describe('Show approval notice (default: false)'),
    },
    async ({ schema, originalValues, amendedValues, requiresReason, requiresApproval }) => {
      try {
        const result = generateAmendmentFlow(schema, originalValues, amendedValues, {
          requiresReason,
          requiresApproval,
        });
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
              text: `Error generating amendment flow: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'generate_form_chain',
    'Generate a multi-form chain UI with step navigation, dependency-based locking, ' +
      'data carry-over between forms, and back/next/submit-all buttons.',
    {
      schema: FormSchema.describe('Form schema with formChain configuration'),
      currentStep: z
        .number()
        .optional()
        .describe('Current active step index (default: 0)'),
      completedSteps: z
        .array(z.string())
        .optional()
        .describe('Array of completed step schemaRef IDs'),
    },
    async ({ schema, currentStep, completedSteps }) => {
      try {
        const result = generateFormChain(schema, { currentStep, completedSteps });
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
              text: `Error generating form chain: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'generate_decision_notice',
    'Generate a formal approval/denial letter with merge-field substitution, ' +
      'legal citations, appeal information, and print support.',
    {
      schema: FormSchema.describe('Form schema with decisionNotice configuration'),
      decision: z
        .string()
        .describe('Decision key matching a template (e.g., "approved", "denied")'),
      formData: z
        .record(z.string(), z.string())
        .describe('Form data for merge field substitution (fieldName → value)'),
    },
    async ({ schema, decision, formData }) => {
      try {
        const result = generateDecisionNotice(schema, decision, formData);
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
              text: `Error generating decision notice: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'generate_bilingual_form',
    'Generate a bilingual form with language toggle, side-by-side, or inline rendering modes. ' +
      'Supports RTL languages and localStorage-based language preference persistence.',
    {
      schema: FormSchema.describe('Form schema with bilingual configuration'),
      translations: z
        .record(z.string(), z.string())
        .describe('Translation map (primary label → secondary label)'),
      mode: z
        .enum(['toggle', 'side-by-side', 'inline'])
        .optional()
        .describe('Rendering mode (default: from schema or "toggle")'),
    },
    async ({ schema, translations, mode }) => {
      try {
        const result = generateBilingualForm(schema, translations, { mode });
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
              text: `Error generating bilingual form: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'generate_data_table',
    'Generate an accessible financial/itemized data entry table with add/remove rows, ' +
      'column sorting, totals, and ARIA announcements.',
    {
      schema: FormSchema.describe('Form schema with dataTable configuration'),
      initialRows: z
        .number()
        .optional()
        .describe('Number of initial rows (default: minRows or 1)'),
    },
    async ({ schema, initialRows }) => {
      try {
        const result = generateDataTable(schema, { initialRows });
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
              text: `Error generating data table: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'generate_signature_block',
    'Generate an e-signature block with typed, drawn (canvas), or checkbox modes. ' +
      'Includes legal attestation text, optional witness, print name, title, and date fields.',
    {
      schema: FormSchema.describe('Form schema (optional signature configuration)'),
      type: z
        .enum(['typed', 'drawn', 'checkbox'])
        .optional()
        .describe('Signature type (default: from schema or "typed")'),
      legalText: z
        .string()
        .optional()
        .describe('Legal attestation text'),
      witnessRequired: z
        .boolean()
        .optional()
        .describe('Include witness fieldset'),
      dateRequired: z
        .boolean()
        .optional()
        .describe('Include date field'),
      printNameRequired: z
        .boolean()
        .optional()
        .describe('Include printed name field'),
      titleRequired: z
        .boolean()
        .optional()
        .describe('Include title field'),
    },
    async ({ schema, type, legalText, witnessRequired, dateRequired, printNameRequired, titleRequired }) => {
      try {
        const result = generateSignatureBlock(schema, {
          type,
          legalText,
          witnessRequired,
          dateRequired,
          printNameRequired,
          titleRequired,
        });
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
              text: `Error generating signature block: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // --- Phase 7: Utility & Integration Tools ---

  server.tool(
    'generate_repeatable_section',
    'Generate an add-another repeatable section pattern with reindexing, ' +
      'min/max enforcement, and ARIA live announcements.',
    {
      schema: FormSchema.describe('Form schema containing the section to repeat'),
      sectionIndex: z
        .number()
        .describe('Index of the section in schema.sections to make repeatable'),
      minRepeats: z.number().optional().describe('Minimum number of items (default: 1)'),
      maxRepeats: z.number().optional().describe('Maximum number of items (default: unlimited)'),
      addLabel: z.string().optional().describe('Label for the add button (default: "Add another")'),
      removeLabel: z.string().optional().describe('Label for remove buttons (default: "Remove")'),
    },
    async ({ schema, sectionIndex, minRepeats, maxRepeats, addLabel, removeLabel }) => {
      try {
        const result = generateRepeatableSection(schema, sectionIndex, {
          minRepeats,
          maxRepeats,
          addLabel,
          removeLabel,
        });
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
              text: `Error generating repeatable section: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'generate_progress_bar',
    'Generate a step progress indicator with completed/current/upcoming states, ' +
      'optional clickable navigation, and aria-current step marking.',
    {
      steps: z
        .array(z.object({ id: z.string(), label: z.string() }))
        .describe('Ordered array of step definitions'),
      currentStep: z.string().describe('ID of the currently active step'),
      clickable: z
        .boolean()
        .optional()
        .describe('Allow clicking completed steps to navigate back'),
    },
    async ({ steps, currentStep, clickable }) => {
      try {
        const result = generateProgressBar(steps, currentStep, { clickable });
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
              text: `Error generating progress bar: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'generate_timeout_warning',
    'Generate a WCAG 2.2.1-compliant session timeout warning dialog with ' +
      'countdown timer, session extension, and optional redirect.',
    {
      schema: FormSchema.optional().describe(
        'Form schema with timeoutWarning configuration (alternative to standalone params)',
      ),
      sessionTimeoutMs: z
        .number()
        .optional()
        .describe('Session timeout in milliseconds (standalone mode)'),
      warningBeforeMs: z
        .number()
        .optional()
        .describe('Show warning this many ms before timeout (standalone mode)'),
      extendable: z
        .boolean()
        .optional()
        .describe('Allow session extension (default: true)'),
      maxExtensions: z
        .number()
        .optional()
        .describe('Maximum number of extensions allowed'),
      redirectUrl: z
        .string()
        .optional()
        .describe('URL to redirect to on timeout'),
    },
    async ({ schema, sessionTimeoutMs, warningBeforeMs, extendable, maxExtensions, redirectUrl }) => {
      try {
        let result;
        if (sessionTimeoutMs && warningBeforeMs) {
          result = generateTimeoutWarning({
            sessionTimeoutMs,
            warningBeforeMs,
            extendable,
            maxExtensions,
            redirectUrl,
          });
        } else if (schema) {
          result = generateTimeoutWarning(schema);
        } else {
          throw new Error('Provide either schema with timeoutWarning or standalone sessionTimeoutMs + warningBeforeMs');
        }
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
              text: `Error generating timeout warning: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'generate_conditional_reveal',
    'Generate a conditional reveal pattern that shows or hides field groups ' +
      'based on a trigger field value, with aria-expanded and aria-controls.',
    {
      trigger: z
        .object({
          fieldName: z.string(),
          value: z.union([z.string(), z.array(z.string())]),
          operator: z.enum(['eq', 'neq', 'includes']).optional(),
        })
        .describe('Trigger field configuration'),
      revealedFields: z
        .array(FormField)
        .describe('Fields to show/hide based on trigger'),
      mode: z
        .enum(['show', 'hide'])
        .optional()
        .describe('Whether trigger shows or hides the fields (default: "show")'),
    },
    async ({ trigger, revealedFields, mode }) => {
      try {
        const result = generateConditionalReveal(trigger, revealedFields, { mode });
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
              text: `Error generating conditional reveal: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'generate_help_panel',
    'Generate a contextual help panel in sidebar, inline, or tooltip mode ' +
      'with collapsible sections, keyboard navigation, and ARIA attributes.',
    {
      sections: z
        .array(
          z.object({
            id: z.string(),
            heading: z.string(),
            body: z.string(),
            relatedFields: z.array(z.string()).optional(),
          }),
        )
        .describe('Help content sections'),
      mode: z
        .enum(['sidebar', 'inline', 'tooltip'])
        .optional()
        .describe('Display mode (default: "sidebar")'),
    },
    async ({ sections, mode }) => {
      try {
        const result = generateHelpPanel(sections, { mode });
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
              text: `Error generating help panel: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'validate_reading_level',
    'Analyze text readability using Flesch-Kincaid scoring. Returns grade level, ' +
      'reading ease score, and plain-language suggestions for government content.',
    {
      text: z.string().describe('Text content to analyze for readability'),
      targetGradeLevel: z
        .number()
        .optional()
        .describe('Target grade level (default: 8 for government content)'),
    },
    async ({ text, targetGradeLevel }) => {
      try {
        const result = validateReadingLevel(text, { targetGradeLevel });
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
              text: `Error validating reading level: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'generate_pdf_notice',
    'Generate a print-optimized decision notice with @media print CSS, ' +
      'page break rules, and running headers for PDF generation.',
    {
      schema: FormSchema.describe('Form schema with decisionNotice configuration'),
      decision: z
        .string()
        .describe('Decision key matching a template (e.g., "approved", "denied")'),
      formData: z
        .record(z.string(), z.string())
        .describe('Form data for merge field substitution'),
      includeHeader: z
        .boolean()
        .optional()
        .describe('Include running header with agency name (default: true)'),
      pageSize: z
        .enum(['letter', 'a4'])
        .optional()
        .describe('Page size (default: "letter")'),
      orientation: z
        .enum(['portrait', 'landscape'])
        .optional()
        .describe('Page orientation (default: "portrait")'),
    },
    async ({ schema, decision, formData, includeHeader, pageSize, orientation }) => {
      try {
        const result = generatePdfNotice(schema, decision, formData, {
          includeHeader,
          pageSize,
          orientation,
        });
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
              text: `Error generating PDF notice: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'generate_field_dependencies_graph',
    'Generate a Mermaid dependency graph of field relationships from conditions, ' +
      'visibility rules, cascading options, and cross-field rules.',
    {
      schema: FormSchema.describe('Form schema to analyze for field dependencies'),
    },
    async ({ schema }) => {
      try {
        const result = generateFieldDependenciesGraph(schema);
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
              text: `Error generating dependencies graph: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'generate_mock_data',
    'Generate deterministic mock form data from a schema using a seeded PRNG. ' +
      'Respects field types, options, ranges, and required/optional fill rates.',
    {
      schema: FormSchema.describe('Form schema to generate data for'),
      seed: z.number().optional().describe('PRNG seed for deterministic output (default: 42)'),
      count: z.number().optional().describe('Number of records to generate (default: 1)'),
      locale: z.string().optional().describe('Locale hint for data generation'),
    },
    async ({ schema, seed, count, locale }) => {
      try {
        const result = generateMockData(schema, { seed, count, locale });
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
              text: `Error generating mock data: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'generate_api_handler',
    'Generate a server-side API route handler with Zod validation, typed request bodies, ' +
      'and per-field error responses. Supports Express, Hono, and Fastify.',
    {
      schema: FormSchema.describe('Form schema to derive handler from'),
      framework: z
        .enum(['express', 'hono', 'fastify'])
        .optional()
        .describe('Server framework (default: "express")'),
      includeValidation: z
        .boolean()
        .optional()
        .describe('Include Zod validation schema (default: true)'),
      includeTypes: z
        .boolean()
        .optional()
        .describe('Include TypeScript interface (default: true)'),
    },
    async ({ schema, framework, includeValidation, includeTypes }) => {
      try {
        const result = generateApiHandler(schema, {
          framework,
          includeValidation,
          includeTypes,
        });
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
              text: `Error generating API handler: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'validate_schema',
    'Validate a FormSchema for internal consistency — detects duplicate field names, ' +
      'missing options, dangling condition references, invalid ranges, and more.',
    {
      schema: FormSchema.describe('Form schema to validate'),
    },
    async ({ schema }) => {
      try {
        const result = validateSchema(schema);
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
              text: `Error validating schema: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'generate_e2e_tests',
    'Generate Playwright end-to-end tests from a FormSchema covering validation, ' +
      'submission, wizard flow, conditional fields, repeatable sections, and save/resume.',
    {
      schema: FormSchema.describe('Form schema to generate tests for'),
      baseUrl: z.string().optional().describe('Base URL for the form page (default: http://localhost:3000)'),
      suiteName: z.string().optional().describe('Test suite name (default: schema title)'),
    },
    async ({ schema, baseUrl, suiteName }) => {
      try {
        const result = generateE2eTests(schema, { baseUrl, suiteName });
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
              text: `Error generating e2e tests: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'generate_email_template',
    'Generate an HTML email (confirmation or decision) with inline CSS, ' +
      'table layout, and plain text fallback. Email-client compatible.',
    {
      schema: FormSchema.describe('Form schema to generate email from'),
      type: z.enum(['confirmation', 'decision']).describe('Email type'),
      formData: z.record(z.string(), z.union([z.string(), z.array(z.string())])).optional()
        .describe('Form submission data'),
      decision: z.string().optional().describe('Decision key (required for decision type)'),
      replyTo: z.string().optional().describe('Reply-to email address'),
      subject: z.string().optional().describe('Custom email subject line'),
    },
    async ({ schema, type, formData, decision, replyTo, subject }) => {
      try {
        const result = generateEmailTemplate(schema, {
          type,
          formData,
          decision,
          replyTo,
          subject,
        });
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
              text: `Error generating email template: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // --- Phase 9 Tools ---

  server.tool(
    'generate_cross_field_rules',
    'Parse natural-language descriptions into CrossFieldRule[] for cross-field validation. ' +
      'Supports require/show/hide/setError actions with eq/neq/in/exists operators and compound and/or conditions.',
    {
      schema: FormSchema.describe('Form schema to validate field references against'),
      descriptions: z.array(z.string()).describe(
        'Natural-language rule descriptions, e.g. "require phone when contact-method is phone"',
      ),
    },
    async ({ schema, descriptions }) => {
      try {
        const result = generateCrossFieldRules(schema, descriptions);
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
              text: `Error generating cross-field rules: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'inline_sub_forms',
    'Flatten subForm refs into a single merged schema with no subForms or ref sections. ' +
      'Applies namespace prefixes to field names, conditions, and cross-field rules.',
    {
      schema: FormSchema.describe('Form schema with subForms and ref sections to inline'),
    },
    async ({ schema }) => {
      try {
        const result = inlineSubForms(schema);
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
              text: `Error inlining sub-forms: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'scaffold_from_template',
    'Return a pre-built FormSchema from a template library. ' +
      'Includes 8 government form templates: Contact, Benefits, Change of Address, ' +
      'Document Submission, Feedback, Benefits with Workflow, Petition with Delegation, Building Permit.',
    {
      templateName: z.string().describe('Template name (exact, case-insensitive, or partial match)'),
      title: z.string().optional().describe('Override the form title'),
      action: z.string().optional().describe('Override the form action URL'),
      method: z.string().optional().describe('Override the HTTP method'),
    },
    async ({ templateName, title, action, method }) => {
      try {
        const overrides = title !== undefined || action !== undefined || method !== undefined ? { title, action, method } : undefined;
        const result = scaffoldFromTemplate(templateName, overrides);
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
              text: `Error scaffolding from template: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'generate_react_native_form',
    'Generate a full React Native screen (TSX) from a FormSchema. ' +
      'Maps each field type to the corresponding @civui/react-native component. ' +
      'Supports validation generation, section grouping, and custom screen names.',
    {
      schema: FormSchema.describe('Form schema to generate React Native screen from'),
      screenName: z
        .string()
        .optional()
        .describe('Name for the generated React component (default: FormScreen)'),
      includeValidation: z
        .boolean()
        .optional()
        .describe('Generate useForm validation hook (default: false)'),
    },
    async ({ schema, screenName, includeValidation }) => {
      try {
        const result = generateReactNativeForm(schema, { screenName, includeValidation });
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
              text: `Error generating React Native form: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'generate_content_registry',
    'Generate a FormContent JSON from a FormSchema for use with registerContent() from @civui/content. ' +
      'Produces field labels, hints, placeholders, and optionally error messages. ' +
      'Outputs both the JSON content object and ready-to-use TypeScript code.',
    {
      schema: FormSchema.describe('Form schema to generate content registry from'),
      locale: z
        .string()
        .optional()
        .describe('Locale identifier for i18n-aware content (e.g. "es-US")'),
      includeErrors: z
        .boolean()
        .optional()
        .describe('Include generated error messages for each field (default: false)'),
    },
    async ({ schema, locale, includeErrors }) => {
      try {
        const result = generateContentRegistry(schema, { locale, includeErrors });
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
              text: `Error generating content registry: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'query_tokens',
    'Look up CivUI design token values by category, name pattern, or type. ' +
      'Returns token names, values, CSS custom property names, and Tailwind class equivalents. ' +
      'Covers all 9 token files: color, color-dark, spacing, typography, border, focus, motion, shadow, scales.',
    {
      category: z
        .string()
        .optional()
        .describe('Filter by category: color, color-dark, spacing, typography, border, focus, motion, shadow, scales'),
      search: z
        .string()
        .optional()
        .describe('Case-insensitive substring search on token name (e.g. "primary", "error")'),
      type: z
        .string()
        .optional()
        .describe('Filter by W3C DTCG $type: color, dimension, fontWeight, duration, cubicBezier, shadow, etc.'),
    },
    async ({ category, search, type }) => {
      try {
        const result = queryTokens({ category, search, type });
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
              text: `Error querying tokens: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'generate_508_report',
    'Generate a prioritized Section 508 compliance report from CivUI HTML markup. ' +
      'Maps each violation to a WCAG criterion, assigns severity scores and priority levels (P1–P4), ' +
      'estimates remediation effort, and produces a markdown remediation plan.',
    {
      html: z
        .string()
        .max(MAX_HTML_LENGTH, 'HTML exceeds 10 MB size limit')
        .describe('CivUI HTML markup to audit for Section 508 compliance'),
    },
    async ({ html }) => {
      try {
        const result = generate508Report(html);
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
              text: `Error generating 508 report: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'generate_openapi_spec',
    'Generate an OpenAPI 3.0.3 specification from a FormSchema. ' +
      'Produces request/response schemas with validation constraints, example payloads, ' +
      'and both JSON and YAML output formats.',
    {
      schema: FormSchema.describe('Form schema to generate OpenAPI spec from'),
      basePath: z
        .string()
        .optional()
        .describe('Base path for the API endpoint (default: "/api")'),
      operationId: z
        .string()
        .optional()
        .describe('Custom operation ID (default: derived from schema title)'),
      tags: z
        .array(z.string())
        .optional()
        .describe('OpenAPI tags for the endpoint (default: ["Forms"])'),
      includeExamples: z
        .boolean()
        .optional()
        .describe('Include example payloads in the spec (default: true)'),
    },
    async ({ schema, basePath, operationId, tags, includeExamples }) => {
      try {
        const result = generateOpenApiSpec(schema, { basePath, operationId, tags, includeExamples });
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
              text: `Error generating OpenAPI spec: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'generate_react_form',
    'Generate a React web component (TSX) from a FormSchema using CivUI custom elements in JSX. ' +
      'Supports useState or react-hook-form state management, TypeScript types, ' +
      'and useEffect/addEventListener pattern for custom element events.',
    {
      schema: FormSchema.describe('Form schema to generate React component from'),
      componentName: z
        .string()
        .optional()
        .describe('Name for the generated React component (default: "Form")'),
      stateManagement: z
        .enum(['useState', 'react-hook-form'])
        .optional()
        .describe('State management approach (default: "useState")'),
      includeTypes: z
        .boolean()
        .optional()
        .describe('Generate TypeScript FormData interface (default: true)'),
    },
    async ({ schema, componentName, stateManagement, includeTypes }) => {
      try {
        const result = generateReactForm(schema, { componentName, stateManagement, includeTypes });
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
              text: `Error generating React form: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'sync_content_registry',
    'Compare a FormContent registry against a FormSchema to find missing, stale, and mismatched content entries. ' +
      'Returns a patch object with corrected values and a markdown report.',
    {
      schema: FormSchema.describe('Form schema (source of truth)'),
      content: z
        .object({
          meta: z.object({
            title: z.string(),
            description: z.string().optional(),
            submitLabel: z.string(),
          }),
          fields: z.record(
            z.object({
              label: z.string(),
              hint: z.string().optional(),
              placeholder: z.string().optional(),
              errors: z.record(z.string()).optional(),
            }),
          ),
        })
        .describe('Existing FormContent registry to compare against the schema'),
    },
    async ({ schema, content }) => {
      try {
        const result = syncContentRegistry(schema, content);
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
              text: `Error syncing content registry: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'generate_i18n_files',
    'Generate JSON locale bundles for internationalization from a FormSchema. ' +
      'Extracts all user-facing strings (labels, hints, placeholders, option labels) ' +
      'and produces base locale + target locale placeholder files with a TypeScript helper.',
    {
      schema: FormSchema.describe('Form schema to extract strings from'),
      baseLocale: z
        .string()
        .optional()
        .describe('Base locale identifier (default: "en")'),
      targetLocales: z
        .array(z.string())
        .optional()
        .describe('Target locales for placeholder files (default: ["es"])'),
      includeOptions: z
        .boolean()
        .optional()
        .describe('Include option labels in locale bundles (default: true)'),
      includeErrors: z
        .boolean()
        .optional()
        .describe('Include error messages in locale bundles (default: false)'),
      keyFormat: z
        .enum(['flat', 'nested'])
        .optional()
        .describe('Key format: "flat" (dot notation) or "nested" (default: "flat")'),
    },
    async ({ schema, baseLocale, targetLocales, includeOptions, includeErrors, keyFormat }) => {
      try {
        const result = generateI18nFiles(schema, {
          baseLocale,
          targetLocales,
          includeOptions,
          includeErrors,
          keyFormat,
        });
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
              text: `Error generating i18n files: ${err instanceof Error ? err.message : String(err)}`,
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

  server.prompt(
    BUILD_WORKFLOW_FORM_NAME,
    BUILD_WORKFLOW_FORM_DESCRIPTION,
    {
      description: z
        .string()
        .describe('Plain-English description of the multi-actor workflow form requirements'),
    },
    async ({ description }) => buildWorkflowFormPrompt(description),
  );

  return server;
}
