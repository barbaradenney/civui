/**
 * export_schema tool — export FormSchema as JSON Schema (Draft-07) or TypeScript interface.
 */
import type { FormSchema, FormField } from '../schema/index.js';

export type ExportFormat = 'json-schema' | 'typescript';

export interface ExportResult {
  format: ExportFormat;
  output: string;
}

function fieldToJsonSchemaType(field: FormField): Record<string, unknown> {
  const prop: Record<string, unknown> = {};

  switch (field.type) {
    case 'number':
      prop.type = 'number';
      if (field.min) prop.minimum = parseFloat(field.min);
      if (field.max) prop.maximum = parseFloat(field.max);
      break;
    case 'checkbox':
    case 'toggle':
      prop.type = 'boolean';
      break;
    case 'checkbox-group':
      prop.type = 'array';
      prop.items = { type: 'string' };
      if (field.options) {
        (prop.items as Record<string, unknown>).enum = field.options.map(
          (o) => o.value,
        );
      }
      break;
    case 'file':
      prop.type = 'string';
      prop.description = 'File upload (base64 or file reference)';
      if (field.multiple) {
        prop.type = 'array';
        prop.items = { type: 'string' };
      }
      break;
    default:
      prop.type = 'string';
      if (field.options) {
        prop.enum = field.options.map((o) => o.value);
      }
      if (field.pattern) prop.pattern = field.pattern;
      if (field.minlength) prop.minLength = field.minlength;
      if (field.maxlength) prop.maxLength = field.maxlength;
      break;
  }

  prop.description = field.label;
  return prop;
}

function toCamelCase(str: string): string {
  return str.replace(/[-_](\w)/g, (_, c) => c.toUpperCase());
}

function fieldToTsType(field: FormField): string {
  switch (field.type) {
    case 'number':
      return 'number';
    case 'checkbox':
    case 'toggle':
      return 'boolean';
    case 'checkbox-group':
      if (field.options) {
        return `(${field.options.map((o) => `'${o.value}'`).join(' | ')})[]`;
      }
      return 'string[]';
    case 'file':
      return field.multiple ? 'File[]' : 'File';
    default:
      if (field.options) {
        return field.options.map((o) => `'${o.value}'`).join(' | ');
      }
      return 'string';
  }
}

function exportJsonSchema(schema: FormSchema): string {
  const properties: Record<string, Record<string, unknown>> = {};
  const required: string[] = [];

  for (const section of schema.sections) {
    for (const field of section.fields) {
      properties[field.name] = fieldToJsonSchemaType(field);
      if (field.required) {
        required.push(field.name);
      }
    }
  }

  const jsonSchema: Record<string, unknown> = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties,
  };

  if (schema.title) jsonSchema.title = schema.title;
  if (schema.description) jsonSchema.description = schema.description;
  if (required.length > 0) jsonSchema.required = required;

  return JSON.stringify(jsonSchema, null, 2);
}

function exportTypeScript(schema: FormSchema): string {
  const lines: string[] = [];
  lines.push('export interface FormData {');

  for (const section of schema.sections) {
    if (section.heading) {
      lines.push(`  // ${section.heading}`);
    }
    for (const field of section.fields) {
      const name = toCamelCase(field.name);
      const tsType = fieldToTsType(field);
      const optional = field.required ? '' : '?';
      lines.push(`  ${name}${optional}: ${tsType};`);
    }
  }

  lines.push('}');
  return lines.join('\n');
}

/**
 * Export a FormSchema as JSON Schema or TypeScript interface.
 *
 * @param schema - The FormSchema to export
 * @param format - Output format: 'json-schema' or 'typescript'
 * @returns Formatted output string
 */
export function exportSchema(
  schema: FormSchema,
  format: ExportFormat,
): ExportResult {
  const output =
    format === 'json-schema'
      ? exportJsonSchema(schema)
      : exportTypeScript(schema);

  return { format, output };
}
