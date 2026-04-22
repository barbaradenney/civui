---
title: Validation
sidebar_position: 1
sidebar_label: Validation
---

# Validation

CivUI provides 15 built-in validators via `validate` from `@civui/core`. Each returns `{ valid: boolean, error?: string }`.

## Available Validators

| Validator | Description |
|-----------|-------------|
| `required` | Value is not empty |
| `email` | Valid email address |
| `phone` | US phone number |
| `phoneIntl` | International phone number |
| `ssn` | Social Security number |
| `ein` | Employer Identification Number |
| `zip` | 5-digit ZIP code |
| `zip4` | ZIP+4 code |
| `usState` | US state abbreviation |
| `isoDate` | ISO 8601 date (YYYY-MM-DD) |
| `url` | Valid URL |
| `currency` | Currency amount |
| `range` | Numeric range |
| `length` | String length range |
| `alphanumeric` | Letters and numbers only |

## Declarative Usage

Set the `validate` attribute on form components to auto-validate on submit:

```html
<civ-text-input label="Email" name="email" validate="email" required></civ-text-input>
<civ-text-input label="SSN" name="ssn" validate="ssn" required></civ-text-input>
<civ-text-input label="ZIP code" name="zip" validate="zip" required></civ-text-input>
```

When the `validate` attribute is set, validation runs automatically and sets or clears the error message on the field.

## Programmatic Usage

```javascript
import { validate } from '@civui/core';

const result = validate.email('user@example.com');
// { valid: true }

const bad = validate.ssn('000-12-3456');
// { valid: false, error: 'Enter a valid Social Security number' }
```

## Form-Level Validation

`<civ-form>` coordinates validation across all its child fields:

1. **Validate on submit, not on blur** -- government form users often tab through fields to understand the form first.
2. **Error summary at top** -- `civ-form` renders an error summary automatically on validation failure with anchor links to each invalid field.
3. **Field-level errors** -- set the `error` prop on individual fields after server validation.
4. **Custom required messages** -- use `required-message` to provide field-specific instructions instead of generic "This field is required".

```html
<civ-form @civ-submit="${handleSubmit}" @civ-invalid="${handleErrors}">
  <civ-text-input label="Full name" name="name" required
    required-message="Enter your full name"></civ-text-input>
  <civ-text-input label="Email" name="email" type="email" required
    validate="email"></civ-text-input>
  <button type="submit">Submit</button>
</civ-form>
```

## Server-Side Validation

After server validation, set errors on individual fields:

```javascript
async function handleSubmit(e) {
  const response = await fetch('/api/submit', {
    method: 'POST',
    body: JSON.stringify(e.detail.formData)
  });

  if (!response.ok) {
    const { errors } = await response.json();
    for (const err of errors) {
      const field = document.querySelector(`[name="${CSS.escape(err.field)}"]`);
      if (field) field.error = err.message;
    }
  }
}

// Clear errors before re-submit
formEl.clearErrors();
```

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `civ-submit` | `{ formData: Record<string, string> }` | Fires on valid submission |
| `civ-invalid` | `{ errors: FormFieldError[] }` | Fires on validation failure; each error has `name`, `message`, `element` |
