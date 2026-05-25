# CivUI Design System

Accessibility-first web components for government applications.

## Tech Stack

- **Lit 3** web components with **Light DOM** (`createRenderRoot()` returns `this`)
- **Tailwind CSS** with `civ-` prefix (e.g., `civ-p-2`, `civ-text-error`, `civ-border-primary`)
- **ElementInternals** for native form participation (no hidden inputs)
- **pnpm workspaces + Turborepo** monorepo
- **Vitest + jsdom** for testing
- **Storybook** for component documentation
- **W3C DTCG design tokens** with custom build pipeline (`packages/tokens/build/build-tokens.js`)

## Package Structure

Build order: `tokens → core → layout → actions, navigation, overlays → inputs → compound → form-patterns`

| Package | Path | Description |
|---------|------|-------------|
| `@civui/tokens` | `packages/tokens/` | Design tokens (colors, spacing, typography) |
| `@civui/core` | `packages/core/` | Base classes, a11y utilities, analytics, date utils, form-field wrappers |
| `@civui/actions` | `packages/actions/` | Polymorphic action + link affordances (button, action-button, filter-chip, filter-chip-group, link, link-card, skip-link, confirm-button, toggle-button). Buttons accept `href` and links accept `type` for device actions, so the boundary between "single action" and "single link" is a render-time detail — these stay one package |
| `@civui/navigation` | `packages/navigation/` | Navigation surfaces (breadcrumb, nav, side-nav, tabs, tab-nav, on-this-page, back-to-top). Pulled out of `@civui/actions` once the cluster grew big enough — these are link/list containers, not single affordances, so the polymorphism argument that keeps button-and-link together doesn't apply |
| `@civui/overlays` | `packages/overlays/` | Overlay components (modal, action-sheet, drawer, menu) |
| `@civui/layout` | `packages/layout/` | Layout components (card, divider, input-group, list, page-header, tag, pagination, data-grid) |
| `@civui/inputs` | `packages/inputs/` | Input + selection-control components (text-input, textarea, select, combobox, date-picker, file-upload, toggle, yes-no, checkbox, radio, segmented-control) + preset wrappers (ssn, ein, phone, email, zip, currency, routing-number, va-file-number, country). Selection controls used to live in their own `@civui/controls` package; consolidated since consumers always reached for both packages together |
| `@civui/compound` | `packages/compound/` | Compound fields (address, name, direct-deposit, signature, race-ethnicity, relationship, partnership-history, service-history) |
| `@civui/form-patterns` | `packages/form-patterns/` | Form orchestration (form, form-step, repeater, summary, prefill, progress, conditional) |
| `@civui/feedback` | `packages/feedback/` | Feedback components (alert, callout, notice, badge, count, spinner, skeleton, timeline, process-list) |
| `@civui/test-utils` | `packages/test-utils/` | Test helpers: `fixture`, `cleanupFixtures`, `elementUpdated`, `pressKey`, `typeText` |
| `@civui/cli` | `packages/cli/` | CLI tooling |
| `@civui/content` | `packages/content/` | Content/copy management |
| `@civui/mcp-server` | `packages/mcp-server/` | MCP server for AI-assisted form conversion |
| `@civui/drupal` | `packages/drupal/` | Drupal SDC module — 71 Single Directory Components for Drupal 10.3+/11 |
| `@civui/schema` | `packages/schema/` | Platform-neutral component schemas — the contract each platform implementation must satisfy (see "Schemas as contract" below) |

## Commands

```bash
pnpm test          # Run all tests (3600+ tests across packages)
pnpm build         # Build all packages (respects dependency order)
pnpm typecheck     # TypeScript type checking
pnpm lint          # ESLint
pnpm validate      # lint + typecheck + test (full CI check, slow)
pnpm preflight     # Fast pre-push: typecheck + lints + schema parity + doc-tables sync
pnpm storybook     # Dev server on port 6006
pnpm scaffold:component <name>   # Scaffold a new component (web + iOS + Android + Drupal + schema + COVERED_COMPONENTS)
pnpm generate:schema civ-<name>  # Bootstrap a schema from an existing Lit component
civ generate component <name>    # Alternative scaffolder (also creates a schema) — equivalent for new components
```

## Architecture Patterns

