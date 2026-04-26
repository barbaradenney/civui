# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

Component review pass: bug fixes, a11y consistency, and feature additions
across all 21 components.

### Added

- **`civ-text-input`** — Character counter when `maxlength` is set (visual + 1s-debounced `aria-live` polite announcement). Suppressed when a mask is active.
- **`civ-textarea`** — `minlength` prop (was missing) and declarative `validate="length"` that runs on blur against `minlength` / `maxlength`.
- **`civ-select`** — Slot fallback for declarative `<option>` and `<optgroup>` children. New `width` prop (`default | 2xs | xs | sm | md | lg | xl | 2xl`).
- **`civ-combobox`** — Always-visible decorative chevron toggle (matches native `<select>` affordance). New `width` prop matching select.
- **`civ-combobox`** — Async option loading via the new `loadOptions` property (`(query) => Promise<ComboboxOption[]>`). Calls are debounced (`load-debounce`, default 300ms), stale responses are race-discarded by request id, and the dropdown surfaces dedicated loading / error / below-min-query states. New props: `load-debounce`, `min-query-length`, `loading-text`, `loading-error-text`. Locale keys: `comboboxLoading`, `comboboxLoadError`, `comboboxTypeToSearch`, `comboboxLoadingAnnouncement`.
- **`civ-date-picker`** — Today button in the dialog footer (selects today + closes). `T` / `Shift+T` keyboard shortcut jumps focus to today without selecting. `hide-today-button` opt-out for date-of-birth pickers.
- **`civ-file-upload`** — Duplicate detection on add (matches by name + size + lastModified). `capture` prop passes through to the native file input for mobile camera capture (`user` / `environment`).
- **`civ-checkbox-group`** — `min-selections` prop with implicit-required behavior, dedicated error message, and combined min+max hint chain.
- **`@civui/core/validation`** — New `validate.routing(value)` ABA mod-10 checksum validator. `civ-direct-deposit` wires it onto its routing-number sub-input automatically.
- **`civ-signature`** — `slot="statement"` for HTML statement content (links, etc.). Statement now linked to the certify checkbox via `aria-describedby` so screen-reader users hear the full text on focus. New `signedAt` ISO 8601 timestamp captured on user certify; preserved across draft restore via `signatureValue.signedAt`.
- **`civ-form`** — `setServerErrors(errors)` public method to inject server-side errors into the error summary and per-field state. Fires a `civ-server-errors` event.
- **`civ-summary`** — Cancelable `civ-edit` event on edit-link clicks (detail: `{ section, item?, href }`). Calling `preventDefault()` suppresses default navigation for SPA routing.
- **`CivBooleanFormElement`** — `extra-describedby` prop appends caller-supplied IDs to the control's `aria-describedby` chain.
- **Shared `InputWidth` type** in `@civui/core` (replaces per-component duplicates).
- **Icon editor (Storybook)** — New `Core › Icon › Editor` story with picker, live CSS textarea, scoped preview, snippet palette, multi-size + color swatches, pixel grid, and dark-mode toggle. Authoring path for new CSS icons no longer requires a build/reload cycle.

### Changed

- **`civ-radio-group` / `civ-yes-no`** — `role="radiogroup"` is now always on the inner group container instead of migrating between fieldset and div based on `skipLabel`. Cleaner DOM contract; same screen-reader experience.
- **`civ-radio-group`** — Stopped propagating the group's error state to each child radio (was causing screen readers to repeat "invalid" once per option as the user arrowed).
- **`civ-form`** — Only `<button type="submit">` triggers form submission. Typeless `<button>` no longer auto-submits (HTML's default-button-is-submit rule is `<form>`-specific).
- **`CivFormElement`** — `_setValidity()` wrapper mirrors flags + message into protected fields so `checkValidity()` / `validity` / `validationMessage` work in jsdom (where ElementInternals is partial). `firstUpdated` runs `_updateValidity()` once for correct initial validity. `updated()` re-runs validity on `required` / `error` change.
- **Locale keys** — Added `inputCharsRemaining`, `textareaWordsOverLimit`, `fileUploadCancelText`, `fileUploadCancelAriaLabel`, `fileUploadRetryText`, `fileUploadRetryAriaLabel`, `fileUploadProgressAriaLabel`, `fileUploadDuplicateError`, `summaryDefaultHeading`, `repeaterMinReached`, `minSelectionsHint`, `minSelectionsError`, `validateRouting`, `datePickerTodayButton`. Renamed `textareaCharsRemaining` → `inputCharsRemaining` (now shared by text-input and textarea).
- **Compound `required`** — `civ-name`, `civ-address`, `civ-direct-deposit`, `civ-signature` now actually enforce `required` against their structured fields (previously a no-op because `value` was always non-empty JSON).
- **`prefers-reduced-motion`** — `civ-form._focusField` and `civ-form-step.goToStep` honor the user's reduced-motion preference for scroll behavior.

### Fixed

- **`civ-text-input`** — Clear button now resets mask/validate errors and has a focus-visible ring; mask-stripped initial value is captured as the form-reset default; empty `name` no longer rendered.
- **`civ-date-picker`** — Stale errors clear on `_onClear`, empty text input, dialog selection, and successful parse. `civ-input` now fires on dialog selection. Locale cache keyed on `locale|weekStartsOn`.
- **`civ-toggle` / `civ-checkbox`** — Removed duplicate `civ-reset` dispatch in `formResetCallback` overrides.
- **`civ-checkbox`** — Dropped redundant `aria-checked="mixed"` on native input.
- **`civ-segmented-control`** — Roving tabindex now driven by a declarative `managedTabIndex` property, surviving subsequent renders (previous RAF + `setAttribute` was clobbered by Lit's next render).
- **`civ-progress-steps`** — Errored completed steps remain clickable; SR announcement fires on `current` change; `_safeCurrent` clamps out-of-range values.
- **`civ-address`** — `_useSelectForState` only true for US (and military APO/FPO). CA/MX previously rendered US states as options; now fall back to free-text province until province lists are added.
- **`civ-form-step`** — Required validation now uses `t('fieldRequired')` / `requiredMessage` interpolation instead of hardcoded English. Brittle `endsWith('is required')` heuristic replaced with a `WeakSet` of fields whose error this component set itself (so externally-set errors are no longer accidentally cleared).
- **`civ-form`** — `_focusField` respects `prefers-reduced-motion`.
- **`civ-repeater`** — Silent min-rejection on remove now announces assertively.
- **`civ-textarea`** — Word-count error no longer reports "negative N words remaining" when over limit; uses dedicated `textareaWordsOverLimit` message. Word-count error no longer overwrites externally-set errors.
- **`civ-file-upload`** — Cancel/Retry button labels and per-file aria-labels and progress aria-label now use locale keys (were hardcoded English).
- **`civ-summary`** — `aria-label` fallback no longer hardcoded English.

### Documentation

- New Storybook stories cover every new feature with a `parameters.docs.description.story` blurb.
- `docs/ai-guide.md` updated for every new prop and event, plus a pointer to the new icon editor.
- `CLAUDE.md` Icon System section points at the editor as the authoring entry point.
- Docusaurus `apps/docs` MDX pages embed the new stories alongside their existing examples.
- New `docs/ai-guide.md` section flags `@civui/schema` as dormant — schemas are out of date and not consumed by CI; treat as design-time aspirational documentation.

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
