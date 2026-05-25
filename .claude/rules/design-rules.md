# CivUI Design Rules

Cross-cutting design principles enforced across components. Each rule
states the intent, the failure mode it prevents, and how it's
mechanised (lint, code review, or doc-only).

When adding a new container, new shape, or new color treatment to the
design system, consult this file first. New rules are added here
*and* wired into a lint when the failure mode is mechanisable.

---

## Only interactive elements get rounded corners

**Rule.** Rounded corners (`border-radius` / `civ-rounded*`) signal
*activatable*: buttons, inputs, links, controls. Static container
chrome (cards, callouts, metric tiles, image previews, info blocks)
stays flat. The user reads "rounded" as "I can click / type / pick
this," so applying it to a display-only surface dilutes the signal
and trains users not to trust it.

**What gets rounded corners**:
- Interactive controls (buttons, inputs, links, checkboxes, radios,
  toggles, file dropzones, segmented controls, date-picker day
  cells, pagination links, accordion triggers, etc.).
- Overlay surfaces that *contain* interactive content (modal,
  drawer, action-sheet, combobox listbox, menu popover,
  datepicker dialog, popover panel, time picker).
- Pills / chips / badges (`civ-tag`, `civ-badge`, `civ-count`,
  `civ-filter-chip`, `civ-data-grid__sort-position`). The pill
  shape is the identity of these components — square corners would
  read as broken.
- Decorative / loading shapes (`civ-spinner`, `civ-skeleton`,
  `civ-avatar`, `civ-timeline-item__dot`). These are geometric
  affordances, not container chrome.
- Scrollbar thumbs (the user drags them).
- Consumer opt-in: `<civ-image variant="thumbnail" rounded>` — the
  consumer explicitly requested a rounded image.

**What does NOT get rounded corners**:
- `civ-card` — the canonical flat container.
- `civ-metric-tile` — composes `civ-card`, inherits flat.
- `civ-callout` — left-accent rail + padding, no radius.
- `civ-file-preview` (image / file thumbnail).
- Any new "card-shaped" display container — use `civ-card` or
  `civ-callout` instead of hand-rolling chrome.

**Exceptions documented in the lint**:
- `civ-accordion__inner--tertiary`, `civ-accordion-item` (when
  used inside `--secondary`), and `civ-accordion-item__content`
  (open-state of `--primary`) carry deliberate card-style
  variants. They're whitelisted with comments in
  `tools/lint-border-radius.ts`. If those variants are reworked
  to flat chrome, the allowlist entries should be removed.

**Caught by:** `pnpm lint:border-radius` — scans
`packages/core/src/styles/components.css` for every `border-radius:`
declaration and every `civ-rounded*` Tailwind utility used in
`@apply`, and verifies the selector's targeted class appears in
the allowlist at the top of `tools/lint-border-radius.ts`. Wired
into `pnpm validate:lints` and the drift-lints CI gate. Adding a
new entry to the allowlist requires a deliberate edit, which
shows up in code review.

---

## Compose existing components before hand-rolling chrome

**Rule.** When a CivUI primitive already exists for a visual pattern,
compose it. Hand-rolling parallel chrome is the most common source
of design-system drift — the parallel version inevitably diverges,
the original component's bug fixes don't reach it, and the visual
treatment fragments.

**Decision tree — "I need a…"**

| You want | Use | Don't hand-roll |
|---|---|---|
| Flat bordered container | `<civ-card>` | `<div class="my-card">` with own border |
| Container with a left accent rail | `<civ-callout>` | `<div>` with `border-inline-start` |
| Section heading + intro paragraph | `<civ-section-intro>` | Hand-rolled heading + lead pattern |
| Help / resource footer on a form | `<civ-support-resources>` | Inline `<aside>` rendering |
| Clickable card that navigates | `<civ-link-card>` | `<a class="my-card">` with chrome |
| Status / notice banner | `<civ-alert>` | Bordered `<div>` with role="alert" |
| Inline pill / status tag | `<civ-tag>` / `<civ-badge>` | Span with rounded pill styling |
| Numeric counter chip | `<civ-count>` | Span with pill chrome |
| Loading placeholder | `<civ-skeleton>` | Hand-rolled grey block |
| Inline loading indicator | `<civ-spinner>` | Hand-rolled CSS animation |
| Single key figure / KPI tile | `<civ-metric-tile>` | Hand-rolled "stat card" |
| Dated event sequence | `<civ-timeline>` + `<civ-timeline-item>` | Hand-rolled list with dates |
| Form input | `<civ-text-input>` / etc. | Native `<input>` with own label/hint chrome |
| Group of related inputs | `<civ-fieldset>` (true grouping) or self-contained group component (`<civ-radio-group>`, etc.) | Manual fieldset / legend |
| Tab strip | `<civ-tabs>` + `<civ-tab>` + `<civ-tab-panel>` | Hand-rolled `role="tablist"` plumbing |
| Disclosure / expandable detail | `<civ-disclosure>` (native `<details>`) or `<civ-accordion>` | Hand-rolled toggle |
| Toolbar of small buttons (flush borders) | `<civ-button-group>` | `<div class="civ-flex civ-gap-2">` |
| Primary + secondary form-flow CTAs | `<div class="civ-button-row">` | `<div class="civ-flex civ-gap-3">` |
| Dropdown / popover panel | `<civ-popover>` / `<civ-menu>` | Hand-rolled absolute-positioned div |
| Dialog / modal | `<civ-modal>` | Native `<dialog>` with own chrome |

