---
title: Motion
sidebar_position: 13
sidebar_label: Motion
---

# Motion

CivUI uses design tokens for all transitions and animations. Hardcoded durations and easings are not allowed. Every motion value comes from the token system so it can be adjusted globally and respects reduced-motion preferences.

## Duration tokens

| Token | Value | Use |
|-------|-------|-----|
| `--civ-motion-duration-instant` | `0ms` | Immediate state changes |
| `--civ-motion-duration-fast` | `100ms` | Toggle switches, focus rings, micro-interactions |
| `--civ-motion-duration-normal` | `200ms` | Dropdowns, expanding panels |
| `--civ-motion-duration-slow` | `300ms` | Progress bars, larger transitions |
| `--civ-motion-duration-slower` | `500ms` | Loading spinners, complex animations |

## Easing tokens

| Token | Value | Use |
|-------|-------|-----|
| `--civ-motion-easing-linear` | `linear` | Spinners, progress bars |
| `--civ-motion-easing-ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Elements leaving the screen |
| `--civ-motion-easing-ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Elements entering the screen |
| `--civ-motion-easing-ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | Elements moving between states |

## Usage

Always use token variables instead of hardcoded values:

```css
/* Correct */
.my-panel {
  transition: opacity var(--civ-motion-duration-normal) var(--civ-motion-easing-ease-out);
}

/* Wrong — never hardcode */
.my-panel {
  transition: opacity 200ms ease;
}
```

## Components using motion

| Component | What animates | Duration | Easing |
|-----------|--------------|----------|--------|
| Toggle | Thumb slide | `fast` (100ms) | `ease-out` |
| Checkbox | Check/indeterminate indicator | `fast` (100ms) | `ease-out` |
| Progress bar | Width fill | `slow` (300ms) | `ease-out` |
| Loader spinner | Continuous rotation | `slower` (500ms) | `linear` |
| Link/Button | Background color on hover | `fast` (100ms) |. |

## Reduced motion (WCAG 2.1 AA)

CivUI globally disables all animations and transitions when the user has enabled reduced motion in their OS settings:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

This is applied automatically. No opt-in required. Every CivUI component respects this setting. State changes still happen (toggling, checking, expanding), they just happen instantly instead of animating.

### Testing reduced motion

- **macOS:** System Settings > Accessibility > Display > Reduce motion
- **Windows:** Settings > Accessibility > Visual effects > Animation effects (off)
- **Chrome DevTools:** Rendering tab > Emulate CSS media feature `prefers-reduced-motion: reduce`
