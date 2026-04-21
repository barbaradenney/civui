---
title: Textarea
sidebar_position: 2
sidebar_label: Textarea
---

# civ-textarea

Multi-line text input with optional character count and word count display. Uses ElementInternals for native form participation.

## Shared Props

All form components share these props: `label`, `name`, `value`, `hint`, `error`, `required`, `disabled`.

## Component-Specific Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `rows` | `number` | `5` | Number of visible text rows |
| `maxlength` | `number` | — | Maximum character length (enables character count display) |
| `maxwords` | `number` | — | Maximum word count (enables word count display, mutually exclusive with maxlength counter) |
| `placeholder` | `string` | `''` | Placeholder text |
| `autogrow` | `boolean` | `false` | Whether the textarea auto-grows to fit content |
| `max-height` | `string` | `''` | Maximum height for autogrow (CSS value, e.g., `'300px'`) |

## Character Count

When `maxlength` is set, a character count indicator appears below the textarea showing remaining characters. The count updates visually on every keystroke, but screen reader announcements are debounced (1 second) to avoid spamming.

## Word Count

When `maxwords` is set (and `maxlength` is not), a word count indicator appears. If the user exceeds the limit, an error state is shown automatically.

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `civ-input` | `{ value: string }` | Fires on every value change |
| `civ-change` | `{ value: string }` | Fires on committed value change (blur) |

## Examples

```html
<!-- Basic textarea -->
<civ-textarea
  label="Describe your symptoms"
  name="symptoms"
  hint="Include when they started and how often they occur."
  required
></civ-textarea>

<!-- With character count -->
<civ-textarea
  label="Additional comments"
  name="comments"
  maxlength="500"
  hint="You have 500 characters available."
></civ-textarea>

<!-- With word count -->
<civ-textarea
  label="Personal statement"
  name="statement"
  maxwords="250"
></civ-textarea>

<!-- Auto-growing textarea -->
<civ-textarea
  label="Notes"
  name="notes"
  rows="3"
  autogrow
  max-height="400px"
></civ-textarea>
```

## Live Examples

### comments

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-textarea--default&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### With Hint

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-textarea--with-hint&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### With Error

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-textarea--with-error&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Required

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-textarea--required&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Disabled

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-textarea--disabled&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### With Character Count

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-textarea--with-character-count&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### With Word Count

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-textarea--with-word-count&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### All States

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-textarea--all-states&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Density Scale

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-textarea--density-scale&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Usage: Appeal Justification

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-textarea--government-appeal-form&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

[Open in Storybook →](/civui/storybook/?path=/story/forms-inputs-textarea--default)
