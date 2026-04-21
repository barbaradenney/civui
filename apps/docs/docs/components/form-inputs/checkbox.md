---
title: Checkbox
sidebar_position: 5
sidebar_label: Checkbox
---

# civ-checkbox and civ-checkbox-group

Accessible checkbox and checkbox group components. Individual checkboxes support tile variants and indeterminate state. The group manages shared state, form participation, and "select all" functionality.

## civ-checkbox

### Shared Props

All form components share these props: `label`, `name`, `value`, `hint`, `error`, `required`, `disabled`.

### Component-Specific Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `checked` | `boolean` | `false` | Whether the checkbox is checked |
| `indeterminate` | `boolean` | `false` | Display indeterminate (mixed) state |
| `tile` | `boolean` | `false` | Tile variant (bordered card style) |
| `description` | `string` | `''` | Description text below the label |

### Events

| Event | Detail | Description |
|-------|--------|-------------|
| `civ-input` | `{ checked: boolean, value: string }` | Fires on change |
| `civ-change` | `{ checked: boolean, value: string }` | Fires on change |

---

## civ-checkbox-group

Groups multiple `civ-checkbox` elements with a shared legend, hint, and error. Uses a native `<fieldset>` for accessibility. The group uses `legend` instead of `label`.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `legend` | `string` | `''` | Group legend text |
| `name` | `string` | `''` | Shared form field name |
| `value` | `string` | `''` | Comma-separated checked values |
| `hint` | `string` | `''` | Hint text below legend |
| `error` | `string` | `''` | Error message for the group |
| `tile` | `boolean` | `false` | Apply tile variant to all child checkboxes |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` | Layout direction |
| `show-select-all` | `boolean` | `false` | Show a "Select all" / "Deselect all" button |
| `max-selections` | `number` | — | Maximum number of checkboxes that can be checked |
| `required` | `boolean` | `false` | Whether at least one selection is required |
| `disabled` | `boolean` | `false` | Disable all child checkboxes |

### Events

| Event | Detail | Description |
|-------|--------|-------------|
| `civ-input` | `{ values: string[] }` | Fires when checked values change |
| `civ-change` | `{ values: string[] }` | Fires when checked values change |

## Examples

```html
<!-- Single checkbox -->
<civ-checkbox
  label="I agree to the terms and conditions"
  name="agree"
  value="yes"
  required
></civ-checkbox>

<!-- Checkbox group -->
<civ-checkbox-group
  legend="Which benefits are you applying for?"
  name="benefits"
  required
>
  <civ-checkbox label="Disability compensation" value="disability"></civ-checkbox>
  <civ-checkbox label="Education benefits" value="education"></civ-checkbox>
  <civ-checkbox label="Health care" value="healthcare"></civ-checkbox>
  <civ-checkbox label="Housing assistance" value="housing"></civ-checkbox>
</civ-checkbox-group>

<!-- Tile variant with descriptions -->
<civ-checkbox-group
  legend="Select your preferred contact methods"
  name="contactMethods"
  tile
>
  <civ-checkbox label="Email" value="email" description="We will send updates to your email address"></civ-checkbox>
  <civ-checkbox label="Text message" value="sms" description="Standard messaging rates may apply"></civ-checkbox>
  <civ-checkbox label="U.S. mail" value="mail" description="Allow 7-10 business days for delivery"></civ-checkbox>
</civ-checkbox-group>

<!-- With select all and max selections -->
<civ-checkbox-group
  legend="Choose up to 3 topics"
  name="topics"
  show-select-all
  max-selections="3"
>
  <civ-checkbox label="Claims" value="claims"></civ-checkbox>
  <civ-checkbox label="Appeals" value="appeals"></civ-checkbox>
  <civ-checkbox label="Records" value="records"></civ-checkbox>
  <civ-checkbox label="Payments" value="payments"></civ-checkbox>
</civ-checkbox-group>
```



## Live Examples

### agree

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-checkbox--default&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Checked

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-checkbox--checked&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### With Description

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-checkbox--with-description&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### With Error

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-checkbox--with-error&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Disabled

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-checkbox--disabled&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Tile Variant

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-checkbox--tile-variant&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Tile Checked

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-checkbox--tile-checked&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Group

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-checkbox--group&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Group With Error

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-checkbox--group-with-error&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Group Tile Variant

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-checkbox--group-tile-variant&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Indeterminate

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-checkbox--indeterminate&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### With Hint

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-checkbox--with-hint&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Group With Name

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-checkbox--group-with-name&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Group Horizontal

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-checkbox--group-horizontal&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Group Disabled

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-checkbox--group-disabled&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Group In Form

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-checkbox--group-in-form&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

[Open in Storybook →](/civui/storybook/?path=/story/forms-inputs-checkbox--default)
