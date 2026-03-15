/**
 * Naming utilities for cross-platform code generation.
 *
 * Converts between civ-text-input (kebab), CivTextInput (PascalCase),
 * textInput (camelCase), and text_input (snake_case).
 */

/** "civ-text-input" → "text-input" */
export function stripPrefix(name: string): string {
  return name.replace(/^civ-/, '');
}

/** "civ-text-input" → "CivTextInput" */
export function toPascalCase(kebab: string): string {
  return kebab
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
}

/** "civ-text-input" → "textInput" */
export function toCamelCase(kebab: string): string {
  const pascal = toPascalCase(stripPrefix(kebab));
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/** "text" → "Text", "2xs" → "_2xs" */
export function toEnumCase(value: string): string {
  if (/^\d/.test(value)) return `_${value}`;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** "civ-text-input" → "TextInput" (Swift/Kotlin struct name without Civ prefix — we add it in generators) */
export function toComponentName(kebab: string): string {
  return toPascalCase(stripPrefix(kebab));
}
