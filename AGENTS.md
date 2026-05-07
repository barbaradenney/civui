# AGENTS.md — CivUI runbook for AI agents

Task-oriented reference. CLAUDE.md has the architecture; this file has the recipes. When you hit a CI failure or need to perform a common operation, look here first.

> **Convention:** files referenced by `path:line` use the canonical paths. The line numbers may drift; the file paths shouldn't.

---

## When something fails in CI

The CI gates that protect the schema-as-contract feature each have a specific failure mode and a specific recovery. Match the failing job to its recipe below — the failure messages are designed to be parseable.

### `schema-parity` (Lit ↔ schema drift)

Symptom: `civ-X: props in source but missing from schema: foo` or `props in schema but no longer in source: bar`.

The Lit canonical source diverged from the schema. **The schema is contract; the Lit source is the implementation.** When they disagree, decide which side is right:

- **Lit source is correct (you intentionally added `foo`)** → add `foo` to `packages/schema/src/components/civ-X.schema.ts` with a description, type, and default.
- **Schema is correct (you accidentally added `foo` to Lit)** → remove `foo` from the Lit source.

Run `pnpm parity:schema --platforms` locally to confirm fix.

### `schema-parity` (cross-platform: iOS / Android / Drupal SDC missing prop)

Symptom: `ios: missing schema props in source (1): foo`.

The schema declares `foo`, but the iOS Swift struct doesn't have it. **Three legitimate fixes** — pick based on the prop's nature:

| If the prop is... | Then... |
|---|---|
| A real cross-platform feature missing on this platform | Add `foo: <Type>` to `packages/ios/Sources/CivUI/CivX.swift` (and `CivX.kt` for Android, `<name>.component.yml` for Drupal). Match the schema's type. |
| A web-specific concept (HTML attribute, Tailwind sizing, JS-only callback, etc.) | Mark the prop `webOnly: true` in the schema. Cross-platform check skips it. |
| A platform-divergent wire format (web JSON-string ↔ native typed array, web HTML attribute ↔ native object) | Mark `webOnly: true` AND document the divergence in the schema's description. |

Examples in the codebase:
- `civ-link.newTab`: HTML target/rel concept → `webOnly: true`
- `civ-progress-steps.steps`: JSON-string on web, `[String]` on native → `webOnly: true` with rationale
- `civ-link-card.eyebrow`: real prop missing on iOS/Android → ADD to native source

### `schema-parity` (Drupal SDC YAML type-drift)

Symptom: `drupal: foo type mismatch — schema expects boolean, drupal declares string`.

The SDC YAML's `type:` field disagrees with the schema's `PropDef.type`. The schema is contract — fix the YAML:

```sh
# Edit packages/drupal/civui/components/<name>/<name>.component.yml
# Change `type: <wrong>` to match schema (boolean → boolean, number → integer, enum → string, etc.)
```

Then `pnpm sync:drupal && pnpm parity:schema --platforms` to verify.

### `schema-parity` (iOS/Android type-drift)

Symptom: `ios: foo type mismatch — schema expects string (one of: string-or-enum, unknown), ios declares Bool (boolean)`.

Real type drift — schema and native disagree on the value's *kind*. Fix the native source:

```swift
// Before:
public var persist: Bool = false

// After (matches schema's `string`):
public var persist: String = ""
```

If the native API genuinely needs a different shape (e.g., iOS takes `CGFloat` for sizing where web takes a string shorthand), mark `webOnly: true` in the schema. See `civ-icon.size` for the precedent.

### `schema-validate` (structural error)

Symptom: `civ-X.props.foo.type: Invalid prop type "object". Must be one of: string, boolean, number, enum, array`.

