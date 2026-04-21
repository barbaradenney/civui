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
- **45 CSS Icons** — pure CSS icons, no fonts or SVGs

## Quick Start

```bash
npm install @civui/forms
```

```html
<script type="module">
  import '@civui/forms';
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
| `@civui/forms` | Form components (text input, select, checkbox, date picker, etc.) |
| `@civui/ui` | UI components (button, link, tag, card, page header, link card) |
| `@civui/feedback` | Alert, progress bar |
| `@civui/navigation` | Skip link, task list |
| `@civui/mcp-server` | 80-tool MCP server for form generation |

## Design Philosophy

- **Use the platform** — native `<select>`, `<input>`, `<fieldset>`, `<button>` elements
- **CSS over JavaScript** — states handled with attribute selectors, icons drawn with CSS
- **System fonts** — zero network requests, no flash of unstyled text
- **Border radius signals interactivity** — only clickable elements get rounded corners
- **Underlines signal navigation** — links are underlined, action buttons are not
- **Every byte is earned** — Lit is the only runtime dependency
