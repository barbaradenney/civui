/**
 * Validation tool definitions.
 */

import { z } from 'zod';
import { FormSchema } from '../schema/index.js';
import { validateForm } from '../validators/index.js';
import {
  validateForms,
  validateCrossField,
  validateReadingLevel,
  validateSchema,
} from '../tools/index.js';
import type { ToolDefinition } from './types.js';
import { MAX_HTML_LENGTH } from './constants.js';

export const VALIDATION_TOOLS: ToolDefinition[] = [
  {
    name: 'validate_form',
    description: 'Validate CivUI HTML markup against Section 508 rules and best practices. Checks labels, legends, deprecated components, autocomplete, required-messages, and more.',
    params: {
      html: z.string().max(MAX_HTML_LENGTH).describe('CivUI HTML markup to validate'),
      config: z.object({
        promoteWarnings: z.array(z.string()).optional().describe('Rule IDs to promote from warning to error'),
        suppressRules: z.array(z.string()).optional().describe('Rule IDs to skip'),
      }).optional().describe('Optional validation config'),
    },
    handler: ({ html, config }) => validateForm(html, config),
  },
  {
    name: 'validate_forms',
    description: 'Batch validate multiple CivUI form markups. Returns individual results plus overall summary.',
    params: {
      forms: z.array(z.object({
        id: z.string().describe('Form identifier'),
        html: z.string().describe('CivUI HTML markup to validate'),
      })).describe('Array of { id, html } objects'),
      config: z.object({
        promoteWarnings: z.array(z.string()).optional(),
        suppressRules: z.array(z.string()).optional(),
      }).optional().describe('Validation config for all forms'),
    },
    handler: ({ forms, config }) => validateForms(forms, config),
  },
  {
    name: 'validate_schema',
    description: 'Validate a FormSchema for consistency — duplicate names, missing options, dangling references, invalid ranges.',
    params: {
      schema: FormSchema.describe('Form schema to validate'),
    },
    handler: ({ schema }) => validateSchema(schema),
  },
  {
    name: 'validate_cross_field',
    description: 'Evaluate cross-field rules and conditional requirements against field values. Returns fired rules and errors.',
    params: {
      schema: FormSchema.describe('Form schema with cross-field rules'),
      values: z.record(z.string(), z.union([z.string(), z.array(z.string())])).describe('Field values to evaluate (name → value)'),
    },
    handler: ({ schema, values }) => validateCrossField(schema, values),
  },
  {
    name: 'validate_reading_level',
    description: 'Analyze text readability using Flesch-Kincaid scoring. Returns grade level and plain-language suggestions.',
    params: {
      text: z.string().describe('Text to analyze for readability'),
      targetGradeLevel: z.number().optional().describe('Target grade level (default: 8)'),
    },
    handler: ({ text, targetGradeLevel }) => validateReadingLevel(text, { targetGradeLevel }),
  },
];
