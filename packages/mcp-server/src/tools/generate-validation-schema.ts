/**
 * generate_validation_schema tool — generate runtime server-side validation code
 * in Zod or JSON Schema format from a FormSchema.
 */
import type { FormSchema, FormField } from '../schema/index.js';

export interface ValidationSchemaResult {
  code: string;
  format: 'zod' | 'json-schema-validation';
  fieldCount: number;
  rulesGenerated: number;
}

/** Escape a regex string for embedding in code. */
function escapeRegex(pattern: string): string {
  return pattern.replace(/\\/g, '\\\\');
}

/** Escape a string for embedding in single-quoted JS strings. */
function escapeSingleQuotes(str: string): string {
  return str.replace(/'/g, "\\'");
}

/** Convert a field to its Zod chain. */
function fieldToZod(field: FormField): string {
  let chain: string;

  switch (field.type) {
    case 'number':
      chain = 'z.coerce.number()';
      if (field.min != null) chain += `.min(${parseFloat(field.min)})`;
      if (field.max != null) chain += `.max(${parseFloat(field.max)})`;
      break;

    case 'checkbox':
    case 'toggle':
      chain = 'z.boolean()';
      break;

    case 'checkbox-group':
      if (field.options) {
        const values = field.options.map((o) => `'${o.value}'`).join(', ');
        chain = `z.array(z.enum([${values}]))`;
      } else {
        chain = 'z.array(z.string())';
      }
      break;

    case 'select':
    case 'radio':
    case 'combobox':
      if (field.options && field.options.length > 0) {
        const values = field.options.map((o) => `'${o.value}'`).join(', ');
        chain = `z.enum([${values}])`;
      } else {
        chain = 'z.string()';
      }
      break;

    case 'date':
    case 'memorable-date':
      chain = `z.string().regex(/^\\d{4}-\\d{2}-\\d{2}$/, 'Invalid date format')`;
      break;

    case 'file':
      chain = `z.any()`;
      if (field.accept) {
        chain += `.refine((v) => v != null, 'File is required')`;
      }
      if (field.maxSize != null) {
        chain += `.refine((v) => !v?.size || v.size <= ${field.maxSize}, 'File too large')`;
      }
      break;

    default:
      chain = 'z.string()';
      if (field.pattern) {
        chain += `.regex(/${escapeRegex(field.pattern)}/)`;
      }
      if (field.minlength != null) chain += `.min(${field.minlength})`;
      if (field.maxlength != null) chain += `.max(${field.maxlength})`;
      break;
  }

  if (field.required) {
    // For strings, add min(1) to prevent empty — skip if minlength already set
    if (chain.startsWith('z.string()') && !chain.includes('.min(')) {
      if (field.minlength == null) {
        chain += '.min(1)';
      }
    }
  } else {
    // Make optional unless it's a boolean
    if (field.type !== 'checkbox' && field.type !== 'toggle') {
      chain += '.optional()';
    }
  }

  return chain;
}

/** Build Zod fields from a list of fields. */
function buildZodFields(fields: FormField[]): { lines: string[]; count: number } {
  const lines: string[] = [];
  let count = 0;
  for (const field of fields) {
    lines.push(`  ${field.name.includes('-') ? `'${field.name}'` : field.name}: ${fieldToZod(field)},`);
    count++;
  }
  return { lines, count };
}

/** Generate Zod validation schema. */
function generateZod(schema: FormSchema): ValidationSchemaResult {
  const lines: string[] = [];
  lines.push("import { z } from 'zod';");
  lines.push('');

  let fieldCount = 0;
  let rulesGenerated = 0;
  const topFields: string[] = [];
  const nestedSchemas: string[] = [];

  for (const section of schema.sections) {
    // Repeatable section
    if (section.repeatable && section.repeatableKey) {
      const { lines: fieldLines, count } = buildZodFields(section.fields);
      fieldCount += count;

      const schemaName = section.repeatableKey + 'ItemSchema';
      nestedSchemas.push(`const ${schemaName} = z.object({`);
      nestedSchemas.push(...fieldLines);
      nestedSchemas.push('});');
      nestedSchemas.push('');

      let arrayChain = `z.array(${schemaName})`;
      if (section.repeatableMin != null) arrayChain += `.min(${section.repeatableMin})`;
      if (section.repeatableMax != null) arrayChain += `.max(${section.repeatableMax})`;

      topFields.push(`  '${section.repeatableKey}': ${arrayChain},`);
      continue;
    }

    // Flat fields
    const { lines: fieldLines, count } = buildZodFields(section.fields);
    fieldCount += count;
    topFields.push(...fieldLines);
  }

  if (nestedSchemas.length > 0) {
    lines.push(...nestedSchemas);
  }

  lines.push('export const formSchema = z.object({');
  lines.push(...topFields);
  lines.push('})');

  // Cross-field rules as superRefine
  if (schema.crossFieldRules && schema.crossFieldRules.length > 0) {
    lines.push('.superRefine((data, ctx) => {');
    for (const rule of schema.crossFieldRules) {
      rulesGenerated++;
      const condField = 'field' in rule.when ? (rule.when as { field: string; operator: string; value?: string }).field : undefined;
      const condOp = 'field' in rule.when ? (rule.when as { operator: string }).operator : undefined;
      const condVal = 'field' in rule.when ? (rule.when as { value?: string }).value : undefined;

      if (condField && condOp) {
        let condition: string;
        switch (condOp) {
          case 'eq':
            condition = `data['${condField}'] === '${condVal}'`;
            break;
          case 'neq':
            condition = `data['${condField}'] !== '${condVal}'`;
            break;
          case 'exists':
            condition = `data['${condField}'] != null && data['${condField}'] !== ''`;
            break;
          case 'notExists':
            condition = `data['${condField}'] == null || data['${condField}'] === ''`;
            break;
          default:
            condition = `true /* ${condOp} */`;
        }

        lines.push(`  // ${rule.description}`);
        lines.push(`  if (${condition}) {`);

        for (const target of rule.then.targets) {
          if (rule.then.action === 'require') {
            lines.push(`    if (!data['${target}']) {`);
            lines.push(`      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['${target}'], message: '${escapeSingleQuotes(rule.then.message ?? rule.description)}' });`);
            lines.push(`    }`);
          } else if (rule.then.action === 'setError') {
            lines.push(`    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['${target}'], message: '${escapeSingleQuotes(rule.then.message ?? rule.description)}' });`);
          }
        }

        lines.push(`  }`);
      }
    }
    lines.push('})');
  }

  lines.push(';');
  lines.push('');

  // Count per-field requiredWhen rules (handled by superRefine above)
  for (const section of schema.sections) {
    for (const field of section.fields) {
      if (field.requiredWhen && 'field' in field.requiredWhen) {
        rulesGenerated++;
      }
    }
  }

  return { code: lines.join('\n'), format: 'zod', fieldCount, rulesGenerated };
}

/** Convert a field to JSON Schema property. */
function fieldToJsonSchemaProp(field: FormField): Record<string, unknown> {
  const prop: Record<string, unknown> = {};

  switch (field.type) {
    case 'number':
      prop.type = 'number';
      if (field.min != null) prop.minimum = parseFloat(field.min);
      if (field.max != null) prop.maximum = parseFloat(field.max);
      break;
    case 'checkbox':
    case 'toggle':
      prop.type = 'boolean';
      break;
    case 'checkbox-group':
      prop.type = 'array';
      prop.items = field.options
        ? { type: 'string', enum: field.options.map((o) => o.value) }
        : { type: 'string' };
      break;
    case 'select':
    case 'radio':
    case 'combobox':
      prop.type = 'string';
      if (field.options) prop.enum = field.options.map((o) => o.value);
      break;
    case 'date':
    case 'memorable-date':
      prop.type = 'string';
      prop.pattern = '^\\d{4}-\\d{2}-\\d{2}$';
      break;
    case 'file':
      prop.type = 'string';
      break;
    default:
      prop.type = 'string';
      if (field.pattern) prop.pattern = field.pattern;
      if (field.minlength) prop.minLength = field.minlength;
      if (field.maxlength) prop.maxLength = field.maxlength;
      break;
  }

  prop.description = field.label;
  return prop;
}

/** Generate JSON Schema validation. */
function generateJsonSchema(schema: FormSchema): ValidationSchemaResult {
  const properties: Record<string, unknown> = {};
  const required: string[] = [];
  let fieldCount = 0;
  let rulesGenerated = 0;

  for (const section of schema.sections) {
    if (section.repeatable && section.repeatableKey) {
      const itemProps: Record<string, unknown> = {};
      const itemRequired: string[] = [];
      for (const field of section.fields) {
        itemProps[field.name] = fieldToJsonSchemaProp(field);
        if (field.required) itemRequired.push(field.name);
        fieldCount++;
      }
      const arraySchema: Record<string, unknown> = {
        type: 'array',
        items: {
          type: 'object',
          properties: itemProps,
          ...(itemRequired.length > 0 ? { required: itemRequired } : {}),
        },
      };
      if (section.repeatableMin != null) arraySchema.minItems = section.repeatableMin;
      if (section.repeatableMax != null) arraySchema.maxItems = section.repeatableMax;
      properties[section.repeatableKey] = arraySchema;
      continue;
    }

    for (const field of section.fields) {
      properties[field.name] = fieldToJsonSchemaProp(field);
      if (field.required) required.push(field.name);
      fieldCount++;
    }
  }

  const jsonSchema: Record<string, unknown> = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties,
  };
  if (schema.title) jsonSchema.title = schema.title;
  if (required.length > 0) jsonSchema.required = required;

  // Cross-field rules as if/then
  if (schema.crossFieldRules && schema.crossFieldRules.length > 0) {
    const allOf: Record<string, unknown>[] = [];
    for (const rule of schema.crossFieldRules) {
      if ('field' in rule.when) {
        const cond = rule.when as { field: string; operator: string; value?: string };
        rulesGenerated++;

        let ifClause: Record<string, unknown>;
        if (cond.operator === 'eq') {
          ifClause = { properties: { [cond.field]: { const: cond.value } } };
        } else if (cond.operator === 'exists') {
          ifClause = { required: [cond.field] };
        } else {
          continue;
        }

        const thenClause: Record<string, unknown> = {};
        if (rule.then.action === 'require') {
          thenClause.required = rule.then.targets;
        }

        allOf.push({ if: ifClause, then: thenClause });
      }
    }
    if (allOf.length > 0) {
      jsonSchema.allOf = allOf;
    }
  }

  return {
    code: JSON.stringify(jsonSchema, null, 2),
    format: 'json-schema-validation',
    fieldCount,
    rulesGenerated,
  };
}

/**
 * Generate runtime validation code (Zod or JSON Schema) from a FormSchema.
 */
export function generateValidationSchema(
  schema: FormSchema,
  format: 'zod' | 'json-schema-validation',
): ValidationSchemaResult {
  return format === 'zod' ? generateZod(schema) : generateJsonSchema(schema);
}
