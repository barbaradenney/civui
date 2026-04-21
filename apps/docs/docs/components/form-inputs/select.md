---
title: Select
sidebar_position: 3
sidebar_label: Select
---

# civ-select

Accessible dropdown select using a native `<select>` element for maximum accessibility and mobile compatibility. Supports grouped options via `optgroup`.

## Shared Props

All form components share these props: `label`, `name`, `value`, `hint`, `error`, `required`, `disabled`.

## Component-Specific Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `Array<{ value: string, label: string, disabled?: boolean, group?: string }>` | `[]` | Array of options to render |
| `empty-label` | `string` | `'- Select -'` | Label for the empty/default option |

## Option Groups

Options with a `group` property are rendered inside `<optgroup>` elements. Ungrouped options appear before any groups.

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `civ-input` | `{ value: string }` | Fires when selection changes |
| `civ-change` | `{ value: string }` | Fires when selection changes |

## Examples

```html
<!-- Basic select -->
<civ-select
  label="Branch of service"
  name="branch"
  required
></civ-select>

<script>
  document.querySelector('civ-select').options = [
    { value: 'army', label: 'Army' },
    { value: 'navy', label: 'Navy' },
    { value: 'airforce', label: 'Air Force' },
    { value: 'marines', label: 'Marine Corps' },
    { value: 'coastguard', label: 'Coast Guard' },
    { value: 'spaceforce', label: 'Space Force' },
  ];
</script>

<!-- With grouped options -->
<civ-select
  label="Document type"
  name="docType"
  empty-label="Choose a document type"
></civ-select>

<script>
  document.querySelector('[name="docType"]').options = [
    { value: 'dd214', label: 'DD214', group: 'Military' },
    { value: 'dd215', label: 'DD215', group: 'Military' },
    { value: 'passport', label: 'Passport', group: 'Identity' },
    { value: 'license', label: 'Driver\'s license', group: 'Identity' },
  ];
</script>
```



## Live Examples

### state

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-select--default&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### With Hint

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-select--with-hint&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### With Error

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-select--with-error&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Required

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-select--required&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Disabled

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-select--disabled&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### With Disabled Options

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-select--with-disabled-options&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Option Groups

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-select--option-groups&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### In Native Form

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-select--in-native-form&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

[Open in Storybook →](/civui/storybook/?path=/story/forms-inputs-select--default)
