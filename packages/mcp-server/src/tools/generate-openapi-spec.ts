/**
 * generate_openapi_spec tool — generate an OpenAPI 3.0.3 specification
 * from a FormSchema with request/response schemas, validation constraints,
 * and example payloads.
 */
import type { FormSchema, FormField } from '../schema/index.js';
import { toCamelCase } from './shared-utils.js';

export interface OpenApiSpecResult {
  spec: Record<string, unknown>;
  yaml: string;
  fieldCount: number;
  features: string[];
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
      return 'XXX-XX-XXXX';
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
    case 'segmented-control':
      return field.options && field.options.length > 0 ? field.options[0].value : '';
    case 'url':
      return 'https://example.gov';
    default:
      return 'Example text';
  }
}

/** Simple JSON-to-YAML converter for our limited structure. */
function jsonToYaml(obj: unknown, indent: number = 0): string {
  const pad = '  '.repeat(indent);
  if (obj === null || obj === undefined) return `${pad}null`;
  if (typeof obj === 'boolean') return `${pad}${obj}`;
  if (typeof obj === 'number') return `${pad}${obj}`;
  if (typeof obj === 'string') {
    // Quote strings that might be ambiguous
    if (obj === '' || obj.includes(':') || obj.includes('#') || obj.includes('\n') || obj.startsWith('{') || obj.startsWith('[')) {
      return `${pad}"${obj.replace(/"/g, '\\"')}"`;
    }
    return `${pad}${obj}`;
  }
  if (Array.isArray(obj)) {
    if (obj.length === 0) return `${pad}[]`;
    const lines: string[] = [];
    for (const item of obj) {
      if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
        const entries = Object.entries(item as Record<string, unknown>);
        if (entries.length > 0) {
          lines.push(`${pad}- ${entries[0][0]}: ${jsonToYaml(entries[0][1], 0).trim()}`);
          for (let i = 1; i < entries.length; i++) {
            lines.push(`${pad}  ${entries[i][0]}: ${jsonToYaml(entries[i][1], 0).trim()}`);
          }
        } else {
          lines.push(`${pad}- {}`);
        }
      } else {
        lines.push(`${pad}- ${jsonToYaml(item, 0).trim()}`);
      }
    }
    return lines.join('\n');
  }
  if (typeof obj === 'object') {
    const entries = Object.entries(obj as Record<string, unknown>);
    if (entries.length === 0) return `${pad}{}`;
    const lines: string[] = [];
    for (const [key, val] of entries) {
      if (typeof val === 'object' && val !== null && !Array.isArray(val) && Object.keys(val as object).length > 0) {
        lines.push(`${pad}${key}:`);
        lines.push(jsonToYaml(val, indent + 1));
      } else if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object') {
        lines.push(`${pad}${key}:`);
        lines.push(jsonToYaml(val, indent + 1));
      } else if (Array.isArray(val)) {
        if (val.length === 0) {
          lines.push(`${pad}${key}: []`);
        } else {
          lines.push(`${pad}${key}:`);
          lines.push(jsonToYaml(val, indent + 1));
        }
      } else {
        lines.push(`${pad}${key}: ${jsonToYaml(val, 0).trim()}`);
      }
    }
    return lines.join('\n');
  }
  return `${pad}${String(obj)}`;
}

/** Build properties, required, and examples from fields. */
function buildObjectShape(fields: FormField[]): {
  properties: Record<string, unknown>;
  required: string[];
  example: Record<string, unknown>;
  count: number;
} {
  const properties: Record<string, unknown> = {};
  const required: string[] = [];
  const example: Record<string, unknown> = {};
  let count = 0;

  for (const field of fields) {
    properties[field.name] = fieldToJsonSchema(field);
    example[field.name] = fieldExample(field);
    if (field.required) required.push(field.name);
    count++;
  }

  return { properties, required, example, count };
}

/**
 * Generate an OpenAPI 3.0.3 specification from a FormSchema.
 */
export function generateOpenApiSpec(
  schema: FormSchema,
  options?: {
    basePath?: string;
    operationId?: string;
    tags?: string[];
    includeExamples?: boolean;
  },
): OpenApiSpecResult {
  const basePath = options?.basePath ?? '/api';
  const tags = options?.tags ?? ['Forms'];
  const includeExamples = options?.includeExamples ?? true;
  const title = schema.title ?? 'Form Submission';
  const operationId =
    options?.operationId ??
    toCamelCase(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));

  const features: string[] = [];
  const topProperties: Record<string, unknown> = {};
  const topRequired: string[] = [];
  const topExample: Record<string, unknown> = {};
  let fieldCount = 0;

  for (const section of schema.sections) {
    if (section.repeatable && section.repeatableKey) {
      features.push('repeatable');
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
      continue;
    }

    if (section.namespace) {
      features.push('namespace');
      const shape = buildObjectShape(section.fields);
      fieldCount += shape.count;

      const objSchema: Record<string, unknown> = {
        type: 'object',
        properties: shape.properties,
      };
      if (shape.required.length > 0) objSchema.required = shape.required;

      topProperties[section.namespace] = objSchema;
      topExample[section.namespace] = shape.example;
      continue;
    }

    // Flat fields
    const shape = buildObjectShape(section.fields);
    fieldCount += shape.count;
    Object.assign(topProperties, shape.properties);
    topRequired.push(...shape.required);
    Object.assign(topExample, shape.example);
  }

  // Check for file upload
  const hasFile = schema.sections.some((s) =>
    s.fields.some((f) => f.type === 'file'),
  );
  if (hasFile) features.push('file-upload');
  if (includeExamples) features.push('examples');

  const requestSchema: Record<string, unknown> = {
    type: 'object',
    properties: topProperties,
  };
  if (topRequired.length > 0) requestSchema.required = topRequired;

  const requestContent: Record<string, unknown> = {
    schema: requestSchema,
  };
  if (includeExamples) {
    requestContent.example = topExample;
  }

  const contentType = hasFile ? 'multipart/form-data' : 'application/json';

  const spec: Record<string, unknown> = {
    openapi: '3.0.3',
    info: {
      title,
      description: schema.description ?? `API for ${title}`,
      version: '1.0.0',
    },
    paths: {
      [`${basePath}/submit`]: {
        post: {
          operationId,
          tags,
          summary: `Submit ${title}`,
          requestBody: {
            required: true,
            content: {
              [contentType]: requestContent,
            },
          },
          responses: {
            '200': {
              description: 'Success',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      id: { type: 'string', description: 'Submission ID' },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Validation Error',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      errors: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            field: { type: 'string' },
                            message: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            '422': {
              description: 'Unprocessable Entity',
            },
          },
        },
      },
    },
  };

  const yaml = jsonToYaml(spec);

  return {
    spec,
    yaml,
    fieldCount,
    features: [...new Set(features)],
  };
}
