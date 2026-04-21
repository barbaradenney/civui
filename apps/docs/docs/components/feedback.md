---
title: Feedback
sidebar_position: 4
sidebar_label: Feedback
---

# Feedback Components

## civ-progress-bar

A horizontal progress bar for displaying completion percentage.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | `0` | Current progress value (0-100) |
| `label` | `string` | — | Accessible label for the progress bar |
| `status` | `string` | `"default"` | Visual status: `default`, `success`, `error` |

### Example

```html
<civ-progress-bar value="65" label="Application progress"></civ-progress-bar>

<civ-progress-bar value="100" label="Upload complete" status="success"></civ-progress-bar>
```

---

## civ-progress-steps

A step indicator for multi-page forms and workflows. Displays steps as a numbered sequence with current, completed, and error states.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `steps` | `string[]` | `[]` | Array of step labels (JSON attribute) |
| `current` | `number` | `0` | Zero-based index of the current step |
| `show-counter` | `boolean` | `false` | Show "Step X of Y" text |
| `show-back` | `boolean` | `false` | Show a back button |
| `clickable` | `boolean` | `false` | Allow clicking completed steps to navigate |
| `orientation` | `string` | `"horizontal"` | Layout: `horizontal`, `vertical` |
| `error-steps` | `string` | — | Comma-separated indices of steps with errors |

### Example

```html
<civ-progress-steps
  steps='["Personal info", "Address", "Documents", "Review"]'
  current="1"
  show-counter
  clickable>
</civ-progress-steps>

<civ-progress-steps
  steps='["Eligibility", "Details", "Submit"]'
  current="2"
  orientation="vertical"
  error-steps="0">
</civ-progress-steps>
```

---

## civ-alert

An alert banner for displaying informational, warning, error, or success messages.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `string` | `"info"` | Alert type: `info`, `warning`, `error`, `success` |

### Example

```html
<civ-alert variant="info">
  Your application has been received. We will contact you within 5 business days.
</civ-alert>

<civ-alert variant="warning">
  Your session will expire in 5 minutes. Save your progress to avoid losing data.
</civ-alert>

<civ-alert variant="error">
  We could not process your submission. Please try again or contact support.
</civ-alert>

<civ-alert variant="success">
  Your changes have been saved successfully.
</civ-alert>
```
