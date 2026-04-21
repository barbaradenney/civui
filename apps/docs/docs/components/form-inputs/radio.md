---
title: Radio
sidebar_position: 6
sidebar_label: Radio
---

# civ-radio and civ-radio-group

Accessible radio button group implementing the WAI-ARIA Radio Group pattern with roving tabindex. Individual radio buttons support tile variants and descriptions.

## civ-radio

Child element used within `civ-radio-group`. Not usable standalone.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `''` | Radio label text |
| `value` | `string` | `''` | Form submission value when selected |
| `description` | `string` | `''` | Description text below the label |
| `checked` | `boolean` | `false` | Whether this radio is selected (managed by parent) |
| `tile` | `boolean` | `false` | Tile variant (managed by parent) |
| `disabled` | `boolean` | `false` | Whether the radio is disabled |

---

## civ-radio-group

Groups multiple `civ-radio` elements with mutual exclusivity, roving tabindex keyboard navigation, and shared form participation. Uses `legend` instead of `label`.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `legend` | `string` | `''` | Group legend text |
| `name` | `string` | `''` | Shared form field name |
| `value` | `string` | `''` | Currently selected value |
| `hint` | `string` | `''` | Hint text below legend |
| `error` | `string` | `''` | Error message for the group |
| `tile` | `boolean` | `false` | Apply tile variant to all child radios |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` | Layout direction |
| `required` | `boolean` | `false` | Whether a selection is required |
| `disabled` | `boolean` | `false` | Disable all child radios |

### Keyboard Navigation

| Key | Action |
|-----|--------|
| Arrow Down / Arrow Right | Move to next radio |
| Arrow Up / Arrow Left | Move to previous radio |
| Home | Move to first radio |
| End | Move to last radio |

Selection follows focus (WAI-ARIA pattern). RTL direction is automatically detected and arrow keys are reversed.

### Events

| Event | Detail | Description |
|-------|--------|-------------|
| `civ-input` | `{ value: string }` | Fires when selection changes |
| `civ-change` | `{ value: string }` | Fires when selection changes |

## Examples

```html
<!-- Basic radio group -->
<civ-radio-group
  legend="What is your relationship to the Veteran?"
  name="relationship"
  required
>
  <civ-radio label="Veteran" value="veteran"></civ-radio>
  <civ-radio label="Spouse" value="spouse"></civ-radio>
  <civ-radio label="Child" value="child"></civ-radio>
  <civ-radio label="Parent" value="parent"></civ-radio>
</civ-radio-group>

<!-- Tile variant with descriptions -->
<civ-radio-group
  legend="How would you like to receive your decision?"
  name="deliveryMethod"
  tile
  required
>
  <civ-radio label="Online" value="online" description="View your decision in your account immediately"></civ-radio>
  <civ-radio label="U.S. mail" value="mail" description="Receive a printed copy in 7-10 business days"></civ-radio>
</civ-radio-group>

<!-- Horizontal layout -->
<civ-radio-group
  legend="Preferred language"
  name="language"
  orientation="horizontal"
>
  <civ-radio label="English" value="en"></civ-radio>
  <civ-radio label="Spanish" value="es"></civ-radio>
</civ-radio-group>
```

## Live Examples

### contact

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-radio--default&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### With Hint

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-radio--with-hint&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### With Error

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-radio--with-error&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Required

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-radio--required&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Disabled

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-radio--disabled&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### All States

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-radio--all-states&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Density Scale

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-radio--density-scale&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Tile Variant

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-radio--tile-variant&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Horizontal

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-radio--horizontal&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### With Descriptions

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-radio--with-descriptions&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Usage: Eligibility Questions

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-radio--government-eligibility-form&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

[Open in Storybook →](/civui/storybook/?path=/story/forms-inputs-radio--default)
