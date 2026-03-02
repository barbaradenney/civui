import { z } from 'zod';

export const FieldType = z.enum([
  'text',
  'email',
  'tel',
  'number',
  'password',
  'search',
  'url',
  'ssn',
  'zip',
  'textarea',
  'select',
  'combobox',
  'radio',
  'checkbox',
  'checkbox-group',
  'date',
  'memorable-date',
  'file',
  'toggle',
]);

export type FieldType = z.infer<typeof FieldType>;

export const FieldOption = z.object({
  value: z.string(),
  label: z.string(),
  disabled: z.boolean().optional(),
});

export type FieldOption = z.infer<typeof FieldOption>;

export const SimpleCondition = z.object({
  field: z.string(),
  operator: z.enum(['eq', 'neq', 'in', 'notIn', 'exists', 'notExists']),
  value: z.union([z.string(), z.array(z.string())]).optional(),
});

export type SimpleCondition = z.infer<typeof SimpleCondition>;

export interface CompoundCondition {
  allOf?: ConditionExpression[];
  anyOf?: ConditionExpression[];
}

export type ConditionExpression = SimpleCondition | CompoundCondition;

export const CompoundCondition: z.ZodType<CompoundCondition> = z.object({
  allOf: z.lazy(() => z.array(ConditionExpression)).optional(),
  anyOf: z.lazy(() => z.array(ConditionExpression)).optional(),
});

export const ConditionExpression: z.ZodType<ConditionExpression> = z.union([
  SimpleCondition,
  CompoundCondition,
]);

/** Type guard: returns true if the condition is a simple field condition. */
export function isSimpleCondition(cond: ConditionExpression): cond is SimpleCondition {
  return 'field' in cond;
}

export const StepDefinition = z.object({
  title: z.string(),
  description: z.string().optional(),
});

export type StepDefinition = z.infer<typeof StepDefinition>;

export interface FormField {
  type: FieldType;
  name: string;
  label: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  value?: string;
  options?: FieldOption[];
  maxlength?: number;
  minlength?: number;
  pattern?: string;
  min?: string;
  max?: string;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number;
  autocomplete?: string;
  inputmode?: string;
  rows?: number;
  children?: FormField[];
  visibleWhen?: ConditionExpression;
  requiredWhen?: ConditionExpression;
  entityType?: string;
  optionsFrom?: {
    field: string;
    map: Record<string, FieldOption[]>;
  };
}

export const FormField: z.ZodType<FormField> = z.object({
  type: FieldType,
  name: z.string(),
  label: z.string(),
  hint: z.string().optional(),
  required: z.boolean().optional(),
  disabled: z.boolean().optional(),
  placeholder: z.string().optional(),
  value: z.string().optional(),
  options: z.array(FieldOption).optional(),
  maxlength: z.number().optional(),
  minlength: z.number().optional(),
  pattern: z.string().optional(),
  min: z.string().optional(),
  max: z.string().optional(),
  accept: z.string().optional(),
  multiple: z.boolean().optional(),
  maxFiles: z.number().optional(),
  maxSize: z.number().optional(),
  autocomplete: z.string().optional(),
  inputmode: z.string().optional(),
  rows: z.number().optional(),
  children: z.lazy(() => z.array(FormField)).optional(),
  visibleWhen: ConditionExpression.optional(),
  requiredWhen: ConditionExpression.optional(),
  entityType: z.string().optional(),
  optionsFrom: z.object({
    field: z.string(),
    map: z.record(z.string(), z.array(FieldOption)),
  }).optional(),
});

export const FormSection = z.object({
  heading: z.string().optional(),
  fields: z.array(FormField),
  repeatable: z.boolean().optional(),
  repeatableKey: z.string().optional(),
  repeatableMin: z.number().optional(),
  repeatableMax: z.number().optional(),
  repeatableAddLabel: z.string().optional(),
  repeatableRemoveLabel: z.string().optional(),
  ref: z.string().optional(),
  namespace: z.string().optional(),
  step: z.number().optional(),
  visibleWhen: ConditionExpression.optional(),
  layout: z.enum(['default', 'table']).optional(),
  tableColumns: z.array(z.string()).optional(),
  editableBy: z.array(z.string()).optional(),
  visibleTo: z.array(z.string()).optional(),
  phase: z.string().optional(),
});

