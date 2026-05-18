# CivUI Common Traps

Single-page reference for the recurring CivUI gotchas an AI agent (or
human) should know before writing or editing stories, doc pages, or
component code. Each entry has a one-line rule, the failure mode it
prevents, and how the lints surface it.

If you add a new component or refactor an existing one and discover a
new failure mode, **append it here**. Future agents read this file
on every CivUI session.

---

## Self-contained controls — no civ-form-field wrapper

Every CivUI input renders its own label / hint / error chrome from
its own props. Pass `label="..."` (or `legend="..."` on group
components) **directly on the control**.

```html
<!-- ✓ good -->
<civ-text-input label="Email" name="email" type="email" required></civ-text-input>

<!-- ✗ stale — civ-form-field was deleted in Phase 4 -->
<civ-form-field label="Email" required>
  <civ-text-input name="email" type="email"></civ-text-input>
</civ-form-field>
```

`<civ-fieldset>` survives, but only for **multi-field grouping**
(several unrelated controls under one section heading). Do not wrap a
single input or a self-contained group component in it.

**Caught by:** `pnpm lint:story-embeds` (dead component refs in doc
embeds), `pnpm lint:prose-refs` (dead `<civ-X>` references anywhere
in long-form prose: CLAUDE.md, AGENTS.md, `.claude/rules/`, doc body
text), and the stories themselves stop rendering chrome correctly.

---

## HTML boolean attributes are truthy whenever present

`<civ-relationship show-name="false">` does **not** disable the inner
name fields. HTML boolean attributes read as `true` for any non-null
value, so `"false"` is just a (truthy) string.

For props that default to `true` and need an HTML-only off-switch,
pair the prop with an inverse attribute:

```html
<!-- ✓ good — `hide-name` (no value) flips showName off -->
<civ-relationship preset="dependent" hide-name></civ-relationship>

<!-- ✗ silent no-op — name fields still render -->
<civ-relationship preset="dependent" show-name="false"></civ-relationship>

<!-- ✓ also good — bind the property directly in lit-html -->
<civ-relationship preset="dependent" .showName=${false}></civ-relationship>
```

Today this trap is documented + warned for `civ-relationship`. If
you add another default-true boolean prop, also add the inverse
attribute (or accept that consumers must use lit-html property
binding).

**Caught by:** runtime `console.warn` from `civ-relationship`
when the literal `"false"` string is detected, and a regression test
in `civ-relationship.test.ts`.

---

## JSON-string attributes must be valid JSON arrays

`support-resources`, `civ-progress-steps`' `steps`, and similar
attributes are parsed with `JSON.parse`. Pass a JSON-encoded array,
not a plain English sentence:

```html
<!-- ✓ good -->
<civ-form support-resources='[
  {"label":"Crisis Line","href":"tel:988"}
]'></civ-form>

<!-- ✗ silent no-op — JSON.parse fails, supportResources falls back to [] -->
<civ-form support-resources="Call 988 for help"></civ-form>
```

**Caught by:** the converter calls `warnInvalidProp(...)` from
`@civui/core` in dev mode; suppressed in prod by
`globalThis.CIV_DEV = false`.

---

## Storybook export name → URL slug

Doc `<StoryEmbed id="..." />` references resolve by **export name**
(kebab-cased), not by `name:` display title. Two consequences:

1. Renaming a story export breaks every doc embed pointing at the old
   slug. Run `pnpm lint:story-embeds` after any rename.
2. Storybook's `startCase` inserts a dash between digits and letters:
   `Step1_Hub` → `step-1-hub`, `Step2a_LockedChapter` →
   `step-2-a-locked-chapter`. **Not** `step1-hub` or
   `step-2a-locked-chapter`.

**Caught by:** `pnpm lint:story-embeds`.

---

## Stories ≠ component implementation

A story attribute that isn't a declared `@property` on the component
silently does nothing. Past examples that wasted reader time:

- `<civ-repeater add-label="Add another medication">` — there is no
  `add-label` prop; use `item-label="medication"` instead and the
  i18n template interpolates "Add another medication".
- `<civ-select preset="document-type">` — there is no such preset;
  pass inline `<option>` children or set `options=` via JS.