### Light DOM Components
All components render to Light DOM (no Shadow DOM). `createRenderRoot()` returns `this`. This means Tailwind classes work directly and there are no style encapsulation boundaries.

### Cross-Package Component Imports
When a component renders child components from another `@civui/*` package (e.g., `civ-address` renders `<civ-text-input>`), use **bare side-effect imports** to ensure custom elements are registered:

```typescript
// CORRECT — direct sub-path imports, always preserved by bundlers
import '@civui/inputs/text-input';
import '@civui/inputs/select';
import '@civui/inputs/radio';

// AVOID — barrel imports can be tree-shaken by Vite/esbuild
import '@civui/inputs';  // may get dropped!

// WRONG — named imports are always tree-shaken
import { CivTextInput } from '@civui/inputs';  // will get dropped!
```

Sub-path imports resolve to individual component index files, guaranteeing the `@customElement` decorator runs. Barrel imports go through a re-export chain that bundlers can optimize away, especially when resolved to source via Vite aliases.

An ESLint rule (`no-restricted-imports`) enforces this in component source files. Tests and stories are exempt.

### Form Components
Form-participating components extend `CivFormElement` (which extends `CivBaseElement`):
- `static formAssociated = true` enables ElementInternals
- `updateFormValue()` syncs value to the browser's form system
- `_syncFormValue()` is called automatically when `value` changes — override in subclasses with custom form value logic
- `formResetCallback()` restores initial value on form reset
- `formDisabledCallback()` cascades disabled state
- `touched` property tracks per-field interaction (set on first `focusout`, reset on form reset)
- jsdom doesn't fully support ElementInternals, so guards like `typeof setFormValue === 'function'` are needed

### Self-Contained Controls
Every form input renders its own label / hint / error chrome from `label`, `hint`, `error`, `required` props. There is no separate wrapper component for single inputs — pass the props directly on the control:

```html
<civ-text-input label="Email address" name="email" type="email" hint="Work email preferred" required></civ-text-input>
```

