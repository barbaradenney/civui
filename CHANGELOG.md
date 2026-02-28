# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-02-27

Initial release of the CivUI Design System -- accessibility-first web components
for government applications.

**Packages:** `@civui/tokens`, `@civui/core`, `@civui/forms`, `@civui/ui`,
`@civui/feedback`, `@civui/navigation`, `@civui/react-native`, `@civui/test-utils`,
`@civui/cli`, `@civui/content`, `@civui/mcp-server`

### Added

- **Monorepo foundation** -- pnpm workspaces, Turborepo build pipeline, Vitest + jsdom
  test harness, and Storybook documentation site.
- **Design tokens** (`@civui/tokens`) -- W3C DTCG color, spacing, and typography tokens
  with a custom build pipeline. Contextual type and spacing scales. Density-responsive
  variants (`dense`, `spacious`, `fluid`) applied via `[data-civ-scale]`. Dark mode
  palette with `@media (prefers-color-scheme: dark)` overrides and parity validation
  against light tokens.
- **Core library** (`@civui/core`) -- `CivBaseElement` and `CivFormElement` base classes
  using Lit 3 Light DOM rendering. Shared accessibility utilities including
  `announce()` for screen-reader live regions. Shared form templates (`renderLabel`,
  `renderHint`, `renderError`). Analytics event infrastructure. Date utilities.
- **Form components** (`@civui/forms`) -- `civ-text-input`, `civ-textarea`,
  `civ-select`, `civ-checkbox`, `civ-checkbox-group`, `civ-radio-group`,
  `civ-toggle`, `civ-combobox`, `civ-date-picker`, `civ-memorable-date`,
  `civ-file-upload`, `civ-segmented-control`, and `civ-form` (with error summary
  and anchor links). All form components participate natively via ElementInternals.
  Standard API across all fields: `label`, `name`, `value`, `hint`, `error`,
  `required`, `disabled`. Events follow `civ-input` / `civ-change` conventions.
- **Checkbox indeterminate state** -- full indeterminate support with form
  participation and parent/child group syncing.
- **Radio group keyboard navigation** -- WAI-ARIA roving tabindex with arrow-key
  navigation and configurable orientation.
- **Date picker** -- accessible calendar date picker for scheduling use cases,
  complementing `civ-memorable-date` for known dates.
- **UI components** (`@civui/ui`) -- `civ-button` component.
- **Feedback components** (`@civui/feedback`) -- `civ-alert` component.
- **Navigation components** (`@civui/navigation`) -- `civ-skip-link` component.
- **React Native companion** (`@civui/react-native`) -- full-parity React Native
  counterparts for all form components.
- **Internationalization** -- message-override properties on all web components for
  custom label and error text.
- **Focus management** -- W3C Two-Color Technique (C40) focus rings via
  `focus-visible:civ-focus-ring`, with dark-mode token-based color switching.
- **MCP server** (`@civui/mcp-server`) -- Model Context Protocol server for
  AI-assisted migration of legacy forms to CivUI markup. Includes a Tailwind
  reference resource, style-lookup tool, `validate_form` tool, and 4 MCP prompts.
- **Test utilities** (`@civui/test-utils`) -- `fixture`, `cleanupFixtures`,
  `elementUpdated`, `pressKey`, and `typeText` helpers for component testing.
- **CI/CD** -- GitHub Actions workflow deploying web and React Native Storybooks to
  GitHub Pages.
- **Documentation** -- `CLAUDE.md` project instructions, AI component usage guide
  (`docs/ai-guide.md`), and `_syncFormValue` override reference.

### Changed

- **Codebase rename** -- renamed `civds` to `civui`/`civ` across the entire
  codebase for consistency.
- **Form template deduplication** -- extracted shared label, hint, and error
  rendering from individual components into reusable core templates. Improved group
  component consistency (`legend` vs `label`).
- **Density-responsive components** -- form components now respond to the density
  scale system, adjusting spacing and font size via CSS custom properties.

### Fixed

- **Accessibility (150+ fixes across 11 audit rounds)** -- comprehensive ARIA
  attribute wiring, `role="alert"` on all error messages, correct `aria-required`
  and `aria-invalid` states, focus trapping in modal-like components, and
  live-region announcement reliability.
- **Form participation** -- `_syncFormValue()` consistency across all components,
  `formResetCallback()` restoring initial values, `formDisabledCallback()` cascading
  disabled state, and ElementInternals guards for jsdom compatibility.
- **Event consistency** -- unified `dispatch()` pattern across all components,
  eliminated native event leaking, ensured correct detail shapes (`{ value }`,
  `{ values }`, `{ checked, value }`, `{ files }`).
- **Combobox** -- keyboard navigation, filtering, and ARIA ownership fixes.
- **Focus management** -- consistent `focus-visible:civ-focus-ring` usage, correct
  focus restoration after interactions, and roving-tabindex edge cases in radio
  groups.
- **React Native parity** -- accessibility props, value guards, validation behavior,
  and event naming aligned with web components across 7 audit rounds.
- **Build and CI** -- removed stale `tailwind.config.js` that broke the density
  system, fixed package build ordering for Storybook, corrected GitHub Pages
  deployment branch, and pinned pnpm version via `packageManager` field.
- **MCP server** -- addressed review findings for Tailwind reference and
  style-lookup tool.

[0.1.0]: https://github.com/civui/civui/releases/tag/v0.1.0
