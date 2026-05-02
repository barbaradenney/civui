---
sidebar_position: 2
title: Architecture
---

# Architecture

## Light DOM

All CivUI components render to Light DOM — no Shadow DOM. This means:

- External `<label>` elements work with `for` attributes
- ARIA `id` references (`aria-describedby`, `aria-labelledby`) resolve across the page
- Tailwind CSS classes apply directly without `::part()` or CSS custom properties workarounds
- Focus management works naturally without retargeting
- Third-party tools (testing, accessibility auditors) see the real DOM

Every component returns `this` from `createRenderRoot()`:

```typescript
class CivTextInput extends CivFormElement {
  createRenderRoot() { return this; }
}
```

## Base Classes

### CivBaseElement

Base for all display components. Provides:
- `generateId()` — unique ID generation for ARIA references
- `sendAnalytics()` — PII-safe analytics events
- Light DOM rendering

### CivFormElement

Extends `CivBaseElement` for form-participating components. Adds:
- `static formAssociated = true` — ElementInternals form participation
- Standard props: `label`, `name`, `value`, `hint`, `error`, `required`, `disabled`
- `updateFormValue()` — syncs value to the browser's form system
- `formResetCallback()` — restores initial value on form reset
- `formDisabledCallback()` — cascades disabled state
- `hide-required-indicator` — suppresses "(required)" text while keeping validation

## Tailwind CSS

All utility classes use the `civ-` prefix to avoid conflicts:

```html
<div class="civ-p-4 civ-mb-2 civ-text-primary civ-bg-white">
```

Component classes are defined in `@layer components` via `@apply`:

```css
.civ-input {
  @apply civ-block civ-w-full civ-border civ-rounded civ-px-2 civ-py-1.5;
}
```

Dynamic class names (tag variants, icon names, button variants) are protected from Tailwind's JIT purging via the `safelist` in `tailwind.config.ts`.

## Design Tokens

W3C DTCG format tokens in `packages/tokens/src/`:

| File | Contents |
|------|----------|
| `color.tokens.json` | Light mode palette |
| `color-dark.tokens.json` | Dark mode overrides |
| `spacing.tokens.json` | Spacing scale |
| `typography.tokens.json` | Font sizes, weights, line heights |
| `border.tokens.json` | Border radius, widths |
| `focus.tokens.json` | Focus ring styles |
| `motion.tokens.json` | Duration, easing |
| `shadow.tokens.json` | Box shadows |
| `scales.tokens.json` | Dense/spacious density overrides |

Build outputs:
- CSS custom properties (`dist/css/tokens.css`)
- Tailwind preset (`dist/tailwind/preset.js`)
- JavaScript constants (`dist/js/tokens.js`)
- SwiftUI constants (`dist/swift/CivTokens.swift`)
- Kotlin constants (`dist/kotlin/CivTokens.kt`)

## Monorepo Structure

```
civui/
├── packages/
│   ├── tokens/       — Design tokens
│   ├── core/         — Base classes, icons, utilities
│   ├── forms/        — Form components
│   ├── ui/           — Button, Link, Tag, Card, etc.
│   ├── feedback/     — Alert
│   ├── navigation/   — Task List, Skip Link
│   ├── mcp-server/   — 80-tool MCP server
│   ├── test-utils/   — Shared test helpers
│   ├── cli/          — Developer CLI
│   ├── content/      — Content management
│   ├── drupal/       — Drupal SDC module (69 components)
│   ├── ios/          — SwiftUI components
│   └── android/      — Jetpack Compose components
├── apps/
│   ├── civ-site/     — VA Forms demo
│   └── docs/         — This documentation (Docusaurus)
└── docs/             — AI guide, research docs
```