- `<civ-card heading="Title">` — civ-card uses a `data-card-header`
  slot, not a `heading` prop:
  `<civ-card><h3 slot="data-card-header">Title</h3>…</civ-card>`.
- `<civ-progress-bar>` is not a registered element. The real
  component is `civ-progress-percent` (same props).

**Caught by:** `pnpm lint:story-props`.

---

## Hidden civ-conditional content is still in the DOM

`civ-conditional` toggles its slotted content with `display: none`
plus `aria-hidden="true"` — children stay in the DOM. **`civ-form`
already excludes hidden-conditional fields** from `validate()`,
`getFormData()`, and `toFormData()`, so a `required` field inside a
hidden branch will *not* block submit or send a stale value.

If you write a non-civ-form orchestrator that iterates
`[data-civ-form-field]`, walk up via
`closest('[data-civ-conditional-content][aria-hidden="true"]')` and
skip those fields too.

---

## Group components are self-contained — no extra fieldset

`civ-radio-group`, `civ-checkbox-group`, `civ-segmented-control`,
`civ-yes-no`, `civ-memorable-date`, and `civ-date-range-picker`
render their own `<fieldset>` + `<legend>`. Wrapping any of them in
`<civ-fieldset>` produces nested fieldsets and double-rendered
legends.

```html
<!-- ✓ good -->
<civ-yes-no legend="Are you a veteran?" name="vet"></civ-yes-no>

<!-- ✗ nested fieldset, double legend -->
<civ-fieldset legend="Are you a veteran?">
  <civ-yes-no name="vet"></civ-yes-no>
</civ-fieldset>
```

**Caught by:** `pnpm lint:fieldsets`.

---

## `civ-flex civ-gap-*` button rows don't go full-width on mobile

A common reflex when placing two primary buttons side-by-side is to
wrap them in `<div class="civ-flex civ-gap-3">`. That works on
desktop, but on mobile each `civ-button` only gets to "100% of its
share of the row" — i.e. ~50% — instead of the full-width tap target
the design system intends.

```html
<!-- ✗ buttons stay side-by-side on mobile, each ~50% wide -->
<div class="civ-flex civ-gap-3">
  <civ-button label="Sign in and start" variant="primary"></civ-button>
  <civ-button label="Start without signing in" variant="tertiary"></civ-button>
</div>

<!-- ✓ stacks on mobile (each full-width), row on ≥481px -->
<div class="civ-button-row">
  <civ-button label="Sign in and start" variant="primary"></civ-button>
  <civ-button label="Start without signing in" variant="tertiary"></civ-button>
</div>
```

`.civ-button-row` is the design-system utility for primary +
secondary form-flow button clusters. Two specific exceptions stay
on `civ-flex`:

- **Toolbar clusters** (text formatting, view toggles, action chips):
  use `<civ-button-group>` instead — it's `role="toolbar"`, connected/
  flush borders, no gap.
- **Row-action clusters** (Edit / Remove next to a summary card or
  list row): keep `civ-flex civ-gap-2` — those *should* stay row on
  mobile per the row-action rule (destructive labels shouldn't grow
  to consume the whole screen).

---

## Story display name should describe the story

A `StoryObj` whose `name:` is unrelated to its export silently lies to
the reader — the Storybook panel title and the actual content don't
match. Past examples:

- export `WithError`, display name `"Custom Button Labels"` — embedded
  as `forms-form-form-step--with-error` and confused everyone who
  clicked through. Renamed the body to a real validation example.

If you want a longer display name (`"Required Decision (No Close)"`
for export `RequiredDecision`), extend the export's name into the
display — keep the export's substantive token in the display.

**Caught by:** `pnpm lint:story-names`.

---

## Doc tables drift unless they're generated from the schema

Hand-written Props / Events tables in `apps/docs/docs/components/**`
drift. The overview page kept listing `civ-form-field` as a current
component months after it was deleted.

The `apps/docs/docs/components/{category}/_{slug}.props.mdx` and
`_{slug}.events.mdx` partials are **generated from `@civui/schema`**
by `pnpm sync:doc-tables` (where `{slug}` is the component name with
the `civ-` prefix stripped — e.g. `text-input`, `checkbox-group`).
Every component doc page imports those partials instead of
hand-writing tables:

```mdx
import PropsTable from './_text-input.props.mdx';
import EventsTable from './_text-input.events.mdx';

## Props
<PropsTable />

## Events
<EventsTable />
```

