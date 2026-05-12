---
title: Quality Gates
sidebar_position: 10
sidebar_label: Quality Gates
---

# Quality Gates

CivUI enforces consistency and cross-platform parity through automated CI checks on every push and pull request to `main`. These checks prevent regressions in component APIs, coding patterns, and native platform coverage.

## CI Workflows

### Parity Check

**Workflow:** `.github/workflows/parity.yml` (job: `parity`)

The parity check extracts component APIs from all four platforms and compares them:

1. **API extraction** -- Parses web (TypeScript `@property`), iOS (Swift struct properties), Android (Kotlin `@Composable` parameters), and Drupal (SDC `.component.yml` prop schemas) to extract props, events, and callbacks at the property level.
2. **Cross-platform comparison** -- For each component, checks that every prop and event on the web side has a corresponding parameter or callback on iOS, Android, and Drupal. Drupal prop names are normalized from `snake_case` to `camelCase` for matching.
3. **Report generation** -- Produces `tools/parity-report.html` with a per-component breakdown showing which props and events are present or missing on each platform (5 columns: Property, Web, iOS, Android, Drupal).
4. **Threshold enforcement** -- Fails the build if any component falls below **85% parity**.
5. **Artifact upload** -- The HTML report is uploaded as a CI artifact (available even on failure) so you can see exactly what's missing.

**Run locally:**

```bash
node --experimental-strip-types tools/parity-report.ts
```

This generates `tools/parity-report.html`. Open it in a browser to see the full breakdown.

### Consistency Check

**Workflow:** `.github/workflows/parity.yml` (job: `consistency`)

The consistency checker scans all web component source files and verifies they follow CivUI patterns:

- **Base class usage** -- Components extend the correct base class (`CivFormElement`, `CivBooleanFormElement`, etc.)
- **Event naming** -- Events use the `civ-` prefix (`civ-input`, `civ-change`, `civ-analytics`)
- **Prop naming** -- Standard props (`label`, `name`, `value`, `hint`, `error`, `required`, `disabled`) are present on form components
- **Form participation** -- Form components have `static formAssociated = true` and implement `updateFormValue()`
- **Render order** -- Templates follow the label, hint, error, control order
- **ARIA attributes** -- Required accessibility attributes are present
- **CSS class conventions** -- Tailwind utilities use the `civ-` prefix
- **Drupal SDC coverage** -- Warns when a web component is missing a corresponding Drupal SDC (non-blocking)

**Run locally:**

```bash
node --experimental-strip-types tools/consistency-check.ts
```

Issues are reported with severity levels: `error` (fails CI), `warning` (logged but non-blocking), and `info` (suggestions).

### Drupal SDC Validation

**Workflow:** `.github/workflows/parity.yml` (job: `consistency`)

The Drupal SDC validator checks all 71 Single Directory Components:

- **YAML structure** -- Each SDC has a valid `.component.yml` with name, props, and slots
- **Twig correctness** -- Templates render the correct `<civ-*>` web component tag
- **Prop mapping** -- Props in the YAML schema map to attributes in the Twig template

**Run locally:**

```bash
node --experimental-strip-types tools/validate-drupal-sdc.ts
```

## Schema-as-Contract Gates

In addition to the parity report (which extracts and compares APIs from all four platforms), CivUI maintains a fifth artifact per component: a **platform-neutral schema** in `@civui/schema` that describes the public contract — props, events, accessibility role, render order, form behavior. **53 of the cross-platform components are covered**; the schema is the source a contractor (or a new platform implementation) reads when writing equivalent native code.

The Lit web implementation is the canonical reference. Four additional CI gates protect drift between the schema and the four implementations.

### Schema Parity

**Workflow:** `.github/workflows/parity.yml` (job: `schema-parity`)

```bash
pnpm parity:schema --platforms
```

Validates that for every covered component:

