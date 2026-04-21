---
title: Form Step
sidebar_position: 1
sidebar_label: Form Step
---

# civ-form-step

Multi-step wizard for navigating within a form chapter. Shows one step at a time, validates required fields before advancing, and renders a compact nav bar with a back link and step counter ("Go back | Step X of Y").

Each direct child element with a `data-step-label` attribute is treated as a step. Only the current step is visible.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `persist` | `string` | `''` | Storage key for auto-saving form data via `civ-form` |
| `continue-label` | `string` | `'Continue'` | Label for the continue button |
| `complete-label` | `string` | `'Save'` | Label for the final step's button |
| `validate` | `boolean` | `true` | Enable built-in required field validation before advancing |
| `nav-disabled` | `boolean` | `false` | Disable navigation buttons (e.g., during async validation) |

## Step Definition

Steps are defined as child elements with `data-step-label`:

```html
<civ-form-step>
  <div data-step-label="Your name">
    <!-- form fields for step 1 -->
  </div>
  <div data-step-label="Date of birth">
    <!-- form fields for step 2 -->
  </div>
</civ-form-step>
```

## Navigation Bar

When there are multiple steps, a compact nav bar is rendered:

- **First step**: Shows only "Step 1 of N"
- **Subsequent steps**: Shows "Go back | Step X of N"

The step counter uses `aria-live="polite"` to announce step changes to screen readers.

## Validation Logic

When `validate` is `true` (default), the component checks all `[required]` fields in the current step before advancing:

1. Calls `reportValidity()` on fields that support it
2. Falls back to checking empty `value` on required fields
3. Sets descriptive error messages on invalid fields
4. Prevents advancement if any field is invalid

## Persistence

When `persist` is set, the component wraps its content in a `civ-form` with the same persist key, enabling auto-save to `sessionStorage`.

## Programmatic API

```js
const stepper = document.querySelector('civ-form-step');

stepper.current;      // Current step index (0-based)
stepper.total;        // Total number of steps
stepper.currentLabel; // Label of the current step

stepper.goToStep(2);  // Navigate to step 3
```

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `civ-step-change` | `{ current: number, total: number, label: string }` | When the step changes |
| `civ-step-back` | `{ from: number, to: number }` | When back is clicked |
| `civ-step-continue` | `{ from: number, to: number }` | When continue is clicked and validation passes |
| `civ-step-complete` | `{ total: number }` | When the last step is completed |

## Examples

```html
<!-- Basic multi-step form -->
<civ-form-step persist="form-21-526ez-personal">
  <div data-step-label="Your name">
    <civ-name legend="Your name" name="fullName" required></civ-name>
  </div>
  <div data-step-label="Date of birth">
    <civ-memorable-date legend="Date of birth" name="dob" required></civ-memorable-date>
  </div>
  <div data-step-label="Contact information">
    <civ-text-input label="Email address" name="email" type="email" validate="email" required></civ-text-input>
    <civ-text-input label="Phone number" name="phone" type="tel" mask="phone-us"></civ-text-input>
  </div>
</civ-form-step>

<!-- Custom button labels -->
<civ-form-step
  continue-label="Next step"
  complete-label="Submit application"
>
  <div data-step-label="Step one">...</div>
  <div data-step-label="Step two">...</div>
</civ-form-step>
```


## Live Example

<iframe
  src="/civui/storybook/iframe.html?id=forms-patterns-form-step--default&viewMode=story"
  width="100%"
  height="300"
  style={{border: '1px solid #dfe1e2', borderRadius: '6px'}}
></iframe>

[Open in Storybook →](/civui/storybook/?path=/story/forms-patterns-form-step--default)