**Multi-component pages** (e.g. `controls/checkbox.mdx` covers both
`civ-checkbox` and `civ-checkbox-group`) import each partial under an
aliased name:

```mdx
import CheckboxProps from './_checkbox.props.mdx';
import CheckboxGroupProps from './_checkbox-group.props.mdx';
```

**Sub-components without their own MDX page** (e.g.
`civ-checkbox-group` is documented inside `controls/checkbox.mdx`,
not on its own page) declare their host in `HOST_PAGE_OVERRIDES` at
the top of `tools/sync-doc-tables.ts`. Add an entry when you create a
schema for a component that lives as a sub-section of a sibling's
page rather than on its own.

**JSX safety in descriptions.** Schema descriptions can use bare HTML
tag syntax (`<select>`) or interpolation placeholders (`{name}`) —
the generator escapes them to HTML entities outside code spans so
MDX doesn't try to parse them as JSX. Inside backticks (`` `<select>` ``)
they're emitted literally. Either is safe; the backtick form reads
better in rendered tables.

**Caught by:** CI runs `pnpm validate:doc-tables` which re-syncs and
fails on `git diff --exit-code` against the partials. Run
`pnpm sync:doc-tables` locally and commit the regenerated partials
when a schema changes.

---

## Muted/gray text classes on `<p>` body text

Per CLAUDE.md and government-patterns.md: body text inherits the
default color (`base-darkest`). Visual hierarchy comes from font
size and weight, not color muting. Gray text is reserved for hint
text (which uses `.civ-hint` internally), disabled states (via
`.civ-opacity-disabled`), and placeholders.

Putting `civ-text-muted`, `civ-text-base-dark`, `civ-text-base-light`,
`civ-text-base-lighter`, `civ-text-base-lightest`, or bare
`civ-text-base` on a `<p>` body paragraph violates this — the user
sees descriptive prose ("Provide your bank account information…")
rendered in light gray.

```html
<!-- ✗ muted descriptive paragraph — caught by lint:muted-body-text -->
<p class="civ-m-0 civ-mb-4 civ-text-muted">
  Provide your bank account information so we can deposit your benefit payments directly.
</p>

<!-- ✓ default color (base-darkest), inherited -->
<p class="civ-m-0 civ-mb-4">
  Provide your bank account information so we can deposit your benefit payments directly.
</p>
```

**Caught by:** `pnpm lint:muted-body-text` — scans `.stories.ts`,
`.mdx`, and `.twig` files under `packages/` and `apps/docs/docs/`
for `<p>` tags whose `class=` attribute contains any of the
forbidden tokens. Two files demonstrate the muted token by design
(`packages/core/src/colors/colors.stories.ts`,
`packages/core/src/typography/typography.stories.ts`) and are
allowlisted. Wired into `pnpm validate:lints` and the drift-lints
CI gate. To extend the allowlist, edit `ALLOWLIST` in
`tools/lint-muted-body-text.ts`.

---

## Color-utility class typos silently render unstyled text

`civ-text-success-darker` looks plausible but `success` has no
`darker` shade — only `lightest / lighter / DEFAULT / dark / darkest`.
A class that doesn't resolve to a real
`--civ-color-{family}-{shade}` token renders as plain inherited text
with no visual error.

```html
<!-- ✗ silent no-op — no `darker` shade on success -->
<p class="civ-text-success-darker">All set.</p>

<!-- ✓ good — `dark` is a real shade -->
<p class="civ-text-success-dark">All set.</p>
```

**Caught by:** `pnpm lint:color-classes` — every
`civ-{text|bg|border|ring|fill|stroke|divide|outline}-{family}-{shade}`
class used anywhere in the repo must resolve to a real token. The
lint scans `packages/`, `apps/docs/docs/`, and `.twig` / `.mdx`
files; it's wired into `pnpm validate:lints` and the
drift-lints CI gate.



---

## JSDoc @prop tags drift from real @property declarations

A component's class-level JSDoc declares its public API with
`@prop {Type} name - …` tags. Those tags must match the actual
`@property` declarations below. When they drift, the docs lie:

