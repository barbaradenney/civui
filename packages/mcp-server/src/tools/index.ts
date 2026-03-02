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

export { generateWizard } from './generate-wizard.js';
export type { WizardResult, StepSummary } from './generate-wizard.js';

export { generatePrefillJs } from './generate-prefill-js.js';
export type { PrefillJsResult } from './generate-prefill-js.js';

export { generateSummary } from './generate-summary.js';
export type { SummaryResult } from './generate-summary.js';

export { visualizeFormFlow } from './visualize-form-flow.js';
export type { VisualizeResult } from './visualize-form-flow.js';

export { generatePrintCss } from './generate-print-css.js';
export type { PrintCssResult } from './generate-print-css.js';

export { migrateSavedData } from './migrate-saved-data.js';
export type { MigrateResult } from './migrate-saved-data.js';

export { generateErrorMessages } from './generate-error-messages.js';
export type { ErrorMessageMap } from './generate-error-messages.js';

export { generateAnalyticsPlan } from './generate-analytics-plan.js';
export type {
  AnalyticsPlanResult,
  AnalyticsEvent,
  FunnelStep,
  DropOffRisk,
  PraMetrics,
} from './generate-analytics-plan.js';

export { lintFormLanguage } from './lint-form-language.js';
export type { LintLanguageResult, LanguageIssue } from './lint-form-language.js';

export { generatePayloadSchema } from './generate-payload-schema.js';
export type { PayloadSchemaResult } from './generate-payload-schema.js';

export { compareSchemas } from './compare-schemas.js';
export type { CompareResult, SchemaChange } from './compare-schemas.js';

export { generateValidationSchema } from './generate-validation-schema.js';
export type { ValidationSchemaResult } from './generate-validation-schema.js';

export { generateA11yTests } from './generate-a11y-tests.js';
export type { A11yTestsResult } from './generate-a11y-tests.js';

export { generatePrefillMapping } from './generate-prefill-mapping.js';
export type { PrefillMappingResult, FieldMapping } from './generate-prefill-mapping.js';

export { generateWorkflowUi } from './generate-workflow-ui.js';
export type { WorkflowUiResult } from './generate-workflow-ui.js';

export { generateLockMatrix } from './generate-lock-matrix.js';
export type { LockMatrixResult, LockMatrixEntry, SectionPermission } from './generate-lock-matrix.js';

export { generateDelegationSections } from './generate-delegation-sections.js';
export type { DelegationSectionsResult } from './generate-delegation-sections.js';

export { generateFeedbackUi } from './generate-feedback-ui.js';
export type { FeedbackUiResult, FeedbackComment } from './generate-feedback-ui.js';

export { generateAuditTrail } from './generate-audit-trail.js';
export type { AuditTrailResult, AuditEntry } from './generate-audit-trail.js';

export { generateSectionProgress } from './generate-section-progress.js';
export type { SectionProgressResult, SectionStatus } from './generate-section-progress.js';

export { generateCaseDashboard } from './generate-case-dashboard.js';
export type { CaseDashboardResult } from './generate-case-dashboard.js';
