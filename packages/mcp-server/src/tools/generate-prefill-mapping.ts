/**
 * generate_prefill_mapping tool — intelligent API-to-form field matching.
 * Matches form fields to API schema fields using multiple strategies.
 */
import type { FormSchema, FormField } from '../schema/index.js';

export interface FieldMapping {
  formField: string;
  apiField: string;
  confidence: number;
  matchType: 'exact' | 'normalized' | 'label' | 'type';
}

export interface PrefillMappingResult {
  mappings: FieldMapping[];
  unmapped: { form: string[]; api: string[] };
  confidence: number;
  code: string;
}

/** Normalize a field name: lowercase, remove hyphens/underscores, strip dots. */
function normalize(name: string): string {
  return name
    .toLowerCase()
    .replace(/[-_.\s]/g, '')
    .replace(/\d+/g, '');
}

/** Convert kebab-case/snake_case to Title Case for label comparison. */
function nameToWords(name: string): string {
  return name
    .replace(/[-_]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .trim();
}

/** Infer type from a JSON example value. */
function inferType(value: unknown): string {
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'string') {
    if (value.includes('@')) return 'email';
    if (/^\d{3}-\d{2}-\d{4}$/.test(value)) return 'ssn';
    if (/^\d{5}(-\d{4})?$/.test(value)) return 'zip';
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) return 'date';
    if (/^\+?\d[\d\s()-]{6,}$/.test(value)) return 'tel';
    return 'string';
  }
  if (Array.isArray(value)) return 'array';
  return 'unknown';
}

interface ApiFieldInfo {
  path: string;
  type?: string;
  description?: string;
  inferredType?: string;
}

/** Parse a JSON Schema into flat field list. */
function parseJsonSchema(schema: Record<string, unknown>, prefix = ''): ApiFieldInfo[] {
  const fields: ApiFieldInfo[] = [];
  const properties = schema.properties as Record<string, Record<string, unknown>> | undefined;
  if (!properties) return fields;

  for (const [key, prop] of Object.entries(properties)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (prop.type === 'object' && prop.properties) {
      fields.push(...parseJsonSchema(prop as Record<string, unknown>, path));
    } else {
      fields.push({
        path,
        type: prop.type as string | undefined,
        description: prop.description as string | undefined,
      });
    }
  }
  return fields;
}

/** Parse an example JSON object into flat field list. */
function parseExampleJson(obj: Record<string, unknown>, prefix = ''): ApiFieldInfo[] {
  const fields: ApiFieldInfo[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      fields.push(...parseExampleJson(value as Record<string, unknown>, path));
    } else {
      fields.push({
        path,
        inferredType: inferType(value),
      });
    }
  }
  return fields;
}

