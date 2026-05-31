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

## Hidden civ-conditional / collapsed civ-accordion content is still in the DOM

Two patterns keep form fields rendered even when the user can't
see them:

- **`civ-conditional`** toggles its slotted content with
  `display: none` plus `aria-hidden="true"` — children stay in
  the DOM.
- **`civ-accordion-item`** renders a native `<details>` element;
  children of a collapsed `<details>` stay in the DOM (the browser
  just doesn't paint them).

**`civ-form` excludes both** from `validate()`, `getFormData()`,
and `toFormData()`, so a `required` field inside a hidden branch
or a collapsed accordion will *not* block submit or send a stale
value. Nested cases work too: a field inside an OPEN inner
accordion that's wrapped in a COLLAPSED outer one is excluded
(the user can't reach it).

If you write a non-civ-form orchestrator that iterates
`[data-civ-form-field]`, walk up via:

```ts
// hidden civ-conditional
el.closest('[data-civ-conditional-content][aria-hidden="true"]')
// collapsed civ-accordion-item — walk every ancestor, not just
// the nearest, since nesting matters
let cur = el.parentElement;
while (cur) {
  if (cur.tagName === 'CIV-ACCORDION-ITEM' && !(cur as any).open) return true;
  cur = cur.parentElement;
}
```

and skip those fields.

---

## `civ-conditional` inside a `civ-repeater` matches by name suffix, scoped to its row

A `civ-repeater` rewrites each row child's `name` to an indexed form —
`<civ-select name="docType">` in the `documents` repeater becomes
`name="documents[0].docType"`. A `civ-conditional` placed in the same
row keeps its authored `when="docType"` (the repeater does **not**
rewrite `when`).

`civ-conditional` resolves this by matching the watched field when the
field's name **equals `when` exactly OR ends with the `…].when` /
`….when` suffix** — so `when="docType"` tracks the row's
`documents[0].docType` field. It also **scopes to its own row**: when the
conditional is inside a `[data-civ-repeater-row]`, only a field in the
*same* row can toggle it, so row 0's select never reveals row 1's
conditional. Outside a repeater, the exact-name match is the only one
that fires (a plain `notDocType` field never matches `when="docType"` —
the suffix match requires a `.`/`]` boundary).

```html
<!-- ✓ works — upload is gated per-row by that row's docType select -->
<civ-repeater legend="Documents" name="documents" item-label="document">
  <civ-select name="docType" label="Document type">…</civ-select>
  <civ-conditional when="docType" has-value>
    <civ-file-upload name="file" accept=".pdf"></civ-file-upload>
  </civ-conditional>
</civ-repeater>
```

Before this was fixed, the exact-name match (`target.name === when`) never
matched the indexed name, so every conditional inside a repeater stayed
permanently hidden — silently. If you need a category-gated control inside
a repeater (upload-after-type-selected, "Other" description field), this
now works; place the dependency field and the conditional as siblings in
the same row.

**Caught by:** `civ-conditional.test.ts` "repeater-indexed field names"
block (suffix match, partial-token guard, row scoping, initial-mount
prefill). No lint — it's a runtime behavior locked by tests.

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

## Schema enum `values:` must match the Lit source TS union

A schema in `packages/schema/src/components/civ-*.schema.ts` may
declare an enum prop with a `values:` array that doesn't actually
match the source type union. The schema-parity CI gate
(`pnpm parity:schema`) only checks prop *names* across platforms,
not enum *values*, so drift like this slips through:

```ts
// packages/layout/src/tag/civ-tag.ts
export type TagVariant = 'blue' | 'orange' | 'purple' | 'gray';

// packages/schema/src/components/civ-tag.schema.ts
variant: {
  type: 'enum',
  values: ['gray', 'primary', 'info', 'success', 'warning', 'error'], // ✗ drifts
}
```

The auto-generated Props tables in
`apps/docs/docs/components/**/_<slug>.props.mdx` import from the
schema, so the docs surface the wrong allowed values to anyone
implementing the iOS / Android / Drupal platforms — including
contractors who treat the schema as the contract.

Five schemas were silently wrong before this lint shipped
(civ-alert.alertStyle, civ-alert.variant, civ-tag.variant,
civ-link-card.{variant,color}, civ-card.color, civ-count.countStyle,
civ-filter-chip.chipRole). All have been corrected.

**Caught by:** `pnpm lint:schema-enum-values` — for every schema in
`COVERED_COMPONENTS` (in `tools/schema-parity.ts`), parses the Lit
source's `@property` type annotation and any `export type X = …`
alias it references, resolves the union to a string-literal list,
and compares against the schema's `values:` array. Reports missing
values in both directions ("source accepts but schema doesn't list"
and "schema lists but source rejects"). Wired into
`pnpm validate:lints` and the drift-lints CI gate. Sources whose
type is bare `string` (or any non-literal union) are skipped — the
schema is documenting beyond what the type system enforces, which
is intentional for some props.

---

## Orphan enum values in Drupal SDC YAMLs

`pnpm sync:drupal` is **append-only** — it adds missing props but
doesn't rewrite existing prop definitions. When a schema's enum
value is removed (e.g. `civ-link.variant` dropped `tertiary` after
a design pass), the Drupal SDC YAML keeps the orphan silently.
Drupal authors who pick the orphan value get an unstyled component
with no validation error.

```yaml
# packages/drupal/civui/components/link/link.component.yml (after sync)
variant:
  type: string
  enum: ['primary', 'secondary', 'back', 'tertiary']   # ← `tertiary` orphan
                                                       #   the schema dropped it
```

The symmetric direction is also drift: an SDC YAML hand-edited to
add an `enum: [...]` constraint that the schema doesn't share
(e.g. early civ-alert.heading_level had `enum: [2, 3, 4, 5, 6]`
matching the source's `2 | 3 | 4 | 5 | 6` union, but the schema's
`type: 'number'` declared no values). Drupal then over-constrains
relative to the schema contract.

**Caught by:** `pnpm lint:sdc-enum-values` — for every component in
`COVERED_COMPONENTS` with a `drupal:` path, walks the SDC YAML's
`props.properties` block, captures each prop's `enum: [...]`
array, and compares it against the schema's `values:` (filtering
out `''` to match `sync-drupal-sdc.ts`'s empty-string filter).
Reports two failure modes: **orphan-in-drupal** (YAML has values
the schema rejects) and **drupal-over-constrains** (schema isn't
enum but YAML has one). Wired into `pnpm validate:lints` and the
drift-lints CI gate.

The lint deliberately does NOT flag the symmetric "schema is enum
but YAML has no enum constraint" case — that's widespread legacy
drift across ~30 SDCs, tracked in audit-debt as "Tighten Drupal
SDC enum constraints" rather than blocking CI.

---

## Hardcoded option values must match across platforms

When a component ships a fixed option vocabulary — the `value`
strings behind a hardcoded radio/checkbox list, not consumer-
provided options — those values are part of the cross-platform
contract: the same answer must serialize to the same string on
web, iOS, and Android. `parity:schema` (prop names),
`lint:schema-enum-values` (enum *prop* value sets), and
`lint:schema-default-values` (defaults) all miss this, because
option vocabularies aren't a schema prop.

```ts
// ✗ silent data-integrity drift — civ-race-ethnicity shipped this
// web:     { value: 'hispanic-latino', … }
// iOS:     ("hispanic", "Hispanic or Latino")            // drifted
// Android: CivRadioOption(value = "hispanic", …)         // drifted
```

A form submitted from each platform stored a different string for
the same selection. The web Lit source is canonical (per CLAUDE.md);
the natives must match it.

**Caught by:** `pnpm lint:option-value-parity` — for every component
in the curated `OPTION_COMPONENTS` registry (`tools/lint-option-value-parity.ts`),
it extracts the canonical option values from the Lit source's inline
`value: '...'` literals and asserts each appears as a quoted string
literal in the iOS + Android counterparts (presence-check, since
native option shapes vary — iOS positional tuples, Android
`CivRadioOption(value = …)`). Wired into `pnpm validate:lints` and
the drift-lints CI gate. Add a registry entry when a new component
hardcodes an inline option list with real (non-stub) native
counterparts; components that resolve options from the `@civui/core`
preset registry or whose natives are EmptyView stubs are out of scope.

---

## Schema must declare civ-analytics when the component fires it

`civ-analytics` is the cross-cutting analytics event dispatched by
`sendAnalytics()` (from `CivBaseElement`). When a component surfaces
it as public API — a JSDoc `@fires civ-analytics` tag — the
component's **schema must also declare the event** in its `events`
block. The schema is the platform-neutral contract; a contractor (or
a native implementation) reading it shouldn't have to also grep the
Lit source to discover an event the component publicly fires.

```ts
// civ-button.ts
/** @fires civ-analytics - Analytics tracking event on click */

// civ-button.schema.ts  — events block MUST include:
events: {
  'civ-analytics': {
    description: 'Analytics tracking event fired on interaction',
    detail: {
      componentName: { type: 'string', description: 'Tag name of the dispatcher' },
      action: { type: 'string', description: 'The user action that triggered the event' },
    },
  },
},
```

The 2026-05-29 component audits found this drift on `civ-combobox`
and `civ-date-picker` one at a time; a follow-up sweep added the
event to all 22 covered components that documented `@fires
civ-analytics` but omitted it from the schema.

The check is one-directional (JSDoc → schema). A component that
*calls* `sendAnalytics()` without a `@fires` tag is a separate
JSDoc-completeness question and is **not** gated — add the `@fires`
tag first if you want the event to be public API, and the schema
requirement follows.

**Caught by:** `pnpm lint:schema-analytics-event` — for every
`COVERED_COMPONENTS` entry whose Lit source has `@fires
civ-analytics`, asserts the schema declares the event. After adding
it, run `pnpm sync:doc-tables` and commit the regenerated events
partials. Wired into `pnpm validate:lints` and the drift-lints CI
gate.

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

## Multi-field compounds must cascade `required` to at least one leaf

A multi-field compound with `showRequired: false` on its
`renderLegend()` call deliberately suppresses the `(required)`
mark on its own `<legend>` (because a section heading isn't
actionable). The contract is that the compound then cascades
`required` down to its primary leaf controls, where each leaf
renders its own per-field `(required)`.

If the compound forgets the cascade, the user sees **zero**
`(required)` markers: the legend is suppressed and the leaves
were never told they're required. The compound is required, but
no UI signals it.

```ts
// ✗ silent — legend suppresses (required), nothing cascades
<civ-text-input
  label="Account number"
  ?disabled="${this.disabled}"
></civ-text-input>

// ✓ leaf carries its own (required) marker
<civ-text-input
  label="Account number"
  ?required="${this.required}"
  ?disabled="${this.disabled}"
></civ-text-input>
```

civ-direct-deposit, civ-service-history, and civ-signature
shipped without the cascade for months and this audit caught
them.

**Caught by:** `pnpm lint:required-cascade` — fixtures each
multi-field compound with `required`, walks its rendered DOM,
and asserts at least one leaf form control received
`required=true`. Wired into `pnpm validate:lints` and the
drift-lints CI gate. To extend, add the new compound's tag to
`COMPOUNDS` in
`packages/compound/src/_lint/required-cascade.test.ts`.

---

## Compound `formResetCallback` must reset `_data`, not just `value`

Compounds extending `CivCompoundElement` render from an internal
`_data` field, not from `value` directly. The default
`CivFormElement.formResetCallback` resets `value` to its default,
but **does not touch `_data`** — so the rendered sub-fields keep
showing the stale values until the user reloads.

Every compound must override `formResetCallback` to also reset
`_data` and clear any sub-field error props:

```ts
override formResetCallback(): void {
  this._data = { ...EMPTY_INCOME };
  this._resetCompound(['amountError', 'frequencyError']);
}
```

The civ-income compound shipped without this override for months
and silently failed to reset inside `<civ-form>` reset flows. The
behavior was subtle enough that no end-to-end test caught it.

**Caught by:** `pnpm lint:form-reset-callback` — fixtures each
compound with a non-empty value, calls `formResetCallback()`, and
asserts `_data` returns to `_empty`. Wired into
`pnpm validate:lints` and the drift-lints CI gate. To extend, add
the new compound's tag + a non-empty sample value to `COMPOUNDS`
in `packages/compound/src/_lint/form-reset-callback.test.ts`.

---

## Compound `readonly` must cascade to every leaf control

CivUI's `readonly` contract: when a compound parent
(`civ-address`, `civ-name`, `civ-relationship`, …) is `readonly`,
every leaf control inside renders read-only too. HTML doesn't
cascade `readonly` the way `<fieldset disabled>` cascades
`disabled`, so each compound has to forward the prop to every
leaf itself.

Wherever a compound renders a readonly-supporting inner control
and forwards `?disabled="${this.disabled}"`, it must also forward
`?readonly="${this.readonly}"` in the same opening tag:

```ts
// ✓ good — both cascade
<civ-select
  …
  ?disabled="${this.disabled}"
  ?readonly="${this.readonly}"
></civ-select>

// ✗ silent — parent.readonly = true leaves this field editable
<civ-select
  …
  ?disabled="${this.disabled}"
></civ-select>
```

Property binding (`.readonly="${this.readonly}"`) and bare
attribute (`readonly="${this.readonly}"`) are also accepted —
all three forms propagate the value. Selection-only controls
(radio, checkbox, segmented) are exempt because HTML doesn't
define `readonly` for them; lock those with `disabled`.

**Caught by:** `pnpm lint:readonly-cascade` — scans
`packages/compound/src` and `packages/form-patterns/src` for
readonly-supporting `<civ-*>` tags with `?disabled` but no
`?readonly`. Wired into `pnpm validate:lints` and the
drift-lints CI gate. To add a new readonly-supporting input,
append its tag to `READONLY_TAGS` in
`tools/lint-readonly-cascade.ts`.

---

## LightDomSlotMixin composition with dynamic Lit children

Components built on `LightDomSlotMixin` (`civ-popover`, `civ-menu`,
`civ-form`, `civ-fieldset`, `civ-button-group`, `civ-radio-group`,
`civ-checkbox-group`, `civ-page-header`, `civ-list-item`,
`civ-input-group`, and the compound parents) capture their
authored children in `connectedCallback` and relocate them into
rendered slot-target containers.

**Comment-node preservation (since 2026-05-19):** `_captureChildren`
SKIPS Comment nodes so Lit's `<!---->` ChildPart marker anchors
stay at the host root. Without this, every outer re-render — even
ones that didn't change the slotted content — threw "ChildPart
has no parentNode" because the mixin had captured and removed
Lit's markers along with the children.

That fix handles the common case: outer component re-renders for
unrelated reasons while the mixin component's content is unchanged
("static slot, dynamic outer").

**The remaining constraint** — fully dynamic slotted content:

```ts
// ⚠ still misbehaves on items-array mutation
<civ-menu>
  ${this.items.map((item) => html`
    <civ-menu-item>${item.label}</civ-menu-item>
  `)}
</civ-menu>
```

If `this.items` actually mutates (push/splice on re-render), Lit
tries to add or remove children at the marker position (the host
root) — but the previously-captured items live in the slot-target
container by then. The new items land at the root and don't get
restyled; old ones in the target don't get removed. Visually:
ghost duplicate items or new items missing entirely.

This is fundamental to "move authored children" + "Light DOM, no
`<slot>`". Fixing it would require Shadow DOM or a substantial
projection layer; both rejected by CivUI's architecture.

**Pattern when you need dynamic slotted content**: render a static
wrapper that gets captured as a unit, with the `${...map(...)}`
inside it. `civ-column-visibility` and `civ-button-group`'s
overflow panel both follow this — they render a plain `<div>`
containing the dynamic list, inside a `<civ-popover>`. The div
gets relocated as one chunk and the markers inside it stay
attached to the div (which doesn't itself capture children).

```ts
// ✓ — div is captured as one unit; markers inside stay attached
<civ-popover>
  <civ-button data-civ-popover-trigger>...</civ-button>
  <div class="overflow-panel">
    ${this.items.map(item => html`<civ-button>${item.label}</civ-button>`)}
  </div>
</civ-popover>
```

**Conditional rendering of the mixin element itself** is also
broken. Patterns like:

```ts
// ⚠ crashes with "Cannot read properties of null (reading 'nextSibling')"
${this._open ? html`
  <civ-modal>...children...</civ-modal>
` : nothing}
```

…fail the same way when the outer template flips back and forth.
The civ-modal element gets re-created each time, and lit-html's
`_$clear` walk hits a detached marker. Two safe rewrites:

1. **Always render, toggle a prop**: drop the conditional and use
   `<civ-modal ?open="${this._open}">…</civ-modal>` so the same
   element stays mounted. civ-address's address-validation modal
   uses this — the modal is rendered unconditionally once
   `validateAddress` is set; opening/closing is just a `?open`
   toggle.
2. **`keyed()` directive when the conditional MUST cover a different
   set of slot children** (e.g. civ-radio-group with two distinct
   radio vocabularies):

   ```ts
   import { keyed } from 'lit/directives/keyed.js';
   ${keyed(vocab, html`
     <civ-radio-group>
       ${vocab === 'a' ? html`<civ-radio …/>…` : html`<civ-radio …/>…`}
     </civ-radio-group>
   `)}
   ```

   `keyed` tells lit-html to tear down the existing template and
   create a fresh one when the key changes, so each civ-radio-group
   instance captures its own static set of children on mount.
   civ-partnership-history's marriage vs. partnership status radios
   use this.

**Caught by:** runtime exception (rare now, after the comment-skip
fix). If you see odd duplicate/missing children inside a
LightDomSlotMixin component's slot target, or `null.nextSibling`
crashes from `ChildPart._$clear`, check whether the content uses
a dynamic `${...map(...)}` directly under the mixin-using element
— and wrap it in a static container, hoist the conditional out
with `keyed(...)`, or render the element unconditionally and
toggle a prop.

---

## Confirm vs Toggle button — pick by intent

CivUI has two small action-component patterns with overlapping
visuals but different ARIA + behavioral contracts:

- **`<civ-confirm-button>`** — fire-and-forget action with a
  transient receipt ("Copy" → "Copied ✓" → "Copy"). Use for
  Copy, Paste, Scan, Generate. Consumer does the work in the
  `civ-confirm` listener; the component owns the success-window
  timing and visual swap.
- **`<civ-toggle-button>`** — two-state persistent toggle
  ("Show" ↔ "Hide"). Use for password reveal, mute/unmute,
  expand/collapse on a custom control. Uses `aria-pressed` and
  reflects `pressed` for two-way binding.

```html
<!-- ✓ Confirm: action + receipt -->
<civ-confirm-button label="Copy" success-label="Copied" @civ-confirm=${copyHandler}>
</civ-confirm-button>

<!-- ✓ Toggle: two persistent labels -->
<civ-toggle-button label="Show" pressed-label="Hide" @civ-toggle=${onToggle}>
</civ-toggle-button>
```

**Padding stability**: both components hold the variant class
stable across state changes — `.is-success` (confirm) and
`[pressed]` (toggle) only add a state flag, never swap variants.
This avoids the "button visibly shrinks when it transitions" bug
that hand-rolled implementations hit when they swap
`.civ-text-btn--chip` for `.civ-text-btn--inline` mid-state.

**Do not use** these components for:

| Need | Use |
|---|---|
| Primary form CTA (Submit, Continue) | `<civ-button>` |
| Toolbar / row action | `<civ-action-button>` |
| Disclosure section open/close | `<civ-disclosure>` (native `<details>`) |
| Read-more expansion | `<civ-read-more>` |
| Bare text button with no behavior | `<button class="civ-text-btn civ-text-btn--chip">` |

**Caught by:** no lint covers the choice — review-time decision
based on intent. Tests in each component lock the state-transition
behavior; misuse would be a design bug, not a regression.

---

## Action shortcuts go below the input, not inset

The trailing inset region inside a `civ-text-input` is reserved
for exactly **one** component-rendered control: the close / ×
clear button. It operates on the value but has universally-
understood semantics and stays tightly coupled to the field's
visual box.

Everything else — Copy, Today, Now, Show / Hide password, custom
trailing-action chips — belongs in the helper row below the
input. `civ-text-input` renders the password reveal toggle there
automatically when `reveal-password` is set; consumers can drop
in arbitrary chips via the `data-below-action` slot:

```html
<civ-text-input label="API key" value="…">
  <!-- ✓ helper-row chip directly under the input -->
  <button data-below-action type="button" class="civ-text-btn civ-text-btn--chip">
    Copy
  </button>
</civ-text-input>
```

Why:

- **Touch-target conflicts**. An inset button shares the input's
  bounding box on mobile. Users reaching for the input field
  hit the action instead. 44×44 mobile floors mitigate *missed*
  taps but not *misdirected* ones.
- **Cognitive ambiguity**. An inset button reads as part of the
  input chrome — users hesitate to figure out whether it
  modifies the value, submits the form, or just hides text.
- **Industry precedent**. USWDS and most accessibility-forward
  systems render "Show password" / "Copy" affordances below
  the field for the same reason.

The previous `data-trailing-action` slot (which rendered inset)
was renamed to `data-below-action` in this refactor — hard
break, no alias, since the inset position was the bug.

**Caught by:** test in `civ-text-input.test.ts` asserts the
helper-row slot is a sibling of `.civ-input-icon-wrap`, not a
descendant. No lint covers the design rule "value shortcuts go
below the input" — that's a review-time call when adding a new
inset button.

---

## Text-button variant choice — chip vs. inline

CivUI has one base class for low-chrome text buttons —
`.civ-text-btn` — with two variants:

- **`.civ-text-btn--chip`** — gray pill background, neutral text
  color. A quiet *toggle disclosure*: "Show more / Hide / Open".
  Used by `civ-disclosure` and `civ-read-more`. Deliberately
  doesn't compete with a primary action in the same view.
- **`.civ-text-btn--inline`** — transparent background,
  primary-dark text color. A *one-shot action shortcut*:
  "Today / Now / Copy". Used by `civ-date-picker` and
  `civ-time-picker` helper-row shortcuts.

Pick the variant by the *intent*:

| Intent | Variant |
|---|---|
| Toggle a disclosure state | `--chip` |
| Fire an action and move on | `--inline` |

`.civ-text-btn--inline` also supports a transient `.is-success`
state (green text + check icon) for "Copied ✓" / "Saved ✓"
confirmations — toggle the class for ~1–2 seconds after the
action completes, then remove.

```html
<!-- ✓ disclosure toggle -->
<button class="civ-text-btn civ-text-btn--chip">Show more</button>

<!-- ✓ one-shot action -->
<button class="civ-text-btn civ-text-btn--inline">Copy</button>

<!-- ✓ same button after the user clicks (~1.5 s) -->
<button class="civ-text-btn civ-text-btn--inline is-success">Copied</button>
```

**Caught by:** test assertions in `civ-disclosure.test.ts` and
`civ-read-more.test.ts` lock the `civ-text-btn` +
`civ-text-btn--chip` composition. No lint covers the variant
*choice* (chip vs inline) — that's a design call.

---

## Open-state event dispatch must come from the property setter

For any component whose `open` prop is the public observability
channel — popover, accordion-item, menu, anything else that fires
`civ-open` / `civ-close` / `civ-toggle` — dispatching from a
private `_requestOpen()` / `_requestClose()` helper alone is a
bug. Setting the property externally
(`popover.open = true`, `<civ-popover .open=${state}>`, or the
public `openPopover()` / `closePopover()` methods) bypasses
the helper and silently skips the event.

The fix is the accessor pattern (mirrors `civ-accordion-item`):

```ts
@property({ type: Boolean, reflect: true })
get open(): boolean { return this._openState; }
set open(value: boolean) {
  const old = this._openState;
  if (old === value) return;
  this._openState = value;
  this.requestUpdate('open', old);
  // Explicit branches so the schema-parity event parser recognizes
  // both dispatch sites. A ternary on the event name is invisible
  // to the parser and shows up as "event declared in schema but
  // never dispatched".
  if (value) dispatch(this, 'civ-open');
  else dispatch(this, 'civ-close');
}
private _openState = false;
```

The `_requestOpen` / `_requestClose` helpers then just set
`this.open = ...` and the setter handles dispatching for every
path (user click, programmatic property set, public method,
lit-html two-way binding). The `if (old === value) return` guard
prevents idempotent sets from re-firing.

**Caught by:** runtime — a controlled-component test like
`el.open = true; expect(opened).toHaveBeenCalledOnce();` exposes
the bug immediately. The popover suite (`civ-popover.test.ts`)
has the canonical pair of regression tests.

---

## Schema `a11y.role` must match the Lit host's actual role

The schema's `a11y.role` field is the contract documented to
other-platform implementers (iOS / Android / Drupal). When the
schema declares one role but the Lit source sets a different one
via `this.setAttribute('role', '...')`, native teams reading the
schema apply the wrong role.

The 2026-05-25 audit found three real cases of this drift:

```ts
// civ-spinner.schema.ts (BEFORE)
a11y: { role: 'status', ... }     // wrong — source sets role='img'

// civ-popover.schema.ts (BEFORE)
a11y: { role: 'group', ... }      // wrong — host has no role,
                                  // panel carries the role

// civ-tab-nav-item.schema.ts (BEFORE)
a11y: { requiredIndicator: 'none', errorAnnouncement: 'none' }
                                  // missing — source sets role='listitem'
```

Two rules:

1. **If source sets a role via `this.setAttribute('role', ...)`,
   the schema MUST declare it.** Add `role: '<value>'` to the
   `a11y` block with a one-line comment explaining the host
   role's purpose.

2. **If the schema declares a role, the source MUST actually
   set it on the host.** Either via `setAttribute` in
   `connectedCallback`, or via an inherent role on a rendered
   native element. A schema role that doesn't correspond to a
   host-level role is misleading.

Light-DOM template roles (`<div role="region">...` inside
`render()`) are on the rendered CHILD, not the host. If the role
you want is on a rendered child element, fine — but document
that in the `a11y` block's comment so contractors know not to
look on the host.

**Caught by:** `pnpm lint:schema-a11y-role` — scans every
`COVERED_COMPONENTS` entry, extracts `this.setAttribute('role',
...)` calls from the Lit source, and fails when schema vs.
source disagree. Wired into `pnpm validate:lints` and the
drift-lints CI gate. Deliberately narrow — only catches the two
high-signal cases (mismatch + source-sets-but-schema-omits).
Template-level roles are not validated; the light-DOM model
makes that ambiguous.

---

## `text-overflow: ellipsis` violates WCAG 1.4.12

When a CSS rule pairs `overflow: hidden` with `text-overflow: ellipsis`
(or `text-overflow: clip`) and a width constraint (`max-width`, fixed
`width`), the content is **truncated** when it grows past that width.
Under WCAG 2.1 SC 1.4.12 (Text Spacing), users can override
`line-height` / `letter-spacing` / `word-spacing` / paragraph spacing,
which grows text. Ellipsis truncation hides the overflow — failing
the success criterion.

```css
/* ✗ truncates label content when user-spacing grows it past 50% */
.civ-data-field__label {
  max-width: 50%;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ✓ wraps to a second line within the 50% cap — content preserved */
.civ-data-field__label {
  max-width: 50%;
}
```

The default fix is to **drop the truncation and let the content
wrap**. The 50% width cap is preserved; long content wraps to a
second line instead of clipping. Visual rhythm is mostly
maintained — federal-form data fields rarely have labels long
enough to trip this in practice, and when they do, two-line labels
are preferable to invisible labels.

When wrapping is genuinely not acceptable (decorative previews
that have the data stored elsewhere — the `civ-signature-preview`
cursive font is the canonical example), allowlist the class in
`tools/lint-wcag-text-spacing.ts` → `ALLOWLIST_CLASSES` with a
one-line rationale that names the accessible escape (where the
non-truncated content lives so users still reach it). For a single-
declaration exemption, add a `/* clip ok: <reason> */` comment
immediately above the declaration.

`white-space: nowrap` on currency / dollar-amount cells is NOT
flagged — the surrounding cell is expected to grow horizontally
under user-spacing overrides (it's a `flex` row); the `nowrap` is
correct content-protection (you never want `$1,234.\n56`).
`overflow: hidden` on chip pill shapes (clipping inner corners
against `border-radius: 9999px`) is NOT flagged — the chip is
`inline-flex` and grows with its content; the overflow is purely
cosmetic.

**Caught by:** `pnpm lint:wcag-text-spacing` — scans
`components.css` for every `text-overflow` declaration and fails
on selectors not in the class allowlist AND not annotated.
Wired into `pnpm validate:lints` and the drift-lints CI gate.
Fixed `height: <px|rem>` on text-containing blocks is caught
separately by `lint:hardcoded-spacing` (which gates ALL hardcoded
dimensions in components.css against a decorative allowlist).

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
