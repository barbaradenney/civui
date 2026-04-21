---
title: Form Patterns
sidebar_position: 6
sidebar_label: Form Patterns
---

# Form Pattern Components

## civ-form-step

A multi-step form controller that manages step navigation, validation, focus management, and optional data persistence.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `persist` | `boolean` | `false` | Persist form data to sessionStorage between steps |
| `continue-label` | `string` | `"Continue"` | Label for the continue button |
| `complete-label` | `string` | `"Submit"` | Label for the final step button |
| `validate` | `boolean` | `true` | Validate the current step before advancing |

### Events

| Event | Detail | Description |
|-------|--------|-------------|
| `civ-step-complete` | `{ step, data }` | Fired when the final step is submitted |
| `civ-step-continue` | `{ step, data }` | Fired when advancing to the next step |
| `civ-step-back` | `{ step }` | Fired when navigating to the previous step |
| `civ-step-change` | `{ from, to }` | Fired on any step transition |

### How It Works

Child elements with `data-step-label` define each step. The component renders one step at a time, with navigation buttons.

```html
<civ-form-step persist validate>
  <div data-step-label="Personal information">
    <civ-text-input label="First name" name="first-name" required></civ-text-input>
    <civ-text-input label="Last name" name="last-name" required></civ-text-input>
  </div>

  <div data-step-label="Contact details">
    <civ-text-input label="Email address" name="email" type="email" required validate="email"></civ-text-input>
    <civ-text-input label="Phone number" name="phone" mask="phone-us"></civ-text-input>
  </div>

  <div data-step-label="Review">
    <p>Please review your information before submitting.</p>
  </div>
</civ-form-step>
```

### Validation

When `validate` is enabled, the component validates all required fields in the current step before allowing navigation forward. Invalid fields receive focus and display error messages.

### Focus Management

On step transitions, focus moves to the first heading or first focusable element in the new step, ensuring screen reader users know the context has changed.

---

## civ-form

A form wrapper that provides validation on submit, error summary with anchor links, and optional persistence.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `action` | `string` | — | Form submission URL |
| `method` | `string` | `"post"` | HTTP method |
| `persist` | `boolean` | `false` | Persist data to sessionStorage |

### Events

| Event | Detail | Description |
|-------|--------|-------------|
| `civ-submit` | `{ data: FormData }` | Fired on valid submission |
| `civ-invalid` | `{ errors: [] }` | Fired when validation fails |

### Example

```html
<civ-form action="/api/apply" method="post">
  <civ-text-input label="Full name" name="name" required></civ-text-input>
  <civ-text-input label="Email" name="email" required validate="email"></civ-text-input>
  <civ-button type="submit">Submit</civ-button>
</civ-form>
```

When validation fails, an error summary renders at the top of the form with anchor links to each invalid field.

---

## civ-repeater

An "add another" pattern for collecting repeated groups of fields (e.g., multiple addresses, employment history).

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `legend` | `string` | — | Group legend |
| `min` | `number` | `1` | Minimum number of entries |
| `max` | `number` | — | Maximum number of entries |
| `add-label` | `string` | `"Add another"` | Label for the add button |
| `remove-label` | `string` | `"Remove"` | Label for remove buttons |

### Example

```html
<civ-repeater legend="Previous employers" max="5" add-label="Add another employer">
  <template>
    <civ-text-input label="Employer name" name="employer-name" required></civ-text-input>
    <civ-text-input label="Job title" name="job-title" required></civ-text-input>
    <civ-memorable-date label="Start date" name="start-date"></civ-memorable-date>
    <civ-memorable-date label="End date" name="end-date"></civ-memorable-date>
  </template>
</civ-repeater>
```

---

## civ-summary

A review/summary page that displays all collected form data for user confirmation before final submission.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `object` | — | Form data to display |
| `editable` | `boolean` | `true` | Show "Change" links for each section |
| `edit-label` | `string` | `"Change"` | Label for edit links |

### Example

```html
<civ-summary editable>
  <civ-summary-row label="Full name" value="Jane Smith" href="#name"></civ-summary-row>
  <civ-summary-row label="Email" value="jane@example.gov" href="#email"></civ-summary-row>
  <civ-summary-row label="Date of birth" value="March 15, 1985" href="#dob"></civ-summary-row>
</civ-summary>
```

---

## civ-signature

A signature capture component supporting multiple input modes.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Label text |
| `name` | `string` | — | Form field name |
| `mode` | `string` | `"typed"` | Input mode: `typed`, `drawn`, `checkbox` |
| `required` | `boolean` | `false` | Whether signature is required |
| `error` | `string` | — | Error message |
| `legal-text` | `string` | — | Legal attestation text shown above the input |

### Example

```html
<civ-signature
  label="Your signature"
  name="signature"
  mode="typed"
  legal-text="By signing, I certify that the information provided is true and correct."
  required>
</civ-signature>

<civ-signature
  label="Acknowledgment"
  name="acknowledge"
  mode="checkbox"
  legal-text="I agree to the terms and conditions of this application."
  required>
</civ-signature>
```
