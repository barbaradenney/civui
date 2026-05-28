---
title: Accessibility
sidebar_position: 6
sidebar_label: Accessibility
---

import StoryEmbed from "@site/src/components/StoryEmbed";

# Accessibility

CivUI components are built for WCAG 2.1 AA compliance, which satisfies Section 508 requirements for government applications.

## WCAG 2.1 AA Checklist

| Criterion | How CivUI Addresses It |
|-----------|----------------------|
| 1.1.1 Non-text Content | Labels rendered as text, not images |
| 1.3.1 Info and Relationships | Semantic HTML (fieldset/legend, label/input), ARIA attributes |
| 1.3.5 Identify Input Purpose | Support `autocomplete` attribute on text inputs |
| 2.1.1 Keyboard | All controls keyboard accessible, arrow nav in groups |
| 2.1.2 No Keyboard Trap | Focus trap only in modal dialogs, Escape closes |
| 2.4.1 Bypass Blocks | `<civ-skip-link>` for skip navigation |
| 2.4.3 Focus Order | DOM order matches visual order (Light DOM) |
| 2.4.7 Focus Visible | Global rule in `civ.css` applies the ring to every interactive element |
| 2.4.13 Focus Appearance | W3C Two-Color Technique, 3px outline, WCAG 2.2 |
| 3.2.2 On Input | No unexpected context changes on input |
| 3.3.1 Error Identification | `role="alert"` on error messages |
| 3.3.2 Labels or Instructions | Visible labels + hint text |
| 3.3.3 Error Suggestion | Error messages include correction guidance |
| 4.1.2 Name, Role, Value | ElementInternals + ARIA roles |

## Keyboard-only flow

<StoryEmbed id="foundations-accessibility--keyboard-only" />

## Keyboard Patterns

| Component | Keys |
|-----------|------|
| Text input, textarea, select | Standard native behavior |
| Checkbox, toggle | Space to toggle |
| Radio group | Arrow keys (RTL-aware), Home/End |
| Combobox | ArrowDown/Up to navigate, Enter to select, Escape to close |
| Segmented control | Arrow keys (RTL-aware), Home/End |
| Date picker dialog | Arrows (day), PageUp/Down (month), Shift+PageUp/Down (year), Enter/Space to select, Escape to close |
| File upload dropzone | Enter/Space to open file browser |

## Focus Ring

CivUI uses the W3C Two-Color Technique (C40) for focus indicators:

- 3px solid outline
- Halo shadow for additional contrast
- Triggers on `:focus` (so it shows on click as well as keyboard). Matches GOV.UK Design System
- Meets WCAG 2.2 SC 2.4.13 Focus Appearance

The ring is applied automatically by a global rule in `civ.css` to every native
interactive element. `button`, `[role="button"]`, `a[href]`, `input`, `select`,
`textarea`, `summary`, `[contenteditable]`, `[tabindex]:not([tabindex="-1"])`.
You don't add a class:

```html
<button>Custom button</button>

<!-- Inverse opt-in for dark / colored backgrounds -->
<button class="focus-visible:civ-focus-ring-inverse">On dark</button>
```

Focus ring colors automatically invert in dark mode.

<StoryEmbed id="foundations-accessibility--focus-ring" />

### Inverse focus ring on dark surfaces

<StoryEmbed id="foundations-accessibility--focus-ring-inverse" />

### Skip link

<StoryEmbed id="foundations-accessibility--skip-link-affordance" />

## Screen Reader Announcements

Use the `announce` function from `@civui/core` to queue messages to `aria-live` regions:

```javascript
import { announce } from '@civui/core';

// Polite -- non-urgent status updates
announce('Form saved successfully');
announce('3 results found');

// Assertive -- urgent, time-sensitive
announce('Session expires in 2 minutes', 'assertive');
announce('Error: payment declined', 'assertive');
```

The announcement queue is capped at 10 messages with oldest-drop strategy.

<StoryEmbed id="foundations-accessibility--screen-reader-announcer" />

## RTL Support

Radio groups, segmented controls, and date pickers reverse arrow key behavior in RTL contexts. The `isRtl()` utility from `@civui/core` detects direction from CSS computed styles.

Use logical properties for RTL-safe layouts:

- `civ-border-s-4` / `civ-border-e-4` -- inline-start/end border
- `civ-rounded-s` / `civ-rounded-e` -- start/end border radius
- `civ-ms-2` / `civ-me-2` -- inline-start/end margin

## Windows High Contrast Mode

Components include `@media (forced-colors: active)` overrides for date pickers, combobox options, checkboxes, toggles, and file uploads. This ensures visibility in Windows High Contrast Mode without additional configuration.

## Error Handling

- Error messages render with `role="alert"` for immediate screen reader announcement (handled by `renderError()`)
- Color is never the sole error indicator -- errors use text + border
- Error text states what went wrong and how to fix it
- Required fields render an asterisk and set `aria-required="true"`

<StoryEmbed id="foundations-accessibility--error-identification" />

## Performance is an accessibility feature

Fast download and load times keep services reachable on throttled mobile
data, rural broadband, and older agency hardware — the conditions many
government audiences actually use. See [Performance](./performance.md) for
what CivUI does (system fonts, inline SVG icons, Light DOM, tree-shakeable
sub-path exports, lazy images) and what you should do as a consumer to
keep your bundle small.
