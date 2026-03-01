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

export { checkContrast } from './check-contrast.js';
export type { ContrastResult } from './check-contrast.js';

export { estimateBurden } from './estimate-burden.js';
export type { BurdenEstimate } from './estimate-burden.js';

export { generateTests } from './generate-tests.js';
export type { GenerateTestsResult } from './generate-tests.js';

export { generateStory } from './generate-story.js';
export type { GenerateStoryResult } from './generate-story.js';

export { extractStrings } from './extract-strings.js';
export type { ExtractStringsResult } from './extract-strings.js';

export { composeForms } from './compose-forms.js';
export type { ComposeResult } from './compose-forms.js';

export { generateCompanionJs } from './generate-companion-js.js';
export type { CompanionJsResult } from './generate-companion-js.js';

export { validateCrossField } from './validate-cross-field.js';
export type { CrossFieldResult, CrossFieldError, FiredRule } from './validate-cross-field.js';

export { analyzeRelationships } from './analyze-relationships.js';
export type { RelationshipAnalysis, Entity, Relationship } from './analyze-relationships.js';
