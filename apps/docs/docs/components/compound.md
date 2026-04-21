---
title: Compound Components
sidebar_position: 7
sidebar_label: Compound
---

# Compound Components

Pre-built multi-field components for common government form patterns.

---

## civ-name

A name input group with first, middle, last, and suffix fields.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `legend` | `string` | `"Your name"` | Fieldset legend |
| `name` | `string` | `"name"` | Base name for child fields |
| `required` | `boolean` | `false` | Marks first and last name as required |
| `hint` | `string` | — | Helper text |
| `error` | `string` | — | Error message |

### Required Indicator Logic

The `required` prop marks only the first name and last name fields as required. Middle name and suffix remain optional. The required asterisk does not appear on the legend itself since not all child fields are mandatory.

### Example

```html
<civ-name
  legend="Applicant name"
  name="applicant"
  required
  hint="As it appears on your government-issued ID">
</civ-name>
```

Generates fields: `applicant-first`, `applicant-middle`, `applicant-last`, `applicant-suffix`.

---

## civ-address

A complete address input group with street, city, state, and ZIP fields.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `legend` | `string` | `"Mailing address"` | Fieldset legend |
| `name` | `string` | `"address"` | Base name for child fields |
| `required` | `boolean` | `false` | Marks required fields |
| `hint` | `string` | — | Helper text |
| `error` | `string` | — | Error message |
| `show-country` | `boolean` | `false` | Show country selector |
| `show-military` | `boolean` | `false` | Show military address options (APO/FPO/DPO) |

### Example

```html
<civ-address
  legend="Home address"
  name="home-address"
  required>
</civ-address>

<civ-address
  legend="Overseas mailing address"
  name="mail-address"
  required
  show-country
  show-military>
</civ-address>
```

The component renders: street address line 1, street address line 2 (optional), city, state (select), and ZIP code. When `show-country` is enabled, a country selector appears. When `show-military` is enabled, military address options (APO, FPO, DPO) are available in the state/city fields.

---

## civ-direct-deposit

A direct deposit information group for collecting bank routing number, account number, and account type.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `legend` | `string` | `"Direct deposit information"` | Fieldset legend |
| `name` | `string` | `"direct-deposit"` | Base name for child fields |
| `required` | `boolean` | `false` | Marks all fields as required |
| `hint` | `string` | — | Helper text |
| `error` | `string` | — | Error message |

### Example

```html
<civ-direct-deposit
  legend="Where should we send your payment?"
  name="payment"
  required
  hint="You can find your routing and account numbers on a check or your bank's website.">
</civ-direct-deposit>
```

Generates fields:
- `payment-routing` — 9-digit routing number (with validation)
- `payment-account` — Account number
- `payment-account-type` — Account type (checking/savings radio group)
