---
title: Text Input
sidebar_position: 1
sidebar_label: Text Input
---

# civ-text-input

Accessible text input with label, hint, error, and width variants. Supports input masking and declarative validation. Uses ElementInternals for native form participation.

## Shared Props

All form components share these props: `label`, `name`, `value`, `hint`, `error`, `required`, `disabled`.

## Component-Specific Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'text' \| 'email' \| 'number' \| 'password' \| 'search' \| 'tel' \| 'url'` | `'text'` | Input type attribute |
| `width` | `'default' \| '2xs' \| 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl'` | `'default'` | Input width variant |
| `placeholder` | `string` | `''` | Placeholder text |
| `pattern` | `string` | `''` | HTML pattern attribute for native validation |
| `maxlength` | `number` | — | Maximum character length |
| `minlength` | `number` | — | Minimum character length |
| `autocomplete` | `string` | `''` | Autocomplete hint (e.g., `'email'`, `'given-name'`) |
| `inputmode` | `string` | `''` | Virtual keyboard hint (e.g., `'numeric'`, `'tel'`) |
| `mask` | `'ssn' \| 'phone-us' \| 'zip' \| 'zip4' \| 'ein' \| 'currency' \| ''` | `''` | Mask preset name |
| `mask-pattern` | `string` | `''` | Custom mask pattern (`#` = digit, `A` = letter, `*` = any) |
| `mask-mode` | `'blur' \| 'live'` | `'blur'` | Mask formatting mode |
| `validate` | `'email' \| 'phone' \| 'phoneIntl' \| 'ssn' \| 'ein' \| 'zip' \| 'zip4' \| 'usState' \| 'url' \| 'currency' \| 'alphanumeric' \| ''` | `''` | Declarative validation preset |
| `prefix` | `string` | `''` | Prefix text rendered before the input (e.g., `'$'`) |
| `suffix` | `string` | `''` | Suffix text rendered after the input |
| `clearable` | `boolean` | `false` | Show a clear button when the field has a value |

## Mask Presets

| Preset | Pattern | Example Output | PII |
|--------|---------|----------------|-----|
| `ssn` | `###-##-####` | 123-45-6789 | Yes |
| `phone-us` | `(###) ###-####` | (555) 123-4567 | No |
| `zip` | `#####` | 20500 | No |
| `zip4` | `#####-####` | 20500-1234 | No |
| `ein` | `##-#######` | 12-3456789 | Yes |
| `currency` | (variable) | $1,234.56 | No |

PII-flagged presets automatically set `autocomplete="off"` and add `data-civ-pii` for persistence exclusion.

## Mask Modes

- **`blur`** (default): User types freely without formatting. Mask is applied on blur for display. Accessible and predictable.
- **`live`**: Formats as user types with auto-inserted literals. Has accessibility tradeoffs (cursor jumping).

## Validation Presets

When the `validate` attribute is set, validation runs automatically on blur and sets/clears the error message.

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `civ-input` | `{ value: string }` | Fires on every value change |
| `civ-change` | `{ value: string }` | Fires on committed value change |

## Examples

```html
<!-- Basic text input -->
<civ-text-input
  label="First name"
  name="firstName"
  required
  autocomplete="given-name"
></civ-text-input>

<!-- Email with validation -->
<civ-text-input
  label="Email address"
  name="email"
  type="email"
  validate="email"
  autocomplete="email"
  required
></civ-text-input>

<!-- SSN with mask -->
<civ-text-input
  label="Social Security number"
  name="ssn"
  mask="ssn"
  required
></civ-text-input>

<!-- Phone with mask -->
<civ-text-input
  label="Phone number"
  name="phone"
  type="tel"
  mask="phone-us"
  required
></civ-text-input>

<!-- Custom mask pattern -->
<civ-text-input
  label="Case number"
  name="caseNumber"
  mask-pattern="AAA-####"
></civ-text-input>

<!-- Currency with prefix -->
<civ-text-input
  label="Annual income"
  name="income"
  mask="currency"
></civ-text-input>

<!-- Fixed width -->
<civ-text-input
  label="ZIP code"
  name="zip"
  mask="zip"
  width="xs"
></civ-text-input>
```

## Live Examples

### full-name

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-text-input--default&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### With Hint

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-text-input--with-hint&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### With Error

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-text-input--with-error&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Required

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-text-input--required&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Disabled

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-text-input--disabled&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### All States

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-text-input--all-states&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Density Scale

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-text-input--density-scale&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Width Variants

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-text-input--width-variants&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Input Types

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-text-input--input-types&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Mask: Social Security number

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-text-input--mask-ssn&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Mask: Phone number

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-text-input--mask-phone-us&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Mask: ZIP code

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-text-input--mask-zip&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Mask: Employer Identification Number

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-text-input--mask-ein&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Mask: Currency

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-text-input--mask-currency&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Mask: Custom pattern

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-text-input--mask-custom&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Validate Email

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-text-input--validate-email&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Validate ZIP

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-text-input--validate-zip&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Usage: Government Contact Form

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-text-input--government-contact-form&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

[Open in Storybook →](/civui/storybook/?path=/story/forms-inputs-text-input--default)
