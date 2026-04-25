---
title: Icons
sidebar_position: 5
sidebar_label: Icons
---

# Icons

CivUI includes 45 pure CSS icons rendered via `::before`/`::after` pseudo-elements. No font files, no SVG, no Unicode characters -- just CSS.

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
<civ-icon name="search" size="lg"></civ-icon>

<!-- Colored via Tailwind -->
<civ-icon name="check" class="civ-text-success"></civ-icon>
<civ-icon name="error" class="civ-text-error"></civ-icon>
```

## Icon Categories

### Navigation

Chevrons (left, right, up, down), arrows (left, right, up, down), external-link.

### Actions

Close, plus, minus, menu, search, edit.

### Status

Check, check-circle, error, warning, info.

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

CI enforces icon parity across all three platforms.

## Component Reference

See the [Icon component page](../components/core/icon) for the full props table and Storybook examples.
