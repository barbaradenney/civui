/**
 * Replace `{key}` placeholders in a template string with values.
 * Supports simple pluralization: `{count, plural, one {word} other {words}}`
 *
 * Values are NOT HTML-escaped. Safe for use in Lit `html\`\`` template
 * expressions (Lit escapes values automatically) and text-only contexts
 * (aria-label, textContent, screen reader announcements).
 *
 * Do NOT use with `innerHTML` or `document.write` — values are not
 * sanitized and could introduce XSS if interpolated into raw HTML.
 *
 * @example
 * interpolate('Hello {name}', { name: 'Jane' })
 * // 'Hello Jane'
 *
 * interpolate('{count} {count, plural, one {item} other {items}}', { count: 1 })
 * // '1 item'
 *
 * interpolate('{count} {count, plural, one {item} other {items}}', { count: 5 })
 * // '5 items'
 */
export function interpolate(template: string, values: Record<string, string | number>): string {
  // First pass: resolve plural expressions {key, plural, one {singular} other {plural}}
  let result = template.replace(
    /\{(\w+),\s*plural,\s*one\s*\{([^}]*)\}\s*other\s*\{([^}]*)\}\}/g,
    (_, key, one, other) => {
      const count = Number(values[key] ?? 0);
      return count === 1 ? one : other;
    },
  );

  // Second pass: resolve simple {key} placeholders
  result = result.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ''));

  return result;
}