```ts
/** @prop {boolean} trapFocus - Enable focus trapping. */
@customElement('civ-action-sheet')
export class CivActionSheet extends … {
  // ✗ silent docstring drift — JSDoc says trapFocus, JS says trapFocusProp
  @property({ type: Boolean, attribute: 'trap-focus' }) trapFocusProp = false;
}
```

This trap shipped in `civ-action-sheet` for months — the imported
`trapFocus` utility from `@civui/core` collided with the prop name,
so the author renamed the prop to `trapFocusProp` but never updated
the docs. The fix is to alias the import (`trapFocus as runTrapFocus`)
and keep the prop name aligned with the documented API.

The lint normalizes camelCase ↔ kebab-case (`@prop us-first` matches
`@property usFirst`) and seeds inherited props from known base
classes (`CivFormElement`, `CivBooleanFormElement`,
`CivCompoundElement`, `PresetInputWrapper`, `LegendHeadingMixin`) so
you don't need to re-declare `name`, `value`, `error`, etc.

**Caught by:** `pnpm lint:jsdoc-props` — every `@prop` tag must
correspond to a declared `@property` on the class (or an inherited
prop from one of the known base classes). Wired into
`pnpm validate:lints` and the drift-lints CI gate.

---

## Section legends don't carry (required); leaf inputs do

CivUI distinguishes two kinds of `<legend>`:

- **Question legends** on self-contained group components
  (`civ-radio-group`, `civ-checkbox-group`, `civ-yes-no`,
  `civ-segmented-control`, `civ-memorable-date`,
  `civ-date-range-picker`). The legend IS the question — "Are you a
  veteran?", "What is your date of birth?". `(required)` belongs here
  because the user answers the legend.
- **Section legends** on multi-field grouping compounds
  (`civ-fieldset`, `civ-address`, `civ-name`, `civ-relationship`,
  `civ-direct-deposit`, `civ-partnership-history`,
  `civ-service-history`). The legend is a section heading —
  "Mailing address", "About the dependent". The user can't act on a
  section heading; they act on the leaf inputs inside. `(required)`
  on a section legend is decorative, and combined with the `required`
  cascade to children it produces stacked indicators
  ("(required)" once per nesting level — the bug the
  civ-relationship "With Errors" story showed before this rule).

Section-legend compounds therefore pass `showRequired: false` to
`renderLegend(...)` in their `render()`:

```ts
renderLegend({ legend, required: this.required, showRequired: false, ... })
```

The compound still cascades `required` down to its children so each
leaf input shows its own `(required)` on its own label. That's the
single source of truth.

**Caught by:** `pnpm lint:stacked-required` — fixtures each
multi-field compound with `required` and asserts no
`.civ-required-mark` appears inside any `<legend>` owned by a host
in the `MULTI_FIELD_COMPOUNDS` set. Nested self-contained groups
(e.g. the `civ-radio-group` inside `civ-partnership-history`) keep
their question-level `(required)` mark and are ignored. Wired into
`pnpm validate:lints` and the drift-lints CI gate. To extend, add
the new compound tag to the `MULTI_FIELD_COMPOUNDS` set and a
fixture to
`packages/compound/src/_lint/stacked-required.test.ts`.

---

## Unlabelled form controls inside compound components

A compound component that renders a native `<input>` / `<select>` /
`<textarea>` must give it a labeller — `label=` on the CivUI wrapper,
a wrapping `<label>`, or `aria-labelledby`. Outer fieldset legends
alone don't count: they name the *group*, not each control, so the
user sees a section heading but no per-field label.

Past example: `civ-relationship` dropped the `label=` on its inner
relationship-type `<civ-select>` to dodge a single-control-fieldset
double-label warning. The "Dependent" preset rendered "About the
dependent" → "Their name" → first/middle/last → an unlabeled
`- Select -` at the bottom, because the compound actually has
multiple controls when name fields are shown. The fix was to restore
the label and tighten the double-labels rule so it doesn't fire when
the fieldset contains nested fieldsets with their own legends.

**Caught by:** `pnpm lint:missing-labels` — renders a curated set of
compound fixtures (including `civ-relationship` with its `dependent`
preset) and flags any native control with zero labellers. Wired into
`pnpm validate:lints` and the drift-lints CI gate. To extend, add a
fixture to `packages/compound/src/_lint/missing-labels.test.ts`.

---

## Double-labelled form controls

