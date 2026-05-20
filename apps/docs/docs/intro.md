---
slug: /
sidebar_position: 1
title: Introduction
---

# CivUI Component Library

Accessibility-first web components for government applications. Built on Lit 3, Tailwind CSS, and W3C design tokens.

## Key Features

- **76 Components** — form inputs, selection controls, layout, navigation, overlays, feedback, and compound fields, every one covered by a platform-neutral schema and CI-enforced parity check
- **WCAG 2.1 AA** — every component tested for accessibility compliance (satisfies Section 508)
- **80 MCP Tools** — AI-powered form generation, validation, and testing via the bundled MCP server
- **20 VA Forms** — complete form definitions ready to generate
- **4 Platforms** — Web (Lit), iOS (SwiftUI), Android (Compose), Drupal (74 SDCs for Drupal 10.3+/11)
- **Dark Mode** — automatic system preference detection with token-based colors
- **Density Scale** — dense, default, and spacious modes via CSS custom properties
- **Light DOM** — no Shadow DOM, external labels and ARIA work naturally
- **SVG Icons** — 20 inline Material Icons, no fonts or external requests (Material Symbols font available as opt-in)
- **Mobile-first** — popups become bottom sheets ≤480px, primary buttons go full-width, segmented controls expand to fill the row, hover styling gated to real pointer devices

## Quick Start

```bash
npm install @civui/inputs @civui/controls @civui/compound @civui/form-patterns @civui/actions
```

```html
<script type="module">
  import '@civui/inputs';
  import '@civui/controls';
  import '@civui/compound';
  import '@civui/form-patterns';
  import '@civui/actions';
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
| `@civui/core` | Base classes, a11y utilities, icons, analytics, validation, mask system |
| `@civui/schema` | Platform-neutral component contracts (the source of truth for cross-platform parity) |
| `@civui/inputs` | Input components (text-input, textarea, select, combobox, date-picker, time-picker, file-upload, toggle, yes-no, and preset wrappers for SSN/EIN/phone/email/etc.) |
| `@civui/controls` | Selection controls (checkbox, radio, segmented-control) |
| `@civui/actions` | Action + navigation affordances (button, action-button, button-group, link, link-card, filter-chip, skip-link, breadcrumb, nav, tabs) |
| `@civui/overlays` | Overlay components (modal, action-sheet, drawer, menu) |
| `@civui/layout` | Layout components (card, divider, list, tag, page-header, input-group, pagination, data-grid, toolbar, bulk-actions, column-visibility) |
| `@civui/compound` | Compound fields (address, name, direct-deposit, signature, race-ethnicity, relationship, partnership-history, service-history) |
| `@civui/form-patterns` | Form orchestration (form, form-step, repeater, summary, prefill, progress, conditional) |
| `@civui/feedback` | Feedback components (alert, badge, count) |
| `@civui/drupal` | Drupal SDC module — 74 Single Directory Components for Drupal 10.3+/11 |
| `@civui/cli` | CLI tooling (`civui generate component <name>` scaffolds across all 4 platforms) |
| `@civui/content` | Content / copy management |
| `@civui/mcp-server` | 80-tool MCP server for AI-assisted form generation |

## Design Philosophy

- **Use the platform** — native `<select>`, `<input>`, `<fieldset>`, `<button>` elements
- **CSS over JavaScript** — states handled with attribute selectors, icons rendered as inline SVG
- **System fonts** — zero network requests, no flash of unstyled text
- **Border radius signals interactivity** — only clickable elements get rounded corners
- **Underlines signal navigation** — links are underlined, action buttons are not
- **Every byte is earned** — Lit is the only runtime dependency

## Recent additions

- **Navigation components** — `civ-breadcrumb`, `civ-nav`, and a full ARIA tabs pattern (`civ-tabs` / `civ-tab` / `civ-tab-panel`) with roving tabindex and arrow-key navigation.
- **Admin data-grid** — `civ-data-grid` (semantic table with sort, selection, row-action menus, responsive stacked / scroll, empty + loading + error states), `civ-pagination` (USWDS-style), `civ-menu` + `civ-menu-item` (anchored kebab menu).
- **Spacing scale `sm`** — compact 20-px form controls (`spacing="sm"`) for dense surfaces like data-grid cell editors and column-visibility panels.
- **Password reveal toggle** — `reveal-password` prop on `civ-text-input` (`type="password"`) renders an inset show/hide affordance.
- **Mobile focus + touch hardening** — iOS Safari focus ring on checkbox/radio tap, segmented control expands to full width, sticky-hover gated to real pointer devices, 44×44 minimum tap targets on input action buttons.
