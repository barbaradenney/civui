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

1. **API extraction** -- Parses web (TypeScript), iOS (Swift), Android (Kotlin), and Drupal (SDC YAML/Twig) source files to extract props, events, and callbacks.
2. **Cross-platform comparison** -- For each component, checks that every prop and event on the web side has a corresponding parameter or callback on iOS, Android, and Drupal.
3. **Report generation** -- Produces `tools/parity-report.html` with a per-component breakdown showing which props and events are present or missing on each platform (4 columns: Web, iOS, Android, Drupal).
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

The Drupal SDC validator checks all 69 Single Directory Components:

- **YAML structure** -- Each SDC has a valid `.component.yml` with name, props, and slots
- **Twig correctness** -- Templates render the correct `<civ-*>` web component tag
- **Prop mapping** -- Props in the YAML schema map to attributes in the Twig template

**Run locally:**

```bash
node --experimental-strip-types tools/validate-drupal-sdc.ts
```

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

## Summary of Thresholds

| Check | Threshold | Blocking |
|-------|-----------|----------|
| Parity | 85% per component | Yes |
| Drupal SDC validation | All SDCs valid | Yes |
| Consistency errors | 0 errors | Yes |
| Consistency warnings | Unlimited | No |
| Native compile (Swift) | Must parse | Yes |
| Native compile (Kotlin) | Must have package declaration | Yes |
| Bundle size | Configured per package | Yes |
