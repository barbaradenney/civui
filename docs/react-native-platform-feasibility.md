# React Native as a CivUI Platform — Feasibility & Design

A feasibility assessment for adding **React Native (RN)** as a fifth CivUI platform,
alongside Web (Lit), iOS (SwiftUI), Android (Jetpack Compose), and Drupal (SDC).
This document scopes the work, separates the cheap parts from the expensive parts,
maps the concrete extension points in the existing tooling, and recommends a path.

**Status:** design only — no code. Decision pending.

---

## The question

> Should CivUI add React Native as a platform, and how hard would it be?

"Hard" splits into two very different answers, because CivUI deliberately separates
a platform's **contract** (the prop/event surface, enforced by schema parity) from its
**implementation** (the actually-rendered UI). You can satisfy the first long before
the second exists — that is exactly how iOS and Android operate today.

---

## TL;DR

- **Standing RN up as a contract-satisfying platform is small and well-bounded — roughly one week** of tooling work, after which `pnpm parity:schema --platforms` treats RN as a first-class platform and CI gates it.
- **Building RN into real, rendered components is open-ended** — the same multi-week-to-multi-month effort iOS and Android are still working through (today **62 of 118 iOS components are `EmptyView()` stubs**).
- **The token layer is already done.** `@civui/tokens` already emits React Native values (`dist/react-native/tokens.js`, exported as `@civui/tokens/react-native`). Colors, spacing, typography, dark mode, and density scales are RN-ready with zero new work.
- **RN has one structural advantage iOS/Android never had: it's TypeScript.** Both the parity parser and the component stubs can be **code-generated from the schemas**, and some non-visual `@civui/core` logic is potentially shareable.
- **Recommendation:** approve a **thin vertical-slice spike** (`civ-button` end-to-end through parity + CI) before committing to coverage. It proves the pipeline in a day or two and de-risks the estimate.

---

## What already exists

### 1. The design tokens are RN-ready

`packages/tokens/build/build-tokens.js` already has a `buildReactNative()` step that writes
`dist/react-native/tokens.js`, and the package exports it:

```json
// packages/tokens/package.json
"./react-native": "./dist/react-native/tokens.js"
```

It converts `px` strings to numbers, preserves shadow/easing/font-family shapes for RN,
and emits the density `scales`. **No token porting is required** — the foundation layer
(color families, the 5px spacing scale, the fluid type scale, dark-mode values) is available today.

### 2. The contract already exists, platform-neutral

`@civui/schema` holds **115 component schemas** (`packages/schema/src/components/*.schema.ts`).
Each describes a component's props, events, a11y, form behavior, and render order in a
platform-neutral form. The Lit web implementation is canonical; every other platform must
match the schema, enforced by `tools/schema-parity.ts`. **RN inherits this contract for
free** — it is not a new contract, just a new platform that must satisfy the existing one.

### 3. A proven "platform onboarding" pattern

iOS, Android, and Drupal each plug into the same registry and parity machinery. Adding RN
follows a path the codebase has already walked three times — there is no greenfield
architecture to invent.

> Note: an older vision doc, `docs/web-component-native-runtime.md`, references a
> hypothetical `@civui/react-native` with "12 components." **No such package exists in the
> repo today** — that doc describes a possible compile-Lit-to-native future, not current
> state. This document supersedes it for the question of "add RN as a platform now."

---

## The two costs, separated

### Cost A — contract + tooling (small, bounded: ~1 week)

What it takes to make RN a recognized platform that CI enforces:

1. **Register RN paths.** Add an optional `rn?:` field to each entry in `COVERED_COMPONENTS`
   (`tools/schema-parity.ts`, ~115 entries). This is the single registry the whole pipeline reads.
2. **Write one RN prop parser** (~400 LOC). This is the *easiest* of the four platform
   parsers: RN components are TypeScript, so the parser can use the TypeScript compiler API
   (proper AST) instead of the brace-depth regex the Swift/Kotlin parsers fall back to.
3. **Naming normalization is nearly free.** RN uses camelCase like the web — `disabled` stays
   `disabled` (no iOS-style `isDisabled`), `type` stays `type` (no Swift keyword collision).
   Only the HTML-attribute cases (`maxlength` → `maxLength`) need mapping, and that table
   (`HTML_ATTR_TO_NATIVE_CAMEL`) already exists. A `rnPropAlternatives()` helper is ~20 LOC.
4. **Thread `'rn'` through the platform enumerations** (see the extension-point map below).
5. **Add a CI job** that type-checks the RN package (`tsc --noEmit`) in `native.yml`.

### Cost B — the rendered components (open-ended: weeks → months)

What it takes for RN to actually *look like and behave like* CivUI:

- **The Lit components cannot be reused.** They are Light-DOM web components built on
  `ElementInternals`, native `<dialog>`, `<details>`, and Tailwind CSS — none of which exist
  in React Native. UI is reimplemented in `<View>` / `<Text>` / `Pressable` / `StyleSheet`,
  exactly as iOS reimplemented in SwiftUI and Android in Compose.
