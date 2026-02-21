import type { FieldContent } from './field.js';

/** Content for a complete form. */
export interface FormContent {
  $schema?: string;
  meta?: {
    title?: string;
    description?: string;
    submitLabel?: string;
    cancelLabel?: string;
  };
  /** Field content keyed by field name. */
  fields: Record<string, FieldContent>;
}
