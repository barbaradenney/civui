/**
 * Feature & utility tool definitions.
 */

import { z } from 'zod';
import { FormSchema, FormField } from '../schema/index.js';
import {
  generateSignatureBlock,
  generateEligibilityScreener,
  generateConfirmationPage,
  generateSaveResumeUi,
  generateDocumentChecklist,
  generateAddressBlock,
  generateErrorMessages,
  generateConditionalReveal,
  generateRepeatableSection,
  generateProgressBar,
  generateTimeoutWarning,
  generateHelpPanel,
  generateDataTable,
  generateFormChain,
  generateBilingualForm,
  generatePrintCss,
  generateSummary,
  generateCompanionJs,
} from '../tools/index.js';
import type { ToolDefinition } from './types.js';

export const FEATURES_TOOLS: ToolDefinition[] = [
  {
    name: 'generate_signature_block',
    description:
      'Generate an e-signature block with typed, drawn (canvas), or checkbox modes. ' +
      'Includes legal attestation text, optional witness, print name, title, and date fields.',
    params: {
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
    handler: ({ schema, type, legalText, witnessRequired, dateRequired, printNameRequired, titleRequired }) =>
      generateSignatureBlock(schema, {
        type,
        legalText,
        witnessRequired,
        dateRequired,
        printNameRequired,
        titleRequired,
      }),
  },
  {
    name: 'generate_eligibility_screener',
    description:
      'Generate an eligibility screening questionnaire with disqualification logic. ' +
      'Produces yes-no radios, selects, and number inputs with configurable pass/fail conditions.',
    params: {
      schema: FormSchema.describe('Form schema with eligibility configuration'),
    },
    handler: ({ schema }) => generateEligibilityScreener(schema),
  },
  {
    name: 'generate_confirmation_page',
    description:
      'Generate a post-submission confirmation page with receipt number, submission summary, ' +
      'next steps, and print/copy controls.',
    params: {
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
    handler: ({ schema, submissionData, showNextSteps, nextSteps, agency }) =>
      generateConfirmationPage(schema, submissionData, {
        showNextSteps,
        nextSteps,
        agency,
      }),
  },
  {
    name: 'generate_save_resume_ui',
    description:
      'Generate save-and-resume UI with auto-save, manual save, draft persistence via localStorage, ' +
      'resume detection, and session timeout dialog with countdown.',
    params: {
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
    handler: ({ schema, autoSaveIntervalMs, sessionTimeoutMs, warningBeforeTimeoutMs, storageKey, showLastSaved }) =>
      generateSaveResumeUi(schema, {
        autoSaveIntervalMs,
        sessionTimeoutMs,
        warningBeforeTimeoutMs,
        storageKey,
        showLastSaved,
      }),
  },
  {
    name: 'generate_document_checklist',
    description:
      'Generate an evidence/document upload checklist with per-requirement file inputs, ' +
      'format and size validation, status tracking, and civ-document-status events.',
    params: {
      schema: FormSchema.describe('Form schema with documents configuration'),
    },
    handler: ({ schema }) => generateDocumentChecklist(schema),
  },
  {
    name: 'generate_address_block',
    description:
      'Generate a standalone US address fieldset with autocomplete attributes, ' +
      'ZIP validation, optional territories and military addresses. Returns HTML, JS, and a FormSection.',
    params: {
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
    handler: ({ includeTerritories, includeMilitary, label }) =>
      generateAddressBlock({ includeTerritories, includeMilitary, label }),
  },
  {
    name: 'generate_error_messages',
    description:
      'Generate a complete error message library for every field and constraint in a FormSchema. ' +
      'Produces field-specific messages for required, pattern, length, range, and file constraints. ' +
      'Includes cross-field rule error messages.',
    params: {
      schema: FormSchema.describe('Form schema to generate error messages for'),
    },
    handler: ({ schema }) => generateErrorMessages(schema),
  },
  {
    name: 'generate_conditional_reveal',
    description:
      'Generate a conditional reveal pattern that shows or hides field groups ' +
      'based on a trigger field value, with aria-expanded and aria-controls.',
    params: {
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
    handler: ({ trigger, revealedFields, mode }) =>
      generateConditionalReveal(trigger, revealedFields, { mode }),
  },
  {
    name: 'generate_repeatable_section',
    description:
      'Generate an add-another repeatable section pattern with reindexing, ' +
      'min/max enforcement, and ARIA live announcements.',
    params: {
      schema: FormSchema.describe('Form schema containing the section to repeat'),
      sectionIndex: z
        .number()
        .describe('Index of the section in schema.sections to make repeatable'),
      minRepeats: z.number().optional().describe('Minimum number of items (default: 1)'),
      maxRepeats: z.number().optional().describe('Maximum number of items (default: unlimited)'),
      addLabel: z.string().optional().describe('Label for the add button (default: "Add another")'),
      removeLabel: z.string().optional().describe('Label for remove buttons (default: "Remove")'),
    },
    handler: ({ schema, sectionIndex, minRepeats, maxRepeats, addLabel, removeLabel }) =>
      generateRepeatableSection(schema, sectionIndex, {
        minRepeats,
        maxRepeats,
        addLabel,
        removeLabel,
      }),
  },
  {
    name: 'generate_progress_bar',
    description:
      'Generate a step progress indicator with completed/current/upcoming states, ' +
      'optional clickable navigation, and aria-current step marking.',
    params: {
      steps: z
        .array(z.object({ id: z.string(), label: z.string() }))
        .describe('Ordered array of step definitions'),
      currentStep: z.string().describe('ID of the currently active step'),
      clickable: z
        .boolean()
        .optional()
        .describe('Allow clicking completed steps to navigate back'),
    },
    handler: ({ steps, currentStep, clickable }) =>
      generateProgressBar(steps, currentStep, { clickable }),
  },
  {
    name: 'generate_timeout_warning',
    description:
      'Generate a WCAG 2.2.1-compliant session timeout warning dialog with ' +
      'countdown timer, session extension, and optional redirect.',
    params: {
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
    handler: ({ schema, sessionTimeoutMs, warningBeforeMs, extendable, maxExtensions, redirectUrl }) => {
      if (sessionTimeoutMs && warningBeforeMs) {
        return generateTimeoutWarning({
          sessionTimeoutMs,
          warningBeforeMs,
          extendable,
          maxExtensions,
          redirectUrl,
        });
      } else if (schema) {
        return generateTimeoutWarning(schema);
      }
      throw new Error('Provide either schema with timeoutWarning or standalone sessionTimeoutMs + warningBeforeMs');
    },
  },
  {
    name: 'generate_help_panel',
    description:
      'Generate a contextual help panel in sidebar, inline, or tooltip mode ' +
      'with collapsible sections, keyboard navigation, and ARIA attributes.',
    params: {
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
    handler: ({ sections, mode }) => generateHelpPanel(sections, { mode }),
  },
  {
    name: 'generate_data_table',
    description:
      'Generate an accessible financial/itemized data entry table with add/remove rows, ' +
      'column sorting, totals, and ARIA announcements.',
    params: {
      schema: FormSchema.describe('Form schema with dataTable configuration'),
      initialRows: z
        .number()
        .optional()
        .describe('Number of initial rows (default: minRows or 1)'),
    },
    handler: ({ schema, initialRows }) => generateDataTable(schema, { initialRows }),
  },
  {
    name: 'generate_form_chain',
    description:
      'Generate a multi-form chain UI with step navigation, dependency-based locking, ' +
      'data carry-over between forms, and back/next/submit-all buttons.',
    params: {
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
    handler: ({ schema, currentStep, completedSteps }) =>
      generateFormChain(schema, { currentStep, completedSteps }),
  },
  {
    name: 'generate_bilingual_form',
    description:
      'Generate a bilingual form with language toggle, side-by-side, or inline rendering modes. ' +
      'Supports RTL languages and localStorage-based language preference persistence.',
    params: {
      schema: FormSchema.describe('Form schema with bilingual configuration'),
      translations: z
        .record(z.string(), z.string())
        .describe('Translation map (primary label → secondary label)'),
      mode: z
        .enum(['toggle', 'side-by-side', 'inline'])
        .optional()
        .describe('Rendering mode (default: from schema or "toggle")'),
    },
    handler: ({ schema, translations, mode }) =>
      generateBilingualForm(schema, translations, { mode }),
  },
  {
    name: 'generate_print_css',
    description:
      'Generate a @media print stylesheet for a CivUI form schema. ' +
      'Includes base print styles plus feature-specific rules for form steps, ' +
      'repeatable sections, conditional visibility, and table layouts.',
    params: {
      schema: FormSchema.describe('Form schema to generate print CSS for'),
    },
    handler: ({ schema }) => generatePrintCss(schema),
  },
  {
    name: 'generate_summary',
    description:
      'Generate a read-only HTML summary of form values for review pages. ' +
      'Groups by section with <dl> elements, handles repeatable sections, ' +
      'and adds edit links for multi-step forms.',
    params: {
      schema: FormSchema.describe('Form schema'),
      values: z
        .record(z.string(), z.union([z.string(), z.array(z.string())]))
        .describe('Field values to summarize (name → value)'),
    },
    handler: ({ schema, values }) => generateSummary(schema, values),
  },
  {
    name: 'generate_companion_js',
    description:
      'Generate client-side JavaScript for repeatable sections and conditional visibility. ' +
      'Produces a self-contained IIFE handling add/remove/re-index for repeatable sections, ' +
      'show/hide for conditional fields, and conditional required toggling.',
    params: {
      schema: FormSchema.describe('Form schema to generate JavaScript for'),
    },
    handler: ({ schema }) => generateCompanionJs(schema),
  },
];
