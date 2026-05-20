---
title: Dark Mode
sidebar_position: 14
sidebar_label: Dark Mode
---

# Dark Mode

CivUI supports dark mode via the `prefers-color-scheme` media query. When the user's OS is set to dark mode, all components automatically switch to a dark palette with WCAG AA contrast ratios.

## How it works

1. **Light tokens** (`color.tokens.json`) define the default palette
2. **Dark tokens** (`color-dark.tokens.json`) define the dark palette with the same token keys
3. The token build pipeline generates `@media (prefers-color-scheme: dark)` CSS overrides
4. Components use CSS custom properties. They automatically pick up the right values

No JavaScript is involved. Dark mode is pure CSS.

## Enabling dark mode

Dark mode activates automatically when the user's OS preference is set to dark. Tailwind is configured with `darkMode: 'media'`:

```js
// tailwind.config.js
module.exports = {
  darkMode: 'media', // Uses @media (prefers-color-scheme: dark)
};
```

## Token parity

The build pipeline enforces that dark tokens have **exactly the same keys** as light tokens. If a light token exists without a dark counterpart (or vice versa), the build fails:

```
Token parity check failed:
  Dark tokens missing keys present in light tokens: color.accent.DEFAULT
```

This prevents components from rendering with missing colors in dark mode.

## Dark palette

The dark palette inverts the lightness scale. `lightest` becomes the darkest shade (for backgrounds), and `darker` becomes the lightest (for text):

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `primary-DEFAULT` | `#005ea2` | `#73b3e7` | Primary actions, links |
| `error-DEFAULT` | `#b50909` | `#f28b82` | Error states |
| `success-DEFAULT` | `#00a91c` | `#5cb85c` | Success states |
| `base-darkest` | `#1b1b1b` | `#f0f0f0` | Primary text |
| `base-lightest` | `#f0f0f0` | `#1b1b1b` | Page background |

## Focus rings in dark mode

Focus ring colors switch to token-based values so they remain visible on dark backgrounds:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --civ-focus-outline-color: var(--civ-color-primary-lighter);
    --civ-focus-shadow-color: var(--civ-color-primary-darker);
  }
}
```

## Component-specific overrides

Some components have dark-mode-specific CSS beyond just color swaps:

- **Select dropdown arrow:** switches to a lighter SVG chevron for visibility
- **Checkbox/Radio indicators:** border colors adjust for contrast
- **Input borders:** lighten to remain visible against dark backgrounds

## Testing dark mode

- **macOS:** System Settings > Appearance > Dark
- **Windows:** Settings > Personalization > Colors > Dark
- **Chrome DevTools:** Rendering tab > Emulate CSS media feature `prefers-color-scheme: dark`
- **Storybook:** Use the toolbar theme toggle to preview both modes
