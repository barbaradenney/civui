/**
 * Resource: CivUI FormSchema reference documentation.
 * Complete specification of the FormSchema format, field types,
 * condition expressions, and all configuration objects.
 */

export const SCHEMA_REFERENCE = `# CivUI FormSchema Reference

Complete specification for the FormSchema JSON format used by CivUI MCP tools.

---

## Top-Level FormSchema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| \`title\` | string | no | Form title displayed in headings |
| \`description\` | string | no | Form description / instructions |
| \`action\` | string | no | Form submission URL |
| \`method\` | string | no | HTTP method (e.g. "post") |
| \`sections\` | FormSection[] | **yes** | Array of form sections |
| \`subForms\` | Record<string, SubFormDefinition> | no | Named sub-form definitions |
| \`crossFieldRules\` | CrossFieldRule[] | no | Cross-field validation rules |
| \`steps\` | StepDefinition[] | no | Form step definitions |
| \`actors\` | ActorDefinition[] | no | Actor roles for multi-actor workflows |
| \`workflow\` | WorkflowDefinition | no | Workflow state machine |
| \`delegation\` | DelegationConfig | no | Third-party filing configuration |
| \`feedback\` | FeedbackConfig | no | Reviewer feedback configuration |
| \`eligibility\` | EligibilityConfig | no | Pre-screening eligibility questions |
| \`documents\` | DocumentsConfig | no | Document upload checklist |
| \`saveResume\` | SaveResumeConfig | no | Save & resume configuration |
| \`formChain\` | FormChainConfig | no | Multi-form chain configuration |
| \`decisionNotice\` | DecisionNoticeConfig | no | Decision notice templates |
| \`bilingual\` | BilingualConfig | no | Bilingual form configuration |
| \`dataTable\` | DataTableConfig | no | Tabular data entry configuration |
| \`signature\` | SignatureConfig | no | Signature capture configuration |
| \`timeoutWarning\` | TimeoutWarningConfig | no | Session timeout warning |

---

## FieldType Enum

| Value | CivUI Component | Description |
|-------|----------------|-------------|
| \`text\` | \`<civ-text-input>\` | Single-line text input |
| \`email\` | \`<civ-text-input type="email">\` | Email address |
| \`tel\` | \`<civ-text-input type="tel">\` | Telephone number |
| \`number\` | \`<civ-text-input type="number">\` | Numeric input |
| \`password\` | \`<civ-text-input type="password">\` | Password field |
| \`search\` | \`<civ-text-input type="search">\` | Search input |
| \`url\` | \`<civ-text-input type="url">\` | URL input |
| \`ssn\` | \`<civ-text-input>\` | Social Security number (masked) |
| \`zip\` | \`<civ-text-input>\` | ZIP code |
| \`textarea\` | \`<civ-textarea>\` | Multi-line text |
| \`select\` | \`<civ-select>\` | Dropdown select |
| \`combobox\` | \`<civ-combobox>\` | Searchable select with typeahead |
| \`radio\` | \`<civ-radio-group>\` | Radio button group |
| \`checkbox\` | \`<civ-checkbox>\` | Single checkbox |
| \`checkbox-group\` | \`<civ-checkbox-group>\` | Multiple checkbox group |
| \`date\` | \`<civ-date-picker>\` | Date picker (calendar) |
| \`memorable-date\` | \`<civ-memorable-date>\` | Memorable date (3 fields) |
| \`file\` | \`<civ-file-upload>\` | File upload |
| \`toggle\` | \`<civ-toggle>\` | Toggle switch |
| \`segmented-control\` | \`<civ-segmented-control>\` | Segmented control (single selection) |

---

## FormField Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| \`type\` | FieldType | **yes** | Field type (see enum above) |
| \`name\` | string | **yes** | Unique field name (used as form key) |
| \`label\` | string | **yes** | Visible label text |
| \`hint\` | string | no | Help text shown below label |
| \`required\` | boolean | no | Whether field is mandatory |
| \`disabled\` | boolean | no | Whether field is disabled |
| \`placeholder\` | string | no | Placeholder text (not a label substitute) |
| \`value\` | string | no | Default/initial value |
| \`options\` | FieldOption[] | no | Options for select/radio/combobox/checkbox-group/segmented-control |
| \`maxlength\` | number | no | Maximum character count |
| \`minlength\` | number | no | Minimum character count |
| \`pattern\` | string | no | Regex validation pattern |
| \`min\` | string | no | Minimum value (number/date fields) |
| \`max\` | string | no | Maximum value (number/date fields) |
| \`accept\` | string | no | Accepted file types for file upload |
| \`multiple\` | boolean | no | Allow multiple selections/files |
| \`maxFiles\` | number | no | Maximum file count |
| \`maxSize\` | number | no | Maximum file size in bytes |
| \`autocomplete\` | string | no | HTML autocomplete attribute |
| \`inputmode\` | string | no | HTML inputmode attribute |
| \`rows\` | number | no | Textarea row count |
| \`children\` | FormField[] | no | Nested child fields |
| \`visibleWhen\` | ConditionExpression | no | Show field when condition is met |
| \`requiredWhen\` | ConditionExpression | no | Require field when condition is met |
| \`entityType\` | string | no | Entity type hint for relationship analysis |
| \`optionsFrom\` | { field, map } | no | Cascading options from another field |

### FieldOption

\`\`\`json
{ "value": "CA", "label": "California", "disabled": false }
\`\`\`

### optionsFrom

\`\`\`json
{
  "field": "country",
  "map": {
    "US": [{ "value": "CA", "label": "California" }],
    "CA": [{ "value": "ON", "label": "Ontario" }]
  }
}
\`\`\`

---

## ConditionExpression

A condition can be a **SimpleCondition** or a **CompoundCondition**.

### SimpleCondition

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| \`field\` | string | **yes** | Field name to evaluate |
| \`operator\` | string | **yes** | One of: \`eq\`, \`neq\`, \`in\`, \`notIn\`, \`exists\`, \`notExists\` |
| \`value\` | string \\| string[] | no | Comparison value(s) |

\`\`\`json
{ "field": "status", "operator": "eq", "value": "active" }
\`\`\`

### CompoundCondition

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| \`allOf\` | ConditionExpression[] | no | All conditions must be true (AND) |
| \`anyOf\` | ConditionExpression[] | no | Any condition must be true (OR) |

\`\`\`json
{
  "allOf": [
    { "field": "age", "operator": "exists" },
    { "field": "consent", "operator": "eq", "value": "yes" }
  ]
}
\`\`\`

---

## FormSection

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| \`heading\` | string | no | Section heading |
| \`fields\` | FormField[] | **yes** | Fields in this section |
| \`repeatable\` | boolean | no | Whether section can be duplicated |
| \`repeatableKey\` | string | no | Key for repeatable instances |
| \`repeatableMin\` | number | no | Minimum instances |
| \`repeatableMax\` | number | no | Maximum instances |
| \`repeatableAddLabel\` | string | no | Custom "Add" button label |
| \`repeatableRemoveLabel\` | string | no | Custom "Remove" button label |
| \`ref\` | string | no | Reference to a subForm definition |
| \`namespace\` | string | no | Namespace prefix for field names |
| \`step\` | number | no | Form step index (0-based) |
| \`visibleWhen\` | ConditionExpression | no | Show section conditionally |
| \`layout\` | "default" \\| "table" | no | Section layout mode |
| \`tableColumns\` | string[] | no | Column field names for table layout |
| \`editableBy\` | string[] | no | Actor IDs who can edit this section |
| \`visibleTo\` | string[] | no | Actor IDs who can see this section |
| \`phase\` | string | no | Workflow phase tag |

---

## CrossFieldRule

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| \`id\` | string | **yes** | Unique rule identifier |
| \`description\` | string | **yes** | Human-readable description |
| \`when\` | ConditionExpression | **yes** | Trigger condition |
| \`then.action\` | string | **yes** | One of: \`require\`, \`show\`, \`hide\`, \`setError\` |
| \`then.targets\` | string[] | **yes** | Target field names |
| \`then.message\` | string | no | Error message for \`setError\` action |

\`\`\`json
{
  "id": "spouse-required",
  "description": "Require spouse name when married",
  "when": { "field": "marital-status", "operator": "eq", "value": "married" },
  "then": { "action": "require", "targets": ["spouse-name"] }
}
\`\`\`

---

## StepDefinition

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| \`title\` | string | **yes** | Step title |
| \`description\` | string | no | Step description |

---

## ActorDefinition

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| \`id\` | string | **yes** | Unique actor identifier |
| \`label\` | string | **yes** | Display label |
| \`description\` | string | no | Actor description |

---

## WorkflowDefinition

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| \`initialState\` | string | **yes** | Starting state ID |
| \`states\` | WorkflowState[] | **yes** | Available states |
| \`transitions\` | WorkflowTransition[] | **yes** | State transitions |

### WorkflowState

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| \`id\` | string | **yes** | State identifier |
| \`label\` | string | **yes** | Display label |
| \`description\` | string | no | State description |
| \`editableBy\` | string[] | no | Actors who can edit in this state |
| \`visibleTo\` | string[] | no | Actors who can view in this state |
| \`allowsFeedback\` | boolean | no | Whether feedback is enabled |
| \`terminal\` | boolean | no | Whether this is a final state |

### WorkflowTransition

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| \`from\` | string | **yes** | Source state ID |
| \`to\` | string | **yes** | Target state ID |
| \`actor\` | string | **yes** | Actor who performs this transition |
| \`label\` | string | **yes** | Button/action label |
| \`requiresComment\` | boolean | no | Whether a comment is required |
| \`requiresAllSectionsComplete\` | boolean | no | Whether all sections must be complete |
| \`confirmationMessage\` | string | no | Confirmation dialog message |

---

## DelegationConfig

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| \`types\` | DelegationType[] | **yes** | Delegation types |
| \`attestation\` | AttestationDefinition | no | Attestation / signature |
| \`subjectLabel\` | string | no | Label for the subject person |
| \`representativeLabel\` | string | no | Label for the representative |
| \`requiresConsentUpload\` | boolean | no | Require consent document |
| \`requiresAuthorizationNumber\` | boolean | no | Require authorization number |

---

## FeedbackConfig

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| \`granularity\` | "section" \\| "field" | no | Feedback granularity level |
| \`allowAttachments\` | boolean | no | Allow file attachments |
| \`requiresResolution\` | boolean | no | Require resolution of all feedback |

---

## EligibilityConfig

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| \`questions\` | EligibilityQuestion[] | **yes** | Screening questions (min 1) |
| \`passMessage\` | string | no | Message when eligible |
| \`failMessage\` | string | no | Message when ineligible |
| \`partialMessage\` | string | no | Message for partial eligibility |

### EligibilityQuestion

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| \`id\` | string | **yes** | Question identifier |
| \`text\` | string | **yes** | Question text |
| \`type\` | "yes-no" \\| "select" \\| "number" | **yes** | Question type |
| \`options\` | FieldOption[] | no | Options for select type |
| \`disqualifyWhen\` | string | no | Value that disqualifies |
| \`explanation\` | string | no | Explanation text |

---

## DocumentsConfig

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| \`requirements\` | DocumentRequirement[] | **yes** | Document requirements (min 1) |
| \`maxTotalSizeMb\` | number | no | Total upload size limit |

### DocumentRequirement

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| \`id\` | string | **yes** | Requirement identifier |
| \`label\` | string | **yes** | Document label |
| \`description\` | string | no | Description of what to provide |
| \`required\` | boolean | no | Whether this document is mandatory |
| \`acceptedFormats\` | string[] | no | Accepted file formats |
| \`maxSizeMb\` | number | no | Per-file size limit |
| \`examples\` | string[] | no | Example documents |
| \`alternatives\` | string[] | no | Alternative acceptable documents |

---

## SaveResumeConfig

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| \`autoSaveIntervalMs\` | number | no | Auto-save interval in ms |
| \`sessionTimeoutMs\` | number | no | Session timeout in ms |
| \`warningBeforeTimeoutMs\` | number | no | Warning before timeout |
| \`storageKey\` | string | no | LocalStorage key |
| \`showLastSaved\` | boolean | no | Show last saved timestamp |

---

## FormChainConfig

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| \`forms\` | FormChainStep[] | **yes** | Ordered form steps |
| \`allowSkip\` | boolean | no | Allow skipping forms |

### FormChainStep

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| \`schemaRef\` | string | **yes** | Schema reference identifier |
| \`label\` | string | **yes** | Step display label |
| \`dependsOn\` | string[] | no | Schema refs that must complete first |
| \`dataMapping\` | Record<string, string> | no | Field mapping from prior forms |

---

## DecisionNoticeConfig

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| \`templates\` | DecisionNoticeTemplate[] | **yes** | Notice templates |
| \`agencyName\` | string | no | Agency name for header |
| \`agencyLogo\` | string | no | Agency logo URL |

### DecisionNoticeTemplate

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| \`decision\` | string | **yes** | Decision key (e.g. "approved") |
| \`subject\` | string | **yes** | Notice subject line |
| \`bodyTemplate\` | string | **yes** | Body with \`{{fieldName}}\` merge fields |
| \`legalCitations\` | string[] | no | Legal citation references |
| \`appealInfo\` | string | no | Appeal rights information |

---

## BilingualConfig

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| \`primaryLanguage\` | string | **yes** | Primary language code (e.g. "en") |
| \`secondaryLanguage\` | string | **yes** | Secondary language code (e.g. "es") |
| \`primaryLabel\` | string | no | Language toggle label |
| \`secondaryLabel\` | string | no | Language toggle label |
| \`mode\` | "toggle" \\| "side-by-side" \\| "inline" | no | Display mode |

---

## DataTableConfig

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| \`columns\` | DataTableColumn[] | **yes** | Column definitions |
| \`minRows\` | number | no | Minimum row count |
| \`maxRows\` | number | no | Maximum row count |
| \`showTotals\` | string[] | no | Column IDs to show totals (must be numeric) |
| \`sortable\` | boolean | no | Enable column sorting |
| \`caption\` | string | **yes** | Table caption (accessibility) |

### DataTableColumn

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| \`id\` | string | **yes** | Column identifier |
| \`label\` | string | **yes** | Column header label |
| \`type\` | "text" \\| "number" \\| "currency" \\| "date" \\| "select" | **yes** | Column data type |
| \`options\` | { value, label }[] | no | Options for select columns |
| \`required\` | boolean | no | Whether column is required |
| \`width\` | string | no | Column width (CSS value) |

---

## SignatureConfig

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| \`type\` | "typed" \\| "drawn" \\| "checkbox" | **yes** | Signature capture method |
| \`legalText\` | string | **yes** | Legal attestation text |
| \`required\` | boolean | no | Whether signature is mandatory |
| \`witnessRequired\` | boolean | no | Require witness signature |
| \`dateRequired\` | boolean | no | Require date with signature |
| \`printNameRequired\` | boolean | no | Require printed name |
| \`titleRequired\` | boolean | no | Require title/position |

---

## TimeoutWarningConfig

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| \`sessionTimeoutMs\` | number | **yes** | Session timeout in ms |
| \`warningBeforeMs\` | number | **yes** | Warning lead time in ms |
| \`extendable\` | boolean | no | Allow session extension |
| \`maxExtensions\` | number | no | Maximum extension count |
| \`redirectUrl\` | string | no | URL to redirect on timeout |

---

## Common Patterns

### Simple form with validation
\`\`\`json
{
  "title": "Contact Form",
  "action": "/api/contact",
  "method": "post",
  "sections": [{
    "heading": "Your information",
    "fields": [
      { "type": "text", "name": "name", "label": "Full name", "required": true },
      { "type": "email", "name": "email", "label": "Email address", "required": true },
      { "type": "textarea", "name": "message", "label": "Message", "required": true, "rows": 5 }
    ]
  }]
}
\`\`\`

### Conditional fields
\`\`\`json
{
  "type": "text",
  "name": "other-reason",
  "label": "Please specify",
  "visibleWhen": { "field": "reason", "operator": "eq", "value": "other" }
}
\`\`\`

### Multi-step form
\`\`\`json
{
  "steps": [
    { "title": "Personal info" },
    { "title": "Address" },
    { "title": "Review" }
  ],
  "sections": [
    { "heading": "About you", "step": 0, "fields": [...] },
    { "heading": "Your address", "step": 1, "fields": [...] },
    { "heading": "Review your answers", "step": 2, "fields": [...] }
  ]
}
\`\`\`

### Cascading options
\`\`\`json
{
  "type": "select",
  "name": "city",
  "label": "City",
  "optionsFrom": {
    "field": "state",
    "map": {
      "CA": [{ "value": "la", "label": "Los Angeles" }, { "value": "sf", "label": "San Francisco" }],
      "NY": [{ "value": "nyc", "label": "New York City" }, { "value": "buf", "label": "Buffalo" }]
    }
  }
}
\`\`\`
`;
