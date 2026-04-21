---
title: Segmented Control
sidebar_position: 8
sidebar_label: Segmented Control
---

# civ-segmented-control and civ-segment

A segmented control (button-style radio group) that provides a compact single-select interface. Implements WAI-ARIA radiogroup semantics with roving tabindex keyboard navigation.

## civ-segmented-control

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `legend` | `string` | `''` | Accessible label for the control (rendered as sr-only legend) |
| `name` | `string` | `''` | Form field name |
| `value` | `string` | `''` | Currently selected segment value |
| `hint` | `string` | `''` | Hint text |
| `error` | `string` | `''` | Error message |
| `required` | `boolean` | `false` | Whether a selection is required |
| `disabled` | `boolean` | `false` | Disable all segments |

### Events

| Event | Detail | Description |
|-------|--------|-------------|
| `civ-input` | `{ value: string }` | Fires when selection changes |
| `civ-change` | `{ value: string }` | Fires when selection changes |

---

## civ-segment

Individual segment option. Must be used as a child of `civ-segmented-control`.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `''` | Segment label text |
| `value` | `string` | `''` | Value when this segment is selected |
| `disabled` | `boolean` | `false` | Whether this segment is disabled |

## Keyboard Navigation

| Key | Action |
|-----|--------|
| Arrow Right | Move to next segment |
| Arrow Left | Move to previous segment |
| Home | Move to first segment |
| End | Move to last segment |

Selection follows focus. RTL direction is automatically handled.

## Examples

```html
<!-- View toggle -->
<civ-segmented-control legend="View" name="view" value="list">
  <civ-segment label="List" value="list"></civ-segment>
  <civ-segment label="Grid" value="grid"></civ-segment>
</civ-segmented-control>

<!-- Status filter -->
<civ-segmented-control legend="Filter by status" name="status" value="all">
  <civ-segment label="All" value="all"></civ-segment>
  <civ-segment label="Active" value="active"></civ-segment>
  <civ-segment label="Closed" value="closed"></civ-segment>
</civ-segmented-control>
```



## Live Examples

### view

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-segmented-control--default&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### With Preselection

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-segmented-control--with-preselection&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Three Options

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-segmented-control--three-options&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Five Options

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-segmented-control--five-options&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### With Hint

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-segmented-control--with-hint&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### With Error

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-segmented-control--with-error&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Disabled

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-segmented-control--disabled&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### In Form

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-segmented-control--in-form&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

[Open in Storybook →](/civui/storybook/?path=/story/forms-inputs-segmented-control--default)