**When to actually hand-roll**:
- The primitive doesn't exist yet. In that case, the new chrome belongs
  in `packages/core/src/styles/components.css` with a clear BEM root,
  and you should consider whether it should become a component (so
  the next consumer composes it instead of inventing another variant).
- The primitive can't be styled to the design you need. First check
  if the primitive should grow a `variant` / `style` prop. If the
  design is genuinely one-off, scope the bespoke CSS narrowly and
  add a comment explaining why composition wasn't viable.

**Anti-patterns to look for in review**:
- A new `.civ-{feature}-card` / `.civ-{feature}-tile` / `.civ-{feature}-panel`
  class with its own border / padding / background. Almost always
  the consumer should compose `civ-card` or `civ-callout` instead.
- A component template that renders raw `<a class="civ-link">`
  inside its own children. Should be `<civ-link>` (which produces
  the same `<a>` but is the contract surface).
- A new `<aside>` / `<section>` / `<div>` with structural styling
  that mirrors an existing component's BEM (e.g. naming clash like
  `civ-form-support-resources` parallel to `civ-support-resources`).
  This is a strong smell that a primitive exists.

**Caught by:** code review (no lint). The naming-clash anti-pattern
(`civ-X-Y` parallel to `civ-Y`) is a candidate for a future lint —
not built today.

---

## Semantic-intent vs categorical-color components

**Rule.** Two distinct families of "this component carries a color"
exist in the design system, and the colour vocabulary differs by
intent. Don't conflate them.

- **Semantic-intent** — `civ-badge`, `civ-count`, `civ-alert`, and
  `civ-notice`. The colour communicates status: *info*, *success*,
  *warning*, *error*, *neutral*. The prop is named `intent`.
- **Categorical** — `civ-tag` and `civ-card`. The colour groups
  visually but carries no status meaning: *blue*, *red*, *green*,
  *teal*, *yellow*, *orange*, *purple*, *gray*. The prop is named
  `color`.

**Why it matters.** Semantic components need to render the same
intent with the same visual weight across components — an *error*
should not be paler in a count pill than in a badge pill — so the
two semantic components share one CSS recipe. Categorical
components, by contrast, are tuned for aesthetic grouping, so they
use pre-composed `tag-{color}-bg/text` tokens that swap as a pair
between light and dark mode rather than deriving per-shade.

**The semantic recipe (badge, count):**

| Emphasis | bg | text |
|---|---|---|
| secondary | `<intent>-lighter` (base-lightest for neutral) | `<intent>-darkest` for success/warning; `<intent>-dark` for info/error; `base-darker` for neutral |
| primary | `<intent>-dark` (`error-DEFAULT` for error; `base-darker` for neutral) | `white-DEFAULT` |
| dot (badge) | same shade as primary bg | — |
| tertiary (count) | transparent | `<intent>-dark` (neutral inherits parent color) |

success and warning use `-darkest` for text because `*-dark` for
those families is too muted to hit AA on the `-lighter` bg.

Error's primary bg uses `error-DEFAULT` (saturated brand red), not
`error-dark` (muted burgundy), so the "this is bad" cue stays
loud. This is the only documented exception to the uniform
`{intent}-dark` primary rule.

**The categorical recipe (tag, card):**

Secondary variants reuse the same semantic-family shades as the
overlapping intents (so `red` secondary on a card is the same
visual as `error` secondary on a badge), but primary variants use
`tag-{color}-bg/text` pre-composed pairs — those tokens encode
both the light- and dark-mode rendering as a single colour-keyed
pair. Don't substitute `{family}-dark + white` for
`tag-{color}-bg/text` on a card/tag primary: the categorical
components rely on the paired tokens to swap correctly between
modes.

**Two anti-patterns:**

1. A new "card" or "tile" component that hand-rolls an intent
   palette using its own shade selections. Should reuse the
   semantic recipe (extend `civ-badge` / `civ-count` if it carries
   intent, or `civ-tag` / `civ-card` if it carries a category).
2. Tag-family `primary` variants that drop into `{family}-dark + white`
   instead of `tag-{color}-bg/text`. Breaks the light/dark swap
   contract.

**Caught by:** `pnpm lint:semantic-color-recipe` — parses every
`.civ-{badge,count}--style-{emphasis}.civ-{badge,count}--{intent}`
(and `.civ-{badge,count}--dot.civ-{badge,count}--{intent}`) rule in
`components.css` and asserts the `background-color` + `color`
declarations match the recipe above. Drift fails CI. The recipe
itself lives at the top of `tools/lint-semantic-color-recipe.ts`;
edits to it require a deliberate change that shows up in code
review.

The lint does NOT cover `civ-tag` / `civ-card` primary variants
yet — categorical-color components don't have a single recipe to
enforce (the `tag-{color}-bg/text` token is the contract, but
allowing arbitrary categorical colour names means the lint can't
mechanically check "did you use the right one"). The categorical
rules are documented above and enforced by code review.

---

## Process

Run `pnpm validate:lints` after editing styles or composing
components. The border-radius lint runs in <1 second and surfaces
new rounded-corner additions on display-only surfaces immediately.

When you propose to whitelist a new rounded-corner class in
`tools/lint-border-radius.ts`, explain in the same diff *why* the
class is interactive / popover / pill. The allowlist is the place
the design rule's exceptions are documented.

When you find an existing component reimplementing chrome that's
already provided by a primitive (the support-resources case from
2026-05-24), the fix is a composition refactor — see the commit
message conventions in `.claude/rules/common-traps.md`.
