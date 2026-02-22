/**
 * Shared types matching the web component API.
 * These ensure API parity between web and React Native.
 */

import type { AnalyticsHandler } from './useAnalytics.js';

/** Base props shared by all CivUI form components. */
export interface CivFormProps {
  /** Field name for form data collection. */
  name: string;
  /** Current field value. */
  value?: string;
  /** Label text displayed above the field. */
  label: string;
  /** Hint text displayed below the label. */
  hint?: string;
  /** Error message. When set, field shows error styling. */
  error?: string;
  /** Whether a value is required. */
  required?: boolean;
  /** Whether the field is disabled. */
  disabled?: boolean;
  /** Called when the value changes. */
  onChange?: (value: string) => void;
  /** Analytics event handler. */
  onAnalytics?: AnalyticsHandler;
}

/** Option type for select and combobox components. */
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/** Option type for combobox (alias for API parity). */
export type ComboboxOption = SelectOption;

/** Form field error returned by useForm validation. */
export interface FormFieldError {
  name: string;
  message: string;
}

/** Form field configuration for useForm. */
export interface FormFieldConfig {
  label?: string;
  required?: boolean;
  validate?: (value: string) => string | undefined;
}
