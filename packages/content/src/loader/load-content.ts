import type { FieldContent, FormContent } from '../types/index.js';

const registry = new Map<string, FormContent>();

/** Register a content file under a key (e.g. 'forms/login'). */
export function registerContent(key: string, content: FormContent): void {
  registry.set(key, content);
}

/** Get registered content. Throws if the key is missing. */
export function getContent(key: string): FormContent {
  const content = registry.get(key);
  if (!content) {
    throw new Error(`Content not registered for key "${key}". Call registerContent() first.`);
  }
  return content;
}

/** Get a single field's content. Returns undefined if the field is missing. */
export function getFieldContent(key: string, fieldName: string): FieldContent | undefined {
  const content = getContent(key);
  return content.fields[fieldName];
}

/** Clear the registry — for testing. */
export function clearRegistry(): void {
  registry.clear();
}
