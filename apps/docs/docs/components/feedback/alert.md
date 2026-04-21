---
title: Alert
sidebar_position: 3
sidebar_label: Alert
---

# civ-alert

An accessible alert component for informational, warning, error, or success messages. Supports a heading, dismissible close button, and slim (compact) variant.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'info' \| 'warning' \| 'error' \| 'success'` | `'info'` | Alert type (sets colors and ARIA role) |
| `alert-style` | `'primary' \| 'secondary' \| 'tertiary'` | `'secondary'` | Visual treatment/emphasis |
| `heading` | `string` | `''` | Optional heading text |
| `heading-level` | `2 \| 3 \| 4 \| 5 \| 6` | `4` | Heading element level for accessibility |
| `label` | `string` | `''` | Body text (preferred over child text) |
| `dismissible` | `boolean` | `false` | Shows close button |
| `slim` | `boolean` | `false` | Compact single-line variant (no heading) |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `civ-dismiss` | — | Fired when close button is clicked (cancelable) |
| `civ-analytics` | — | Analytics tracking event on dismiss |

## Accessibility

- `variant="error"` sets `role="alert"` (assertive announcement)
- All other variants set `role="status"` (polite announcement)
- Heading uses `role="heading"` with appropriate `aria-level`
- Dismissal announces a confirmation message to screen readers

## Examples

### Info alert

```html
<civ-alert
  variant="info"
  heading="Scheduled maintenance"
  label="The system will be unavailable Saturday from 2:00 AM to 6:00 AM ET."
></civ-alert>
```

### Error alert

```html
<civ-alert
  variant="error"
  heading="There is a problem"
  label="Your session has expired. Please sign in again to continue."
></civ-alert>
```

### Success alert

```html
<civ-alert
  variant="success"
  heading="Application submitted"
  label="Your claim has been received. You will get a confirmation email within 24 hours."
></civ-alert>
```

### Warning alert

```html
<civ-alert
  variant="warning"
  heading="Unsaved changes"
  label="You have unsaved changes. If you leave this page, your progress will be lost."
></civ-alert>
```

### Dismissible alert

```html
<civ-alert
  variant="info"
  heading="New feature available"
  label="You can now upload documents directly from your phone."
  dismissible
></civ-alert>
```

### Slim (compact) variant

```html
<civ-alert variant="success" slim label="Your changes have been saved."></civ-alert>
```

### Primary style (high emphasis)

```html
<civ-alert
  variant="error"
  alert-style="primary"
  heading="Service unavailable"
  label="We are experiencing technical difficulties. Please try again later."
></civ-alert>
```
