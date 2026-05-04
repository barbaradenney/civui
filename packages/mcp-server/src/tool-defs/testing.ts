/**
 * Testing tool definitions.
 */

import { z } from 'zod';
import { FormSchema } from '../schema/index.js';
import {
  generateTests,
  generateStory,
  generate508Report,
  generateE2eTests,
  generateA11yTests,
  generateMockData,
} from '../tools/index.js';
import type { ToolDefinition } from './types.js';
import { MAX_HTML_LENGTH } from './constants.js';

export const TESTING_TOOLS: ToolDefinition[] = [
  {
    name: 'generate_tests',
    description: 'Generate a Vitest test file from CivUI HTML markup. Creates rendering tests, label/legend tests, required field tests, event listener tests, and keyboard navigation tests.',
    params: {
      html: z
        .string()
        .max(MAX_HTML_LENGTH, 'HTML exceeds 10 MB size limit')
        .describe('CivUI HTML markup to generate tests for'),
      suiteName: z
        .string()
        .optional()
        .describe('Name for the test suite (default: "Form")'),
    },
    handler: ({ html, suiteName }) => generateTests(html, suiteName),
  },
  {
    name: 'generate_story',
    description: 'Generate a Storybook CSF3 story file from CivUI HTML or FormSchema. Creates Default, WithErrors, and Filled story variants with argTypes.',
    params: {
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
    handler: ({ html, schema, componentName }) => generateStory({ html, schema }, componentName),
  },
  {
    name: 'generate_508_report',
    description: 'Generate a prioritized Section 508 compliance report from CivUI HTML markup. Maps each violation to a WCAG criterion, assigns severity scores and priority levels (P1-P4), estimates remediation effort, and produces a markdown remediation plan.',
    params: {
      html: z
        .string()
        .max(MAX_HTML_LENGTH, 'HTML exceeds 10 MB size limit')
        .describe('CivUI HTML markup to audit for Section 508 compliance'),
    },
    handler: ({ html }) => generate508Report(html),
  },
  {
    name: 'generate_e2e_tests',
    description: 'Generate Playwright end-to-end tests from a FormSchema covering validation, submission, form-steps flow, conditional fields, repeatable sections, and save/resume.',
    params: {
      schema: FormSchema.describe('Form schema to generate tests for'),
      baseUrl: z.string().optional().describe('Base URL for the form page (default: http://localhost:3000)'),
      suiteName: z.string().optional().describe('Test suite name (default: schema title)'),
    },
    handler: ({ schema, baseUrl, suiteName }) => generateE2eTests(schema, { baseUrl, suiteName }),
  },
  {
    name: 'generate_a11y_tests',
    description: 'Generate accessibility-focused Vitest tests from CivUI HTML markup. Creates tests in 6 categories: aria-attributes, keyboard, focus-management, announcements, semantics, and color-independence.',
    params: {
      html: z
        .string()
        .max(MAX_HTML_LENGTH, 'HTML exceeds 10 MB size limit')
        .describe('CivUI HTML markup to generate accessibility tests for'),
      suiteName: z
        .string()
        .optional()
        .describe('Name for the test suite (default: "Accessibility")'),
    },
    handler: ({ html, suiteName }) => generateA11yTests(html, suiteName),
  },
  {
    name: 'generate_mock_data',
    description: 'Generate deterministic mock form data from a schema using a seeded PRNG. Respects field types, options, ranges, and required/optional fill rates.',
    params: {
      schema: FormSchema.describe('Form schema to generate data for'),
      seed: z.number().optional().describe('PRNG seed for deterministic output (default: 42)'),
      count: z.number().optional().describe('Number of records to generate (default: 1)'),
      locale: z.string().optional().describe('Locale hint for data generation'),
    },
    handler: ({ schema, seed, count, locale }) => generateMockData(schema, { seed, count, locale }),
  },
];
