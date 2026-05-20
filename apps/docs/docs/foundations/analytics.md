---
title: Analytics
sidebar_position: 11
sidebar_label: Analytics
---

# Analytics

CivUI includes a built-in analytics event system that tracks user interactions without exposing PII. Every interactive component fires a `civ-analytics` custom event that bubbles to the document root, making it easy to wire up any analytics provider with a single listener.

## How it works

1. User interacts with a component (clicks, selects, types, uploads)
2. The component fires `civ-analytics` with a structured payload
3. Your listener at the document root forwards the event to your analytics provider

```js
document.addEventListener('civ-analytics', (e) => {
  const { componentName, action, fieldName, label, timestamp, details } = e.detail;
  // Forward to Google Analytics, Mixpanel, custom backend, etc.
});
```

## Event payload

Every `civ-analytics` event includes this structure:

| Property | Type | Description |
|----------|------|-------------|
| `componentName` | `string` | Tag name (e.g., `'civ-text-input'`, `'civ-select'`) |
| `action` | `string` | What happened (see actions table below) |
| `fieldName` | `string?` | The field's `name` attribute, if set |
| `label` | `string?` | The field's visible label or legend text |
| `timestamp` | `string` | ISO 8601 timestamp |
| `details` | `object?` | Additional context (varies by component) |

### Actions

| Action | Fired by |
|--------|----------|
| `change` | Text inputs, textareas, selects, comboboxes, radios, checkboxes, toggles, date pickers, memorable dates, segmented controls |
| `click` | Buttons, links |
| `submit` | Forms (successful submission) |
| `invalid` | Forms (validation failure) |
| `select` | Combobox option selection |
| `upload` | File upload (file added) |
| `remove` | File upload (file removed) |
| `dismiss` | Alert (dismissed) |
| `expand` | Expandable components |
| `collapse` | Expandable components |

## PII safety

Analytics events **never** include field values. The payload contains the component name, action, field name, and label. Enough to track form completion funnels without capturing what the user typed. This is enforced by the base class implementation and verified by automated tests.

## Opting out

Add `disable-analytics` to any component to suppress its analytics events:

```html
<civ-text-input name="ssn" disable-analytics></civ-text-input>
```

## Integration examples

### Google Analytics

```js
document.addEventListener('civ-analytics', (e) => {
  gtag('event', e.detail.action, {
    event_category: 'form_interaction',
    event_label: `${e.detail.componentName}:${e.detail.fieldName || 'unknown'}`,
  });
});
```

### Custom backend

```js
document.addEventListener('civ-analytics', (e) => {
  navigator.sendBeacon('/api/analytics', JSON.stringify(e.detail));
});
```

### Form funnel tracking

Track how far users get through a multi-step form:

```js
document.addEventListener('civ-analytics', (e) => {
  if (e.detail.componentName === 'civ-form' && e.detail.action === 'submit') {
    trackConversion('form_complete');
  }
  if (e.detail.componentName === 'civ-form' && e.detail.action === 'invalid') {
    trackEvent('form_validation_error');
  }
});
```