- **This is the real cost, and it is the same cost the native platforms carry.** As of this
  writing, **62 of 118 iOS files are `EmptyView()` stubs** (`tools/ios-stub-allowlist.ts`);
  Android is comparable. The schema-parity gate is satisfied by declaring the prop surface;
  the rendered UI is deliberately separate, deferred work that needs device verification.
- **Implication:** "RN is a supported platform" (Cost A + generated stubs) can ship in a week.
  "RN renders 40 core components well" is ~4 weeks. "Full real coverage including data-grid,
  overlays, and compounds" tracks the native platforms' multi-month horizon.

---

## How a platform plugs in (architecture)

```
packages/schema/src/components/*.schema.ts   ← platform-neutral contract (canonical: Lit)
                 │
                 ▼
tools/schema-parity.ts  ──reads──▶  COVERED_COMPONENTS registry
                 │                    { name, source(web), ios?, android?, drupal?, rn? }
                 │
                 ├─ parse web (Lit @property)      ─┐
                 ├─ parse iOS (Swift public var)    │   normalize names per platform,
                 ├─ parse Android (Compose params)  ├── diff prop surfaces vs schema,
                 ├─ parse Drupal (SDC YAML)         │   exit 1 on drift
                 └─ parse RN (TS interface)  ◀NEW ──┘
                 │
                 ▼
CI gates (.github/workflows/parity.yml, native.yml)
```

RN slots in as one more `parse*` branch feeding the same diff engine. The registry is the
hub: add one path per component and the tooling auto-discovers the RN implementation.

---

## Extension points (concrete)

Every place a platform is enumerated today, with the RN edit required:

| File | What's there now | RN change |
|---|---|---|
| `tools/schema-parity.ts` — `COVERED_COMPONENTS` (~L81–206) | `ios?`, `android?`, `drupal?` paths per entry | add `rn?:` path (~115 entries) |
| `tools/schema-parity.ts` — drift loop (~L1116–1194) | per-platform `if (spec.ios) {…}` branches | add `if (spec.rn) {…}` calling the RN parser |
| `tools/schema-parity.ts` — platform union (~L1069) | `'ios' \| 'android' \| 'drupal'` | add `\| 'rn'` |
| `tools/lib/parse-rn-props.ts` | — (does not exist) | **new** ~400 LOC TS-AST prop parser |
| `tools/schema-parity.ts` — name normalization | `iosPropAlternatives`, `androidPropAlternatives` | add `rnPropAlternatives` (~20 LOC) |
| `tools/parity-report.ts` — dir constants (~L27) | `IOS_DIR`, `ANDROID_DIR`, `DRUPAL_DIR` | add `RN_DIR` |
| `tools/parity-report.ts` — discovery (~L517–600) | scans each platform dir | scan RN dir; add `parseRNComponent` (~150 LOC) |
| `tools/parity-report.ts` — `mapPropName(platform)` | `'ios' \| 'android'` | extend to `'rn'` (mostly identity) |
| `tools/scaffold-component.ts` (~L383–385) | iOS/Android/Drupal stub path templates | add RN path template |
| `.github/workflows/native.yml` | `ios`, `android` syntax-check jobs | add `rn` job: `tsc --noEmit` |
| `.github/workflows/parity.yml` (L88) | `pnpm parity:schema --platforms` | no change — platform list is dynamic via the registry |
| `packages/rn/` | — (does not exist) | **new** package: `package.json`, `tsconfig.json`, `src/` |

Optional, only if desired later:
- `tools/lint-option-value-parity.ts` (~L138) — add `['React Native', c.rn]` to enforce
  hardcoded option-value parity (e.g. `civ-race-ethnicity` value strings) across RN too.
- A `react-native-stub-allowlist.ts` mirroring `ios-stub-allowlist.ts`, so unfinished RN
  components can't be silently "completed" without review.

---

## What must be rebuilt (not portable)

| Concern | Web (Lit) | React Native equivalent — new work |
|---|---|---|
| Rendering | Light DOM + Tailwind | `<View>`/`<Text>`/`Pressable` + `StyleSheet` from RN tokens |
| Styling | `civ-*` Tailwind classes | token-driven `StyleSheet` objects |
| A11y | ARIA attributes | `accessibilityRole` / `accessibilityState` / `accessibilityLabel` |
| Form participation | `ElementInternals` | controlled props + a form-state context (RN has no form system) |
| Events | `CustomEvent` (`civ-change`, `civ-input`) | callback props (`onChange`, `onValueChange`, `onAnalytics`) |
| Overlays | native `<dialog>`, `<details>`, CSS bottom-sheet | RN `Modal` / a sheet library; focus + keyboard insets need device testing |

The event-name mapping (Web `civ-change` ↔ RN `onChange`) mirrors the Android callback map
already in the parity tooling — a small, known table, not a research problem.

---

## RN-specific leverage

