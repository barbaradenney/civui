---
title: Progress Bar
sidebar_position: 1
sidebar_label: Progress Bar
---

# civ-progress-bar

A percentage-based progress indicator for dynamic forms where the number of steps is not fixed. Shows a filled bar with percentage label and optional status text.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | `0` | Current progress percentage (0-100, clamped) |
| `label` | `string` | `'Progress'` | Accessible label for the progress bar (`aria-label`) |
| `status` | `string` | `''` | Optional status text displayed above the bar |
| `show-percent` | `boolean` | `true` | Show percentage text |

## Accessibility

Renders with `role="progressbar"`, `aria-valuenow`, `aria-valuemin="0"`, and `aria-valuemax="100"`.

## Examples

### Basic progress bar

```html
<civ-progress-bar value="45" label="Application progress"></civ-progress-bar>
```

### With status text

```html
<civ-progress-bar
  value="37"
  label="Form completion"
  status="3 of 8 sections complete"
></civ-progress-bar>
```

### Complete state

```html
<civ-progress-bar value="100" label="Upload complete" status="All files uploaded"></civ-progress-bar>
```

### Without percentage text

```html
<civ-progress-bar value="60" label="Loading" show-percent="false"></civ-progress-bar>
```
