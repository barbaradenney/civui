/**
 * validate_forms batch tool — validate multiple CivUI form markups at once.
 */
import {
  validateForm,
  type ValidationResult,
  type ValidationConfig,
} from '../validators/validate-form.js';

export interface BatchFormInput {
  id: string;
  html: string;
}

export interface BatchValidationResult extends ValidationResult {
  id: string;
}

export interface BatchValidationOutput {
  results: BatchValidationResult[];
  summary: string;
}

/**
 * Validate multiple CivUI HTML forms in batch.
 *
 * @param forms - Array of { id, html } objects to validate
 * @param config - Optional validation config applied to all forms
 * @returns Results for each form plus an overall summary
 */
export function validateForms(
  forms: BatchFormInput[],
  config?: ValidationConfig,
): BatchValidationOutput {
  const results: BatchValidationResult[] = forms.map((form) => ({
    id: form.id,
    ...validateForm(form.html, config),
  }));

  const validCount = results.filter((r) => r.valid).length;
  const summary = `${validCount}/${results.length} form${results.length === 1 ? '' : 's'} valid`;

  return { results, summary };
}
