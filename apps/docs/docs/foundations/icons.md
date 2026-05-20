---
title: Icons
sidebar_position: 5
sidebar_label: Icons
---

# Icons

CivUI ships 14 inline SVG icons based on Material Icons Outlined. Only the icons CivUI's own components reference. No font files, no external requests, no pseudo-element hacks. Just lightweight SVG paths inlined in the component. For richer icon needs, the full Material Symbols catalog is available as an opt-in (see [Beyond the Built-In Set](#beyond-the-built-in-set) below).

## How It Works

Each icon renders as an inline `<svg>` element with Material Icons Outlined path data. The SVG uses a 24×24 viewBox with `fill="currentColor"`, which means:

- Zero network requests for icon assets
- Icons inherit `color` from their parent (via `currentColor`)
- Icons scale with `font-size` (sized at `0.875em` for optical text matching)
- No flash of unstyled content
- Pixel-perfect rendering at any size
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
| `sm` | 0.875em |
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

Each SVG icon maps to platform-native equivalents:

- **iOS**: SF Symbols
- **Android**: Material Symbols

CI enforces icon parity across all four platforms.

## Adding Custom Icons

Register a custom icon with an SVG path (24×24 viewBox):

```ts
import { registerIcon } from '@civui/core';

registerIcon('agency-seal', {
  label: 'Agency seal',
  path: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  ios: 'shield',
  android: 'shield',
});
```

You can find SVG path data from [Material Icons](https://fonts.google.com/icons), [Lucide](https://lucide.dev/), or any SVG icon set. Just extract the `d` attribute from the `<path>` element.

For icons with multiple paths, separate them with `|||`:

```ts
registerIcon('lock', {
  label: 'Locked',
  path: 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2z|||M12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z',
});
```

## Beyond the Built-In Set

If you need icons outside the built-in 14, you have two paths:

**1. Register a custom SVG path icon** (recommended)

Find the icon you need from any SVG icon library, extract the path data, and register it as shown above. This adds zero bundle size. Just a string in your JavaScript.

**2. Opt in to the Material Symbols font**

For broad icon coverage without finding individual paths, import the optional Material Symbols font and register icons by their glyph name:

```ts
import '@civui/core/styles/material-symbols';
import { registerIcon } from '@civui/core';

registerIcon('home', {
  label: 'Home',
  path: '', // empty path — font glyph is used instead
  symbol: 'home',
  ios: 'house',
  android: 'home',
});
```

`material-symbols` is an optional peer dependency. Install it (`npm install material-symbols`) only if you import the stylesheet. The font weighs ~3.9 MB.

## Component Reference

See the [Icon component page](../components/core/icon) for the full props table and Storybook examples.
