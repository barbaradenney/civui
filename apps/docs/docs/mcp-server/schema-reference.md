---
title: Schema Reference
sidebar_position: 6
sidebar_label: Schema Reference
---

# FormSchema Reference

FormSchema is the universal intermediate format that connects all MCP tools. Parse tools produce it, generation tools consume it, and validation tools check it.

## Minimal Example

```json
{
  "title": "Change of Address",
  "action": "/api/submit",
  "method": "POST",
  "sections": [
    {
      "heading": "New Address",
      "fields": [
        { "name": "street", "label": "Street address", "type": "text", "required": true },
        { "name": "city", "label": "City", "type": "text", "required": true },
        { "name": "state", "label": "State", "type": "select", "required": true,
          "options": [
            { "label": "California", "value": "CA" },
            { "label": "Texas", "value": "TX" }
          ]
        },
        { "name": "zip", "label": "ZIP code", "type": "zip", "required": true }
      ]
    }
  ]
}
```

## Top-Level Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `title` | string | No | Form title |
| `description` | string | No | Form description |
| `action` | string | No | Form submission URL |
| `method` | string | No | HTTP method (POST, GET) |
| `sections` | FormSection[] | Yes | Ordered list of form sections |
| `subForms` | Record&lt;string, SubFormDefinition&gt; | No | Reusable sub-form definitions |
| `crossFieldRules` | CrossFieldRule[] | No | Cross-field validation rules |
| `steps` | StepDefinition[] | No | Wizard step labels |
| `actors` | ActorDefinition[] | No | Roles that interact with the form |
| `workflow` | WorkflowDefinition | No | Multi-actor state machine |
| `delegation` | DelegationConfig | No | Representative/POA support |
| `feedback` | FeedbackConfig | No | Reviewer comment configuration |
| `eligibility` | EligibilityConfig | No | Eligibility screener |
| `documents` | DocumentsConfig | No | Document upload checklist |
| `saveResume` | SaveResumeConfig | No | Save and resume configuration |
| `signature` | SignatureConfig | No | E-signature block |
| `timeoutWarning` | TimeoutWarningConfig | No | Session timeout dialog |
| `bilingual` | BilingualConfig | No | Bilingual form support |
| `dataTable` | DataTableConfig | No | Tabular data entry |
| `formChain` | FormChainConfig | No | Multi-form sequence |
| `decisionNotice` | DecisionNoticeConfig | No | Decision notification templates |

## Field Types

| Type | CivUI Component | Notes |
|------|----------------|-------|
| `text` | `\1` | General text input |
| `email` | `\1` | Email with validation |
| `tel` | `\1` | Phone number |
| `url` | `\1` | URL input |
| `number` | `\1` | Numeric input |
| `password` | `\1` | Password field |
| `search` | `\1` | Search input |
| `ssn` | `\1` | Auto-masked Social Security number |
| `zip` | `\1` | Auto-masked ZIP code |
| `textarea` | `\1` | Multi-line text |
| `select` | `\1` | Dropdown (requires `options`) |
| `combobox` | `\1` | Typeahead search select |
| `radio` | `\1` | Radio button group (requires `options`) |
| `checkbox` | `\1` | Single boolean checkbox |
| `checkbox-group` | `\1` | Multiple selection checkboxes |
| `date` | `\1` | Calendar date picker (for scheduling) |
| `memorable-date` | `\1` | Day/month/year inputs (for known dates like DOB) |
| `file` | `\1` | Document upload |
| `toggle` | `\1` | On/off switch |
| `segmented-control` | `\1` | Segmented button group |

## Field Properties

| Property | Type | Description |
|----------|------|-------------|
| `name` | string | Field name (used as form data key) |
| `label` | string | Visible label text |
| `type` | FieldType | One of the types above |
| `hint` | string | Help text below the label |
| `required` | boolean | Whether the field is mandatory |
| `disabled` | boolean | Whether the field is non-interactive |
| `placeholder` | string | Placeholder text (never use as sole label) |
| `value` | string | Default value |
| `options` | FieldOption[] | Options for select, radio, checkbox-group |
| `maxlength` | number | Maximum character count |
| `minlength` | number | Minimum character count |
| `pattern` | string | Regex validation pattern |
| `min` | string | Minimum value (number/date) |
| `max` | string | Maximum value (number/date) |
| `accept` | string | Accepted file types |
| `multiple` | boolean | Allow multiple file selection |
| `maxFiles` | number | Maximum file count |
| `maxSize` | number | Maximum file size in bytes |
| `autocomplete` | string | Browser autocomplete hint |
| `inputmode` | string | Virtual keyboard hint |
| `rows` | number | Textarea row count |
| `children` | FormField[] | Nested fields (for fieldsets) |
| `visibleWhen` | ConditionExpression | Show field conditionally |
| `requiredWhen` | ConditionExpression | Require field conditionally |
| `entityType` | string | Entity category for prefill mapping |
| `optionsFrom` | object | Dynamic options based on another field's value |