1. **Lit ↔ schema match** — every `@property` in the Lit source is declared in the schema, and vice versa. Types and `attribute` overrides must match.
2. **Cross-platform name coverage** — every non-`webOnly` schema prop appears on iOS (`Civ{Name}.swift` struct properties), Android (`Civ{Name}.kt` `@Composable` parameters), and Drupal (`{name}.component.yml` props). Naming conventions are normalized automatically (iOS `is`-prefix for booleans, Drupal snake_case, etc.).
3. **Drupal SDC YAML type-drift** — when the schema declares `boolean`, the SDC YAML must declare `type: boolean`. Schema `enum` ↔ Drupal `string`, schema `number` ↔ Drupal `integer`. iOS / Android type-parsing is intentionally not enforced — Swift / Kotlin type expressions vary too much to diff reliably.
4. **Event drift** — events dispatched by the Lit source (`dispatch(this, 'civ-...')` or raw `CustomEvent`) must match the events declared in the schema, including their detail-key shape.

Mark genuinely web-specific props (Tailwind size variants, ARIA `headingLevel`, JS-only callbacks like `loadOptions`/`beforeContinue`, anchor `href` semantics) with `webOnly: true` in the schema's `PropDef` to exclude them from cross-platform diffs.

### Schema Validate

**Workflow:** `.github/workflows/parity.yml` (job: `schema-validate`)

```bash
pnpm validate:schemas
```

Runs `validateAll()` from `@civui/schema/validate` over every `*.schema.ts`. Catches structural typos that TypeScript misses:
- Invalid `category` / `extends` / `valueMode` / `requiredIndicator` values
- Enum defaults outside the declared `values` list
- Malformed `renderOrder` (unknown element types)
- Missing required top-level fields

The validator's accepted-value lists are imported from `schema.types.ts` `as const` arrays — adding a new category, render type, or value mode requires editing exactly one file (the type union and runtime check stay in sync).

### Drupal Sync Clean

**Workflow:** `.github/workflows/parity.yml` (job: `drupal-sync-clean`)

```bash
pnpm sync:drupal && git diff --exit-code
```

Regenerates the Drupal SDC YAMLs and Twig templates from the schemas (idempotent), then fails if `git diff` produces any output. Catches hand-edits to Twig / SDC YAML that diverge from what the regenerator would emit — e.g. a boolean prop rendered as a value-bearing attribute, a missing slot block, a stale prop after a schema rename.

### Tool Tests

**Workflow:** `.github/workflows/parity.yml` (job: `tool-tests`)

```bash
pnpm test:tools
```

