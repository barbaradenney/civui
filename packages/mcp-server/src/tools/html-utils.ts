/**
 * Shared HTML utility functions for tool output generation.
 */

import type { FormSchema, FormField } from '../schema/index.js';

/** Escape HTML special characters to prevent XSS in generated markup. */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Convert a string to a URL-safe slug. */
export function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/**
 * Produce a deterministic 8-character uppercase hex hash from a seed string.
 * Uses a simple DJB2-style hash — NOT cryptographic, but stable and testable.
 */
export function deterministicHex(seed: string): string {
  let hash = 5381;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) + hash + seed.charCodeAt(i)) | 0;
  }
  // Convert to unsigned 32-bit then take 8 hex chars
  const unsigned = hash >>> 0;
  return unsigned.toString(16).toUpperCase().padStart(8, '0').slice(0, 8);
}

/** Collect all fields from a schema, including nested children. */
export function collectFields(schema: FormSchema): FormField[] {
  const fields: FormField[] = [];
  for (const section of schema.sections) {
    for (const field of section.fields) {
      fields.push(field);
      if (field.children) {
        fields.push(...field.children);
      }
    }
  }
  return fields;
}
