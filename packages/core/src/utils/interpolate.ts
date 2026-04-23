/**
 * Replace `{key}` placeholders in a template string with values.
 *
 * Values are NOT HTML-escaped. Safe for use in Lit `html\`\`` template
 * expressions (Lit escapes values automatically) and text-only contexts
 * (aria-label, textContent, screen reader announcements).
 *
 * Do NOT use with `innerHTML` or `document.write` — values are not
 * sanitized and could introduce XSS if interpolated into raw HTML.
 */
export function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ''));
}
