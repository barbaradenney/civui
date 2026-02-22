/**
 * Replace `{key}` placeholders in a template string with values.
 *
 * Values are NOT HTML-escaped. Safe for text-only contexts
 * (aria-label, textContent, screen reader announcements).
 * Do not use with innerHTML or unsanitized user input as values.
 */
export function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ''));
}
