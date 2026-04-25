---
title: Design Tokens
sidebar_position: 4
sidebar_label: Design Tokens
---

# Design Tokens

CivUI uses W3C DTCG (Design Token Community Group) format for design tokens. Tokens define colors, spacing, typography, and density scales and are the foundation for all component styling.

## Token Categories

### Colors

Semantic color tokens for consistent theming across components:

| Token | Usage |
|-------|-------|
| `primary` | Brand primary, links, selected state |
| `error` | Validation errors, required marks |
| `warning` | Warning messages |
| `success` | Success confirmations |
| `info` | Informational messages |
| `base` | Default text and backgrounds |

Each color has shades: `lightest`, `lighter`, `light`, default, `vivid` (primary only), `dark`, `darker`.

### Spacing

Spacing tokens follow a consistent scale used for padding, margin, and gap values. Applied via Tailwind utilities with the `civ-` prefix (e.g., `civ-p-4`, `civ-gap-2`).

### Typography

Typography tokens define font families, sizes, weights, and line heights. All text utilities use the `civ-` prefix (e.g., `civ-text-base`, `civ-text-lg`).

## Using Tokens

### CSS Custom Properties

Import the generated CSS custom properties:

```css
@import '@civui/tokens/css';
```

### Tailwind Preset

Use the Tailwind preset to get all token values as Tailwind utilities:

```js
// tailwind.config.js
import civuiPreset from '@civui/tokens/tailwind';

export default {
  presets: [civuiPreset],
  prefix: 'civ-',
};
```

## Dark Mode

- Dark mode activates via `prefers-color-scheme: dark` (configured as `darkMode: 'media'` in Tailwind).
- `color-dark.tokens.json` provides the dark palette with parity validation against light tokens.
- The build script generates `@media (prefers-color-scheme: dark)` CSS overrides automatically.
- Focus ring colors switch to token-based values (`primary-lighter`, `primary-darker`) in dark mode.
- All semantic color tokens have dark-mode overrides.

## Density System

CivUI supports three density scales that adjust spacing and font sizes proportionally:

| Scale | Multiplier | Use Case |
|-------|------------|----------|
| Default | 1x | Standard forms and content |
| `dense` | 0.75x | Compact tables, dashboards |
| `spacious` | 1.25x | Public-facing forms, kiosks |

Apply density at any container level using the `data-civ-scale` attribute:

```html
<!-- Spacious: larger spacing and fonts -->
<div data-civ-scale="spacious">
  <civ-text-input label="Name" name="name"></civ-text-input>
</div>

<!-- Dense: compact spacing and fonts -->
<div data-civ-scale="dense">
  <civ-text-input label="Name" name="name"></civ-text-input>
</div>
```

Density is defined in `scales.tokens.json` and applied through CSS custom variables. All CivUI spacing and font-size utilities scale proportionally.

## Build Pipeline

Tokens are built with a custom build script at `packages/tokens/build/build-tokens.js`. The build process:

1. Reads W3C DTCG JSON token files
2. Generates CSS custom properties
3. Generates Tailwind preset configuration
4. Validates dark mode parity (every light token must have a dark counterpart)

Build order: `tokens` must build before `core` and `forms`.
