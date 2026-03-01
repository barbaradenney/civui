/**
 * Shared utilities used across multiple MCP server tools.
 */
import type { FormSchema, FormField } from '../schema/index.js';

/** Estimated seconds per field type (PRA burden calculation). */
export const TIME_PER_TYPE: Record<string, number> = {
  text: 30,
  email: 30,
  tel: 30,
  url: 30,
  number: 20,
  password: 20,
  search: 15,
  zip: 15,
  select: 15,
  radio: 15,
  checkbox: 15,
  'checkbox-group': 15,
  combobox: 20,
  textarea: 60,
  ssn: 45,
  date: 45,
  'memorable-date': 45,
  file: 60,
  toggle: 10,
};

/** Flatten all fields from sections, including children. */
export function collectFields(sections: FormSchema['sections']): FormField[] {
  const fields: FormField[] = [];
  for (const section of sections) {
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

/** Convert a kebab-case or snake_case string to camelCase. */
export function toCamelCase(str: string): string {
  return str.replace(/[-_](\w)/g, (_, c) => c.toUpperCase());
}
