/** Error messages keyed by validation rule name (e.g. "required", "minLength"). */
export type FieldErrors = Record<string, string>;

/** Content for a single form field. */
export interface FieldContent {
  label: string;
  hint?: string;
  placeholder?: string;
  /** Descriptive text — useful for checkbox/radio options. */
  description?: string;
  /** Error messages keyed by rule name. */
  errors?: FieldErrors;
}
