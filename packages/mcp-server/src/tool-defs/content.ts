/**
 * Content tool definitions.
 */

import { z } from 'zod';
import { FormSchema } from '../schema/index.js';
import {
  extractStrings,
  lintFormLanguage,
  generateI18nFiles,
  generateContentRegistry,
  syncContentRegistry,
} from '../tools/index.js';
import type { ToolDefinition } from './types.js';
import { MAX_HTML_LENGTH } from './constants.js';

export const CONTENT_TOOLS: ToolDefinition[] = [
  {
    name: 'extract_strings',
    description: 'Extract translatable strings from CivUI HTML markup for i18n. Finds all text attributes (label, legend, hint, error, required-message, placeholder) and option labels. Returns a keyed string map for translation files.',
    params: {
      html: z
        .string()
        .max(MAX_HTML_LENGTH, 'HTML exceeds 10 MB size limit')
        .describe('CivUI HTML markup to extract strings from'),
    },
    handler: ({ html }) => extractStrings(html),
  },
  {
    name: 'lint_form_language',
    description: 'Lint a form schema for plain language issues. Checks for jargon, abbreviations, passive voice, high reading level, non-actionable hints, and terminology inconsistency. Returns issues, score, and suggestions.',
    params: {
      schema: FormSchema.describe('Form schema to lint for language issues'),
    },
    handler: ({ schema }) => lintFormLanguage(schema),
  },
  {
    name: 'generate_i18n_files',
    description: 'Generate JSON locale bundles for internationalization from a FormSchema. Extracts all user-facing strings (labels, hints, placeholders, option labels) and produces base locale + target locale placeholder files with a TypeScript helper.',
    params: {
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
    handler: ({ schema, baseLocale, targetLocales, includeOptions, includeErrors, keyFormat }) =>
      generateI18nFiles(schema, { baseLocale, targetLocales, includeOptions, includeErrors, keyFormat }),
  },
  {
    name: 'generate_content_registry',
    description: 'Generate a FormContent JSON from a FormSchema for use with registerContent() from @civui/content. Produces field labels, hints, placeholders, and optionally error messages. Outputs both the JSON content object and ready-to-use TypeScript code.',
    params: {
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
    handler: ({ schema, locale, includeErrors }) =>
      generateContentRegistry(schema, { locale, includeErrors }),
  },
  {
    name: 'sync_content_registry',
    description: 'Compare a FormContent registry against a FormSchema to find missing, stale, and mismatched content entries. Returns a patch object with corrected values and a markdown report.',
    params: {
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
    handler: ({ schema, content }) => syncContentRegistry(schema, content),
  },
];
