---
title: Yes/No
sidebar_position: 12
sidebar_label: Yes/No
---

# civ-yes-no

A simple boolean question component for yes/no questions in government forms. Renders as a fieldset with two styled buttons using `role="radio"` for accessibility. Implements roving tabindex and arrow key navigation.

## Props

Uses `legend` instead of `label` because it renders as a fieldset with radio semantics.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `legend` | `string` | `''` | Question text |
| `name` | `string` | `''` | Form field name |
| `value` | `string` | `''` | Selected value (`'yes'`, `'no'`, or `''`) |
| `hint` | `string` | `''` | Hint text below the question |
| `error` | `string` | `''` | Error message |
| `yes-label` | `string` | `'Yes'` | Label for the Yes button |
| `no-label` | `string` | `'No'` | Label for the No button |
| `required` | `boolean` | `false` | Whether a selection is required |
| `disabled` | `boolean` | `false` | Disable both buttons |
| `readonly` | `boolean` | `false` | Make the control read-only |

## Keyboard Navigation

| Key | Action |
|-----|--------|
| Arrow Right / Arrow Down | Move to next option |
| Arrow Left / Arrow Up | Move to previous option |
| Enter / Space | Select focused option |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `civ-input` | `{ value: string }` | Fires when selection changes |
| `civ-change` | `{ value: string }` | Fires when selection changes |

## Examples

```html
<!-- Basic yes/no question -->
<civ-yes-no
  legend="Are you a Veteran?"
  name="isVeteran"
  required
></civ-yes-no>

<!-- With hint -->
<civ-yes-no
  legend="Do you currently have health insurance?"
  name="hasInsurance"
  hint="Include Medicare, Medicaid, or private insurance."
  required
></civ-yes-no>

<!-- Custom labels -->
<civ-yes-no
  legend="Would you like to add a dependent?"
  name="addDependent"
  yes-label="Yes, add a dependent"
  no-label="No, continue"
></civ-yes-no>
```



## Live Examples

### citizen

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-yes-no--default&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### With Hint

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-yes-no--with-hint&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### With Error

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-yes-no--with-error&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Required

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-yes-no--required&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Disabled

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-yes-no--disabled&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Preselected

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-yes-no--preselected&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Custom Labels

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-yes-no--custom-labels&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### In Form

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-yes-no--in-form&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

[Open in Storybook →](/civui/storybook/?path=/story/forms-inputs-yes-no--default)
