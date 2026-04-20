/**
 * Government form pipeline tool definitions.
 * These tools use dynamic imports to avoid circular dependencies.
 */

import { z } from 'zod';
import type { ToolDefinition } from './types.js';

/** Wrap a dynamic import with a clear error message distinguishing import failures from logic errors. */
async function loadModule<T>(modulePath: string, exportName: string): Promise<T> {
  try {
    const mod = await import(modulePath);
    if (!(exportName in mod)) {
      throw new Error(`Module "${modulePath}" does not export "${exportName}"`);
    }
    return mod[exportName] as T;
  } catch (err) {
    if (err instanceof Error && err.message.includes('does not export')) throw err;
    throw new Error(`Failed to load module "${modulePath}": ${err instanceof Error ? err.message : String(err)}`);
  }
}

export const GOV_FORMS_TOOLS: ToolDefinition[] = [
  {
    name: 'list_gov_forms',
    description: 'List all available government form templates with form numbers, titles, descriptions, and chapter counts.',
    params: {},
    handler: async () => {
      const listGovForms = await loadModule<() => any>('../tools/list-gov-forms.js', 'listGovForms');
      return listGovForms();
    },
  },
  {
    name: 'generate_gov_form',
    description: 'Generate structured form pages (intro, chapters, review, confirmation) from a government form number.',
    params: {
      formNumber: z.string().describe('Government form number, e.g. "21-526EZ"'),
    },
    handler: async ({ formNumber }) => {
      const generateGovForm = await loadModule<(fn: string) => Promise<any>>('../tools/generate-gov-form.js', 'generateGovForm');
      return generateGovForm(formNumber);
    },
  },
  {
    name: 'validate_gov_form',
    description: 'Validate government form for CivUI consistency. Pass a form number (generates automatically) or raw HTML.',
    params: {
      formNumber: z.string().optional().describe('Form number to generate and validate (e.g. "21-526EZ")'),
      html: z.string().optional().describe('Raw HTML to validate (if formNumber not provided)'),
    },
    handler: async ({ formNumber, html }) => {
      let htmlToValidate = html || '';
      if (formNumber) {
        const generateGovForm = await loadModule<(fn: string) => Promise<any>>('../tools/generate-gov-form.js', 'generateGovForm');
        const form = await generateGovForm(formNumber);
        htmlToValidate = [
          form.pages.intro.html,
          form.taskListHub.html,
          ...form.pages.chapters.map((c: any) => c.html),
          form.pages.review.html,
          form.pages.confirmation.html,
        ].join('\n');
      }
      if (!htmlToValidate) throw new Error('Provide either formNumber or html to validate');
      const validateGovForm = await loadModule<(html: string) => any>('../tools/validate-gov-form.js', 'validateGovForm');
      return validateGovForm(htmlToValidate);
    },
  },
  {
    name: 'assemble_gov_form',
    description: 'Assemble a complete form application (HTML or React) from a form number. One command, one working app.',
    params: {
      formNumber: z.string().describe('Government form number, e.g. "21-526EZ"'),
      format: z.enum(['html', 'react']).optional().describe('Output format (default: html)'),
      cdnBase: z.string().optional().describe('Base URL for CivUI assets'),
      submitAction: z.string().optional().describe('API endpoint for submission'),
      preview: z.boolean().optional().describe('Write to temp file for browser preview'),
    },
    handler: async ({ formNumber, format, cdnBase, submitAction, preview }) => {
      const assembleGovForm = await loadModule<(fn: string, opts?: any) => Promise<any>>('../tools/assemble-gov-form.js', 'assembleGovForm');
      return assembleGovForm(formNumber, { format, cdnBase, submitAction, preview });
    },
  },
  {
    name: 'generate_intro_page',
    description: 'Generate a government form introduction page with process list, preparation checklist, and OMB info.',
    params: {
      formNumber: z.string().describe('Government form number, e.g. "21-526EZ"'),
    },
    handler: async ({ formNumber }) => {
      const getFormDefinition = await loadModule<(fn: string) => any>('../resources/gov-form-registry.js', 'getFormDefinition');
      const generateIntroPage = await loadModule<(form: any) => any>('../tools/generate-intro-page.js', 'generateIntroPage');
      const form = getFormDefinition(formNumber);
      if (!form) {
        const getFormNumbers = await loadModule<() => string[]>('../resources/gov-form-registry.js', 'getFormNumbers');
        throw new Error(`Unknown form: ${formNumber}. Available: ${getFormNumbers().join(', ')}`);
      }
      return generateIntroPage(form);
    },
  },
];
