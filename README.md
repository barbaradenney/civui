# CivUI

**Accessibility-first web components for government applications.**

CivUI is an open-source design system built around the constraints of public-sector
software: Section 508 compliance, plain language, broad browser support, multi-platform
parity, and form-heavy interfaces. Components are framework-agnostic Lit 3 web components
with parallel native implementations for iOS (SwiftUI), Android (Jetpack Compose), and
Drupal (Single Directory Components).

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **Status:** early (`0.1.0`). The API is stabilising and we still make
> occasional breaking changes (see [`CHANGELOG.md`](CHANGELOG.md)). The web
> components, schemas, and Drupal SDCs are production-quality and have
> ~3600 tests behind them; the iOS and Android implementations are at the
> stub stage for many components (see
> [`.claude/rules/audit-debt.md`](.claude/rules/audit-debt.md)).

## Live demos

- **Documentation:** <https://barbaradenney.github.io/civui/>
- **Storybook:** <https://barbaradenney.github.io/civui/storybook/>

## Why CivUI?

Public-sector software has a specific shape: long, form-heavy flows; strict
accessibility requirements; older browsers in the long tail of users; multiple
delivery surfaces (a public website, a Drupal CMS, a native mobile app for
field staff). Most general-purpose component libraries optimise for the
*opposite* of that: short flows, latest-browser-only, single-platform.

CivUI is opinionated about the parts that matter for civic forms:

- Self-contained controls that render their own label / hint / error chrome,
  so accessibility can't be skipped by accident.
- Plain-language defaults: "(required)" instead of a red asterisk, and error
  messages that say what to do, not just what went wrong.
- Multi-platform parity as a CI gate, not a manual checklist.
- Schemas as the single source of truth, so humans, the MCP server,
  scaffolders, and the Drupal SDC sync all read the same contract.
- W3C standards (custom elements, ElementInternals, design tokens) over
  framework lock-in.

## What's in the box

- **60+ components:** form controls, compound fields (address, name, direct deposit),
  layout primitives, overlays, navigation, and orchestration (form, repeater, conditional).
- **WCAG 2.1 AA out of the box:** every component renders its own label/hint/error
  chrome, fires `role="alert"` on errors, supports keyboard navigation, and respects
  `prefers-reduced-motion`.
- **Four platforms, one contract:** web (Lit), iOS, Android, and Drupal SDC are kept
  in sync through a platform-neutral schema and a CI parity gate.
- **W3C DTCG design tokens:** colors, spacing, typography, motion, density, and dark
  mode driven by tokens, not magic numbers.
- **Native form participation:** `ElementInternals`/`formAssociated`, so components
  work inside a plain `<form>` with no hidden inputs.
- **Validation + masking:** 16 built-in validators, declarative `validate` attribute,
  blur-mode masking with PII-aware presets (SSN, EIN, phone, ZIP, currency).

## Package overview

| Package | Description |
|---------|-------------|
| `@civui/tokens` | Design tokens (W3C DTCG): colors, spacing, typography, motion |
| `@civui/core` | Base classes, a11y utilities, validation, masking, icons |
| `@civui/actions` | Buttons, links, breadcrumbs, nav, tabs |
| `@civui/inputs` | Text input, textarea, select, combobox, date picker, file upload + presets |
| `@civui/controls` | Checkbox, radio, segmented control |
| `@civui/compound` | Address, name, direct deposit, signature, partnership/service history |
| `@civui/form-patterns` | `<civ-form>`, form-step, repeater, summary, conditional, progress |
| `@civui/layout` | Card, divider, list, page-header, data-grid, pagination |
| `@civui/overlays` | Modal, action-sheet, drawer, menu, popover |
| `@civui/feedback` | Alert, badge, count |
| `@civui/schema` | Platform-neutral component contracts (the single source of truth) |
| `@civui/drupal` | 71 Single Directory Components for Drupal 10.3+/11 |
| `@civui/mcp-server` | MCP server for AI-assisted form conversion |

Native counterparts live in `packages/ios/` (SwiftUI) and `packages/android/` (Compose).

