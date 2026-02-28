export { lookupStyle, ELEMENT_TYPES } from './style-lookup.js';
export type { ElementType, StyleResult } from './style-lookup.js';

export { suggestFix } from './suggest-fix.js';
export type { SuggestFixResult } from './suggest-fix.js';

export { diffForms } from './diff-forms.js';
export type { FormDiff, DiffEntry, DiffChange, AttrChange } from './diff-forms.js';

export { formToSchema } from './form-to-schema.js';

export { exportSchema } from './export-schema.js';
export type { ExportFormat, ExportResult } from './export-schema.js';

export { validateForms } from './validate-forms.js';
export type { BatchFormInput, BatchValidationResult, BatchValidationOutput } from './validate-forms.js';