export type FormSection = z.infer<typeof FormSection>;

export const SubFormDefinition = z.object({
  description: z.string().optional(),
  fields: z.array(FormField),
});

export type SubFormDefinition = z.infer<typeof SubFormDefinition>;

export const CrossFieldRule = z.object({
  id: z.string(),
  description: z.string(),
  when: ConditionExpression,
  then: z.object({
    action: z.enum(['require', 'show', 'hide', 'setError']),
    targets: z.array(z.string()),
    message: z.string().optional(),
  }),
});

export type CrossFieldRule = z.infer<typeof CrossFieldRule>;

// --- Actor Definition ---
export const ActorDefinition = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string().optional(),
});

export type ActorDefinition = z.infer<typeof ActorDefinition>;

// --- Workflow State Machine ---
export const WorkflowState = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string().optional(),
  editableBy: z.array(z.string()).optional(),
  visibleTo: z.array(z.string()).optional(),
  allowsFeedback: z.boolean().optional(),
  terminal: z.boolean().optional(),
});

export type WorkflowState = z.infer<typeof WorkflowState>;

export const WorkflowTransition = z.object({
  from: z.string(),
  to: z.string(),
  actor: z.string(),
  label: z.string(),
  requiresComment: z.boolean().optional(),
  requiresAllSectionsComplete: z.boolean().optional(),
  confirmationMessage: z.string().optional(),
});

export type WorkflowTransition = z.infer<typeof WorkflowTransition>;

export const WorkflowDefinition = z.object({
  initialState: z.string(),
  states: z.array(WorkflowState),
  transitions: z.array(WorkflowTransition),
});

export type WorkflowDefinition = z.infer<typeof WorkflowDefinition>;

// --- Delegation Config ---
export const DelegationType = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string().optional(),
  requiresDocumentation: z.boolean().optional(),
});

export type DelegationType = z.infer<typeof DelegationType>;

export const AttestationDefinition = z.object({
  text: z.string(),
  required: z.boolean().optional(),
  signatureType: z.enum(['checkbox', 'typed-signature', 'wet-signature']).optional(),
});

export type AttestationDefinition = z.infer<typeof AttestationDefinition>;

export const DelegationConfig = z.object({
  types: z.array(DelegationType),
  attestation: AttestationDefinition.optional(),
  subjectLabel: z.string().optional(),
  representativeLabel: z.string().optional(),
  requiresConsentUpload: z.boolean().optional(),
  requiresAuthorizationNumber: z.boolean().optional(),
});

export type DelegationConfig = z.infer<typeof DelegationConfig>;

// --- Feedback Config ---
export const FeedbackConfig = z.object({
  granularity: z.enum(['section', 'field']).optional(),
  allowAttachments: z.boolean().optional(),
  requiresResolution: z.boolean().optional(),
});

export type FeedbackConfig = z.infer<typeof FeedbackConfig>;

// --- Eligibility Screener ---
export const EligibilityQuestion = z.object({
  id: z.string(),
  text: z.string(),
  type: z.enum(['yes-no', 'select', 'number']),
  options: z.array(FieldOption).optional(),
  disqualifyWhen: z.string().optional(),
  explanation: z.string().optional(),
});

export type EligibilityQuestion = z.infer<typeof EligibilityQuestion>;

export const EligibilityConfig = z.object({
  questions: z.array(EligibilityQuestion).min(1),
  passMessage: z.string().optional(),
  failMessage: z.string().optional(),
  partialMessage: z.string().optional(),
});

export type EligibilityConfig = z.infer<typeof EligibilityConfig>;

// --- Document Checklist ---
export const DocumentRequirement = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string().optional(),
  required: z.boolean().optional(),
  acceptedFormats: z.array(z.string()).optional(),
  maxSizeMb: z.number().optional(),
  examples: z.array(z.string()).optional(),
  alternatives: z.array(z.string()).optional(),
});

export type DocumentRequirement = z.infer<typeof DocumentRequirement>;

export const DocumentsConfig = z.object({
  requirements: z.array(DocumentRequirement).min(1),
  maxTotalSizeMb: z.number().optional(),
});

export type DocumentsConfig = z.infer<typeof DocumentsConfig>;

