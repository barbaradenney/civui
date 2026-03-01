/**
 * migrate_saved_data tool — maps saved form values from an old schema to a new schema.
 * Handles direct matches, explicit renames, repeatable fields, and type mismatches.
 */
import type { FormSchema, FormField } from '../schema/index.js';

export interface MigrateResult {
  values: Record<string, string | string[]>;
  mappedCount: number;
  droppedFields: string[];
  unmappedFields: string[];
  warnings: string[];
}

/** Collect all field names and their types from a schema (including repeatable prefixed names). */
function collectFields(schema: FormSchema): Map<string, string> {
  const fields = new Map<string, string>();

  for (const section of schema.sections) {
    for (const field of section.fields) {
      fields.set(field.name, field.type);
      collectChildFields(field, fields);
    }
  }

  return fields;
}

function collectChildFields(field: FormField, fields: Map<string, string>): void {
  if (field.children) {
    for (const child of field.children) {
      fields.set(child.name, child.type);
      collectChildFields(child, fields);
    }
  }
}

/** Parse repeatable field pattern: key[N].field → { key, index, field } */
function parseRepeatableName(name: string): { key: string; index: number; field: string } | null {
  const match = name.match(/^([a-zA-Z_-]+)\[(\d+)\]\.(.+)$/);
  if (!match) return null;
  return { key: match[1], index: parseInt(match[2], 10), field: match[3] };
}

export function migrateSavedData(
  oldSchema: FormSchema,
  newSchema: FormSchema,
  savedValues: Record<string, string | string[]>,
  fieldMappings?: Record<string, string>,
): MigrateResult {
  const newFields = collectFields(newSchema);
  const oldFields = collectFields(oldSchema);
  const mappings = fieldMappings ?? {};

  const values: Record<string, string | string[]> = {};
  const warnings: string[] = [];
  const droppedFields: string[] = [];
  let mappedCount = 0;

  // Build a reverse map for repeatable keys
  const newRepeatableKeys = new Set<string>();
  for (const section of newSchema.sections) {
    if (section.repeatable && section.repeatableKey) {
      newRepeatableKeys.add(section.repeatableKey);
    }
  }

  for (const [savedName, savedValue] of Object.entries(savedValues)) {
    // Check if this is a repeatable field
    const parsed = parseRepeatableName(savedName);

    if (parsed) {
      // Repeatable field: check both key and field name mappings
      const newKey = mappings[parsed.key] ?? parsed.key;
      const newField = mappings[parsed.field] ?? parsed.field;
      const newName = `${newKey}[${parsed.index}].${newField}`;

      // Verify the key exists as repeatable in the new schema
      if (!newRepeatableKeys.has(newKey)) {
        droppedFields.push(savedName);
        continue;
      }

      // Check field exists in the new schema's repeatable section
      const newSection = newSchema.sections.find(
        (s) => s.repeatable && s.repeatableKey === newKey,
      );
      const fieldExists = newSection?.fields.some((f) => f.name === newField);
      if (!fieldExists) {
        droppedFields.push(savedName);
        continue;
      }

      // Type check
      const oldBaseField = oldFields.get(parsed.field);
      const newBaseField = newSection?.fields.find((f) => f.name === newField);
      if (oldBaseField && newBaseField && oldBaseField !== newBaseField.type) {
        warnings.push(
          `Type mismatch for "${savedName}": was "${oldBaseField}", now "${newBaseField.type}"`,
        );
      }

      values[newName] = savedValue;
      mappedCount++;
      continue;
    }

    // Non-repeatable field
    // Check explicit mapping first
    const mappedName = mappings[savedName] ?? savedName;

    if (newFields.has(mappedName)) {
      // Type mismatch check
      const oldType = oldFields.get(savedName);
      const newType = newFields.get(mappedName);
      if (oldType && newType && oldType !== newType) {
        warnings.push(
          `Type mismatch for "${savedName}" → "${mappedName}": was "${oldType}", now "${newType}"`,
        );
      }

      values[mappedName] = savedValue;
      mappedCount++;
    } else {
      droppedFields.push(savedName);
    }
  }

  // Find unmapped fields: fields in new schema with no value
  const unmappedFields: string[] = [];
  for (const [fieldName] of newFields) {
    // Check if we have a value for this field (directly or via repeatable)
    if (!values[fieldName]) {
      // Also check if any repeatable value starts with a matching pattern
      const hasRepeatableValue = Object.keys(values).some((key) => {
        const p = parseRepeatableName(key);
        return p && p.field === fieldName;
      });
      if (!hasRepeatableValue) {
        unmappedFields.push(fieldName);
      }
    }
  }

  return {
    values,
    mappedCount,
    droppedFields,
    unmappedFields,
    warnings,
  };
}
