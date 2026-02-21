import { useState, useCallback, useMemo } from 'react';
import type { FormFieldError, FormFieldConfig } from '../core/types.js';
import type { AnalyticsHandler } from '../core/useAnalytics.js';

export interface UseFormOptions {
  /** Initial form values. */
  initialValues?: Record<string, string>;
  /** Field configurations (label, required, custom validate). */
  fields?: Record<string, FormFieldConfig>;
  /** Called on successful validation and submit. */
  onSubmit?: (values: Record<string, string>) => void;
  /** Optional analytics handler. Called on submit/invalid actions. */
  onAnalytics?: AnalyticsHandler;
}

export interface UseFormReturn {
  /** Current form values. */
  values: Record<string, string>;
  /** Current validation errors. */
  errors: Record<string, string>;
  /** List of all field errors (for error summary). */
  errorList: FormFieldError[];
  /** Whether the form has been submitted at least once. */
  submitted: boolean;
  /** Get the value for a specific field. */
  getValue: (name: string) => string;
  /** Get the error for a specific field. */
  getError: (name: string) => string;
  /** Set a field value. Clears field error if previously submitted. */
  setValue: (name: string, value: string) => void;
  /** Set a field error manually. */
  setError: (name: string, message: string) => void;
  /** Validate all fields. Returns true if valid. */
  validate: () => boolean;
  /** Validate and call onSubmit if valid. */
  handleSubmit: () => void;
  /** Reset form to initial values and clear errors. */
  reset: () => void;
  /** Props helper — returns { value, error, onChange } for a field. */
  fieldProps: (name: string) => {
    name: string;
    value: string;
    error: string | undefined;
    onChange: (value: string) => void;
  };
}

/**
 * useForm — React hook for CivDS form state management.
 *
 * Manages values, validation, errors, and submit handling.
 * Mirrors the validation behavior of the civds-form web component.
 *
 * @example
 * ```tsx
 * const form = useForm({
 *   initialValues: { name: '', email: '' },
 *   fields: {
 *     name: { label: 'Name', required: true },
 *     email: { label: 'Email', required: true, validate: (v) =>
 *       v.includes('@') ? undefined : 'Invalid email' },
 *   },
 *   onSubmit: (values) => console.log(values),
 * });
 *
 * <TextInput {...form.fieldProps('name')} label="Name" required />
 * ```
 */
export function useForm(options: UseFormOptions = {}): UseFormReturn {
  const { initialValues = {}, fields = {}, onSubmit, onAnalytics } = options;

  const [values, setValues] = useState<Record<string, string>>({ ...initialValues });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const getValue = useCallback(
    (name: string): string => values[name] ?? '',
    [values],
  );

  const getError = useCallback(
    (name: string): string => errors[name] ?? '',
    [errors],
  );

  const setValue = useCallback(
    (name: string, value: string) => {
      setValues((prev) => ({ ...prev, [name]: value }));
      // Clear error on change if form was previously submitted
      if (submitted) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[name];
          return next;
        });
      }
    },
    [submitted],
  );

  const setError = useCallback((name: string, message: string) => {
    setErrors((prev) => ({ ...prev, [name]: message }));
  }, []);

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    for (const [name, config] of Object.entries(fields)) {
      const value = values[name] ?? '';

      // Required check
      if (config.required && !value.trim()) {
        newErrors[name] = `${config.label || name} is required`;
        continue;
      }

      // Custom validation
      if (config.validate && value) {
        const errorMsg = config.validate(value);
        if (errorMsg) {
          newErrors[name] = errorMsg;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [fields, values]);

  const handleSubmit = useCallback(() => {
    setSubmitted(true);
    if (validate()) {
      onSubmit?.(values);
      onAnalytics?.({
        componentName: 'civds-form',
        action: 'submit',
        timestamp: new Date().toISOString(),
      });
    } else {
      const errorCount = Object.keys(errors).length;
      onAnalytics?.({
        componentName: 'civds-form',
        action: 'invalid',
        timestamp: new Date().toISOString(),
        details: { errorCount },
      });
    }
  }, [validate, onSubmit, onAnalytics, values, errors]);

  const reset = useCallback(() => {
    setValues({ ...initialValues });
    setErrors({});
    setSubmitted(false);
  }, [initialValues]);

  const fieldProps = useCallback(
    (name: string) => ({
      name,
      value: values[name] ?? '',
      error: errors[name] || undefined,
      onChange: (value: string) => setValue(name, value),
    }),
    [values, errors, setValue],
  );

  const errorList = useMemo<FormFieldError[]>(() => {
    return Object.entries(errors).map(([name, message]) => ({ name, message }));
  }, [errors]);

  return {
    values,
    errors,
    errorList,
    submitted,
    getValue,
    getError,
    setValue,
    setError,
    validate,
    handleSubmit,
    reset,
    fieldProps,
  };
}
