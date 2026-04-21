---
title: Form Inputs
sidebar_position: 5
sidebar_label: Form Inputs
---

# Form Input Components

All form components share a standard API: `label`, `name`, `value`, `hint`, `error`, `required`, `disabled`.

Render order is always: label, hint, error, control.

---

## civ-text-input

A single-line text input with optional masking and validation.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Visible label text |
| `name` | `string` | — | Form field name |
| `value` | `string` | `""` | Current value |
| `hint` | `string` | — | Helper text below the label |
| `error` | `string` | — | Error message |
| `required` | `boolean` | `false` | Whether the field is mandatory |
| `disabled` | `boolean` | `false` | Disables the input |
| `type` | `string` | `"text"` | Input type (`text`, `email`, `tel`, etc.) |
| `mask` | `string` | — | Mask preset or pattern (`phone-us`, `ssn`, `zip`, etc.) |
| `validate` | `string` | — | Declarative validator (`email`, `phone`, `url`, etc.) |
| `maxlength` | `number` | — | Maximum character count |

### Example

```html
<civ-text-input
  label="Email address"
  name="email"
  type="email"
  hint="We will use this to send confirmation"
  required
  validate="email">
</civ-text-input>

<civ-text-input
  label="Social Security number"
  name="ssn"
  hint="For example: 123 45 6789"
  mask="ssn"
  required>
</civ-text-input>
```

---

## civ-textarea

A multi-line text input with optional character count.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Visible label text |
| `name` | `string` | — | Form field name |
| `value` | `string` | `""` | Current value |
| `hint` | `string` | — | Helper text |
| `error` | `string` | — | Error message |
| `required` | `boolean` | `false` | Whether the field is mandatory |
| `disabled` | `boolean` | `false` | Disables the textarea |
| `maxlength` | `number` | — | Maximum character count (shows counter) |
| `rows` | `number` | `5` | Visible row count |

### Example

```html
<civ-textarea
  label="Describe your situation"
  name="description"
  hint="Include dates and relevant details"
  maxlength="500"
  required>
</civ-textarea>
```

---

## civ-select

A native dropdown select input.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Visible label text |
| `name` | `string` | — | Form field name |
| `value` | `string` | `""` | Selected value |
| `hint` | `string` | — | Helper text |
| `error` | `string` | — | Error message |
| `required` | `boolean` | `false` | Whether the field is mandatory |
| `disabled` | `boolean` | `false` | Disables the select |
| `options` | `array` | `[]` | Options as `[{label, value}]` JSON |

### Example

```html
<civ-select
  label="State of residence"
  name="state"
  required
  options='[{"label":"California","value":"CA"},{"label":"Texas","value":"TX"},{"label":"New York","value":"NY"}]'>
</civ-select>
```

---

## civ-combobox

An autocomplete/typeahead input that filters a list of options.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Visible label text |
| `name` | `string` | — | Form field name |
| `value` | `string` | `""` | Selected value |
| `hint` | `string` | — | Helper text |
| `error` | `string` | — | Error message |
| `required` | `boolean` | `false` | Whether the field is mandatory |
| `disabled` | `boolean` | `false` | Disables the combobox |
| `options` | `array` | `[]` | Options as `[{label, value}]` JSON |

### Events

- `civ-change` — detail: `{ value, label }`

### Example

```html
<civ-combobox
  label="Select your county"
  name="county"
  hint="Start typing to filter"
  options='[{"label":"Los Angeles","value":"los-angeles"},{"label":"San Diego","value":"san-diego"}]'>
</civ-combobox>
```

---

## civ-checkbox / civ-checkbox-group

A single checkbox or a group of checkboxes.

### civ-checkbox Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Checkbox label |
| `name` | `string` | — | Form field name |
| `value` | `string` | — | Checkbox value |
| `checked` | `boolean` | `false` | Whether checked |
| `disabled` | `boolean` | `false` | Disables the checkbox |

### civ-checkbox-group Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `legend` | `string` | — | Group legend |
| `name` | `string` | — | Shared form field name |
| `hint` | `string` | — | Helper text |
| `error` | `string` | — | Error message |
| `required` | `boolean` | `false` | Whether at least one must be checked |

### Events

- `civ-change` — detail: `{ values: string[] }`

### Example

```html
<civ-checkbox-group
  legend="Which benefits are you applying for?"
  name="benefits"
  hint="Select all that apply"
  required>
  <civ-checkbox label="Health care" value="health"></civ-checkbox>
  <civ-checkbox label="Education" value="education"></civ-checkbox>
  <civ-checkbox label="Housing" value="housing"></civ-checkbox>
</civ-checkbox-group>
```

---

## civ-radio / civ-radio-group

A group of mutually exclusive radio options.

### civ-radio-group Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `legend` | `string` | — | Group legend |
| `name` | `string` | — | Shared form field name |
| `value` | `string` | `""` | Currently selected value |
| `hint` | `string` | — | Helper text |
| `error` | `string` | — | Error message |
| `required` | `boolean` | `false` | Whether a selection is required |

