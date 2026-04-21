---
title: Memorable Date
sidebar_position: 10
sidebar_label: Memorable Date
---

# civ-memorable-date

Three-field date input (month select + day text input + year text input) wrapped in a fieldset. Use for known dates like date of birth or document dates. For scheduling, use `civ-date-picker` instead.

This component uses `legend` instead of `label` because it renders a `<fieldset>` containing multiple inputs. When `required` is set, the required indicator appears on the legend, and `hide-required-indicator` is applied to individual child fields to avoid duplication.

## Shared Props (Group Component)

Group components share: `name`, `value`, `hint`, `error`, `required`, `disabled`. Uses `legend` instead of `label`.

## Component-Specific Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `legend` | `string` | `''` | Fieldset legend text |
| `locale` | `string` | `'en-US'` | Locale for month names |
| `month-label` | `string` | `'Month'` | Label for the month select |
| `day-label` | `string` | `'Day'` | Label for the day input |
| `year-label` | `string` | `'Year'` | Label for the year input |
| `month-empty-label` | `string` | `'- Month -'` | Empty option text for month select |
| `day-placeholder` | `string` | `'DD'` | Placeholder for day input |
| `year-placeholder` | `string` | `'YYYY'` | Placeholder for year input |

## Value Format

The `value` is in ISO `YYYY-MM-DD` format. Invalid dates (e.g., February 30) produce an empty value and show an error.

## Form Field Naming

Child fields are named `{name}-month`, `{name}-day`, `{name}-year` for individual form submission when needed.

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `civ-input` | `{ value: string, month: string, day: string, year: string }` | Fires on any field change |
| `civ-change` | `{ value: string, month: string, day: string, year: string }` | Fires on committed field change |

## Examples

```html
<!-- Date of birth -->
<civ-memorable-date
  legend="Date of birth"
  name="dob"
  hint="For example: January 15 1990"
  required
></civ-memorable-date>

<!-- Document date -->
<civ-memorable-date
  legend="Date of discharge"
  name="dischargeDate"
  required
></civ-memorable-date>

<!-- With custom locale -->
<civ-memorable-date
  legend="Fecha de nacimiento"
  name="fechaNacimiento"
  locale="es-US"
  required
></civ-memorable-date>
```



## Live Examples

### dob

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-memorable-date--default&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### With Hint

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-memorable-date--with-hint&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### With Error

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-memorable-date--with-error&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Prefilled

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-memorable-date--prefilled&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Required

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-memorable-date--required&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Disabled

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-memorable-date--disabled&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Custom Labels

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-memorable-date--custom-labels&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### In Form

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-memorable-date--in-form&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

[Open in Storybook →](/civui/storybook/?path=/story/forms-inputs-memorable-date--default)
