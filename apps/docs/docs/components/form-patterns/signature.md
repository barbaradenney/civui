---
title: Signature
sidebar_position: 5
sidebar_label: Signature
---

# civ-signature

Statement of truth component for form submission. Renders a certification statement, a full name text input (with autocomplete), and a certification checkbox. Used at the end of a review page before final submission.

## Shared Props

All form components share these props: `label`, `name`, `value`, `hint`, `error`, `required`, `disabled`.

## Component-Specific Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `legend` | `string` | `''` | Fieldset legend text |
| `statement` | `string` | `''` | Certification statement text displayed above fields |
| `name-error` | `string` | `''` | Error message for the name field |
| `certify-error` | `string` | `''` | Error message for the certification checkbox |

## Value Structure

The component stores its value as a JSON string:

```typescript
interface SignatureValue {
  name: string;       // Full name typed by user
  certified: boolean; // Whether the certification checkbox is checked
}
```

## Form Data

The component submits as two fields:
- `{name}.name` - The typed full name
- `{name}.certified` - `'true'` or `'false'`

## Programmatic API

```js
const sig = document.querySelector('civ-signature');

sig.signatureValue;  // { name: 'Jane Doe', certified: true }
sig.isComplete;      // true if name is filled and checkbox is checked
```

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `civ-input` | `{ value: SignatureValue }` | Fires on every field change |
| `civ-change` | `{ value: SignatureValue }` | Fires on committed field change |

## Examples

```html
<!-- Basic signature -->
<civ-signature
  legend="Statement of truth"
  name="signature"
  statement="I certify that the information I have provided is true and correct to the best of my knowledge."
  required
></civ-signature>

<!-- With custom statement -->
<civ-signature
  legend="Certification"
  name="certification"
  statement="By signing below, I confirm that I am authorized to submit this form on behalf of the applicant."
  required
></civ-signature>
```
