---
title: Government Patterns
sidebar_position: 7
sidebar_label: Government Patterns
---

# Government Form Patterns

CivUI is designed for government applications. These patterns ensure compliance with Section 508, plain language requirements, and established government form conventions.

## Section 508 Compliance

CivUI components satisfy WCAG 2.1 AA, which meets Section 508 requirements:

1. **Every input must have a visible label.** Never use `placeholder` as the only label.
2. **Required fields** use the `required` attribute -- this renders an asterisk and sets `aria-required="true"`.
3. **Error messages** render with `role="alert"` for immediate screen reader announcement.
4. **Focus management** -- all interactive elements are keyboard accessible. Dialogs trap focus. Groups use roving tabindex.
5. **Color is never the sole indicator.** Errors use text + border, not just red color.
6. **Focus ring** meets WCAG 2.2 SC 2.4.13 -- W3C Two-Color Technique (C40) with 3px outline + 2px offset + halo shadow.

## Plain Language

Government forms must use clear, jargon-free labels:

| Do | Don't |
|----|-------|
| "Date of birth" | "DOB" or "Natal Date" |
| "Social Security number" | "SSN" |
| "For example: January 15 1990" | "Format: MM/DD/YYYY" |
| "Enter your email address" | "This field is required" |

CivUI supports plain language through:

- `label` / `legend` -- use plain language for field labels
- `hint` -- explain what is expected: "For example: January 15 1990"
- `error` -- state what went wrong and how to fix it: "Enter a valid email address"
- `required-message` -- customize the required error with field-specific text

```html
<civ-text-input
  label="Social Security number"
  name="ssn"
  required
  required-message="Enter your Social Security number"
  hint="We need this to verify your identity"
  type="tel"
  inputmode="numeric"
></civ-text-input>
```

## Date Input Rules

| Date Type | Component | Example |
|-----------|-----------|---------|
| Date of birth | `civ-memorable-date` | "When were you born?" |
| Document issue/expiry | `civ-memorable-date` | "Passport expiration date" |
| Appointment scheduling | `civ-date-picker` | "Select your appointment date" |
| Travel dates with range | `civ-date-picker` with `min`/`max` | "Choose a date within the filing period" |

Never use `civ-date-input` -- it is deprecated due to issues with Dragon NaturallySpeaking, VoiceOver on Safari, and TalkBack on Firefox.

Always provide a hint showing the expected format. For memorable-date: "For example: January 15 1990". For date-picker: default placeholder is "mm/dd/yyyy".

## Form Validation

1. **Validate on submit, not on blur** -- government form users often tab through fields to understand the form first.
2. **Error summary at top** -- `civ-form` renders this automatically on validation failure with anchor links to each invalid field.
3. **Field-level errors** -- set the `error` prop on individual fields after server validation.
4. **Custom required messages** -- use `required-message` to provide field-specific instructions.
5. **Progressive disclosure** -- group related fields with `civ-fieldset` and break long forms into logical sections.

## Render Order

All form components follow a consistent render order:

1. Label (or legend for groups)
2. Hint text
3. Error message
4. Form control
5. Supplementary info (character count, file list)

This order ensures screen readers announce context before the user reaches the control.

## Event Conventions

- Fire `civ-input` on every value change, `civ-change` on committed change.
- Single-value detail: `{ value: string }`
- Multi-value detail: `{ values: string[] }` (checkbox-group)
- Boolean controls include `checked`: `{ checked, value }`
- File detail: `{ files: File[] }` (file-upload)
- Never dispatch native `input` or `change` events.

## Bilingual / i18n Support

Most components support label customization for internationalization:

```html
<!-- Spanish date picker -->
<civ-date-picker
  label="Fecha de cita"
  name="appointment"
  locale="es-US"
  choose-date-label="Elegir fecha"
  dialog-label="Elegir fecha"
  previous-month-label="Mes anterior"
  next-month-label="Mes siguiente"
></civ-date-picker>
```

## VA.gov Patterns

For VA-specific form patterns (name, address, SSN, service history, direct deposit, review pages, eligibility screeners, and more), see the VA patterns guide which maps every VA.gov Design System pattern to CivUI components.
