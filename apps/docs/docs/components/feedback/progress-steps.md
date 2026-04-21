---
title: Progress Steps
sidebar_position: 2
sidebar_label: Progress Steps
---

# civ-progress-steps

A step indicator for multi-step forms. Displays current progress with completed, current, and upcoming step states. Responsive: horizontal on desktop, auto-switches to vertical on narrow screens.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `steps` | `string` | `'[]'` | JSON array of step labels or step objects (`{label, description?}`) |
| `current` | `number` | `0` | Current step index (0-based) |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Layout direction |
| `clickable` | `boolean` | `false` | When true, completed steps become clickable buttons |
| `show-counter` | `boolean` | `false` | Show "Step X of Y" text below the steps |
| `error-steps` | `string` | `'[]'` | JSON array of step indices with validation errors |
| `show-back` | `boolean` | `false` | Show a "Go back" link (only visible when `current > 0`) |
| `back-label` | `string` | `'Go back'` | Label text for the back link |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `civ-step-click` | `{ step: number }` | Fired when a completed step is clicked (requires `clickable`) |
| `civ-step-back` | `{ from: number, to: number }` | Fired when the back link is clicked |

## Examples

### Simple steps

```html
<civ-progress-steps
  steps='["Personal Info", "Address", "Review", "Submit"]'
  current="1"
></civ-progress-steps>
```

### With descriptions

```html
<civ-progress-steps
  steps='[{"label":"Personal","description":"Name and DOB"},{"label":"Address","description":"Mailing address"},{"label":"Review"}]'
  current="0"
></civ-progress-steps>
```

### Clickable with counter and back link

```html
<civ-progress-steps
  steps='["Eligibility", "Personal Info", "Documents", "Review"]'
  current="2"
  clickable
  show-counter
  show-back
  back-label="Previous step"
></civ-progress-steps>
```

### Vertical orientation

```html
<civ-progress-steps
  steps='["Step 1", "Step 2", "Step 3", "Step 4"]'
  current="1"
  orientation="vertical"
></civ-progress-steps>
```

### Error steps

```html
<civ-progress-steps
  steps='["Personal Info", "Address", "Documents", "Review"]'
  current="3"
  error-steps="[1]"
></civ-progress-steps>
```

## Live Examples

### Default

<iframe
  src="/civui/storybook/iframe.html?id=forms-patterns-progress-steps--default&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Middle Step

<iframe
  src="/civui/storybook/iframe.html?id=forms-patterns-progress-steps--with-hint&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### With Error Step

<iframe
  src="/civui/storybook/iframe.html?id=forms-patterns-progress-steps--with-error&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### With Counter

<iframe
  src="/civui/storybook/iframe.html?id=forms-patterns-progress-steps--required&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Vertical Orientation

<iframe
  src="/civui/storybook/iframe.html?id=forms-patterns-progress-steps--disabled&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### With Descriptions

<iframe
  src="/civui/storybook/iframe.html?id=forms-patterns-progress-steps--with-descriptions&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Clickable

<iframe
  src="/civui/storybook/iframe.html?id=forms-patterns-progress-steps--clickable&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### All States

<iframe
  src="/civui/storybook/iframe.html?id=forms-patterns-progress-steps--all-states&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Density Scale

<iframe
  src="/civui/storybook/iframe.html?id=forms-patterns-progress-steps--density-scale&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Progress Bar

<iframe
  src="/civui/storybook/iframe.html?id=forms-patterns-progress-steps--progress-bar&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Progress Bar Complete

<iframe
  src="/civui/storybook/iframe.html?id=forms-patterns-progress-steps--progress-bar-complete&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Usage: Multi-Step Application

<iframe
  src="/civui/storybook/iframe.html?id=forms-patterns-progress-steps--government-application-progress&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

[Open in Storybook →](/civui/storybook/?path=/story/forms-patterns-progress-steps--default)
