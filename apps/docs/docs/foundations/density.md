---
title: Density
sidebar_position: 16
sidebar_label: Density
---

import StoryEmbed from "@site/src/components/StoryEmbed";

# Density

CivUI supports three density scales that adjust spacing, font sizes, and line heights globally. Apply a scale to any container element and all CivUI components inside inherit the adjusted values.

## All three scales compared

<StoryEmbed id="foundations-density-examples--side-by-side" />

## Scales

| Scale | Spacing factor | Base font | Line height | Use case |
|-------|---------------|-----------|-------------|----------|
| **Default** | 1x | 16-18px | 1.6 | Standard government forms. Comfortable reading |
| **Dense** | 0.75x | 14px | 1.4 | Data-heavy layouts, admin dashboards, tables |
| **Spacious** | 1.5x | 18-22px | 1.75 | Accessibility-focused layouts, large screens, kiosks |

## Usage

Add `data-civ-scale` to any parent element:

```html
<!-- Dense: tighter spacing for data tables -->
<div data-civ-scale="dense">
  <civ-text-input label="Search" name="search"></civ-text-input>
  <civ-select label="Filter" name="filter"></civ-select>
</div>

<!-- Spacious: extra room for accessibility -->
<div data-civ-scale="spacious">
  <civ-text-input label="Full name" name="name"></civ-text-input>
</div>

<!-- Default: no attribute needed (this is the standard) -->
<civ-text-input label="Email" name="email"></civ-text-input>
```

## What changes

The density scale adjusts CSS custom properties for:

- **Spacing tokens:** padding, margins, gaps scale by the spacing factor
- **Font sizes:** all typographic scale steps adjust (xs through 5xl)
- **Line heights:** body and heading line heights change per scale

Components that use CivUI tokens automatically respond to the active scale.

## How it works

The token build pipeline generates CSS for each scale:

```css
/* Default — applied to :root (standard 4px-based scale) */
:root {
  --civ-spacing-1: 4px;
  --civ-spacing-2: 8px;
  --civ-typography-fontSize-base: 16px;
  /* ... */
}

/* Dense — tighter values (spacingFactor 0.75) */
[data-civ-scale="dense"] {
  --civ-spacing-1: 3px;
  --civ-spacing-2: 6px;
  --civ-typography-fontSize-base: 14px;
  /* ... */
}

/* Spacious — more generous (spacingFactor 1.5) */
[data-civ-scale="spacious"] {
  --civ-spacing-1: 6px;
  --civ-spacing-2: 12px;
  --civ-typography-fontSize-base: 18px;
  /* ... */
}
```

## Nesting scales

Scales can be nested. The innermost `data-civ-scale` wins:

```html
<div data-civ-scale="spacious">
  <!-- Spacious form fields -->
  <civ-text-input label="Name" name="name"></civ-text-input>

  <!-- Dense table inside the spacious layout -->
  <div data-civ-scale="dense">
    <table><!-- compact data table --></table>
  </div>
</div>
```

## Per-scale previews

### Default

<StoryEmbed id="foundations-density-examples--default-scale" />

### Dense — admin dashboards, data tables

<StoryEmbed id="foundations-density-examples--dense-scale" />

### Spacious — accessibility, kiosks, public-facing flows

<StoryEmbed id="foundations-density-examples--spacious-scale" />

## When to use each scale

| Scenario | Recommended scale |
|----------|------------------|
| Standard benefit application form | Default |
| Admin review dashboard | Dense |
| Public-facing kiosk or accessibility mode | Spacious |
| Data table with many columns | Dense |
| Form with elderly or low-vision users | Spacious |
| Mobile form (small screen) | Default |
