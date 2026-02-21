import { useMemo } from 'react';
import { getContent, getFieldContent } from '../loader/load-content.js';
import { resolveFieldProps, resolveFieldError } from '../loader/resolve-field.js';
import type { FormContent, FieldContent } from '../types/index.js';
import type { ResolvedFieldProps } from '../loader/resolve-field.js';

export interface UseContentReturn {
  /** The full FormContent object. */
  content: FormContent;
  /** Get a single field's raw content. */
  field: (fieldName: string) => FieldContent | undefined;
  /** Get resolved props for a field — spreads cleanly with useForm.fieldProps(). */
  fieldProps: (fieldName: string, overrides?: Partial<ResolvedFieldProps>) => ResolvedFieldProps;
  /** Get an error message for a field + rule combination. */
  fieldError: (fieldName: string, rule: string, fallback?: string) => string | undefined;
}

/**
 * Access registered content by key.
 *
 * ```tsx
 * const { fieldProps, fieldError } = useContent('forms/login');
 *
 * <TextInput
 *   {...fieldProps('email')}
 *   {...form.fieldProps('email')}
 *   error={form.getError('email') ? fieldError('email', 'required') : undefined}
 * />
 * ```
 */
export function useContent(key: string): UseContentReturn {
  const content = getContent(key);

  return useMemo(
    () => ({
      content,
      field: (fieldName: string) => getFieldContent(key, fieldName),
      fieldProps: (fieldName: string, overrides?: Partial<ResolvedFieldProps>) => {
        const field = content.fields[fieldName];
        if (!field) {
          throw new Error(`Field "${fieldName}" not found in content "${key}".`);
        }
        return resolveFieldProps(field, overrides);
      },
      fieldError: (fieldName: string, rule: string, fallback?: string) => {
        const field = content.fields[fieldName];
        if (!field) return fallback;
        return resolveFieldError(field, rule, fallback);
      },
    }),
    [content, key],
  );
}
