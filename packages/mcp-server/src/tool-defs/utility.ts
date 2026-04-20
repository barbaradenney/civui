/**
 * Utility tool definitions.
 */

import { z } from 'zod';
import { FormSchema } from '../schema/index.js';
import {
  lookupStyle,
  ELEMENT_TYPES,
  estimateBurden,
  checkContrast,
  queryTokens,
  suggestFix,
  diffForms,
  compareSchemas,
  generateAnalyticsPlan,
  generatePrefillJs,
  generatePrefillMapping,
  generateFieldDependenciesGraph,
  migrateSavedData,
  analyzeRelationships,
  visualizeFormFlow,
} from '../tools/index.js';
import type { ToolDefinition } from './types.js';
import { MAX_HTML_LENGTH } from './constants.js';

export const UTILITY_TOOLS: ToolDefinition[] = [
  {
    name: 'style_civui_element',
    description: 'Look up the correct CSS classes, state selectors, and focus ring for a CivUI element. Returns semantic component classes from components.css, state-triggered classes (error, disabled, checked, etc.), and focus ring guidance.',
    params: {
      element: z
        .enum(ELEMENT_TYPES)
        .describe('The CivUI element type to look up'),
      variant: z
        .string()
        .optional()
        .describe(
          'Optional variant: "tile" (checkbox/radio), "group" (hint/error-text), "horizontal"/"vertical" (group-layout)',
        ),
      state: z
        .array(z.string())
        .optional()
        .describe(
          'Optional state filter: "error", "disabled", "checked", "active", "selected", "dragging". Omit to see all available states.',
        ),
    },
    handler: ({ element, variant, state }) => lookupStyle(element, variant, state),
  },
  {
    name: 'estimate_burden',
    description: 'Estimate PRA burden for a government form schema. Calculates total/required/optional fields, estimated completion time, complexity level (low/medium/high), and reading level assessment.',
    params: {
      schema: FormSchema.describe('Form schema to estimate burden for'),
    },
    handler: ({ schema }) => estimateBurden(schema),
  },
  {
    name: 'check_contrast',
    description: 'Check WCAG 2.1 contrast ratio between two colors. Accepts hex colors (#005ea2) or CivUI token names (primary, text-primary, civ-bg-error-light). Returns ratio, AA/AAA pass status for normal and large text, and overall WCAG level.',
    params: {
      foreground: z
        .string()
        .describe('Foreground color — hex (#005ea2) or token name (primary, text-primary)'),
      background: z
        .string()
        .describe('Background color — hex (#ffffff) or token name (white, bg-base-lightest)'),
    },
    handler: ({ foreground, background }) => checkContrast(foreground, background),
  },
  {
    name: 'query_tokens',
    description: 'Look up CivUI design token values by category, name pattern, or type. Returns token names, values, CSS custom property names, and Tailwind class equivalents. Covers all 9 token files: color, color-dark, spacing, typography, border, focus, motion, shadow, scales.',
    params: {
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
    handler: ({ category, search, type }) => queryTokens({ category, search, type }),
  },
  {
    name: 'suggest_fix',
    description: 'Auto-correct CivUI validation violations. Parses HTML, applies DOM fixes for known rule violations (missing labels, deprecated tags, abbreviations, etc.), then re-validates. Returns { originalHtml, fixedHtml, appliedFixes, remainingViolations }.',
    params: {
      html: z
        .string()
        .max(MAX_HTML_LENGTH, 'HTML exceeds 10 MB size limit')
        .describe('CivUI HTML markup to fix'),
      rules: z
        .array(z.string())
        .optional()
        .describe('Optional rule IDs to limit fixes to (default: fix all)'),
    },
    handler: ({ html, rules }) => suggestFix(html, rules),
  },
  {
    name: 'diff_forms',
    description: 'Compute a structured diff between two CivUI form markups. Matches components by name then position, returns added/removed/changed/unchanged with attribute-level changes and a summary string.',
    params: {
      before: z
        .string()
        .max(MAX_HTML_LENGTH, 'HTML exceeds 10 MB size limit')
        .describe('Original CivUI HTML markup'),
      after: z
        .string()
        .max(MAX_HTML_LENGTH, 'HTML exceeds 10 MB size limit')
        .describe('Modified CivUI HTML markup'),
    },
    handler: ({ before, after }) => diffForms(before, after),
  },
  {
    name: 'compare_schemas',
    description: 'Compare two FormSchema versions and produce a structured diff. Detects added, removed, changed, and moved fields/sections/steps/rules. Identifies breaking changes like removed required fields or type changes.',
    params: {
      before: FormSchema.describe('Previous version of the form schema'),
      after: FormSchema.describe('New version of the form schema'),
    },
    handler: ({ before, after }) => compareSchemas(before, after),
  },
  {
    name: 'generate_analytics_plan',
    description: 'Generate an analytics instrumentation plan for a form schema. Produces per-field events, funnel steps with expected completion rates, drop-off risk analysis, and PRA burden metrics.',
    params: {
      schema: FormSchema.describe('Form schema to generate analytics plan for'),
    },
    handler: ({ schema }) => generateAnalyticsPlan(schema),
  },
  {
    name: 'generate_prefill_js',
    description: 'Generate client-side JavaScript to prefill a CivUI form from saved values. Handles text inputs, radios, checkboxes, selects, and toggles. Includes window.civSerializeForm() for save-resume serialization.',
    params: {
      schema: FormSchema.describe('Form schema'),
      values: z
        .record(z.string(), z.union([z.string(), z.array(z.string())]))
        .describe('Field values to prefill (name → value)'),
    },
    handler: ({ schema, values }) => generatePrefillJs(schema, values),
  },
  {
    name: 'generate_prefill_mapping',
    description: 'Generate intelligent API-to-form field mappings. Matches fields using exact, normalized, label, and type strategies. Accepts JSON Schema or example JSON as API schema. Returns mappings, unmapped fields, confidence score, and mapping code.',
    params: {
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
    handler: ({ schema, apiSchema, direction }) => generatePrefillMapping(schema, apiSchema, direction),
  },
  {
    name: 'generate_field_dependencies_graph',
    description: 'Generate a Mermaid dependency graph of field relationships from conditions, visibility rules, cascading options, and cross-field rules.',
    params: {
      schema: FormSchema.describe('Form schema to analyze for field dependencies'),
    },
    handler: ({ schema }) => generateFieldDependenciesGraph(schema),
  },
  {
    name: 'migrate_saved_data',
    description: 'Migrate saved form values from an old schema to a new schema. Handles direct matches, explicit renames via fieldMappings, repeatable field index preservation, and type mismatch warnings.',
    params: {
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
    handler: ({ oldSchema, newSchema, savedValues, fieldMappings }) =>
      migrateSavedData(oldSchema, newSchema, savedValues, fieldMappings),
  },
  {
    name: 'analyze_relationships',
    description: 'Analyze a FormSchema and produce an entity-relationship summary. Identifies entities from sections, detects one-to-many from repeatable sections, conditional dependencies from visibleWhen/requiredWhen, and cross-field rule relationships. Infers entity types from field name patterns.',
    params: {
      schema: FormSchema.describe('Form schema to analyze'),
    },
    handler: ({ schema }) => analyzeRelationships(schema),
  },
  {
    name: 'visualize_form_flow',
    description: "Generate a Mermaid flowchart visualizing a form's conditional logic, wizard steps, cascading options, and cross-field rules. Returns Mermaid syntax plus node/edge counts and a summary.",
    params: {
      schema: FormSchema.describe('Form schema to visualize'),
    },
    handler: ({ schema }) => visualizeFormFlow(schema),
  },
];
