/**
 * generate_payload_schema tool — generate expected JSON submission shape
 * with nesting for repeatable and namespaced sections.
 */
import type { FormSchema, FormField } from '../schema/index.js';
import { toCamelCase } from './shared-utils.js';

export interface PayloadSchemaResult {
  schema: Record<string, unknown>;
  typescript: string;
  example: Record<string, unknown>;
  fieldCount: number;
}

/** Generate a JSON Schema type for a field. */
function fieldToJsonSchema(field: FormField): Record<string, unknown> {
  switch (field.type) {
    case 'number':
      return { type: 'number', description: field.label };
    case 'checkbox':
    case 'toggle':
      return { type: 'boolean', description: field.label };
    case 'checkbox-group':
      return {
        type: 'array',
        items: field.options
          ? { type: 'string', enum: field.options.map((o) => o.value) }
          : { type: 'string' },
        description: field.label,
      };
    case 'file':
      return field.multiple
        ? { type: 'array', items: { type: 'string' }, description: field.label }
        : { type: 'string', description: field.label };
    default: {
      const prop: Record<string, unknown> = { type: 'string', description: field.label };
      if (field.options) {
        prop.enum = field.options.map((o) => o.value);
      }
      if (field.pattern) prop.pattern = field.pattern;
      if (field.minlength) prop.minLength = field.minlength;
      if (field.maxlength) prop.maxLength = field.maxlength;
      return prop;
    }
  }
}

/** Generate example value for a field. */
function fieldExample(field: FormField): unknown {
  switch (field.type) {
    case 'number':
      return 0;
    case 'checkbox':
    case 'toggle':
      return false;
    case 'checkbox-group':
      return field.options ? [field.options[0].value] : [];
    case 'email':
      return 'user@example.gov';
    case 'ssn':
      return '123-45-6789';
    case 'zip':
      return '20500';
    case 'tel':
      return '202-555-0100';
    case 'date':
    case 'memorable-date':
      return '2024-01-15';
    case 'file':
      return field.multiple ? ['document.pdf'] : 'document.pdf';
    case 'select':
    case 'radio':
    case 'combobox':
      return field.options && field.options.length > 0 ? field.options[0].value : '';
    case 'url':
      return 'https://example.gov';
    default:
      return 'Example text';
  }
}

/** Generate TypeScript type for a field. */
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
      return field.multiple ? 'string[]' : 'string';
    default:
      if (field.options) {
        return field.options.map((o) => `'${o.value}'`).join(' | ');
      }
      return 'string';
  }
}

/** Build properties + required arrays + example from a list of fields. */
function buildObjectShape(fields: FormField[]): {
  properties: Record<string, unknown>;
  required: string[];
  example: Record<string, unknown>;
  tsLines: string[];
  count: number;
} {
  const properties: Record<string, unknown> = {};
  const required: string[] = [];
  const example: Record<string, unknown> = {};
  const tsLines: string[] = [];
  let count = 0;

  for (const field of fields) {
    properties[field.name] = fieldToJsonSchema(field);
    example[field.name] = fieldExample(field);
    const optional = field.required ? '' : '?';
    tsLines.push(`  ${toCamelCase(field.name)}${optional}: ${fieldToTsType(field)};`);
    if (field.required) required.push(field.name);
    count++;
  }

  return { properties, required, example, tsLines, count };
}

/**
 * Generate the expected JSON submission payload shape for a form schema.
 */
export function generatePayloadSchema(schema: FormSchema): PayloadSchemaResult {
  const topProperties: Record<string, unknown> = {};
  const topRequired: string[] = [];
  const topExample: Record<string, unknown> = {};
  const tsInterfaceLines: string[] = [];
  const nestedInterfaces: string[] = [];
  let fieldCount = 0;

  for (const section of schema.sections) {
    // Repeatable section → array of objects
    if (section.repeatable && section.repeatableKey) {
      const shape = buildObjectShape(section.fields);
      fieldCount += shape.count;

      const itemSchema: Record<string, unknown> = {
        type: 'object',
        properties: shape.properties,
      };
      if (shape.required.length > 0) itemSchema.required = shape.required;

      const arraySchema: Record<string, unknown> = {
        type: 'array',
        items: itemSchema,
      };
      if (section.repeatableMin != null) arraySchema.minItems = section.repeatableMin;
      if (section.repeatableMax != null) arraySchema.maxItems = section.repeatableMax;

      topProperties[section.repeatableKey] = arraySchema;
      topExample[section.repeatableKey] = [shape.example];

      // TypeScript
      const interfaceName = toCamelCase(section.repeatableKey).replace(/^./, (c) => c.toUpperCase()) + 'Item';
      nestedInterfaces.push(`export interface ${interfaceName} {`);
      for (const line of shape.tsLines) {
        nestedInterfaces.push(line);
      }
      nestedInterfaces.push('}');
      nestedInterfaces.push('');
      tsInterfaceLines.push(`  ${toCamelCase(section.repeatableKey)}: ${interfaceName}[];`);
      continue;
    }

    // Namespaced section → nested object
    if (section.namespace) {
      const shape = buildObjectShape(section.fields);
      fieldCount += shape.count;

      const objSchema: Record<string, unknown> = {
        type: 'object',
        properties: shape.properties,
      };
      if (shape.required.length > 0) objSchema.required = shape.required;

      topProperties[section.namespace] = objSchema;
      topExample[section.namespace] = shape.example;

      // TypeScript
      const interfaceName = toCamelCase(section.namespace).replace(/^./, (c) => c.toUpperCase());
      nestedInterfaces.push(`export interface ${interfaceName} {`);
      for (const line of shape.tsLines) {
        nestedInterfaces.push(line);
      }
      nestedInterfaces.push('}');
      nestedInterfaces.push('');
      tsInterfaceLines.push(`  ${toCamelCase(section.namespace)}: ${interfaceName};`);
      continue;
    }

    // Flat fields
    const shape = buildObjectShape(section.fields);
    fieldCount += shape.count;
    Object.assign(topProperties, shape.properties);
    topRequired.push(...shape.required);
    Object.assign(topExample, shape.example);
    tsInterfaceLines.push(...shape.tsLines);
  }

  const jsonSchema: Record<string, unknown> = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: topProperties,
  };
  if (schema.title) jsonSchema.title = schema.title;
  if (topRequired.length > 0) jsonSchema.required = topRequired;

  // TypeScript
  const tsLines: string[] = [];
  if (nestedInterfaces.length > 0) {
    tsLines.push(...nestedInterfaces);
  }
  tsLines.push('export interface FormPayload {');
  tsLines.push(...tsInterfaceLines);
  tsLines.push('}');

  return {
    schema: jsonSchema,
    typescript: tsLines.join('\n'),
    example: topExample,
    fieldCount,
  };
}
