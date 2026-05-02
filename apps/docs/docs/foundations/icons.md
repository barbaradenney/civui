---
title: Icons
sidebar_position: 5
sidebar_label: Icons
---

# Icons

CivUI ships 14 pure-CSS icons rendered via `::before`/`::after` pseudo-elements — only the icons CivUI's own components reference. No font files, no SVG, no Unicode characters -- just CSS. For richer icon needs, the full Material Symbols catalog is available as an opt-in (see [Beyond the Built-In Set](#beyond-the-built-in-set) below).

## How It Works

Each icon is a single `<span>` element styled with CSS pseudo-elements. The shapes are drawn using CSS properties like `border`, `transform`, and `box-shadow`. This approach means:

- Zero network requests for icon assets
- Icons inherit `color` from their parent
- Icons scale with `font-size`
- No flash of unstyled content
- Works in all modern browsers without polyfills

## Usage

```html
<!-- Basic icon -->
<civ-icon name="check-circle"></civ-icon>

<!-- With accessible label -->
<civ-icon name="error" label="Error"></civ-icon>

<!-- Sized -->
<civ-icon name="info" size="lg"></civ-icon>

<!-- Colored via Tailwind -->
<civ-icon name="check" class="civ-text-success"></civ-icon>
<civ-icon name="error" class="civ-text-error"></civ-icon>
```

## Built-In Icons

| Category | Icons |
|----------|-------|
| **Navigation** | `chevron-left`, `chevron-right`, `chevron-down`, `external-link` |
| **Status** | `check`, `check-circle`, `error`, `warning`, `info`, `loading` |
| **Actions** | `close`, `download` |
| **Communication** | `mail`, `phone` |

## Size Shortcuts

| Value | Font Size |
|-------|-----------|
| `sm` | 0.75em |
| `md` | 1em |
| `lg` | 1.5em |
| `xl` | 2em |
| `2xl` | 3em |

You can also pass any CSS length value: `size="24px"`, `size="1.25rem"`.

## Accessibility

- **Decorative icons** (no `label`): rendered with `aria-hidden="true"`. Screen readers ignore them.
- **Meaningful icons** (with `label`): rendered with `role="img"` and `aria-label`. Screen readers announce the label.

Always set `label` on icons that convey information the user needs, such as status indicators or icon-only buttons.

## Native Platform Mapping

Each CSS icon maps to platform-native equivalents:

- **iOS**: SF Symbols
- **Android**: Material Symbols

CI enforces icon parity across all four platforms.

## Authoring Icons

To edit an existing icon or author a new one, run `pnpm storybook` and open **Core › Icon › Editor**. The editor gives you a live CSS textarea with a scoped preview, a snippet palette of common shape primitives (chevron, triangle, circle, diamond, etc.), a multi-size preview (16/24/32/64 px), color swatches, a pixel grid, and a dark-mode toggle. Edits never touch the real library — when you're happy, click **Copy CSS** and paste the rules into `packages/core/src/styles/components.css`, then add the icon's name and platform mappings to `packages/core/src/icon/icon-library.ts`.

## Beyond the Built-In Set

If you need icons outside the built-in 14, you have two paths:

**1. Author your own CSS shape**

Author a `.civ-icon--{name}` rule alongside your application's stylesheet, then register the name:

```ts
import { registerIcon } from '@civui/core';

registerIcon('agency-seal', {
  label: 'Agency seal',
  ios: 'shield',
  android: 'shield',
});
```

**2. Opt in to the Material Symbols font**

For broad icon coverage without writing CSS, import the optional Material Symbols font and register icons by their glyph name:

```ts
import '@civui/core/styles/material-symbols';
import { registerIcon } from '@civui/core';

registerIcon('home', {
  label: 'Home',
  symbol: 'home',
  ios: 'house',
  android: 'home',
});
```

`material-symbols` is an optional peer dependency — install it (`npm install material-symbols`) only if you import the stylesheet. The font weighs ~3.9 MB.

## Component Reference

See the [Icon component page](../components/core/icon) for the full props table and Storybook examples.
