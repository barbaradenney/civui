# @civui/schema

Platform-neutral component schemas — the **contract** that every CivUI platform implementation (Lit, iOS SwiftUI, Android Compose, Drupal SDC) must satisfy.

## What this package is

Each component has a schema in `src/components/civ-<name>.schema.ts` that describes its **public contract**: props, events, accessibility role, render order, form behavior. The schema is platform-neutral — it does not know about Tailwind classes, SwiftUI modifiers, or Compose semantics.

The Lit web implementation is the **canonical reference**. The schema must match it exactly. The other platforms (iOS, Android, Drupal SDC) must declare every non-`webOnly` prop the schema declares.

## What this package is NOT

It is **not** a code generator. The previous `@civui/codegen` package was retired when the schemas-as-contract approach replaced it. Schemas serve the contract role directly:
- A new platform implementation (or a contractor) reads a schema and writes the equivalent native code.
- CI enforces parity via `tools/schema-parity.ts` — drift between schema and any platform fails the build.

## How drift is enforced

Four CI gates protect the contract (`.github/workflows/parity.yml`):

| Gate | Tool | Catches |
|------|------|---------|
| `schema-parity` | `tools/schema-parity.ts --platforms` | Lit ↔ schema ↔ iOS ↔ Android ↔ Drupal SDC prop drift, plus Drupal SDC YAML type-drift (a `boolean` schema prop must surface as `type: boolean` in YAML, etc.) |
| `schema-validate` | `pnpm validate:schemas` | Structural typos that TypeScript misses — invalid `category` / `extends` / `valueMode` / `requiredIndicator`, enum defaults outside the values list, malformed `renderOrder` |
| `drupal-sync-clean` | `tools/sync-drupal-{sdc,twig}.ts` + `git diff --exit-code` | Hand-edits to SDC YAML / Twig that diverge from regenerator output |
| `tool-tests` | `pnpm test:tools` | Regressions in the parity / sync helper functions themselves (59 unit tests) |

iOS / Android type-parsing is intentionally **not** enforced — Swift / Kotlin type expressions vary too much (`Bool`, `@Binding<Bool>`, `Int?`, custom enums like `LinkCardVariant`, etc.) to diff reliably without a full type system. The check covers names on all platforms and types on Drupal SDC, where YAML directly declares them.

Run locally before pushing:

```sh
pnpm parity:schema --platforms
pnpm validate:schemas
pnpm sync:drupal && git diff --exit-code
pnpm test:tools
```

## Naming conventions across platforms

Schemas use camelCase prop names (matching Lit). The parity tool normalizes them per-platform automatically:

| Platform | Convention | Example |
|----------|------------|---------|
| Lit (web) | camelCase JS property; explicit `attribute` for HTML | `validateType` ↔ `validate-type` (or `validate` if `attribute: 'validate'`) |
| iOS SwiftUI | camelCase, with `is`-prefix for booleans; reserved words renamed | `required` ↔ `isRequired`, `type` ↔ `inputType`, `name` ↔ `formName` |
| Android Compose | camelCase verbatim; reserved words renamed | `type` ↔ `inputType`; reserved words like `when` use backtick escaping |
| Drupal SDC YAML | snake_case; honors schema's explicit `attribute` over default snake conversion | `validateType` (with `attribute: 'validate'`) ↔ `validate` in YAML |
| HTML attribute | kebab-case (lowercase tokens) | `maxlength`, `minlength`, `inputmode` map to native `maxLength` / `minLength` / `inputMode` |

The full normalization map lives in `tools/schema-parity.ts` (`iosPropAlternatives`, `androidPropAlternatives`, `HTML_ATTR_TO_NATIVE_CAMEL`).

## The `webOnly` flag

Mark a `PropDef` with `webOnly: true` when the prop is a web-specific abstraction with no clean cross-platform mapping. The parity check excludes it from iOS / Android / Drupal diffs.

Genuinely web-only props include:
- **Tailwind size variants** (`width`, `size` on visual-only components)
- **ARIA heading-level promotion** (`headingLevel` — native platforms expose headings via `accessibilityAddTraits(.isHeader)` / Compose semantics, not numeric levels)
- **JS-only callbacks** (`loadOptions`, `beforeContinue`, `validateAddress`, `onEdit` — `attribute: false` props that can't round-trip through HTML)
- **Lit-only convenience properties** (e.g. `civ-data-field`'s `values: string[]` — JS array; native equivalents differ in shape)
- **HTML-attribute-only props** (e.g. `civ-data-field`'s `href` — render-time link, not a value the native components expose)

If iOS and Android happen to also declare a webOnly prop (as a no-op or convenience), that's fine — webOnly relaxes the requirement, it doesn't forbid the prop.

## Adding a new schema

1. **Create the schema file** at `packages/schema/src/components/civ-<name>.schema.ts`. Use an existing schema (e.g. `civ-text-input.schema.ts`) as a template. Inherited form props (`label`, `name`, `value`, `hint`, `error`, `required`, `disabled`, `readonly`, `touched`, ...) are filtered automatically — do NOT declare them.

2. **Wire it into the parity tool** by adding an entry to `COVERED_COMPONENTS` in `tools/schema-parity.ts`:

   ```ts
   { name: 'civ-foo', source: 'packages/.../civ-foo.ts',
     ios: 'packages/ios/Sources/CivUI/CivFoo.swift',
     android: 'packages/android/.../CivFoo.kt',
     drupal: 'packages/drupal/civui/components/foo/foo.component.yml' },
   ```

3. **Wire it into the sync tools** by adding entries to `tools/sync-drupal-sdc.ts` and `tools/sync-drupal-twig.ts` `COMPONENTS` lists.

4. **Run the gates locally:**

   ```sh
   pnpm parity:schema --platforms
   pnpm sync:drupal       # auto-adds missing props to SDC YAML and regenerates Twig
   pnpm parity:schema --platforms  # confirm 0 drift
   pnpm test:tools
   ```

5. **CI picks it up automatically** — no workflow changes needed. The `schema-parity` job iterates `COVERED_COMPONENTS`.

## Out of scope

These components do **not** have schemas because they're web-specific layout / orchestration wrappers without cross-platform contracts:

- `civ-form-field`, `civ-form-fieldset`, `civ-fieldset` — abstract over how form headers are rendered on web. Native platforms compose the same affordances differently and don't need a contract translation.
- `civ-form` — top-level form orchestration; native uses framework-native form patterns (SwiftUI `Form`, Compose `Column`).

These are tracked in `tools/schema-parity.ts` as deliberately out of scope (see the comment header in `COVERED_COMPONENTS`).

## Schema validator

`src/validate.ts` exports `validateSchema(schema)` (single schema) and `validateAll(schemas)` (batched). `tools/validate-schemas.ts` walks every `*.schema.ts` and runs `validateAll`; CI runs it via the `schema-validate` job.

Run it ad-hoc against a single schema during authoring:

```ts
import { validateSchema } from '@civui/schema/validate';
import schema from './components/civ-foo.schema.js';
console.log(validateSchema(schema));
```
