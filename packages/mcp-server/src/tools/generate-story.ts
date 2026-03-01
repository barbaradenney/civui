/**
 * generate_story tool — generate a Storybook CSF3 story file from a CivUI form.
 * Accepts HTML or FormSchema input and generates a complete story with variants.
 */
import type { FormSchema, FormField } from '../schema/index.js';
import { formToSchema } from './form-to-schema.js';

export interface GenerateStoryResult {
  filename: string;
  code: string;
}

interface StoryInput {
  html?: string;
  schema?: FormSchema;
}

/**
 * Generate a Storybook CSF3 story file from HTML or FormSchema.
 */
export function generateStory(input: StoryInput, componentName?: string): GenerateStoryResult {
  let schema: FormSchema;

  if (input.schema) {
    schema = input.schema;
  } else if (input.html) {
    schema = formToSchema(input.html);
  } else {
    throw new Error('Either html or schema must be provided');
  }

  const name = componentName ?? schema.title ?? 'Form';
  const pascalName = toPascalCase(name);
  const filename = `${pascalName}.stories.ts`;

  const allFields = flattenFields(schema);
  const argTypes = buildArgTypes(allFields);
  const defaultArgs = buildDefaultArgs(allFields);
  const errorArgs = buildErrorArgs(allFields);
  const filledArgs = buildFilledArgs(allFields);

  const htmlTemplate = input.html
    ? escapeTemplateLiteral(input.html.trim())
    : generateTemplateFromSchema(schema);

  const lines: string[] = [];

  // Imports
  lines.push(`import { html } from 'lit';`);
  lines.push(`import { action } from '@storybook/addon-actions';`);
  lines.push('');

  // Meta
  lines.push(`const meta = {`);
  lines.push(`  title: 'Forms/${name}',`);
  lines.push(`  tags: ['autodocs'],`);
  lines.push(`  argTypes: {`);
  for (const [key, argType] of Object.entries(argTypes)) {
    lines.push(`    ${key}: ${JSON.stringify(argType)},`);
  }
  lines.push(`  },`);
  lines.push(`};`);
  lines.push('');
  lines.push(`export default meta;`);
  lines.push('');

  // Default story
  lines.push(`export const Default = {`);
  lines.push(`  args: ${JSON.stringify(defaultArgs, null, 4)},`);
  lines.push(`  render: (args) => html\`${htmlTemplate}\`,`);
  lines.push(`};`);
  lines.push('');

  // WithErrors story
  lines.push(`export const WithErrors = {`);
  lines.push(`  args: ${JSON.stringify(errorArgs, null, 4)},`);
  lines.push(`  render: (args) => html\`${htmlTemplate}\`,`);
  lines.push(`};`);
  lines.push('');

  // Filled story
  lines.push(`export const Filled = {`);
  lines.push(`  args: ${JSON.stringify(filledArgs, null, 4)},`);
  lines.push(`  render: (args) => html\`${htmlTemplate}\`,`);
  lines.push(`};`);
  lines.push('');

  return {
    filename,
    code: lines.join('\n'),
  };
}

function flattenFields(schema: FormSchema): FormField[] {
  const fields: FormField[] = [];
  for (const section of schema.sections) {
    for (const field of section.fields) {
      fields.push(field);
      if (field.children) {
        for (const child of field.children) {
          fields.push(child);
        }
      }
    }
  }
  return fields;
}

function buildArgTypes(
  fields: FormField[],
): Record<string, { control: string; description?: string }> {
  const argTypes: Record<string, { control: string; description?: string }> = {};
  for (const field of fields) {
    const key = toCamelCase(field.name);
    if (field.options && field.options.length > 0) {
      argTypes[key] = {
        control: 'select',
        description: field.label,
      };
    } else if (field.type === 'checkbox' || field.type === 'toggle') {
      argTypes[key] = {
        control: 'boolean',
        description: field.label,
      };
    } else if (field.type === 'textarea') {
      argTypes[key] = {
        control: 'text',
        description: field.label,
      };
    } else {
      argTypes[key] = {
        control: 'text',
        description: field.label,
      };
    }
  }
  return argTypes;
}

function buildDefaultArgs(fields: FormField[]): Record<string, string | boolean> {
  const args: Record<string, string | boolean> = {};
  for (const field of fields) {
    const key = toCamelCase(field.name);
    if (field.type === 'checkbox' || field.type === 'toggle') {
      args[key] = false;
    } else {
      args[key] = field.value ?? '';
    }
  }
  return args;
}

function buildErrorArgs(fields: FormField[]): Record<string, string | boolean> {
  const args: Record<string, string | boolean> = {};
  for (const field of fields) {
    const key = toCamelCase(field.name);
    if (field.type === 'checkbox' || field.type === 'toggle') {
      args[key] = false;
    } else {
      args[key] = '';
    }
    if (field.required) {
      args[`${key}Error`] =
        field.hint
          ? `Enter ${field.label.toLowerCase()}`
          : `${field.label} is required`;
    }
  }
  return args;
}

function buildFilledArgs(fields: FormField[]): Record<string, string | boolean> {
  const args: Record<string, string | boolean> = {};
  for (const field of fields) {
    const key = toCamelCase(field.name);
    args[key] = getSampleValue(field);
  }
  return args;
}

function getSampleValue(field: FormField): string | boolean {
  switch (field.type) {
    case 'email':
      return 'user@example.gov';
    case 'tel':
      return '202-555-0100';
    case 'text':
      return field.name.includes('name') ? 'Jane Doe' : 'Sample text';
    case 'ssn':
      return '123 45 6789';
    case 'zip':
      return '20500';
    case 'url':
      return 'https://example.gov';
    case 'number':
      return '42';
    case 'textarea':
      return 'Sample text content for testing purposes.';
    case 'date':
    case 'memorable-date':
      return '01/15/1990';
    case 'checkbox':
    case 'toggle':
      return true;
    case 'select':
    case 'radio':
    case 'combobox':
      return field.options?.[0]?.value ?? '';
    case 'checkbox-group':
      return field.options?.[0]?.value ?? '';
    default:
      return 'Sample value';
  }
}

function generateTemplateFromSchema(schema: FormSchema): string {
  const parts: string[] = [];
  parts.push('<civ-form>');
  for (const section of schema.sections) {
    if (section.heading) {
      parts.push(`  <civ-fieldset legend="${section.heading}">`);
    }
    for (const field of section.fields) {
      parts.push(`    <!-- ${field.label} -->`);
    }
    if (section.heading) {
      parts.push('  </civ-fieldset>');
    }
  }
  parts.push('</civ-form>');
  return escapeTemplateLiteral(parts.join('\n'));
}

function toPascalCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (_, c) => c.toUpperCase());
}

function toCamelCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''));
}

function escapeTemplateLiteral(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
}
