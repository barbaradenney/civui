---
title: Conditional
sidebar_position: 6
sidebar_label: Conditional
---

# civ-conditional

A declarative show/hide wrapper that reveals its content only when a named field has a specified value. Listens for `civ-input` and `civ-change` events scoped to the nearest form ancestor for performance.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `when` | `string` | `''` | The `name` of the field to watch |
| `equals` | `string` | `''` | Show content when the field value matches this |
| `not-equals` | `string` | `''` | Show content when the field value does NOT match this |

## Behavior

- Content starts hidden
- The component listens for `civ-input` events from the field matching the `when` name
- When the condition is met, content is revealed with `aria-live="polite"` for screen reader announcement
- When the condition is no longer met, content is hidden
- Uses CSS transitions for smooth show/hide

## Event Scoping

For performance, event listeners are scoped to the nearest ancestor:
1. `civ-form`
2. Native `<form>`
3. `civ-fieldset`
4. Native `<fieldset>`
5. `document` (fallback)

## Examples

```html
<!-- Show follow-up question when "Yes" is selected -->
<civ-yes-no
  legend="Do you have a service-connected disability?"
  name="hasDisability"
  required
></civ-yes-no>

<civ-conditional when="hasDisability" equals="yes">
  <civ-text-input
    label="Describe your disability"
    name="disabilityDescription"
    required
  ></civ-text-input>
</civ-conditional>

<!-- Show section when a specific option is NOT selected -->
<civ-select
  label="Country of residence"
  name="country"
></civ-select>

<civ-conditional when="country" not-equals="US">
  <civ-text-input
    label="International phone number"
    name="intlPhone"
    type="tel"
  ></civ-text-input>
</civ-conditional>

<!-- Chain multiple conditionals -->
<civ-radio-group legend="Employment status" name="employment">
  <civ-radio label="Employed" value="employed"></civ-radio>
  <civ-radio label="Self-employed" value="self-employed"></civ-radio>
  <civ-radio label="Unemployed" value="unemployed"></civ-radio>
  <civ-radio label="Retired" value="retired"></civ-radio>
</civ-radio-group>

<civ-conditional when="employment" equals="employed">
  <civ-text-input label="Employer name" name="employer" required></civ-text-input>
</civ-conditional>

<civ-conditional when="employment" equals="self-employed">
  <civ-text-input label="Business name" name="businessName" required></civ-text-input>
</civ-conditional>
```



## Live Examples

### Default

<iframe
  src="/civui/storybook/iframe.html?id=forms-layout-conditional--default&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Not Equals

<iframe
  src="/civui/storybook/iframe.html?id=forms-layout-conditional--not-equals&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Multiple Conditions

<iframe
  src="/civui/storybook/iframe.html?id=forms-layout-conditional--multiple-conditions&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### With Form

<iframe
  src="/civui/storybook/iframe.html?id=forms-layout-conditional--with-form&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

[Open in Storybook →](/civui/storybook/?path=/story/forms-layout-conditional--default)
