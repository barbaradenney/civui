/**
 * Shared types matching the web component API.
 * These ensure API parity between web and React Native.
 */

/** Base props shared by all CivDS form components. */
export interface CivdsFormProps {
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