### Events

- `civ-change` — detail: `{ value: string }`

### Example

```html
<civ-radio-group
  legend="What is your marital status?"
  name="marital-status"
  required>
  <civ-radio label="Single" value="single"></civ-radio>
  <civ-radio label="Married" value="married"></civ-radio>
  <civ-radio label="Divorced" value="divorced"></civ-radio>
  <civ-radio label="Widowed" value="widowed"></civ-radio>
</civ-radio-group>
```

---

## civ-toggle

A toggle switch for binary on/off settings.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Visible label text |
| `name` | `string` | — | Form field name |
| `value` | `string` | — | Value submitted when checked |
| `checked` | `boolean` | `false` | Whether toggled on |
| `hint` | `string` | — | Helper text |
| `disabled` | `boolean` | `false` | Disables the toggle |

### Events

- `civ-change` — detail: `{ checked: boolean, value: string }`

### Example

```html
<civ-toggle
  label="Receive email notifications"
  name="email-notifications"
  value="yes">
</civ-toggle>
```

---

## civ-segmented-control

A segmented button group for selecting one option from a small set (2-5 options).

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `legend` | `string` | — | Group label |
| `name` | `string` | — | Form field name |
| `value` | `string` | `""` | Selected value |
| `options` | `array` | `[]` | Options as `[{label, value}]` JSON |
| `hint` | `string` | — | Helper text |
| `error` | `string` | — | Error message |
| `disabled` | `boolean` | `false` | Disables the control |

### Example

```html
<civ-segmented-control
  legend="Preferred contact method"
  name="contact-method"
  options='[{"label":"Email","value":"email"},{"label":"Phone","value":"phone"},{"label":"Mail","value":"mail"}]'>
</civ-segmented-control>
```

---

## civ-date-picker

A date picker for scheduling and appointment selection. Use for future dates and date ranges.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Visible label text |
| `name` | `string` | — | Form field name |
| `value` | `string` | `""` | Selected date (ISO format) |
| `hint` | `string` | — | Helper text |
| `error` | `string` | — | Error message |
| `required` | `boolean` | `false` | Whether the field is mandatory |
| `disabled` | `boolean` | `false` | Disables the picker |
| `min` | `string` | — | Earliest selectable date (ISO) |
| `max` | `string` | — | Latest selectable date (ISO) |

### Example

```html
<civ-date-picker
  label="Preferred appointment date"
  name="appointment-date"
  hint="Select a weekday"
  min="2026-04-20"
  required>
</civ-date-picker>
```

---

## civ-memorable-date

Three separate inputs (month, day, year) for known dates like date of birth. Preferred over a date picker for memorable dates.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Visible label text |
| `name` | `string` | — | Form field name |
| `value` | `string` | `""` | Date value (ISO format) |
| `hint` | `string` | — | Helper text (e.g., "For example: January 15 1990") |
| `error` | `string` | — | Error message |
| `required` | `boolean` | `false` | Whether the field is mandatory |
| `disabled` | `boolean` | `false` | Disables all inputs |

### Events

- `civ-change` — detail: `{ value, month, day, year }`

### Example

```html
<civ-memorable-date
  label="Date of birth"
  name="dob"
  hint="For example: January 15 1990"
  required>
</civ-memorable-date>
```

---

## civ-file-upload

A file upload control with drag-and-drop support and file list display.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Visible label text |
| `name` | `string` | — | Form field name |
| `hint` | `string` | — | Helper text (accepted formats, size limits) |
| `error` | `string` | — | Error message |
| `required` | `boolean` | `false` | Whether the field is mandatory |
| `disabled` | `boolean` | `false` | Disables the upload |
| `accept` | `string` | — | Accepted MIME types (e.g., `.pdf,.jpg`) |
| `multiple` | `boolean` | `false` | Allow multiple files |
| `max-size` | `number` | — | Max file size in bytes |

### Events

- `civ-change` — detail: `{ files: File[] }`

### Example

```html
<civ-file-upload
  label="Upload supporting documents"
  name="documents"
  hint="PDF or JPG, maximum 10 MB each"
  accept=".pdf,.jpg,.jpeg"
  multiple
  max-size="10485760">
</civ-file-upload>
```

---

## civ-yes-no

A yes/no radio group optimized for boolean questions. Renders as two large radio buttons.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | The yes/no question |
| `name` | `string` | — | Form field name |
| `value` | `string` | `""` | Selected value (`"yes"` or `"no"`) |
| `hint` | `string` | — | Helper text |
| `error` | `string` | — | Error message |
| `required` | `boolean` | `false` | Whether a selection is required |
| `disabled` | `boolean` | `false` | Disables both options |

### Example

```html
<civ-yes-no
  label="Are you a United States citizen?"
  name="us-citizen"
  required>
</civ-yes-no>

<civ-yes-no
  label="Have you served in the military?"
  name="military-service"
  hint="Include active duty, reserves, and National Guard">
</civ-yes-no>
```