A schema field has a value outside the accepted enum. The error message lists valid values. Fix the schema. The accepted-value lists are in `packages/schema/src/schema.types.ts` as `as const` arrays — adding a new value requires editing that file (and possibly `tools/sync-drupal-sdc.ts` if it's a `PropType` that needs Drupal mapping).

### `drupal-sync-clean` (Twig / SDC YAML hand-edited)

Symptom: `Drupal SDC YAML or Twig templates drift from schema. Run \`pnpm sync:drupal\` locally and commit the result.`

Someone hand-edited a `.component.yml` or `.twig` and the regenerator produces a different output. The regenerator is canonical:

```sh
pnpm sync:drupal
git add -A
git commit -m "regenerate Drupal SDC YAML/Twig from schema"
```

Look at `git diff` first — sometimes the hand-edit was intentional and the *schema* needs updating instead of the SDC.

### `tool-tests` (vitest unit failure)

Symptom: standard vitest output. The 84 tests in `tools/__tests__/` cover the parsers, normalizers, and Twig/YAML renderers. If a test fails, you've broken a parser invariant — don't add the test to the skip list. Read the test name, fix the parser to satisfy it.

### `docs-build` (Docusaurus failed)

Two common failure modes:

- **MDX compilation failed for file "/contract/civ-X.md"** → a schema description has a character MDX can't handle (raw `<select>`, unescaped `{`, colon in YAML frontmatter without quotes). Fix the description in the schema. The generator at `tools/generate-contract-docs.ts` HTML-encodes `<` and `>` in body text, but new patterns may slip through.
- **Broken link** → a schema rename or restructure left a dangling reference. Find with `cd apps/docs && pnpm build` locally; the error lists exact source/target paths.

### `consistency-check`

Symptom: `civ-X does not use renderError()` or similar.

The consistency checker enforces patterns documented in CLAUDE.md (label/hint/error order, `civ-` prefix, ARIA conventions). The error message identifies the rule. If you legitimately need an exception, add the component to the appropriate exclusion set in `tools/consistency-check.ts` with a comment explaining why.

---

## Common tasks

### Add a new component (full cross-platform)

For a single touch-point, see "Add a prop to an existing component." Adding a *new component* touches 9 places. **Use `pnpm scaffold:component <name>` to do the mechanical setup** (creates schema skeleton, registers in 3 tool tables, stubs native files). Then implement:

1. **Lit component** at `packages/<package>/src/<name>/civ-<name>.ts` — the canonical reference. Extend `CivBaseElement` (display) or `CivFormElement` (form-participating). Use Light DOM (`createRenderRoot()` returns `this`).
2. **Lit tests** at `packages/<package>/src/<name>/civ-<name>.test.ts` using `@civui/test-utils`.
3. **Schema** at `packages/schema/src/components/civ-<name>.schema.ts` — describe every `@property`, every dispatched event, the a11y role, the render order, the form behavior. Inherited form props (label/value/hint/etc.) are filtered automatically — don't declare them.
4. **iOS** at `packages/ios/Sources/CivUI/Civ<Name>.swift` — SwiftUI view with `public var` for each schema prop. Booleans use `is`-prefix (`required` → `isRequired`).
5. **Android** at `packages/android/src/main/kotlin/gov/civui/components/Civ<Name>.kt` — `@Composable fun Civ<Name>(...)` with parameters matching schema names. Reserved-word props use backtick escaping (`` `when` ``).
6. **Drupal SDC YAML + Twig** at `packages/drupal/civui/components/<name>/`. The scaffolder creates stubs; `pnpm sync:drupal` fills in props from schema.
7. **Verify all gates pass:** `pnpm validate` (which runs lint + typecheck + tests + parity:schema + validate:schemas + test:tools).
8. **Commit.**

### Add a prop to an existing component

1. Add `@property({...}) propName = ...` to the Lit source.
2. Add the matching declaration to the iOS Swift struct AND Android Kotlin function (or mark `webOnly: true` in the schema if it's web-specific).
3. Add to the schema's `props` map.
4. Run `pnpm sync:drupal` (auto-adds the prop to Drupal SDC YAML and updates Twig).
5. Run `pnpm parity:schema --platforms` to verify zero drift.
6. Commit.

### Rename a prop

Renames are higher-friction because the old name lingers in the build artifacts and component pages. Steps:

1. Rename in the Lit source (incl. `@property` and any usage).
2. Rename in iOS / Android / Drupal SDC YAML.
3. Rename in the schema (and update `attribute:` if the HTML attribute name changed).
4. Run `pnpm sync:drupal` to refresh Twig.
5. Run `pnpm parity:schema --platforms` to verify.
6. Run `pnpm docs:contract` to regenerate the contract page (or just `cd apps/docs && pnpm build`).
7. Search for the old name in `docs/`, `apps/docs/`, and `CLAUDE.md` — update references manually.

### Mark a prop `webOnly`

Set `webOnly: true` on the prop in the schema. The cross-platform check will skip it. Document the divergence in the prop's `description`. Examples:

```ts
// Web-specific concept with no native equivalent:
target: {
  type: 'string',
  description: 'HTML target attribute. Web-only — native platforms route URLs through the OS, which has no concept of named targets.',
  default: '',
  webOnly: true,
},
```

### Add a new schema category

Edit `COMPONENT_CATEGORIES` in `packages/schema/src/schema.types.ts` (it's an `as const` array — the TS union and the runtime validator both derive from it). Then use the new category in your schema. No other files need updating.

### Investigate why parity says X but you expected Y

Run with verbose output:

```sh
pnpm parity:schema --platforms 2>&1 | grep -A5 "civ-<name>"
```

The output names the platform, the prop, the kind of mismatch. If it says "missing schema props in source," the platform's native file lacks that prop. If "type mismatch," the types disagree. If you can't reproduce the error message, your local schema may be out of sync with the source — `pnpm sync:drupal` first.

---

## Decision trees

### "Should this prop be `webOnly`?"

```
Is the prop a Tailwind utility class (size, width, color)?
  → YES: webOnly. Native uses platform-native sizing primitives.

Is the prop an ARIA semantic (heading-level, role)?
  → YES (usually): webOnly. Native uses isHeader/role traits, not numeric ARIA levels.

Is the prop a JS-only callback (loadOptions, beforeContinue)?
  → YES: webOnly. Native equivalents differ by platform.

Is the prop an HTML attribute concept (target, rel, download)?
  → YES (usually): webOnly. Native has no DOM.

Is the prop conceptually cross-platform but the WIRE FORMAT differs
(web stores a JSON-encoded string in an HTML attribute, native uses
a typed array; web takes a CSV string, native takes [UTType])?
  → YES: webOnly. Document the divergence in the description.

Is the prop a real cross-platform feature that's just not yet on iOS/Android?
  → NO: don't mark webOnly. ADD to the native source.
```

### "Should I add a schema for this component?"

In scope:
- Cross-platform components with iOS + Android + Drupal implementations
- Components a contractor would need to implement on a new platform

Out of scope:
- Web-specific layout wrappers (`civ-form-field`, `civ-form-fieldset`, `civ-fieldset`, `civ-form`)
- Child components bundled into parents on native (`civ-list-item`, `civ-radio` singular)
- Preset wrappers that inherit everything from a parent (`civ-ssn`, `civ-ein`, `civ-phone` — sugar over `civ-text-input`)

### "Should this be a new schema or just a prop on an existing one?"

If consumers would import a NEW `<civ-thing>` element → new schema. If it's a variation of `<civ-existing>` controlled by a `mode`/`variant` prop → just a prop.

---

## Anti-patterns specific to this repo

These are mistakes AIs commonly make in this codebase. Each has surfaced during real work.

| Anti-pattern | Correct approach |
|---|---|
| Hand-editing a Drupal SDC YAML or Twig | Edit the schema, run `pnpm sync:drupal`. The `drupal-sync-clean` CI gate fails on hand-edits. |
| Hand-editing a `/contract/civ-X.md` page | Edit the schema, regenerate. Contract pages are gitignored — they regenerate on every docs build. |
| Adding a `webOnly` flag to dodge a real drift | webOnly is for genuine platform divergence, not "I don't want to add this to iOS yet." Verify the criteria above. |
| Putting a colon (`:`) in a schema description without thinking | The contract-docs generator quotes YAML scalars, but new descriptions with raw `<select>`, `{`, `}` need MDX-friendly escaping. Look at existing descriptions for the pattern. |
| Running `pnpm publish` from `packages/schema` | The `prepublishOnly` hook builds, but actual publishing is a manual step requiring credentials. Don't publish unless explicitly asked. |
| Renaming `INHERITED_FORM_PROPS` in one tool but not others | Single source of truth lives in `tools/lib/inherited.ts`. Edit that one file. |

---

## Important files (the source-of-truth tables)

| Concept | File |
|---|---|
| Schema covered components | `tools/schema-parity.ts` `COVERED_COMPONENTS` |
| Drupal SDC sync mappings | `tools/sync-drupal-sdc.ts` `COMPONENTS` |
| Drupal Twig regen mappings | `tools/sync-drupal-twig.ts` `COMPONENTS` |
| Inherited form props (skipped from diffs) | `tools/lib/inherited.ts` |
| Valid schema categories / prop types / etc. | `packages/schema/src/schema.types.ts` `as const` arrays |
| Slug aliases for combined doc pages | `tools/generate-contract-docs.ts` `SLUG_ALIAS` |
| Native naming conventions (iOS is-prefix etc.) | `tools/schema-parity.ts` `iosPropAlternatives` / `androidPropAlternatives` |
| HTML attribute → native camelCase mapping | `tools/schema-parity.ts` `HTML_ATTR_TO_NATIVE_CAMEL` |

---

## Helpful commands

```sh
# Verify all schema gates locally (mirrors CI):
pnpm parity:schema --platforms
pnpm validate:schemas
pnpm test:tools
pnpm sync:drupal && git diff --exit-code
cd apps/docs && pnpm build

# Or all of the above at once:
pnpm validate

# Investigate a specific component's drift:
pnpm parity:schema --platforms 2>&1 | grep -A5 "civ-<name>"

# Regenerate Drupal SDC YAML and Twig from schemas:
pnpm sync:drupal

# Regenerate contract pages (auto-runs on docs build via prebuild hook):
pnpm docs:contract

# Build the publish-ready @civui/schema package:
cd packages/schema && pnpm build

# Preview the npm package shape without publishing:
cd packages/schema && npm pack --dry-run
```

---

## When in doubt

1. Read the failing CI message — it's designed to be specific.
2. Run the local equivalent (`pnpm parity:schema --platforms`, etc.).
3. Check this runbook for the recipe.
4. If still stuck: read `packages/schema/README.md` (deep contract reference) or `CLAUDE.md` (architecture).
5. Don't bypass a gate. The drift it's protecting from is real.