## Section Properties

| Property | Type | Description |
|----------|------|-------------|
| `heading` | string | Section heading text |
| `fields` | FormField[] | Fields in this section |
| `repeatable` | boolean | Allow add/remove instances |
| `repeatableKey` | string | Unique key field for repeatable items |
| `repeatableMin` | number | Minimum instances required |
| `repeatableMax` | number | Maximum instances allowed |
| `repeatableAddLabel` | string | "Add another" button text |
| `repeatableRemoveLabel` | string | "Remove" button text |
| `ref` | string | Reference to a sub-form definition |
| `namespace` | string | Field name prefix for nested data |
| `step` | number | Wizard step assignment |
| `visibleWhen` | ConditionExpression | Show section conditionally |
| `layout` | `"default"` or `"table"` | Render as table for tabular data |
| `tableColumns` | string[] | Column field names for table layout |
| `editableBy` | string[] | Roles that can edit this section |
| `visibleTo` | string[] | Roles that can see this section |
| `phase` | string | Workflow phase this section belongs to |

## Conditions (visibleWhen / requiredWhen)

### Simple Condition

Show or require a field based on another field's value:

```json
{
  "name": "otherReason",
  "label": "Please describe",
  "type": "textarea",
  "visibleWhen": { "field": "reason", "operator": "eq", "value": "other" }
}
```

### Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `eq` | Equals | `{ "field": "x", "operator": "eq", "value": "yes" }` |
| `neq` | Not equals | `{ "field": "x", "operator": "neq", "value": "no" }` |
| `in` | Value is one of | `{ "field": "x", "operator": "in", "value": ["a", "b"] }` |
| `notIn` | Value is not one of | `{ "field": "x", "operator": "notIn", "value": ["c", "d"] }` |
| `exists` | Field has any value | `{ "field": "x", "operator": "exists" }` |
| `notExists` | Field is empty | `{ "field": "x", "operator": "notExists" }` |

### Compound Conditions

Combine multiple conditions with `allOf` (AND) or `anyOf` (OR):

```json
{
  "visibleWhen": {
    "allOf": [
      { "field": "hasInsurance", "operator": "eq", "value": "yes" },
      { "field": "insuranceType", "operator": "neq", "value": "medicare" }
    ]
  }
}
```

```json
{
  "visibleWhen": {
    "anyOf": [
      { "field": "branch", "operator": "eq", "value": "army" },
      { "field": "branch", "operator": "eq", "value": "navy" }
    ]
  }
}
```

## Cross-Field Validation Rules

Define validation that depends on multiple fields:

```json
{
  "crossFieldRules": [
    {
      "id": "phone-required-if-call",
      "description": "Phone is required when contact method is call",
      "when": { "field": "contactMethod", "operator": "eq", "value": "call" },
      "then": {
        "action": "require",
        "targets": ["phone"],
        "message": "Enter a phone number since you selected phone as your contact method"
      }
    },
    {
      "id": "end-after-start",
      "description": "End date must be after start date",
      "when": { "field": "startDate", "operator": "exists" },
      "then": {
        "action": "setError",
        "targets": ["endDate"],
        "message": "End date must be after start date"
      }
    }
  ]
}
```

### Rule Actions

| Action | Description |
|--------|-------------|
| `require` | Make target fields required when condition is met |
| `show` | Show target fields when condition is met |
| `hide` | Hide target fields when condition is met |
| `setError` | Set a validation error on target fields |

## Dynamic Options

Populate options based on another field's value:

```json
{
  "name": "city",
  "label": "City",
  "type": "select",
  "optionsFrom": {
    "field": "state",
    "map": {
      "CA": [
        { "value": "la", "label": "Los Angeles" },
        { "value": "sf", "label": "San Francisco" }
      ],
      "TX": [
        { "value": "houston", "label": "Houston" },
        { "value": "austin", "label": "Austin" }
      ]
    }
  }
}
```

## Multi-Step Forms

Assign fields to wizard steps using the section `step` property or the top-level `steps` array:

```json
{
  "steps": [
    { "title": "Personal Information" },
    { "title": "Contact Details" },
    { "title": "Review" }
  ],
  "sections": [
    { "heading": "Your name", "step": 0, "fields": [...] },
    { "heading": "Your address", "step": 1, "fields": [...] }
  ]
}
```
