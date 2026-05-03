---
slug: /
sidebar_position: 1
title: Introduction
---

# CivUI Design System

Accessibility-first web components for government applications. Built on Lit 3, Tailwind CSS, and W3C design tokens.

## Key Features

- **30+ Components** — form inputs, layout, navigation, feedback, and compound components
- **WCAG 2.2 AA** — every component tested for accessibility compliance
- **80 MCP Tools** — AI-powered form generation, validation, and testing
- **20 VA Forms** — complete form definitions ready to generate
- **Dark Mode** — automatic system preference detection with token-based colors
- **Density Scale** — dense, default, and spacious modes via CSS custom properties
- **Light DOM** — no Shadow DOM, external labels and ARIA work naturally
- **SVG Icons** — 14 inline Material Icons, no fonts or external requests (Material Symbols font available as opt-in)
- **4 Platforms** — Web (Lit), iOS (SwiftUI), Android (Compose), Drupal (SDC)

## Quick Start

```bash
npm install @civui/inputs @civui/controls @civui/compound @civui/form-patterns
```

```html
<script type="module">
  import '@civui/inputs';
import '@civui/controls';
import '@civui/compound';
import '@civui/form-patterns';
</script>

<civ-text-input
  label="Email address"
  name="email"
  type="email"
  required
></civ-text-input>
```

## Packages

| Package | Description |
|---------|-------------|
| `@civui/tokens` | Design tokens (CSS, Tailwind, JS, Swift, Kotlin) |
| `@civui/core` | Base classes, utilities, icons, analytics |
| `@civui/inputs` | Input components (text-input, select, combobox, date-picker, etc.) |
| `@civui/controls` | Selection controls (checkbox, radio, segmented-control) |
| `@civui/compound` | Compound fields (address, name, direct-deposit, signature) |
| `@civui/form-patterns` | Form orchestration (form, form-step, repeater, summary, prefill) |
| `@civui/actions` | Action components (button, link, action-button, link-card, button-group) |
| `@civui/overlays` | Overlay components (modal, action-sheet) |
| `@civui/layout` | Layout components (card, divider, input-group, page-header, tag) |
| `@civui/feedback` | Alert, progress bar |
| `@civui/navigation` | Skip link, task list |
| `@civui/drupal` | Drupal SDC module (69 components for Drupal 10.3+/11) |
| `@civui/mcp-server` | 80-tool MCP server for form generation |

## Design Philosophy

- **Use the platform** — native `<select>`, `<input>`, `<fieldset>`, `<button>` elements
- **CSS over JavaScript** — states handled with attribute selectors, icons rendered as inline SVG
- **System fonts** — zero network requests, no flash of unstyled text
- **Border radius signals interactivity** — only clickable elements get rounded corners
- **Underlines signal navigation** — links are underlined, action buttons are not
- **Every byte is earned** — Lit is the only runtime dependency