## Quick start

```html
<!-- 1. Import styles -->
<link rel="stylesheet" href="https://unpkg.com/@civui/tokens/dist/index.css" />
<link rel="stylesheet" href="https://unpkg.com/@civui/core/src/styles/civ.css" />

<!-- 2. Register components (side-effect import) -->
<script type="module">
  import '@civui/inputs/text-input';
  import '@civui/form-patterns/form';
</script>

<!-- 3. Use them -->
<civ-form>
  <civ-text-input
    label="Email address"
    name="email"
    type="email"
    hint="Work email preferred"
    required
  ></civ-text-input>
  <civ-button type="submit" variant="primary" label="Continue"></civ-button>
</civ-form>
```

## Repo layout

```
civui/
├── packages/
│   ├── tokens, core, actions, inputs, controls, compound,
│   ├── form-patterns, layout, overlays, feedback, schema,
│   ├── drupal, mcp-server, cli, content, test-utils,
│   ├── figma-plugin, storybook-utils,
│   ├── ios/                  # SwiftUI implementation
│   └── android/              # Jetpack Compose implementation
├── apps/
│   ├── civ-site/             # Reference / example app
│   └── docs/                 # Docusaurus documentation site
├── tools/                    # Schema parity, lints, generators
├── .github/workflows/        # CI: parity, native, pages, bundle-size
└── CLAUDE.md                 # Architecture guide (also useful for humans)
```

## Development

```bash
pnpm install
pnpm build                   # Build all packages (respects dep order)
pnpm test                    # Run the test suite (3600+ tests)
pnpm storybook               # Dev server on http://localhost:6006
pnpm validate                # Full CI check: lint + typecheck + tests + drift
pnpm preflight               # Faster pre-push check
```

Requires **Node.js ≥ 20** and **pnpm 9**.

## Browser support

CivUI targets evergreen browsers and ships ES2022 output. Supported:

- Chrome / Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari on macOS / iOS, version 16.4 and newer

The hard floor is set by [`ElementInternals` + `formAssociated`](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals)
(Safari 16.4, Chrome 77, Firefox 98) and the `:has()` selector
(Safari 15.4, Chrome 105, Firefox 121). Internet Explorer is not supported.

## Documentation

- **Storybook:** interactive component catalog (`pnpm storybook`)
- **Docusaurus site:** `apps/docs/` (`pnpm --filter civui-docs start`)
- **[`CLAUDE.md`](CLAUDE.md):** architecture overview, patterns, conventions
- **[`docs/ai-guide.md`](docs/ai-guide.md):** long-form component reference with HTML
  examples and government design patterns
- **[`packages/schema/README.md`](packages/schema/README.md):** how the cross-platform
  contract works and how to add a new schema

## Contributing

We welcome contributions. Please read **[CONTRIBUTING.md](CONTRIBUTING.md)** for
development setup, coding conventions, and how the cross-platform parity gates work.

By participating, you agree to abide by our **[Code of Conduct](CODE_OF_CONDUCT.md)**.

## Security

If you discover a security vulnerability, please follow the process in
**[SECURITY.md](SECURITY.md)**. Do not file a public issue.

## Acknowledgements

CivUI draws inspiration and patterns from several public-sector design
systems that came before it:

- [GOV.UK Design System](https://design-system.service.gov.uk/) for the
  pattern of self-contained controls with rendered hint / error chrome,
  and the focus-ring treatment.
- [U.S. Web Design System (USWDS)](https://designsystem.digital.gov/) for
  semantic colour tokens, accessibility-first defaults, and the
  pagination pattern.
- [VA.gov Design System (VADS)](https://design.va.gov/) for patterns
  specific to veteran-facing forms (memorable date, service history,
  dependent relationships).
- [CMS Design System](https://design.cms.gov/) for guidance on
  healthcare-facing form patterns, plain-language error copy, and the
  alert / notification taxonomy.
- [Material Icons Outlined](https://fonts.google.com/icons) for icon paths.

## License

MIT. See [LICENSE](LICENSE).

