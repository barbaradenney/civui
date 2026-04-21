---
title: Direct Deposit
sidebar_position: 3
sidebar_label: Direct Deposit
---

# civ-direct-deposit

Compound financial input for collecting bank account information. Includes account type (checking/savings radio group), routing number, and account number fields. Follows the VA.gov direct deposit pattern.

## Shared Props

All form components share these props: `name`, `value`, `hint`, `error`, `required`, `disabled`.

## Component-Specific Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `legend` | `string` | `''` | Fieldset legend text |
| `routing-error` | `string` | `''` | Error message for routing number field |
| `account-error` | `string` | `''` | Error message for account number field |
| `type-error` | `string` | `''` | Error message for account type radio group |

## Value Structure

The component stores its value as a JSON string:

```typescript
interface DirectDepositValue {
  accountType: 'checking' | 'savings' | '';
  routingNumber: string;
  accountNumber: string;
}
```

## Form Data

The component submits as separate fields:
- `{name}.accountType` - `'checking'` or `'savings'`
- `{name}.routingNumber` - 9-digit routing number
- `{name}.accountNumber` - Account number (variable length)

## Sub-fields

| Field | Type | Details |
|-------|------|---------|
| Account type | Radio group | Checking / Savings |
| Routing number | Text input | `inputmode="numeric"`, max 9 digits, with hint text |
| Account number | Text input | `inputmode="numeric"`, with hint text |

## Programmatic API

```js
const deposit = document.querySelector('civ-direct-deposit');
deposit.depositValue; // { accountType: 'checking', routingNumber: '123456789', accountNumber: '9876543210' }
```

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `civ-input` | `{ value: DirectDepositValue }` | Fires on every field change |
| `civ-change` | `{ value: DirectDepositValue }` | Fires on committed field change |

## Examples

```html
<!-- Basic direct deposit -->
<civ-direct-deposit
  legend="Direct deposit information"
  name="bankInfo"
  hint="We will deposit your payments directly into your bank account."
  required
></civ-direct-deposit>

<!-- With server-side validation errors -->
<civ-direct-deposit
  legend="Payment information"
  name="payment"
  routing-error="Routing number must be 9 digits"
  required
></civ-direct-deposit>
```

## Live Examples

### bank

<iframe
  src="/civui/storybook/iframe.html?id=forms-compound-direct-deposit--default&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Prefilled

<iframe
  src="/civui/storybook/iframe.html?id=forms-compound-direct-deposit--with-hint&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### With Error

<iframe
  src="/civui/storybook/iframe.html?id=forms-compound-direct-deposit--with-error&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Required

<iframe
  src="/civui/storybook/iframe.html?id=forms-compound-direct-deposit--required&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Disabled

<iframe
  src="/civui/storybook/iframe.html?id=forms-compound-direct-deposit--disabled&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### All States

<iframe
  src="/civui/storybook/iframe.html?id=forms-compound-direct-deposit--all-states&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Density Scale

<iframe
  src="/civui/storybook/iframe.html?id=forms-compound-direct-deposit--density-scale&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Usage: Benefit Payment Setup

<iframe
  src="/civui/storybook/iframe.html?id=forms-compound-direct-deposit--government-payment-setup&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

[Open in Storybook →](/civui/storybook/?path=/story/forms-compound-direct-deposit--default)
