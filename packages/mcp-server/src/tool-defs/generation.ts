/**
 * Core form generation tool definitions.
 */

import { z } from 'zod';
import { FormSchema } from '../schema/index.js';
import { generateCivUI } from '../generator/index.js';
import {
  exportSchema,
  composeForms,
  generateFormSteps,
  generateValidationSchema,
  generatePayloadSchema,
  generateOpenApiSpec,
  generateCrossFieldRules,
  inlineSubForms,
  scaffoldFromTemplate,
  generateReactForm,
} from '../tools/index.js';
import type { ToolDefinition } from './types.js';

// MAX_HTML_LENGTH not needed here — parsing tools handle size limits

export const GENERATION_TOOLS: ToolDefinition[] = [
  {
    name: 'generate_civui_form',
    description: 'Convert a FormSchema into accessible CivUI web component HTML with labels, hints, errors, and ARIA attributes.',
    params: {
      schema: FormSchema.describe('Form schema to convert'),
      options: z.object({
        wrapInForm: z.boolean().optional().describe('Wrap in <civ-form> (default true)'),
        includeSubmit: z.boolean().optional().describe('Add submit button (default true)'),
      }).optional().describe('Generation options'),
    },
    handler: ({ schema, options }) => generateCivUI(schema, options),
  },
  {
    name: 'generate_react_form',
    description: 'Generate a React TSX component from FormSchema using CivUI web components as custom elements.',
    params: {
      schema: FormSchema.describe('Form schema to convert'),
      componentName: z.string().optional().describe('React component name (default: from schema title)'),
    },
    handler: ({ schema, componentName }) => generateReactForm(schema, componentName),
  },
  {
    name: 'generate_form_steps',
    description: 'Generate multi-step form navigation from a FormSchema with steps, back/next buttons, and progress.',
    params: {
      schema: FormSchema.describe('Form schema with steps defined'),
    },
    handler: ({ schema }) => generateFormSteps(schema),
  },
  {
    name: 'export_schema',
    description: 'Export a FormSchema as JSON Schema, TypeScript interface, or Zod schema.',
    params: {
      schema: FormSchema.describe('Form schema to export'),
      format: z.enum(['json-schema', 'typescript', 'zod']).describe('Output format'),
    },
    handler: ({ schema, format }) => exportSchema(schema, format),
  },
  {
    name: 'generate_validation_schema',
    description: 'Generate validation rules (Zod, Yup, or JSON) from a FormSchema.',
    params: {
      schema: FormSchema.describe('Form schema'),
      format: z.enum(['zod', 'json-schema-validation']).optional().describe('Output format (default: zod)'),
    },
    handler: ({ schema, format }) => generateValidationSchema(schema, format || 'zod'),
  },
  {
    name: 'generate_payload_schema',
    description: 'Generate API payload TypeScript interface and validation from a FormSchema.',
    params: {
      schema: FormSchema.describe('Form schema'),
    },
    handler: ({ schema }) => generatePayloadSchema(schema),
  },
  {
    name: 'generate_openapi_spec',
    description: 'Generate OpenAPI 3.0 specification from a FormSchema.',
    params: {
      schema: FormSchema.describe('Form schema'),
    },
    handler: ({ schema }) => generateOpenApiSpec(schema),
  },
  {
    name: 'generate_cross_field_rules',
    description: 'Generate cross-field validation rules from plain-English descriptions. Example descriptions: "Phone is required if contact method is call", "End date must be after start date", "Confirm email must match email".',
    params: {
      schema: FormSchema.describe('Form schema'),
      descriptions: z.array(z.string()).describe('Plain-English rule descriptions'),
    },
    handler: ({ schema, descriptions }) => generateCrossFieldRules(schema, descriptions),
  },
  {
    name: 'compose_forms',
    description: 'Merge multiple FormSchemas into one unified schema with sub-form namespaces.',
    params: {
      schema: FormSchema.describe('Primary schema'),
      subForms: z.record(z.string(), z.object({
        schema: FormSchema,
        namespace: z.string(),
      })).optional().describe('Sub-form schemas with namespaces'),
    },
    handler: ({ schema, subForms }) => composeForms(schema, subForms),
  },
  {
    name: 'inline_sub_forms',
    description: 'Resolve and embed sub-form references into a parent FormSchema.',
    params: {
      schema: FormSchema.describe('Parent schema with subForm references'),
    },
    handler: ({ schema }) => inlineSubForms(schema),
  },
  {
    name: 'scaffold_from_template',
    description: 'Generate a FormSchema from a pre-built template (Contact Form, Benefits Application, etc.).',
    params: {
      templateName: z.string().describe('Template name to scaffold from'),
      title: z.string().optional().describe('Override form title'),
      action: z.string().optional().describe('Override form action URL'),
      method: z.enum(['GET', 'POST']).optional().describe('Override HTTP method'),
    },
    handler: ({ templateName, title, action, method }) => {
      const overrides = title !== undefined || action !== undefined || method !== undefined
        ? { title, action, method }
        : undefined;
      return scaffoldFromTemplate(templateName, overrides);
    },
  },
];