Group components (radio-group, checkbox-group, segmented-control, yes-no, memorable-date, date-range-picker) are **self-contained** — pass `legend` directly, do **not** wrap in `<civ-fieldset>` (you'd get nested fieldsets with double legends). The `fieldset-wrappers` CI gate enforces this.

```html
<civ-radio-group legend="Preferred contact method" name="contact" required>
  <civ-radio value="email" label="Email"></civ-radio>
  <civ-radio value="phone" label="Phone"></civ-radio>
</civ-radio-group>
```

`civ-fieldset` is reserved for **genuine multi-field grouping** — putting one section heading over several controls (e.g. an address with street/city/state inside).

**Self-contained components** (every input, checkbox, toggle, all compound components, and all six group components above) render their own labels inline and do not need wrappers.

### Events
- `civ-input` — fires on every value change (like native `input`)
- `civ-change` — fires on committed value change (like native `change`)
- `civ-analytics` — analytics tracking events
- Event detail shapes:
  - `{ value: string }` — single-value (text-input, textarea, select, radio-group, segmented-control, date-picker)
  - `{ values: string[] }` — multi-value (checkbox-group)
  - `{ checked: boolean, value: string }` — boolean controls (checkbox, toggle)
  - `{ files: File[] }` — file-upload
  - `{ value: string }` — combobox civ-change (the `<civ-country>` wrapper extends this to `{ value, label }`)
  - `{ value: string, month: string, day: string, year: string }` — memorable-date
  - `{ value: object }` — compound components (address, name, direct-deposit, relationship, etc.) emit their structured value as an object, not a string

### Rendering Order
Every form control renders its own chrome in this order: label/legend → hint → error → control → supplementary info.
`civ-fieldset` (multi-field grouping) enforces: legend → hint → error → child controls.
All paths use `renderFormHeader()` from `@civui/core` internally.

### Mobile Popups — Bottom Sheet Rule
All popups, dropdowns, and dialogs **must** render as bottom sheets on mobile (≤480px). Use the shared `.civ-bottom-sheet` utility class for new popup components:

```html
<!-- Add civ-bottom-sheet class to any popup element -->
<div class="my-dropdown civ-bottom-sheet">...</div>
```

The `.civ-bottom-sheet` class is defined in `components.css` and applies bottom-anchored fixed positioning with rounded top corners on mobile. For components that can't add the class (because they have their own CSS), copy the same pattern.

Components using this: `civ-modal` (via native `<dialog>` + CSS), `civ-action-sheet`, `civ-datepicker-dialog`. Native `<select>` gets OS-level bottom sheet automatically.

**Documented exception — `civ-combobox`.** The combobox listbox does NOT use the bottom-sheet pattern. The bottom-sheet idiom assumes tap-to-open with no keyboard expected; combobox has a typing surface, so the soft keyboard is always up while the listbox is open. A bottom-anchored sheet under those conditions collapses to a sliver between the keyboard top and the visible viewport bottom. Material UI, USWDS, Apple HIG, and Bootstrap typeaheads all use anchored popovers for the same reason. The mobile rule on `.civ-combobox-listbox` uses `position: absolute` + `max-height: 50dvh` (dynamic viewport height auto-excludes the keyboard on iOS Safari 15.4+ / Chrome 108+ / Firefox 101+, with `50vh` as the fallback).

### Text Color
Do **not** use gray text classes (`civ-text-base-dark`, `civ-text-base-light`, `civ-text-base`) on labels, headings, descriptions, or body text. All text inherits the default color (`base-darkest`). Visual hierarchy is achieved through **font size and weight**, not color muting. Gray text is acceptable for: **hint text**, disabled states, and placeholder text.

### Focus Styles
Focus indicators are applied automatically by a global rule in `civ.css` to every native interactive element (`button`, `[role="button"]`, `a[href]`, `input`, `select`, `textarea`, `summary`, `[contenteditable]`, `[tabindex]:not([tabindex="-1"])`). **You do not need to add a focus-ring class** — render a real `<button>` or `<a href>` and the ring shows. Components with bespoke focus needs (`.civ-input`, `.civ-check-tile`, `.civ-filter-chip` wrapper, `.civ-close-btn`) override with more specific rules.

The ring follows the GOV.UK pattern: triggers on `:focus` (so it shows on click as well as keyboard), dark band flush against the element with a yellow halo extending outside it. Use `focus-visible:civ-focus-ring-inverse` only when you need the inverted treatment for dark backgrounds (currently only the date-picker selected day cell).

**Watch out for `overflow: hidden` on focus-ring ancestors** — the rounded-corner trick clips both `outline` and `box-shadow`, so the ring disappears entirely on focused descendants. If a wrapper needs `overflow: hidden`, move the focus rule to the wrapper itself with `:has(.thing-inside:focus)` and suppress the inner element's own ring (see `civ-filter-chip` for the pattern).

### Screen Reader Announcements
`announce(message, priority)` from `@civui/core` queues messages to `aria-live` regions. Uses polite/assertive priorities. Queue is capped at 10 messages with oldest-drop strategy.

### Dark Mode
- `darkMode: 'media'` in Tailwind config — uses `prefers-color-scheme`
- `color-dark.tokens.json` provides dark palette with parity validation against light tokens
- Build script generates `@media (prefers-color-scheme: dark)` CSS overrides
- Focus ring colors switch to token-based values (`primary-lighter`, `primary-darker`) in dark mode

### Density System
- `scales.tokens.json` defines `dense`, `spacious`, and `fluid` scale variants
- Applied via `[data-civ-scale="dense|spacious"]` on a parent element
- Spacing and font size CSS variables adjust per scale

### Motion & Reduced Motion
- `motion.tokens.json` defines duration (`instant`, `fast`, `normal`, `slow`, `slower`) and easing tokens
- All transitions use `var(--civ-motion-duration-*)` and `var(--civ-motion-easing-*)` — no hardcoded values
- `@media (prefers-reduced-motion: reduce)` globally disables all animations and transitions (WCAG 2.1 AA)

### Z-Index Scale
Named z-index layers as CSS custom properties — no hardcoded values:
- `--civ-z-overlay-backdrop: 99` — overlay backdrops
- `--civ-z-overlay: 100` — modals, action sheets, bottom sheets, combobox dropdowns
- `--civ-z-skip-link: 9999` — skip navigation link

### Print Styles
`@media print` rules hide interactive UI (buttons, dropzones, modals, progress bars), clean up form borders, prevent page breaks inside form fields, and preserve checkbox state rendering.

## Testing Patterns

- Tests use **Vitest** with **jsdom** environment
- Import helpers from `@civui/test-utils`: `fixture`, `cleanupFixtures`, `elementUpdated`, `pressKey`, `typeText`
- Every test file must have `afterEach(cleanupFixtures)`
- After setting properties, `await elementUpdated(el)` before assertions
- Tests are co-located with source: `civ-select.ts` → `civ-select.test.ts`
- **Coverage** (ad-hoc): `npx vitest run --coverage --coverage.reporter=text-summary` from any package. `@vitest/coverage-v8` is pinned to the same **major** version as `vitest` (currently `^2.0.0`). When you bump vitest, bump coverage-v8 in lockstep — version skew throws `BaseCoverageProvider not exported`.
- **`as any` in tests is allowed.** ESLint exempts test files. The dominant pattern is `await fixture(...) as any` to access underscore-prefixed reactive state (`el._loading`, `el._files`, `el._data`) without writing per-component test helpers. Refactor risk: renaming `_state` fields silently breaks tests. Mitigation: keep field renames adjacent to the test edits, or grep for the old name across `*.test.ts` before merging.
- **Long-running validate/test commands may lose output under background runners.** When running `pnpm validate` or `pnpm test` in a background harness, the harness pipe occasionally drops stdout for runs longer than ~30s while still reporting `exit 0`. If you need to capture full output, redirect to a file explicitly: `pnpm validate > /tmp/log.txt 2>&1`, then read `/tmp/log.txt`. Cached turbo runs (`>>> FULL TURBO`) finish in <1s and don't hit the issue.

## File Naming

- Component source: `packages/forms/src/{name}/civ-{name}.ts`
- Component test: `packages/forms/src/{name}/civ-{name}.test.ts`
- iOS counterpart: `packages/ios/Sources/CivUI/Civ{Name}.swift`
- Android counterpart: `packages/android/src/main/kotlin/gov/civui/components/Civ{Name}.kt`
- Drupal SDC: `packages/drupal/civui/components/{name}/{name}.component.yml` + `{name}.twig`
- Drupal Storybook story: co-located at `packages/{package}/src/{name}/civ-{name}.drupal.stories.ts`
- Each component dir has an `index.ts` barrel export

## Validation System

16 built-in validators in `@civui/core` — `validate.required()`, `.email()`, `.phone()`, `.phoneIntl()`, `.ssn()`, `.ein()`, `.zip()`, `.zip4()`, `.usState()`, `.isoDate()`, `.url()`, `.currency()`, `.range()`, `.length()`, `.alphanumeric()`, `.routing()`. Each returns `{ valid, error? }`. Use the declarative `validate` attribute on form components for auto-validation on submit.

## Mask System

Input masking engine in `@civui/core` with blur-mode default (mask on blur, raw input on focus). Presets: `ssn`, `phone-us`, `zip`, `zip4`, `ein`, `currency`. Pattern syntax: `#` = digit, `A` = letter, `*` = any. PII-flagged presets (`ssn`, `ein`) auto-enable blur-mode masking.

## Icon System

~40 inline SVG icons based on Material Icons Outlined — no font files, no external requests. Each icon is an SVG path in a 24×24 viewBox with `fill="currentColor"`, so icons inherit color and scale with font-size. Use `<civ-icon name="..." label="...">`. The registry is verified by `pnpm lint:icon-names` (component source) and the `every built-in icon has a label, path, and platform mappings` test in `civ-icon.test.ts`.

Adding a new icon:
1. Find the SVG path from [Material Icons](https://fonts.google.com/icons), [Lucide](https://lucide.dev/), or any SVG icon set.
2. Register it in `packages/core/src/icon/icon-library.ts` with the `path` (SVG `d` attribute), `label`, and native mappings (`ios`, `android`). Multiple paths are separated by `|||`.

**Optional Material Symbols font** — for broad icon coverage without individual paths, consumers can opt in to the full Material Symbols catalog:

```ts
import '@civui/core/styles/material-symbols';
registerIcon('home', { label: 'Home', path: '', symbol: 'home', ios: 'house', android: 'home' });
```

The `material-symbols` npm package is an optional peer dependency — install it only if you import the opt-in stylesheet.

## Platform Support

CivUI ships components for four platforms: Web (Lit), iOS (SwiftUI), Android (Jetpack Compose), and Drupal (SDC).

- **iOS/Android:** `packages/ios/` and `packages/android/`. CI enforces 85%+ API parity across platforms (`parity.yml`) and verifies native files compile (`native.yml`).
- **Drupal:** `packages/drupal/civui/` — a Drupal module with 71 Single Directory Components. Each SDC has a `.component.yml` schema and a `.twig` template that renders the corresponding `<civ-*>` web component. Requires Drupal 10.3+ or 11. Validated by `tools/validate-drupal-sdc.ts`. Drupal parity is included in the parity report.
- **Storybook Twig preview:** Drupal components can be previewed in Storybook via `vite-plugin-twig-drupal`. Stories are co-located as `*.drupal.stories.ts` files next to web component source.

The cross-platform parity check (`tools/parity-report.ts`) parses real source files on each platform and compares APIs. It does **not** validate against `@civui/schema` — that's a separate check (see below).

## Schemas as contract (`@civui/schema`)

`packages/schema/src/components/*.schema.ts` files describe each component's public contract — props, events, accessibility requirements, form behavior — in a platform-neutral form. The Lit web implementation is the canonical reference, and **the schema must match it exactly** for components covered by `tools/schema-parity.ts`.

Why schemas matter:
- They're the contract a contractor (or a new platform implementation) is expected to satisfy.
- Drift between schema and Lit is enforced by `pnpm parity:schema`, which exits 1 on mismatch.
- Schemas serve the contract role directly; no code-generation step is required (the previous `@civui/codegen` package was removed when this approach replaced it).

**Coverage status (62 components, every cross-platform component covered):**
- Form controls: `civ-text-input`, `civ-textarea`, `civ-select`, `civ-combobox`, `civ-date-picker`, `civ-date-range-picker`, `civ-memorable-date`, `civ-file-upload`, `civ-yes-no`, `civ-toggle`
- Choice groups: `civ-checkbox`, `civ-checkbox-group`, `civ-radio-group`, `civ-segmented-control`
- Compound + orchestration: `civ-address`, `civ-name`, `civ-direct-deposit`, `civ-signature`, `civ-race-ethnicity`, `civ-partnership-history`, `civ-relationship`, `civ-service-history`, `civ-repeater`, `civ-form-step`, `civ-conditional`, `civ-summary`, `civ-data-field`, `civ-section-intro`
- Progress + feedback: `civ-progress-steps`, `civ-progress-percent`, `civ-progress-header`, `civ-support-resources`, `civ-alert`, `civ-badge`, `civ-count`
- Overlays: `civ-modal`, `civ-action-sheet`
- Layout + UI: `civ-filterable-list`, `civ-card`, `civ-divider`, `civ-tag`, `civ-list`, `civ-page-header`, `civ-icon`
- Actions: `civ-button`, `civ-link`, `civ-link-card`, `civ-skip-link`, `civ-action-button`, `civ-button-group`, `civ-filter-chip`, `civ-filter-chip-group`
- Navigation: (none registered yet — schemas exist for `civ-nav`, `civ-breadcrumb`, `civ-tabs`, `civ-tab-nav`, `civ-side-nav`, `civ-on-this-page`, `civ-back-to-top` and their item sub-components, but native + Drupal stubs are deferred per `.claude/rules/audit-debt.md`)
- Display-only feedback: (none registered yet — schemas exist for `civ-timeline` + `civ-timeline-item` and `civ-process-list` + `civ-process-list-item`, but native + Drupal stubs are deferred per `.claude/rules/audit-debt.md`)

Five CI gates protect the contract (`.github/workflows/parity.yml`):
- **`schema-parity`** runs `pnpm parity:schema --platforms` — fails on Lit ↔ schema ↔ iOS ↔ Android ↔ Drupal SDC drift.
- **`schema-validate`** runs `pnpm validate:schemas` — fails on structural typos (invalid category / extends / valueMode / requiredIndicator, enum defaults outside the values list, malformed renderOrder).
- **`drupal-sync-clean`** runs `pnpm sync:drupal && git diff --exit-code` — catches hand-edits to Twig / SDC YAML that diverge from regenerator output.
- **`doc-tables-sync`** runs `pnpm validate:doc-tables` — re-syncs `apps/docs/docs/components/**/_<slug>.{props,events}.mdx` from the schemas and fails on `git diff --exit-code`. Catches hand-edits to a generated partial; doc pages import these partials, so the on-page Props / Events tables can't drift.
- **`tool-tests`** runs `pnpm test:tools` — guards regressions in the parity / sync helper functions themselves (151 tests covering prop normalization, snake↔camel, Twig rendering, MDX-safe table-cell escaping).

The check validates **prop name coverage** on all platforms, plus **prop type matching on Drupal SDC YAML** (a `boolean` schema prop must surface as `type: boolean` in Drupal; iOS / Android type-parsing is intentionally not enforced — Swift / Kotlin type expressions are too varied to compare reliably). Naming conventions are normalized automatically:
- iOS `is`-prefix for booleans (`required` → `isRequired`, `tile` → `isTile`)
- HTML-attribute lowercase → native camelCase (`maxlength` → `maxLength`)
- iOS keyword/builtin renames (`type` → `inputType`, `name` → `formName`)
- Drupal SDC snake_case (`show_percent` ↔ `showPercent`)

Mark genuinely web-specific props (Tailwind size variants, ARIA heading-level promotion, JS-only callbacks like `loadOptions`/`beforeContinue`/`validateAddress`) with `webOnly: true` in the schema's `PropDef` — those are excluded from cross-platform diffs.

When the Drupal SDC YAMLs drift, regenerate from schemas with `pnpm sync:drupal` (runs both `sync-drupal-sdc.ts` and `sync-drupal-twig.ts` — idempotent; only appends missing props and rewrites the Twig from the YAML). Native platform updates are hand-edited Swift / Kotlin. See `packages/schema/README.md` for the full naming-convention map and "how to add a new schema" walk-through.

**Out of scope (web-specific layout wrappers):** `civ-fieldset`, `civ-form` — these abstract over how form-headers are rendered on web; native platforms compose the same affordances differently and don't need a contract translation.

**If you modify a covered component**, update its schema in the same change. Run `pnpm parity:schema` before committing — the check fails on missing/added/renamed/retyped props. Inherited form props (`label`, `name`, `value`, `hint`, `error`, `required`, `disabled`, `readonly`, etc.) are filtered on both sides; you don't need to declare them.

**Adding a new component:** drop a schema next to its source in `packages/schema/src/components/civ-<name>.schema.ts`, add a `COVERED_COMPONENTS` entry in `tools/schema-parity.ts`, and the CI gate picks it up automatically.

## Design Rules

Cross-cutting design principles live in `.claude/rules/design-rules.md`. Two rules in particular:

- **Only interactive elements get rounded corners.** Buttons, inputs, links, controls, overlay panels, and pills/badges may carry `border-radius`. Static container chrome (cards, callouts, metric tiles, image thumbnails, info blocks) stays flat. Enforced by `pnpm lint:border-radius` — adding a new rounded class requires a deliberate allowlist entry.
- **Compose existing components before hand-rolling chrome.** Before writing a new `<aside>` / `<div>` with bordered / padded / backgrounded chrome, check the decision tree in `design-rules.md` — the chances are `civ-card`, `civ-callout`, `civ-support-resources`, `civ-link-card`, `civ-section-intro`, `civ-alert`, or one of the form-pattern components already does it. Hand-rolling a parallel BEM (`civ-form-support-resources` next to `civ-support-resources`) is the canonical drift smell.

## AI Component Usage Guide

For comprehensive component usage, HTML examples, government design patterns,
and accessibility requirements, see `docs/ai-guide.md`.

That guide covers:
- Component catalog with props, events, and HTML examples for 40+ web components
- Preset inputs, compound fields, overlays, link variants, and form patterns
- Validation system (16 validators, declarative `validate` attribute)
- Mask system (blur-mode default, 6 presets)
- Icon system (~40 inline SVG icons from Material Icons Outlined, with optional font opt-in)
- Platform support (iOS, Android, Drupal SDC — 4 platforms with 85%+ parity)
- Component selection decision tables (checkbox vs toggle, select vs combobox, date picker vs memorable date)
- Government design patterns (Section 508, plain language, form validation for .gov)
- WCAG 2.1 AA checklist specific to CivUI
- Anti-patterns to avoid
- Tailwind CSS reference (civ- prefix, semantic colors, density system, focus ring)
