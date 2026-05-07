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

Build order: `tokens → core → layout → navigation → actions, overlays → inputs → controls → compound → form-patterns`

| Package | Path | Description |
|---------|------|-------------|
| `@civui/tokens` | `packages/tokens/` | Design tokens (colors, spacing, typography) |
| `@civui/core` | `packages/core/` | Base classes, a11y utilities, analytics, date utils, form-field wrappers |
| `@civui/actions` | `packages/actions/` | Action components (button, action-button, button-group, filter-chip, action-link) |
| `@civui/overlays` | `packages/overlays/` | Overlay components (modal, action-sheet) |
| `@civui/layout` | `packages/layout/` | Layout components (card, divider, input-group, list, page-header, tag) |
| `@civui/inputs` | `packages/inputs/` | Input components (text-input, textarea, select, combobox, date-picker, file-upload, toggle, yes-no) + preset wrappers (ssn, ein, phone, email, zip, currency, routing-number, va-file-number, country) |
| `@civui/controls` | `packages/controls/` | Selection controls (checkbox, radio, segmented-control) |
| `@civui/compound` | `packages/compound/` | Compound fields (address, name, direct-deposit, signature, race-ethnicity, relationship, marriage-history, service-history) |
| `@civui/form-patterns` | `packages/form-patterns/` | Form orchestration (form, form-step, repeater, summary, prefill, progress, conditional) |
| `@civui/feedback` | `packages/feedback/` | Feedback components (alert, badge, count) |
| `@civui/navigation` | `packages/navigation/` | Navigation components (skip-link, link, link-card) |
| `@civui/test-utils` | `packages/test-utils/` | Test helpers: `fixture`, `cleanupFixtures`, `elementUpdated`, `pressKey`, `typeText` |
| `@civui/cli` | `packages/cli/` | CLI tooling |
| `@civui/content` | `packages/content/` | Content/copy management |
| `@civui/mcp-server` | `packages/mcp-server/` | MCP server for AI-assisted form conversion |
| `@civui/drupal` | `packages/drupal/` | Drupal SDC module — 69 Single Directory Components for Drupal 10.3+/11 |
| `@civui/schema` | `packages/schema/` | Platform-neutral component schemas — the contract each platform implementation must satisfy (see "Schemas as contract" below) |
| `@civui/codegen` | `packages/codegen/` | Cross-platform code generator (dormant; not run by CI) |

## Commands

```bash
pnpm test          # Run all tests (3600+ tests across packages)
pnpm build         # Build all packages (respects dependency order)
pnpm typecheck     # TypeScript type checking
pnpm lint          # ESLint
pnpm validate      # lint + typecheck + test (full CI check)
pnpm storybook     # Dev server on port 6006
civui generate component <name>  # Scaffold new component across all 4 platforms
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
import '@civui/controls/radio';

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

### Form Field Wrappers
Form input components (text-input, textarea, select, combobox, date-picker, file-upload) are **bare controls** — they render only the input element. Wrap them in `<civ-form-field>` for label/hint/error:

```html
<civ-form-field label="Email address" hint="Work email preferred" required>
  <civ-text-input type="email" name="email"></civ-text-input>
</civ-form-field>
```

Group components (radio-group, checkbox-group, segmented-control, yes-no, memorable-date, date-range-picker) use `<civ-form-fieldset>`:

```html
<civ-form-fieldset legend="Preferred contact method" required>
  <civ-radio-group name="contact">
    <civ-radio value="email" label="Email"></civ-radio>
    <civ-radio value="phone" label="Phone"></civ-radio>
  </civ-radio-group>
