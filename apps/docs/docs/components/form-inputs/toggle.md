---
title: Toggle
sidebar_position: 7
sidebar_label: Toggle
---

# civ-toggle

Accessible toggle switch using `role="switch"` with `aria-checked`. Renders as a button element for proper screen reader compatibility. Use for immediate on/off settings, not for form submissions where a checkbox is more appropriate.

## Shared Props

All form components share these props: `label`, `name`, `value`, `hint`, `error`, `required`, `disabled`.

## Component-Specific Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `checked` | `boolean` | `false` | Whether the toggle is on |
| `description` | `string` | `''` | Description text below the label |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `civ-input` | `{ checked: boolean, value: string }` | Fires on toggle |
| `civ-change` | `{ checked: boolean, value: string }` | Fires on toggle |

## When to Use Toggle vs Checkbox

- **Toggle**: Immediate effect, like enabling/disabling a setting. "Enable notifications"
- **Checkbox**: Collected on submit, like form fields. "I agree to terms"

## Examples

```html
<!-- Basic toggle -->
<civ-toggle
  label="Enable email notifications"
  name="emailNotifications"
  value="enabled"
></civ-toggle>

<!-- With description -->
<civ-toggle
  label="Text message alerts"
  name="smsAlerts"
  value="enabled"
  description="Receive a text message when your claim status changes"
></civ-toggle>

<!-- Required toggle -->
<civ-toggle
  label="I acknowledge this information is correct"
  name="acknowledge"
  value="yes"
  required
></civ-toggle>
```


## Live Example

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-toggle--default&viewMode=story"
  width="100%"
  height="300"
  style={{border: '1px solid #dfe1e2', borderRadius: '6px'}}
></iframe>

[Open in Storybook →](/civui/storybook/?path=/story/forms-inputs-toggle--default)
