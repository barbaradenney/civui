---
slug: /
sidebar_position: 1
title: Introduction
---

# CivUI Component Library

Accessibility-first web components for government applications. Built on Lit 3, Tailwind CSS, and W3C design tokens.

CivUI is inspired by the public-sector design systems that came before it:
the [U.S. Web Design System (USWDS)](https://designsystem.digital.gov/), the
[GOV.UK Design System](https://design-system.service.gov.uk/), the
[VA.gov Design System (VADS)](https://design.va.gov/), and the
[CMS Design System](https://design.cms.gov/). It distills their shared
patterns (self-contained form controls, plain-language defaults, WCAG 2.1 AA
out of the box) into a framework-agnostic web-component library with parallel
native and Drupal implementations.

## Key Features

- **Components:** form inputs, selection controls, layout, navigation, overlays, feedback, and compound fields, every one covered by a platform-neutral schema and CI-enforced parity check
- **WCAG 2.1 AA:** every component tested for accessibility compliance (satisfies Section 508)
- **MCP server:** AI-powered form generation, validation, and testing via the bundled MCP server
- **VA forms:** complete form definitions ready to generate
- **Multi-platform:** Web (Lit), iOS (SwiftUI), Android (Compose), Drupal (SDCs for Drupal 10.3+/11)
- **Dark Mode:** automatic system preference detection with token-based colors
- **Density Scale:** dense, default, and spacious modes via CSS custom properties
- **Light DOM:** no Shadow DOM, external labels and ARIA work naturally
- **Inline SVG icons:** Material Icons baked in, no fonts or external requests (Material Symbols font available as opt-in)
- **Mobile-first:** popups become bottom sheets ≤480px, primary buttons go full-width, segmented controls expand to fill the row, hover styling gated to real pointer devices

## Quick Start

Install the packages you need:

```bash
npm install @civui/tokens @civui/core @civui/inputs @civui/actions
```

Import the stylesheet **and** the component modules:

```html
<!-- Design tokens (CSS custom properties) -->
<link rel="stylesheet" href="/node_modules/@civui/tokens/dist/css/tokens.css" />

<!-- Component styles + element registration -->
<script type="module">
  import '@civui/core/styles';
  import '@civui/inputs';
  import '@civui/actions';
</script>

<civ-text-input
  label="Email address"
  name="email"
  type="email"
  required
></civ-text-input>

<civ-button label="Continue" variant="primary"></civ-button>
```

In a bundler (Vite, Webpack, Next.js, etc.) the imports look the same and the
tokens stylesheet can be imported via CSS:

```css
@import '@civui/tokens/css';
```

Skipping the stylesheet imports is the most common cause of unstyled components:
the JS modules register custom elements, but the visual treatment comes from the
two CSS imports above.

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
| `@civui/drupal` | Drupal SDC module with Single Directory Components for Drupal 10.3+/11 |
| `@civui/cli` | CLI tooling (`civui generate component <name>` scaffolds across all platforms) |
| `@civui/content` | Content / copy management |
| `@civui/mcp-server` | MCP server for AI-assisted form generation |

## Design Philosophy

- **Forms-first:** the library is openly biased toward long, multi-step government flows. That bias shows up in heavy investment in compound fields (address, name, direct deposit, signature), form orchestration (form, form-step, repeater, conditional, summary, autosave), per-field touched / error state, and validation copy that says what to do, not just what went wrong.
- **Plain-language defaults:** "(required)" rendered as text instead of a red asterisk; error messages tell the user how to fix the field; hint text shows the expected format; "Date of birth" instead of "DOB". Color is never the sole indicator of an error.
- **Schemas are the source of truth:** every cross-platform component has a platform-neutral schema in `@civui/schema`. Humans read the same contract that tools do (the MCP server, scaffolders, the Drupal SDC sync, the Props / Events tables on these docs pages). A CI gate enforces drift between the schema, the Lit reference implementation, and the iOS / Android / Drupal counterparts, so the contract stays trustworthy. See [AI-Agent-Friendly](./foundations/ai-agent-friendly) for the broader story.
- **Use the platform:** native `<select>`, `<input>`, `<fieldset>`, `<button>` elements
- **CSS over JavaScript:** states handled with attribute selectors, icons rendered as inline SVG
- **System fonts:** zero network requests, no flash of unstyled text
- **Border radius signals interactivity:** only clickable elements get rounded corners
- **Underlines signal navigation:** links are underlined, action buttons are not
- **Every byte is earned:** Lit is the only runtime dependency
