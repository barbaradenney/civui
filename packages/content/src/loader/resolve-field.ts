import type { FieldContent } from '../types/index.js';

/** Props returned by resolveFieldProps — zero overlap with useForm's fieldProps. */
export interface ResolvedFieldProps {
  label: string;
  hint?: string;
  placeholder?: string;
  description?: string;
}

/**
 * Merge field content with optional overrides into component-ready props.
 * Overrides take priority over content values.
 */
export function resolveFieldProps(
  content: FieldContent,
  overrides?: Partial<ResolvedFieldProps>,
): ResolvedFieldProps {
  return {
    label: overrides?.label ?? content.label,
    hint: overrides?.hint ?? content.hint,
    placeholder: overrides?.placeholder ?? content.placeholder,
    description: overrides?.description ?? content.description,
  };
}

/**
 * Resolve an error message for a specific validation rule.
 * Returns the fallback if the rule isn't defined in content.
 */
export function resolveFieldError(
  content: FieldContent,
  rule: string,
  fallback?: string,
): string | undefined {
  return content.errors?.[rule] ?? fallback;
}
