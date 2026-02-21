import { useMemo } from 'react';
import { getContent } from '../loader/load-content.js';
import { resolveFieldProps, resolveFieldError } from '../loader/resolve-field.js';
import type { ResolvedFieldProps } from '../loader/resolve-field.js';

export interface UseFieldContentReturn extends ResolvedFieldProps {
  /** Get an error message by rule name. */
  error: (rule: string, fallback?: string) => string | undefined;
}

/**
 * Convenience hook for a single field.
 *
 * ```tsx
 * const email = useFieldContent('forms/login', 'email');
 * // email.label, email.hint, email.placeholder, email.error('required')
 * ```
 */
export function useFieldContent(key: string, fieldName: string): UseFieldContentReturn {
  const content = getContent(key);
  const field = content.fields[fieldName];

  return useMemo(() => {
    if (!field) {
      throw new Error(`Field "${fieldName}" not found in content "${key}".`);
    }
    const props = resolveFieldProps(field);
    return {
      ...props,
      error: (rule: string, fallback?: string) => resolveFieldError(field, rule, fallback),
    };
  }, [field, fieldName, key]);
}