A single native `<input>` / `<select>` / `<textarea>` must have at
most one direct labelling element. Two patterns produced the bug
historically:

1. **Wrapping `<label>` + child component's own `<label for>`.**
   Memorable-date wrapped each sub-field in
   `<label class="…"><span>Month</span><civ-select label="Month">`,
   so the user saw "Month" rendered twice — once by the wrapping
   `<span>`, once by civ-select's own self-contained label.

2. **Single-control fieldset whose only control has its own
   `<label for>`.** Civ-relationship's outer fieldset legend
   ("Relationship details") sat above the inner civ-select's own
   label ("Relationship to you") with nothing else inside — two
   labels for one control. Multi-control fieldsets (address, name,
   direct-deposit) are correct grouping and are left alone.

When a compound's outer legend already provides the accessible name,
drop the inner control's `label=` attribute — the fieldset/legend
pattern propagates the legend to every contained control
automatically. Do NOT add `aria-label` on the custom element; ARIA
attributes on the host don't propagate to the inner native control.

**Caught by:** `pnpm lint:double-labels` — runs a Vitest sweep that
fixtures a representative set of compound components into jsdom and
counts the distinct labelling elements directly associated with each
native form control. Wired into `pnpm validate:lints` and the
drift-lints CI gate. To extend, add a fixture line to
`packages/compound/src/_lint/double-labels.test.ts`.

---

## Lockfile drift after editing a package.json

Adding or removing a dep on any `packages/*/package.json` requires
regenerating `pnpm-lock.yaml`. CI installs with
`pnpm install --frozen-lockfile` which fails fast on any
spec mismatch:

```
ERR_PNPM_OUTDATED_LOCKFILE  Cannot install with "frozen-lockfile"
because pnpm-lock.yaml is not up to date with packages/<pkg>/package.json
```

A local `pnpm test` / `pnpm typecheck` won't catch this — they reuse
the existing workspace symlinks. Only `--frozen-lockfile` (CI default)
detects the drift, and when it does, **every** CI job fails inside
~10 seconds during setup. That signature — all jobs red with sub-15s
durations — is almost always this trap.

After any package.json edit:

```bash
pnpm install                           # refreshes pnpm-lock.yaml
pnpm install --frozen-lockfile         # local CI-mode dry run
git add pnpm-lock.yaml
```

**Caught by:** CI failure across the board. There's no pre-commit
lint for it; the discipline is "edit deps → install → commit
lockfile in the same change".

---

## Storybook sub-path aliases must follow new package exports

`.storybook/main.ts` aliases workspace packages to source files
(`packages/overlays/src/index.ts`), not to directories. So when a
new component adds a sub-path export like `@civui/overlays/menu`,
Vite resolves the import as `<that-file>/menu` and dies with:

```
[vite:load-fallback] Could not load
./packages/overlays/src/index.ts/menu: ENOTDIR: not a directory
```

Every existing sub-path (modal, action-sheet, card, divider, …)
has its own explicit alias entry **listed above** the base-package
alias so the longest-prefix match wins. Add a matching entry for
the new sub-path:

```ts
'@civui/overlays/menu': resolve(root, 'packages/overlays/src/menu/index.ts'),
'@civui/overlays': resolve(root, 'packages/overlays/src/index.ts'),
```

**Caught by:** `pnpm storybook:build` (also runs in
`storybook-build` CI job and in the `pages.yml` deploy). Local
`pnpm test` doesn't trigger it — Vitest packages have their own
alias maps in `packages/*/vitest.config.ts` and don't go through
the Storybook config. If you add a sub-path export, update **all
three** alias maps: the workspace's `vitest.config.ts`, every
*consumer* package's `vitest.config.ts`, and `.storybook/main.ts`.

---

## Local-first commit / push workflow

The project's convention is to commit locally and push only when
explicitly asked. Don't chain `git push` onto commit commands — CI
minutes are billable, and noisy partial pushes confuse reviewers.

---

## Where to look next

- `CLAUDE.md` — project structure and architecture.
- `.claude/rules/government-patterns.md` — government-form-specific
  accessibility rules.
- `docs/ai-guide.md` — long-form component reference.
- `packages/schema/src/components/*.schema.ts` — source of truth for
  every component's props, events, and accessibility requirements.
