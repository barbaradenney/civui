---
title: Colors
sidebar_position: 2
sidebar_label: Colors
---

import StoryEmbed from "@site/src/components/StoryEmbed";

# Colors

CivUI uses semantic color tokens inspired by USWDS. All colors meet WCAG AA contrast requirements and support dark mode via `prefers-color-scheme`.

## Color Swatches

### All Colors

<StoryEmbed id="foundations-colors--all-colors" />

### Semantic Usage

<StoryEmbed id="foundations-colors--semantic-usage" />

[Open in Storybook →](pathname:///civui/storybook/?path=/story/foundations-colors--all-colors)

## Semantic palette

Use semantic colors based on meaning, not appearance. All are available as Tailwind utilities with the `civ-` prefix for text (`civ-text-*`), background (`civ-bg-*`), and border (`civ-border-*`).

### Primary

Brand color for links, selected states, and primary actions.

| Shade | Value | Class |
|-------|-------|-------|
| Lightest | `#d9e8f6` | `civ-bg-primary-lightest` |
| Lighter | `#73b3e7` | `civ-bg-primary-lighter` |
| Light | `#2378c3` | `civ-bg-primary-light` |
| **Default** | **`#005ea2`** | `civ-bg-primary` |
| Dark | `#1a4480` | `civ-bg-primary-dark` |
| Darker | `#162e51` | `civ-bg-primary-darker` |
| Darkest | `#0d1f38` | `civ-text-primary-darkest` (AAA / hero) |

### Error

Validation errors, required field marks, and destructive actions.

| Shade | Value | Class |
|-------|-------|-------|
| Lightest | `#faf0f0` | `civ-bg-error-lightest` |
| Lighter | `#f4caca` | `civ-bg-error-lighter` |
| Light | `#d63e04` | `civ-bg-error-light` |
| **Default** | **`#b50909`** | `civ-bg-error` |
| Dark | `#8b0a03` | `civ-bg-error-dark` |
| Darkest | `#5a0602` | `civ-text-error-darkest` (AAA / hero) |

### Warning

Caution messages and alerts that need attention but aren't errors.

| Shade | Value | Class |
|-------|-------|-------|
| Lightest | `#faf3d1` | `civ-bg-warning-lightest` (softest surface) |
| Lighter | `#fcedb7` | `civ-bg-warning-lighter` (stronger soft bg) |
| Light | `#fee685` | `civ-bg-warning-light` |
| **Default** | **`#e5a000`** | `civ-bg-warning` |
| Dark | `#936f38` | `civ-bg-warning-dark` |
| Darkest | `#6b4c11` | `civ-text-warning-darkest` (AA text on lightest) |

### Success

Confirmations and completed states.

| Shade | Value | Class |
|-------|-------|-------|
| Lightest | `#ecf3ec` | `civ-bg-success-lightest` (softest surface) |
| Lighter | `#b8e6b8` | `civ-bg-success-lighter` (stronger soft bg) |
| Light | `#70e17b` | `civ-bg-success-light` |
| **Default** | **`#00a91c`** | `civ-bg-success` |
| Dark | `#4d8055` | `civ-bg-success-dark` |
| Darkest | `#1a4d1a` | `civ-text-success-darkest` (AA text on lightest) |

### Info

Informational messages and neutral highlights.

| Shade | Value | Class |
|-------|-------|-------|
| Lightest | `#e7f6f8` | `civ-bg-info-lightest` (softest surface) |
| Lighter | `#c5ecf2` | `civ-bg-info-lighter` (stronger soft bg) |
| Light | `#99deea` | `civ-bg-info-light` |
| **Default** | **`#00bde3`** | `civ-bg-info` |
| Dark | `#2e6276` | `civ-bg-info-dark` |
| Darkest | `#1d4554` | `civ-text-info-darkest` (AAA / hero) |

### Base

Default text, backgrounds, borders, and neutral elements.

| Shade | Value | Class |
|-------|-------|-------|
| Lightest | `#f0f0f0` | `civ-bg-base-lightest` |
| Lighter | `#dfe1e2` | `civ-bg-base-lighter` |
| Light | `#a9aeb1` | `civ-bg-base-light` |
| **Default** | **`#71767a`** | `civ-bg-base` |
| Dark | `#565c65` | `civ-bg-base-dark` |
| Darker | `#3d4551` | `civ-bg-base-darker` |
| Darkest | `#1b1b1b` | `civ-bg-base-darkest` |

### Focus indicator

The focus ring is **not** a primary-color tint — it has dedicated tokens in `packages/tokens/src/focus.tokens.json`. CivUI uses the [W3C Two-Color Technique (C40)](https://www.w3.org/WAI/WCAG22/Techniques/css/C40): a dark band sits flush against the element and a yellow halo extends past it, so the indicator stays visible on **any** background (light, dark, or a colored surface). This satisfies WCAG 2.2 SC 2.4.13 (Focus Appearance).

| Role | Value | CSS custom property |
|------|-------|---------------------|
| Outline — yellow halo | `#face00` | `var(--civ-focus-outline-color)` |
| Shadow — dark band | `#0b0c0c` | `var(--civ-focus-shadow-color)` |
| Outline width | `3px` | `var(--civ-focus-outline-width)` |
| Halo spread | `3px` | `var(--civ-focus-shadow-spread)` |

You **do not** add a class to get the ring — render a real `<button>`, `<a href>`, or `<input>` and `civ.css` applies it on `:focus` (it triggers on click as well as keyboard, matching the GOV.UK pattern). For dark backgrounds where the dark band would disappear, opt into the inverted treatment with `focus-visible:civ-focus-ring-inverse`.

## Usage patterns

### Text

```html
<p class="civ-text-primary">Primary colored text</p>
<p class="civ-text-error">Error message text</p>
<p class="civ-text-base-dark">Secondary body text</p>
<p class="civ-text-base-darkest">Default body text</p>
```

### Backgrounds

```html
<div class="civ-bg-primary-lightest civ-p-4">Info panel</div>
<div class="civ-bg-error-lightest civ-p-4">Error summary</div>
<div class="civ-bg-success-lightest civ-p-4">Success banner</div>
```

### Borders

```html
<div class="civ-border-primary civ-border-s-4 civ-p-4">Highlighted section</div>
<div class="civ-border-error civ-border-s-4 civ-p-4">Error field</div>
<div class="civ-border-base-light civ-border civ-p-4">Default container</div>
```

## Component color usage

| Context | Token | Example classes |
|---------|-------|-----------------|
| Page text | `base-darkest` | `civ-text-base-darkest` |
| Secondary text | `base-dark` | `civ-text-base-dark` |
| Links | `primary` | `civ-text-primary` |
| Error messages | `error` | `civ-text-error`, `civ-border-error` |
| Error field border | `error` | `civ-border-error civ-border-s-4` |
| Alert backgrounds | varies | `civ-bg-info-lightest`, `civ-bg-warning-lightest` |
| Success indicators | `success` | `civ-text-success`, `civ-bg-success-lightest` |
| Disabled elements | `base-light` | `civ-text-base-light` |
| Focus ring | `focus.*` | Applied automatically by `civ.css` to every native interactive element (see [Focus indicator](#focus-indicator)) |

## Accessibility

- All default-on-white combinations meet WCAG AA (4.5:1 contrast for text)
- Error colors use text + border, never color alone as the indicator
- Dark mode tokens are validated for parity with light mode contrast ratios
- Focus ring uses the W3C Two-Color Technique for universal visibility

## Dark mode

Dark mode activates automatically via `prefers-color-scheme: dark`. All semantic tokens have dark-mode overrides. No code changes needed.

## CSS custom properties

All colors are available as CSS custom properties for dynamic theming:

```css
color: var(--civ-color-primary-DEFAULT);
background: var(--civ-color-error-lightest);
border-color: var(--civ-color-base-light);
```