Because the target language **is** TypeScript and the schemas **are** TypeScript:

1. **Stubs can be code-generated.** Props interface, enum unions, default values, and
   event-callback signatures are all derivable from a schema. iOS/Android stubs were
   hand-written; RN's 115 parity-passing stubs could be a generator run rather than 115
   manual files — collapsing a big chunk of Cost A's tail.
2. **The parity parser is the cleanest of the four.** Real AST, no regex brittleness.
3. **Some non-visual logic may be shareable.** The 16 validators, the mask engine, and
   formatting helpers in `@civui/core` are TypeScript. Where they're DOM-coupled they'd need
   a headless extraction, but the *opportunity* to share (rather than re-port to Swift/Kotlin)
   is unique to RN. Treat this as a follow-up optimization, not a prerequisite.

---

## Effort estimate

| Scope | Estimate |
|---|---|
| Tooling + CI + `@civui/rn` skeleton (Cost A) | ~1 week |
| All 115 components as generated, parity-passing stubs | days (codegen) |
| ~40 core components actually rendered (text-input, textarea, select, checkbox/radio, button, action-button, card, alert, modal, spinner, badge) | ~4 weeks |
| Full real coverage incl. data-grid, overlays, compounds | months, ongoing — parity with the iOS/Android horizon |

---

## Recommended approach — spike first, then phase

### Phase 0 — vertical-slice spike (de-risk; ~1–2 days)
Stand up `packages/rn/`, write the RN parser, register **one** component (`civ-button` —
already fully implemented on all four existing platforms, the canonical example), wire it
through `schema-parity` + a `native.yml` RN job, and render that one button against the RN
tokens. Goal: `pnpm parity:schema --platforms` is green *with RN included*, and a button
renders. This proves the entire pipeline before any breadth commitment.

### Phase 1 — platform onboarding (Cost A; ~1 week)
Generalize the parser, add the `rn?:` registry field to all entries, generate stubs for all
115 components, wire CI fully, document the package in `CLAUDE.md` and `packages/schema/README.md`.
Outcome: **RN is an officially gated platform.**

### Phase 2 — core component implementation (~4 weeks)
Hand-implement the ~40 core components with device testing. Use a stub allowlist so
unfinished components stay honest.

### Phase 3 — long-tail coverage (ongoing)
Overlays, data-grid, compounds — scheduled like the native platforms' implementation passes,
with device verification.

---

## Risks & open questions

- **Maintenance multiplier.** A fifth platform is a fifth place every new component and every
  prop change must land. The schema gate makes drift *visible*, not *free* — someone still
  writes the RN side. Confirm there's an owner before Phase 2.
- **Bare RN vs Expo.** Affects the dev-loop, the testing harness, and the overlay/sheet
  approach. Decide before Phase 1.
- **Form-state model.** RN has no native form system; CivUI's `CivFormElement`/`ElementInternals`
  model needs an RN equivalent (a controlled-component + context pattern). This is the
  single largest design decision in Phase 2.
- **Shared-core extraction scope.** Tempting but can balloon. Keep it a Phase-3+ optimization;
  don't block onboarding on it.
- **Testing strategy.** Web uses Vitest + jsdom. RN needs its own (`@testing-library/react-native`)
  — net-new test infrastructure, not a reuse.

## Non-goals (for this proposal)

- Compiling Lit source to RN automatically (that's the separate `web-component-native-runtime.md`
  vision — much larger, and not required to add RN as a platform).
- Day-one full component coverage.
- Sharing the rendering layer with web.

---

## Recommendation

**Proceed to the Phase 0 spike.** The token groundwork is already in place, the onboarding
pattern is proven, and RN's TypeScript nature makes the tooling the easiest of the four
platforms to wire. The spike converts this estimate into something runnable for a day or two
of effort, after which the breadth decision (Phase 2+) can be made with eyes open about the
real cost — which is component implementation, not infrastructure.

---

## Appendix — key files referenced

| File | Role |
|---|---|
| `packages/tokens/build/build-tokens.js` | `buildReactNative()` — RN token emitter (exists) |
| `packages/tokens/package.json` | `./react-native` export (exists) |
| `packages/schema/src/components/*.schema.ts` | 115 platform-neutral contracts |
| `packages/schema/src/schema.types.ts` | schema type definitions |
| `packages/schema/src/naming-maps.ts` | per-platform enum value maps |
| `tools/schema-parity.ts` | `COVERED_COMPONENTS` registry + parity engine |
| `tools/parity-report.ts` | HTML parity visualization |
| `tools/scaffold-component.ts` | new-component scaffolder |
| `tools/ios-stub-allowlist.ts` | precedent: 62 stub entries gated from silent completion |
| `.github/workflows/parity.yml` | schema-parity CI gate (platform-list dynamic) |
| `.github/workflows/native.yml` | per-platform syntax/compile gates |
| `docs/web-component-native-runtime.md` | separate, larger "compile Lit → native" vision (not this proposal) |