/** Collect all form fields. */
function collectFormFields(schema: FormSchema): FormField[] {
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

/** Check if two types are compatible. */
function typesMatch(formType: string, apiType?: string, inferredType?: string): boolean {
  const t = apiType ?? inferredType;
  if (!t) return false;
  const booleanTypes = new Set(['checkbox', 'toggle']);
  if (booleanTypes.has(formType) && t === 'boolean') return true;
  if (formType === 'number' && t === 'number') return true;
  if (formType === 'email' && t === 'email') return true;
  if (formType === 'ssn' && t === 'ssn') return true;
  if (formType === 'zip' && t === 'zip') return true;
  if (formType === 'tel' && t === 'tel') return true;
  if ((formType === 'date' || formType === 'memorable-date') && t === 'date') return true;
  if (formType === 'checkbox-group' && t === 'array') return true;
  return false;
}

/**
 * Generate intelligent API-to-form field mappings.
 */
export function generatePrefillMapping(
  schema: FormSchema,
  apiSchema: Record<string, unknown>,
  direction: 'api-to-form' | 'form-to-api' = 'api-to-form',
): PrefillMappingResult {
  const formFields = collectFormFields(schema);

  // Parse API schema (detect if it's JSON Schema or example JSON)
  let apiFields: ApiFieldInfo[];
  if (apiSchema.type === 'object' && apiSchema.properties) {
    apiFields = parseJsonSchema(apiSchema);
  } else if (apiSchema.$schema) {
    apiFields = parseJsonSchema(apiSchema);
  } else {
    apiFields = parseExampleJson(apiSchema);
  }

  const mappings: FieldMapping[] = [];
  const mappedFormFields = new Set<string>();
  const mappedApiFields = new Set<string>();

  // Strategy 1: Exact match
  for (const formField of formFields) {
    for (const apiField of apiFields) {
      if (formField.name === apiField.path && !mappedApiFields.has(apiField.path)) {
        mappings.push({
          formField: formField.name,
          apiField: apiField.path,
          confidence: 1.0,
          matchType: 'exact',
        });
        mappedFormFields.add(formField.name);
        mappedApiFields.add(apiField.path);
        break;
      }
    }
  }

  // Strategy 2: Normalized match
  for (const formField of formFields) {
    if (mappedFormFields.has(formField.name)) continue;
    const formNorm = normalize(formField.name);

    for (const apiField of apiFields) {
      if (mappedApiFields.has(apiField.path)) continue;
      const apiNorm = normalize(apiField.path);

      if (formNorm === apiNorm) {
        mappings.push({
          formField: formField.name,
          apiField: apiField.path,
          confidence: 0.9,
          matchType: 'normalized',
        });
        mappedFormFields.add(formField.name);
        mappedApiFields.add(apiField.path);
        break;
      }
    }
  }

  // Strategy 3: Label match
  for (const formField of formFields) {
    if (mappedFormFields.has(formField.name)) continue;
    const formWords = nameToWords(formField.label.toLowerCase());

    for (const apiField of apiFields) {
      if (mappedApiFields.has(apiField.path)) continue;
      const apiWords = apiField.description
        ? apiField.description.toLowerCase()
        : nameToWords(apiField.path);

      if (formWords === apiWords || apiWords.includes(formWords) || formWords.includes(apiWords)) {
        mappings.push({
          formField: formField.name,
          apiField: apiField.path,
          confidence: 0.7,
          matchType: 'label',
        });
        mappedFormFields.add(formField.name);
        mappedApiFields.add(apiField.path);
        break;
      }
    }
  }

  // Strategy 4: Type match (only if names partially overlap)
  for (const formField of formFields) {
    if (mappedFormFields.has(formField.name)) continue;

    for (const apiField of apiFields) {
      if (mappedApiFields.has(apiField.path)) continue;

      if (typesMatch(formField.type, apiField.type, apiField.inferredType)) {
        // Only match by type if names have some overlap
        const formNorm = normalize(formField.name);
        const apiNorm = normalize(apiField.path);
        if (formNorm.includes(apiNorm.slice(0, 3)) || apiNorm.includes(formNorm.slice(0, 3))) {
          mappings.push({
            formField: formField.name,
            apiField: apiField.path,
            confidence: 0.5,
            matchType: 'type',
          });
          mappedFormFields.add(formField.name);
          mappedApiFields.add(apiField.path);
          break;
        }
      }
    }
  }

  // Unmapped
  const unmappedForm = formFields
    .filter((f) => !mappedFormFields.has(f.name))
    .map((f) => f.name);
  const unmappedApi = apiFields
    .filter((f) => !mappedApiFields.has(f.path))
    .map((f) => f.path);

  // Overall confidence
  const totalFormFields = formFields.length;
  let confidence = 0;
  if (totalFormFields > 0) {
    const avgMappingConfidence = mappings.length > 0
      ? mappings.reduce((sum, m) => sum + m.confidence, 0) / mappings.length
      : 0;
    const coverageRatio = mappings.length / totalFormFields;
    confidence = parseFloat((avgMappingConfidence * coverageRatio).toFixed(2));
  }

  // Generate code
  const code = generateCode(mappings, direction);

  return { mappings, unmapped: { form: unmappedForm, api: unmappedApi }, confidence, code };
}

/** Generate JavaScript mapping function. */
function generateCode(mappings: FieldMapping[], direction: 'api-to-form' | 'form-to-api'): string {
  const lines: string[] = [];

  if (direction === 'api-to-form') {
    lines.push('/**');
    lines.push(' * Map API response data to form field values.');
    lines.push(' * @param {Object} apiData - API response object');
    lines.push(' * @returns {Object} Form values keyed by field name');
    lines.push(' */');
    lines.push('function mapApiToForm(apiData) {');
    lines.push('  return {');
    for (const mapping of mappings) {
      const getter = mapping.apiField.includes('.')
        ? `apiData${mapping.apiField.split('.').map((p) => `?.['${p}']`).join('')}`
        : `apiData['${mapping.apiField}']`;
      lines.push(`    '${mapping.formField}': ${getter},`);
    }
    lines.push('  };');
    lines.push('}');
  } else {
    lines.push('/**');
    lines.push(' * Map form values to API request payload.');
    lines.push(' * @param {Object} formValues - Form values keyed by field name');
    lines.push(' * @returns {Object} API request payload');
    lines.push(' */');
    lines.push('function mapFormToApi(formValues) {');
    lines.push('  return {');
    for (const mapping of mappings) {
      lines.push(`    '${mapping.apiField}': formValues['${mapping.formField}'],`);
    }
    lines.push('  };');
    lines.push('}');
  }

  return lines.join('\n');
}