// --- Save & Resume ---
export const SaveResumeConfig = z.object({
  autoSaveIntervalMs: z.number().optional(),
  sessionTimeoutMs: z.number().optional(),
  warningBeforeTimeoutMs: z.number().optional(),
  storageKey: z.string().optional(),
  showLastSaved: z.boolean().optional(),
});

export type SaveResumeConfig = z.infer<typeof SaveResumeConfig>;

// --- Form Chain ---
export const FormChainStep = z.object({
  schemaRef: z.string(),
  label: z.string(),
  dependsOn: z.array(z.string()).optional(),
  dataMapping: z.record(z.string(), z.string()).optional(),
});

export type FormChainStep = z.infer<typeof FormChainStep>;

export const FormChainConfig = z.object({
  forms: z.array(FormChainStep),
  allowSkip: z.boolean().optional(),
});

export type FormChainConfig = z.infer<typeof FormChainConfig>;

// --- Decision Notice ---
export const DecisionNoticeTemplate = z.object({
  decision: z.string(),
  subject: z.string(),
  bodyTemplate: z.string(),
  legalCitations: z.array(z.string()).optional(),
  appealInfo: z.string().optional(),
});

export type DecisionNoticeTemplate = z.infer<typeof DecisionNoticeTemplate>;

export const DecisionNoticeConfig = z.object({
  templates: z.array(DecisionNoticeTemplate),
  agencyName: z.string().optional(),
  agencyLogo: z.string().optional(),
});

export type DecisionNoticeConfig = z.infer<typeof DecisionNoticeConfig>;

// --- Bilingual ---
export const BilingualConfig = z.object({
  primaryLanguage: z.string(),
  secondaryLanguage: z.string(),
  primaryLabel: z.string().optional(),
  secondaryLabel: z.string().optional(),
  mode: z.enum(['toggle', 'side-by-side', 'inline']).optional(),
});

export type BilingualConfig = z.infer<typeof BilingualConfig>;

// --- Data Table ---
export const DataTableColumn = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(['text', 'number', 'currency', 'date', 'select']),
  options: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
  required: z.boolean().optional(),
  width: z.string().optional(),
});

export type DataTableColumn = z.infer<typeof DataTableColumn>;

export const DataTableConfig = z.object({
  columns: z.array(DataTableColumn),
  minRows: z.number().optional(),
  maxRows: z.number().optional(),
  showTotals: z.array(z.string()).optional(),
  sortable: z.boolean().optional(),
  caption: z.string(),
});

export type DataTableConfig = z.infer<typeof DataTableConfig>;

// --- Signature ---
export const SignatureConfig = z.object({
  type: z.enum(['typed', 'drawn', 'checkbox']),
  legalText: z.string(),
  required: z.boolean().optional(),
  witnessRequired: z.boolean().optional(),
  dateRequired: z.boolean().optional(),
  printNameRequired: z.boolean().optional(),
  titleRequired: z.boolean().optional(),
});

export type SignatureConfig = z.infer<typeof SignatureConfig>;

// --- Timeout Warning ---
export const TimeoutWarningConfig = z.object({
  sessionTimeoutMs: z.number(),
  warningBeforeMs: z.number(),
  extendable: z.boolean().optional(),
  maxExtensions: z.number().optional(),
  redirectUrl: z.string().optional(),
});

export type TimeoutWarningConfig = z.infer<typeof TimeoutWarningConfig>;

export const FormSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  action: z.string().optional(),
  method: z.string().optional(),
  sections: z.array(FormSection),
  subForms: z.record(z.string(), SubFormDefinition).optional(),
  crossFieldRules: z.array(CrossFieldRule).optional(),
  steps: z.array(StepDefinition).optional(),
  actors: z.array(ActorDefinition).optional(),
  workflow: WorkflowDefinition.optional(),
  delegation: DelegationConfig.optional(),
  feedback: FeedbackConfig.optional(),
  eligibility: EligibilityConfig.optional(),
  documents: DocumentsConfig.optional(),
  saveResume: SaveResumeConfig.optional(),
  formChain: FormChainConfig.optional(),
  decisionNotice: DecisionNoticeConfig.optional(),
  bilingual: BilingualConfig.optional(),
  dataTable: DataTableConfig.optional(),
  signature: SignatureConfig.optional(),
  timeoutWarning: TimeoutWarningConfig.optional(),
});

export type FormSchema = z.infer<typeof FormSchema>;
