# Contributing to CivUI

Thanks for your interest in contributing! CivUI is a design system built for
public-sector software, so contributions are evaluated against accessibility,
plain-language, and cross-platform-parity standards in addition to the usual code
review criteria.

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md).
By participating, you agree to uphold its terms.

## Ways to contribute

- **Report a bug:** open an issue using the bug report template.
- **Propose a feature:** open an issue using the feature request template so we
  can discuss the design before code is written.
- **Improve documentation:** fixes to the Docusaurus site (`apps/docs/`), the
  Storybook stories, or the long-form guides under `docs/` are always welcome.
- **Submit a pull request:** see the workflow below.

## Development setup

```bash
# Requires Node.js >= 20 and pnpm 9
pnpm install
pnpm build           # builds packages in dependency order
pnpm storybook       # http://localhost:6006
pnpm test            # 3600+ tests across packages
```

For a fast iteration loop on a single package:

```bash
pnpm --filter @civui/inputs test --watch
pnpm --filter @civui/inputs build --watch
```

## Coding conventions

CivUI has a fairly opinionated style. Most of it is enforced by lints; the rest
is documented in [`CLAUDE.md`](CLAUDE.md) and the `.claude/rules/` folder. Skim
those before opening a non-trivial PR.

Highlights:

- **Light DOM only.** `createRenderRoot()` returns `this`. No Shadow DOM.
- **Tailwind with the `civ-` prefix.** Use semantic tokens (`civ-text-error`,
  `civ-bg-primary`). Not hex codes, not gray text on body copy.
- **Self-contained form controls.** Every input renders its own label / hint /
  error chrome from props. Do not wrap controls in `civ-fieldset` unless you're
  genuinely grouping multiple unrelated fields.
- **Cross-package side-effect imports** (`import '@civui/inputs/text-input'`).
  Barrel imports are tree-shaken and silently drop custom-element registration.
- **No hardcoded durations / colors / z-index values:** use the design tokens.

## Tests

- Co-located: `civ-foo.ts` ↔ `civ-foo.test.ts`.
- Use the helpers from `@civui/test-utils` (`fixture`, `cleanupFixtures`,
  `elementUpdated`, `pressKey`, `typeText`).
- Every test file ends with `afterEach(cleanupFixtures)`.

## Cross-platform parity

CivUI ships the same components on four platforms. Web (Lit), iOS (SwiftUI),
Android (Jetpack Compose), and Drupal (SDC). When you change a component's
public API:

1. Update the schema in `packages/schema/src/components/civ-<name>.schema.ts`.
2. Update the iOS counterpart in `packages/ios/Sources/CivUI/Civ<Name>.swift`.
3. Update the Android counterpart in
   `packages/android/src/main/kotlin/gov/civui/components/Civ<Name>.kt`.
4. Run `pnpm sync:drupal` to regenerate the Drupal SDC YAML + Twig.
5. Run `pnpm parity:schema --platforms`. This fails on any drift.

If you don't have device access to test the iOS / Android changes, that's okay.
the schema and stubs keep the contract honest, and someone with simulators can
fill in the UI later. See `.claude/rules/audit-debt.md` for the native-stubs
allowlist.

## Pre-push checklist

```bash
pnpm preflight       # typecheck + lints + schema parity + doc tables
pnpm test            # full test suite
```

`pnpm validate` runs the full CI gate locally if you want the strictest check
(it's slow. ~5 min cold).

## Pull request workflow

1. Fork the repo and create a topic branch from `main`.
2. Make your change. Keep PRs focused. One logical change per PR.
3. Write or update tests. New components need test coverage.
4. Update the schema and native stubs if you changed a component's API
   (see "Cross-platform parity" above).
5. Run `pnpm preflight` and fix anything it surfaces.
6. Open the PR. Fill in the template. Link any related issues.
7. CI runs `parity.yml`, `native.yml`, `pages.yml`, and `bundle-size.yml`.
   Address failures or call out anything you intentionally deferred.

We squash-merge PRs. Use a conventional-style summary (`feat:`, `fix:`,
`docs:`, `refactor:`, `test:`, `chore:`). See `CHANGELOG.md` for examples.

## Adding a new component

```bash
pnpm scaffold:component my-thing
```

The scaffolder creates the web component, iOS stub, Android stub, Drupal SDC,
schema, and Storybook story in one go. From there:

1. Implement the component body in `packages/<pkg>/src/<name>/civ-<name>.ts`.
2. Flesh out the schema in `packages/schema/src/components/civ-<name>.schema.ts`.
3. Add the component to `COVERED_COMPONENTS` in `tools/schema-parity.ts`.
4. Run `pnpm parity:schema --platforms` until it's green.
5. Write tests. Aim for behavior coverage (keyboard, a11y, edge cases).
6. Add a Docusaurus page in `apps/docs/docs/components/<category>/<slug>.mdx`.
7. Run `pnpm sync:doc-tables` to generate the Props/Events partials.

The architecture overview in [`CLAUDE.md`](CLAUDE.md) explains the package
layout and dependency order; `packages/schema/README.md` walks through the
schema format in detail.

## Questions?

Open a [GitHub Discussion](https://github.com/barbaradenney/civui/discussions)
or file an issue. We try to respond within a few days.