59 unit tests over the parity / sync helpers in `tools/__tests__/`. Guards against regressions in:
- Prop-name normalization (iOS `is`-prefix, type → inputType, Kotlin backtick stripping for `when`, HTML-attribute lowercase mapping)
- Snake↔camel conversion
- Drupal SDC key resolution (honors schema's `attribute:` override over default snake conversion)
- Twig boolean/string/slot rendering

Without this gate, a broken parser could silently report drift as in-sync.

### Adding a new schema

When you add a new cross-platform component, drop a schema next to its source in `packages/schema/src/components/civ-<name>.schema.ts`, add a `COVERED_COMPONENTS` entry in `tools/schema-parity.ts`, and add it to the `COMPONENTS` lists in `tools/sync-drupal-sdc.ts` and `tools/sync-drupal-twig.ts`. Run `pnpm sync:drupal` to auto-generate the missing Drupal SDC props, then `pnpm parity:schema --platforms` to verify the cross-platform check passes. The CI gates pick it up automatically — no workflow changes needed.

See [`packages/schema/README.md`](https://github.com/anthropics/civui/blob/main/packages/schema/README.md) for the full naming-convention map, the `webOnly` flag semantics, and the exhaustive list of out-of-scope wrappers.

### Generated contract reference

The Storybook site includes a [Contract](pathname:///civui/storybook/?path=/docs/contract-civ-button--docs) section with one auto-generated page per component (53 pages, one per schema). Each page lists the component's props, events, accessibility role, form behavior, and the file path on each platform. Contract pages live in Storybook (alongside worked examples and the Storybook controls panel) rather than Docusaurus — developers reading a component's contract usually want to see the matching examples in the same context.

Pages are regenerated from `@civui/schema` on every `pnpm storybook` / `pnpm storybook:build` via the `prestorybook` hook (`pnpm storybook:contract`), so the documentation can never drift from the canonical schema. The generated directory (`.storybook/contract/`) is gitignored — pages are byproducts of the schema, not source. Each Docusaurus component page also carries an auto-injected admonition that links across to the matching Storybook contract page.

## Drift-Prevention Gates

A separate set of CI jobs guards against narrative and pattern drift across the whole repo — typos in Tailwind colour classes, stale `<civ-X>` references in long-form docs, story attributes that don't match a real `@property`, JSDoc tags that lie about the API. These gates surfaced from the May 2026 form-pattern audit and they apply to every component, not just form patterns.

### Drift Lints

**Workflow:** `.github/workflows/parity.yml` (job: `drift-lints`)

```bash
pnpm validate:lints
```

Seven fast static lints over the whole repo. Each parses source and exits in under a second:

- **`lint:fieldsets`** — No self-contained group component (`civ-radio-group`, `civ-checkbox-group`, `civ-segmented-control`, `civ-yes-no`, `civ-memorable-date`, `civ-date-range-picker`) is wrapped in `<civ-form-fieldset>`. Wrapping would produce nested fieldsets with double legends and broken slot relocation.
- **`lint:story-embeds`** — Every `<StoryEmbed id="..."/>` in `apps/docs` resolves to a real story export. Catches renames, slug typos (note: Storybook's `startCase` inserts dashes between digits and letters, so `Step1_Hub` becomes `step-1-hub`), and references to deleted components.
- **`lint:story-names`** — Every `StoryObj`'s export name and `name:` display title share at least one substantive token. Catches the failure mode where `export const WithError` had display name `"Custom Button Labels"`, so the Storybook panel title contradicted the rendered content.
- **`lint:story-props`** — Every `<civ-*>` attribute used in any `*.stories.ts` corresponds to a declared `@property` on the underlying component (or one of its known base classes). Catches phantom attributes like `<civ-repeater add-label="...">` (no such prop — should be `item-label`) or `<civ-select preset="document-type">` (presets aren't a thing on civ-select).
- **`lint:prose-refs`** — Every `<civ-X>` tag reference in long-form documentation (`CLAUDE.md`, `AGENTS.md`, `.claude/rules/`, `apps/docs/docs/**/*.mdx`) resolves to a registered custom element. Catches narrative drift — e.g. a `civ-form-field` bullet that outlives the deleted component, or `civ-progress-bar` references that should be `civ-progress-percent`.
- **`lint:color-classes`** — Every `civ-{text|bg|border|ring|fill|stroke|divide|outline}-{family}-{shade}` class anywhere in the repo resolves to a real `--civ-color-*` token defined by `packages/tokens`. Catches shades that don't exist on a family — e.g. the `success` family only has `lightest / lighter / DEFAULT / dark / darkest`, so a `darker` suffix would silently render as plain inherited-coloured text rather than throwing.
- **`lint:jsdoc-props`** — Every `@prop` tag in a component's class-level JSDoc names a declared `@property` on that class, or an inherited prop from a known base class (`CivFormElement`, `CivBooleanFormElement`, `CivCompoundElement`, `PresetInputWrapper`, `LegendHeadingMixin`). The lint normalises camelCase ↔ kebab-case automatically. Catches docstring drift like the `civ-action-sheet` `@prop trapFocus` that actually mapped to property `trapFocusProp`.

The lints scan everything under `packages/`, `apps/docs/docs/`, and (for prose-refs and color-classes) the long-form `.md` / `.mdx` / `.twig` files. They are not pattern-specific — adding a new component category gets the same coverage automatically.

### Doc Tables Sync

**Workflow:** `.github/workflows/parity.yml` (job: `doc-tables-sync`)

```bash
pnpm validate:doc-tables
```

Regenerates the auto-generated `_<component>.props.mdx` and `_<component>.events.mdx` partials from `@civui/schema` (via `pnpm sync:doc-tables`), then fails if `git diff` produces any output. Catches hand-edits to a generated partial — the schema is the source of truth for the Props and Events tables on every component page.

Split from the drift-lints job because it has a different remediation step: run `pnpm sync:doc-tables` locally and commit the diff.

### Storybook Build

**Workflow:** `.github/workflows/parity.yml` (job: `storybook-build`)

```bash
pnpm storybook:build
```

Builds the full Storybook static bundle on every PR. Catches story render-time errors that the static lints miss: a story whose `render()` throws, an import that fails to resolve, an MDX docs page with a syntax error, a Vite/Rollup module-resolution failure, or a contract-page generator that emits invalid markup.

The `prestorybook:build` hook regenerates the contract MDX pages first, so this gate also covers the schema → contract page generator. Native bundle size is currently ~1MB ungzipped — the bundle-size CI gate tracks regressions on that separately.

### Native Compile Check

**Workflow:** `.github/workflows/native.yml`

This workflow only runs when iOS or Android files change (path filter: `packages/ios/**` and `packages/android/**`).

**iOS job** (runs on `macos-latest`):
- Runs `swiftc -parse` on all `.swift` files to verify they parse without syntax errors
- Runs `swift test` if a `Package.swift` exists

**Android job** (runs on `ubuntu-latest`):
- Verifies every `.kt` file has a valid `package` declaration in the first 10 lines
- Counts total Kotlin files to confirm none are missing

### Bundle Size Check

**Workflow:** `.github/workflows/bundle-size.yml`

Tracks the bundled output size of web packages to prevent unintended size regressions.

## Fixing Parity Failures

When the parity check fails, the CI log will show which components are below 85%:

```
FAIL: TextInput at 90% (minimum 95%)
```

To fix it:

1. Download the parity report artifact from the CI run, or generate it locally.
2. Open `tools/parity-report.html` and find the failing component.
3. The report shows which props or events are missing on each platform.
4. Add the missing props/callbacks to the platform component files:
   - iOS: `packages/ios/Sources/CivUI/Civ{Name}.swift`
   - Android: `packages/android/src/main/kotlin/gov/civui/components/Civ{Name}.kt`
   - Drupal: `packages/drupal/civui/components/{name}/{name}.component.yml` + `{name}.twig`
5. Re-run the parity report locally to verify the fix.
6. Push and confirm CI passes.

## Fixing Consistency Failures

When the consistency check fails, the output shows which rule was violated:

```
ERROR: packages/forms/src/text-input/civ-text-input.ts
  Rule: event-naming
  Message: Event "input" should use "civ-input" prefix
```

Fix the component source to follow the pattern described in the error message, then re-run the check locally to confirm.

## Pull Request Template

Every PR uses the template at `.github/PULL_REQUEST_TEMPLATE.md`, which includes:

- **Platform checklist** — checkboxes for Web, iOS, Android, Drupal SDC, and Drupal story updates
- **Testing checklist** — unit tests, Storybook verification, parity report

This ensures contributors don't forget to update native counterparts when changing component APIs.

## Summary of Thresholds

| Check | Threshold | Blocking |
|-------|-----------|----------|
| Parity report | 85% per component | Yes |
| Schema parity (Lit ↔ schema ↔ iOS ↔ Android ↔ Drupal SDC) | 0 drift across 53 components | Yes |
| Schema parity — Drupal SDC YAML type-drift | 0 type mismatches | Yes |
| Schema validate (structural correctness) | 0 errors | Yes |
| Drupal sync clean (regenerator output matches commit) | 0 diff | Yes |
| Tool tests (parity / sync helpers) | 59/59 pass | Yes |
| Drupal SDC validation | All 71 SDCs valid | Yes |
| Drift lints (7 lints across repo) | 0 violations | Yes |
| Doc tables sync (schema → MDX partials) | 0 diff | Yes |
| Storybook build (story / MDX / Vite resolution) | Builds successfully | Yes |
| Consistency errors | 0 errors | Yes |
| Consistency warnings | Unlimited | No |
| Native compile (Swift) | Must parse | Yes |
| Native compile (Kotlin) | Must have package declaration | Yes |
| Bundle size | Configured per package | Yes |