</civ-form-fieldset>
```

`civ-form-field` and `civ-form-fieldset` cascade `required`/`disabled` to their child component and wire ARIA attributes automatically.

**Self-contained components** (checkbox, toggle, and all compound components) render their own labels inline and do not need wrappers.

### Events
- `civ-input` — fires on every value change (like native `input`)
- `civ-change` — fires on committed value change (like native `change`)
- `civ-analytics` — analytics tracking events
- Event detail shapes:
  - `{ value: string }` — single-value (text-input, textarea, select, radio-group, segmented-control, date-picker)
  - `{ values: string[] }` — multi-value (checkbox-group)
  - `{ checked: boolean, value: string }` — boolean controls (checkbox, toggle)
  - `{ files: File[] }` — file-upload
  - `{ value: string, label: string }` — combobox civ-change
  - `{ value: string, month: string, day: string, year: string }` — memorable-date

### Rendering Order
`civ-form-field` enforces: label → hint → error → control → supplementary info.
`civ-form-fieldset` enforces: legend → hint → error → controls.
Both use `renderFormHeader()` from `@civui/core` internally.

### Mobile Popups — Bottom Sheet Rule
All popups, dropdowns, and dialogs **must** render as bottom sheets on mobile (≤480px). Use the shared `.civ-bottom-sheet` utility class for new popup components:

```html
<!-- Add civ-bottom-sheet class to any popup element -->
<div class="my-dropdown civ-bottom-sheet">...</div>
```

The `.civ-bottom-sheet` class is defined in `components.css` and applies bottom-anchored fixed positioning with rounded top corners on mobile. For components that can't add the class (because they have their own CSS), copy the same pattern.

Components using this: `civ-modal` (via native `<dialog>` + CSS), `civ-action-sheet`, `civ-datepicker-dialog`, `civ-combobox-listbox`. Native `<select>` gets OS-level bottom sheet automatically.

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

14 inline SVG icons based on Material Icons Outlined — no font files, no external requests. Each icon is an SVG path in a 24×24 viewBox with `fill="currentColor"`, so icons inherit color and scale with font-size. Use `<civ-icon name="..." label="...">`.

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
- **Drupal:** `packages/drupal/civui/` — a Drupal module with 69 Single Directory Components. Each SDC has a `.component.yml` schema and a `.twig` template that renders the corresponding `<civ-*>` web component. Requires Drupal 10.3+ or 11. Validated by `tools/validate-drupal-sdc.ts`. Drupal parity is included in the parity report.
- **Storybook Twig preview:** Drupal components can be previewed in Storybook via `vite-plugin-twig-drupal`. Stories are co-located as `*.drupal.stories.ts` files next to web component source.

The cross-platform parity check (`tools/parity-report.ts`) parses real source files on each platform and compares APIs. It does **not** validate against `@civui/schema` — that's a separate check (see below).

## Schemas as contract (`@civui/schema`)

`packages/schema/src/components/*.schema.ts` files describe each component's public contract — props, events, accessibility requirements, form behavior — in a platform-neutral form. The Lit web implementation is the canonical reference, and **the schema must match it exactly** for components covered by `tools/schema-parity.ts`.

Why schemas matter:
- They're the contract a contractor (or a new platform implementation) is expected to satisfy.
- Drift between schema and Lit is enforced by `pnpm parity:schema`, which exits 1 on mismatch.
- The dormant `@civui/codegen` package can still consume schemas if revived, but the contract role works without codegen.

**Coverage status:**
- Phase 1 (covered by `parity:schema`): `civ-text-input`, `civ-checkbox`, `civ-radio-group`, `civ-yes-no`.
- Phase 2 (planned): sync the remaining ~12 existing schemas, add schemas for `civ-address`, `civ-name`, `civ-direct-deposit`, `civ-signature`, `civ-form-step`, `civ-repeater`, `civ-progress`, then expand `PHASE_1_COMPONENTS` in `tools/schema-parity.ts` to cover them.

**If you modify a Phase 1 component**, update its schema in the same change. Run `pnpm parity:schema` before committing — the check fails on missing/added/renamed/retyped props. Inherited form props (`label`, `name`, `value`, `hint`, `error`, `required`, `disabled`, `readonly`, etc.) are filtered on both sides; you don't need to declare them.

**If you modify a non-Phase-1 component**, no obligation yet — but if you can sync the schema while you're there, you make Phase 2 cheaper.

## AI Component Usage Guide

For comprehensive component usage, HTML examples, government design patterns,
and accessibility requirements, see `docs/ai-guide.md`.

That guide covers:
- Component catalog with props, events, and HTML examples for 40+ web components
- Preset inputs, compound fields, overlays, link variants, and form patterns
- Validation system (16 validators, declarative `validate` attribute)
- Mask system (blur-mode default, 6 presets)
- Icon system (14 inline SVG icons from Material Icons Outlined, with optional font opt-in)
- Platform support (iOS, Android, Drupal SDC — 4 platforms with 85%+ parity)
- Component selection decision tables (checkbox vs toggle, select vs combobox, date picker vs memorable date)
- Government design patterns (Section 508, plain language, form validation for .gov)
- WCAG 2.1 AA checklist specific to CivUI
- Anti-patterns to avoid
- Tailwind CSS reference (civ- prefix, semantic colors, density system, focus ring)
