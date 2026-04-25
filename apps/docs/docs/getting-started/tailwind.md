---
title: Tailwind CSS
sidebar_position: 3
sidebar_label: Tailwind CSS
---

# Tailwind CSS Reference

CivUI uses Tailwind CSS with a `civ-` prefix on all utilities. This prevents conflicts with other CSS frameworks and clearly identifies CivUI styles.

## Prefix

All Tailwind utilities must use the `civ-` prefix:

```html
<!-- Correct -->
<div class="civ-p-4 civ-text-base civ-bg-primary">

<!-- Wrong -- no prefix -->
<div class="p-4 text-base bg-primary">
```

## Semantic Color Classes

| Token | Usage |
|-------|-------|
| `civ-text-primary` / `civ-bg-primary` | Brand primary, links, selected state |
| `civ-text-error` / `civ-bg-error` | Validation errors, required marks |
| `civ-text-warning` / `civ-bg-warning` | Warning messages |
| `civ-text-success` / `civ-bg-success` | Success confirmations |
| `civ-text-info` / `civ-bg-info` | Informational messages |
| `civ-text-base` / `civ-bg-base` | Default text and backgrounds |

Each color has shades: `lightest`, `lighter`, `light`, default, `vivid` (primary only), `dark`, `darker`.

Examples: `civ-bg-error-lighter`, `civ-text-primary-dark`, `civ-border-base-light`.

## Focus Ring

```html
<!-- Standard focus ring (keyboard-only) -->
<button class="focus-visible:civ-focus-ring">Click me</button>

<!-- Inverse variant (for dark backgrounds) -->
<button class="focus-visible:civ-focus-ring-inverse">Click me</button>
```

The focus ring uses the W3C Two-Color Technique: 3px solid outline at 2px offset with a halo shadow for contrast. Always use `focus-visible:` (not `focus:`) for keyboard-only focus indication.

## Component CSS Classes

These classes are used internally by CivUI components:

| Class | Purpose |
|-------|---------|
| `.civ-label` | Standard form label |
| `.civ-legend` | Fieldset legend |
| `.civ-required-mark` | Required asterisk |
| `.civ-hint` | Hint text below label |
| `.civ-error-text` | Error message with `role="alert"` |
| `.civ-input` | Standard form input styling (border, padding, full-width) |
| `.civ-fieldset` | Fieldset reset |
| `.civ-check-input` | Checkbox/radio input |
| `.civ-check-tile` | Tile variant wrapper |
| `.civ-toggle-track` | Toggle switch track |
| `.civ-toggle-thumb` | Toggle switch thumb |
| `.civ-segment-btn` | Segmented control button |
| `.civ-dropzone` | File upload drop area |
| `.civ-combobox-listbox` | Combobox dropdown |
| `.civ-datepicker-dialog` | Date picker calendar dialog |
| `.civ-form-error-summary` | Form error summary box |

## Logical Properties (RTL-Safe)

CivUI provides logical-direction utilities for RTL language support:

- `civ-border-s-4` / `civ-border-e-4` -- inline-start/end border
- `civ-rounded-s` / `civ-rounded-e` -- start/end border radius
- `civ-ms-2` / `civ-me-2` -- inline-start/end margin

## Density System

Switch layout density at any container level:

```html
<!-- Spacious: 1.25x spacing, larger fonts -->
<div data-civ-scale="spacious">...</div>

<!-- Default: standard spacing -->
<div>...</div>

<!-- Dense: 0.75x spacing, smaller fonts -->
<div data-civ-scale="dense">...</div>
```

All CivUI spacing and font-size utilities scale proportionally through CSS custom variables.

## Dark Mode

Dark mode activates via `prefers-color-scheme: dark`. All semantic color tokens have dark-mode overrides. Focus ring colors invert in dark mode automatically.

## Windows High Contrast Mode

Components include `@media (forced-colors: active)` overrides for date pickers, combobox options, checkboxes, toggles, and file uploads.
