# CivUI Spacing

How spacing decisions are made across the design system. This rule covers the rhythm primitives (block stack, inner heading rhythm, gap-controlled layouts), the policy for when each applies, and the relationship between the spacing token scale and the two density mechanisms. It does not redefine the scale itself — that lives in `packages/tokens/src/spacing.tokens.json` and the page-level scale system is documented in `.claude/rules/density-convention.md`.

CivUI's spacing scale is **5px-based** (`1` = 5px, `2` = 10px, `3` = 15px, `4` = 20px, `6` = 30px). This is **NOT** the default Tailwind 4px-based scale (which would have `4` = 16px). If you reach for `civ-p-4` expecting 16px, you'll get 20px. The scale was chosen to land USWDS-aligned values at the workhorse steps without weirdly-named fractional tokens — the 5px base gives natural integer multiples at every step.

---

## What's already in place

Two mechanisms compose orthogonally — see `.claude/rules/density-convention.md` for the full breakdown. Short version:

- **Page-level scale** (`[data-civ-scale="dense|spacious"]`) — retunes the `--civ-spacing-*` token values for everything inside the scoped element. Most components read padding / gap / font-size from tokens and respond automatically.
- **Per-component opt-in** (`spacing="sm"` prop + `--sm` CSS modifier) — ratchets a single component denser than its surroundings when the placement justifies it (data-grid cells, dropdown panels, dense admin toolbars).

The hardcoded-spacing lint (`pnpm lint:hardcoded-spacing`) gates new `padding` / `margin` / `gap` / `font-size` / `line-height` / `width` / `height` declarations in `components.css` against an allowlist of decorative exceptions and `/* not density: <reason> */` annotations. Wired into `pnpm validate:lints` and the drift-lints CI gate.

What's NOT in place: a documented policy for which components own their own margin-bottom (block stack rhythm) vs. rely on parent `gap` (layout-controlled), a "between sibling blocks" lint, or a Foundations/Spacing story documenting the stack tiers.

---

## The scale

`packages/tokens/src/spacing.tokens.json` defines:

| Token | Px | Use frequency | Typical use |
|---|---:|---:|---|
| `0` | 0px | heavy | margin-reset on first/last children |
| `px` | 1px | **unused in components.css** | reserved for `civ-border-px` Tailwind utility |
| `0.5` | 3px | low (7 hits) | tightest gap between adjacent inline icons / text |
| `1` | 5px | heavy (80 hits) | hint-to-input, error-to-input, prose tightening |
| `1.5` | 8px | low (4 hits) | between input and its inline action button |
| `2` | 10px | heavy (93 hits) | heading-sm to body, alert internal gap, action-sheet close |
| `3` | 15px | heavy (60 hits) | heading-md to body, modal body section gap |
| `4` | 20px | heavy (64 hits) | **standard between-blocks cadence** (fieldset, card, alert) |
| `5` | 25px | low (2 hits) | sparingly — only data-grid bulk-actions footer / spinner inset |
| `6` | 30px | medium (16 hits) | heading-xl to body, page-header bottom, section-intro |
| `8` | 40px | low (3 hits) | between major page sections (rare — most use `6`) |
| `10` | 50px | low (4 hits) | hero/landing area inner padding |
| `12` | 60px | very low (1 hit) | one-off in `civ-back-to-top` bottom offset |
| `20` | 100px | very low (1 hit) | one-off in `civ-back-to-top` right offset |

The "workhorses" (heavy use) are `0`, `1`, `2`, `3`, `4`, `6`. Authors should reach for these by default.

**One orphan token remains:** `px` (1px) — available via the Tailwind preset but no component composes it; kept because a `civ-border-px` divider or dense-row separator is a plausible future consumer. The other two former orphans (`2.5` = 13px, `16` = 80px) were **removed 2026-05-31** in a breaking `@civui/tokens` change once `civ-w-16` (the last indirect `16` consumer) was decoupled onto the dedicated width scale.

**Rare-use sub-ladder** (`5`, `8`, `10`, `12`, `20`) — these are "large-spacing" tokens used for hero / landing surfaces or for one-off pixel-precise positioning. Reach for `6` first for "section break" spacing.

---

## Three rhythm tiers

Top-level components fall into one of three tiers, determined by **whether the component owns its own vertical position in the page flow or is positioned by a parent layout**.

### Tier 1 — Top-of-page heading (30px below)

Components that anchor the top of a page and create breathing room before the first content block.

- `.civ-page-header` → `civ-mb-6` (30px)
- `.civ-heading-xl` → `civ-mb-6`
- `.civ-heading-xl-secondary` → `civ-mb-6`

**Rule.** Only `civ-page-header` and the xl heading classes use `mb-6` as a "before the content starts" gesture. New components in this tier are rare — almost everything lives in Tier 2 or Tier 3.

### Tier 2 — Block-stack (20px below)

Components that sit in the normal page flow between other blocks. The 20px below is the **standard between-blocks cadence**.

- `.civ-fieldset` → `civ-mb-4`
- `.civ-card` → `civ-mb-4`
- `.civ-alert` → `civ-mb-4`
- `.civ-form-error-summary` → `civ-mb-4`
- `.civ-filterable-list__filters` → `civ-mb-4`
- `civ-checkbox` (standalone) → 20px via element-level rule (line 161)
- `.civ-page-header--sm` → 15px (the smaller page-header variant pulls one step down)

`.civ-input-group` is NOT in this list even though it sits between form blocks. It's a flex layout primitive that combines an input with an inline button on a single row; its own rule strips `civ-mb-4` from its children so the bottom-aligned button isn't pushed below the input. The "between input-group and the next field" cadence comes from the parent layout (typically a fieldset stack), not from the input-group itself.

**Rule.** When a component is a self-contained block that sits between other content (a card, an alert, a fieldset, a multi-step form section), it owns `civ-mb-4`. This guarantees consistent vertical rhythm across pages without consumers having to remember spacing.

**Reach for `civ-mb-4` automatically when:** the component is full-width OR width-controlled, the content "ends" with a defined bottom edge (not bleeding into a parent layout), and the typical placement is one-per-row in a vertical stack.

### Tier 3 — No margin / gap-controlled

Components that don't carry their own margin-bottom because they're typically placed inside a flex / grid container that controls spacing via `gap`. Forcing `mb-4` on these would create double-spacing when nested in a `civ-grid civ-gap-4` parent.

- `civ-callout` (host-targeted CSS)
- `civ-notice` (flex layout, no bottom margin)
- `civ-section-intro`
- `civ-link-card`
- `civ-metric-tile`, `civ-metric-group`
- `civ-itemized-total`
- `civ-support-resources`
- `civ-process-list`
- `civ-timeline`
- `civ-data-grid`
- `civ-divider` (manages its own padding inside)
- `civ-data-field`
- `civ-list`, `civ-list-item`

**Rule.** When a component is typically composed inside a multi-column layout, a list rendering, or a parent with its own `gap` (grids, stacks, repeaters), DO NOT add a margin-bottom. The consumer's parent layout sets cadence; the component just paints itself.

**Recognise the tier by:** the typical Storybook example shows the component inside a `civ-grid` / `civ-flex civ-flex-col civ-gap-4` / repeating list / `civ-metric-group` / `civ-list` / `civ-data-grid` rather than as a sole vertical block.

### Heading inner-margin (heading → its body, not heading → next sibling)

A separate rhythm applies INSIDE a component or section: the gap between a heading and the content immediately below it.

| Heading | Inner margin-bottom |
|---|---|
| `civ-heading-xl` | 30px (mb-6) |
| `civ-heading-lg` | 20px (mb-4) |
| `civ-heading-md` | 15px (mb-3) |
| `civ-heading-sm` | 10px (mb-2) |

**Rule.** Inner heading margin scales with the heading size (heading-xl gets more breathing room before its body than heading-sm does). This is a *recipe*, applied automatically by the heading classes. New headings shouldn't override.

**Component internal-spacing exceptions** that follow related but distinct rules:
- `.civ-alert__heading` → mb-1 (5px — tight inside the alert chrome)
- `.civ-section-intro__heading` → mb-1
- `.civ-link-card__eyebrow` → mb-1 (5px between eyebrow and heading)
- `.civ-modal__header` → mb-4 (between header and body inside the modal)
- `.civ-modal__body` → mb-3 (between body and footer inside the modal)

These are internal component rhythm, not page-flow rhythm. The consumer doesn't compose them — they're internal to the component.

---

## When to break the cadence

Sometimes a placement needs to override the default. Acceptable patterns:

- **Last child margin reset.** `.civ-fieldset > :last-child` resets `mb-4` to `mb-0` to avoid double-margin at the end of a nested form. Same pattern for `.civ-input-group > * > [class~="civ-mb-4"]`.
- **Per-instance override via consumer markup.** A consumer who wants tighter spacing on a specific instance writes `<civ-card class="civ-mb-2">`. The card's default `mb-4` is overridden by the more-specific class. Document the override in the consumer's code with a comment if it's not obvious.
- **Density-scaled override.** `[data-civ-scale="dense"]` retunes `--civ-spacing-4` from 20px to 15px globally. No code change needed in the consuming component; the token does the work.

What's **not** acceptable:
- **Hardcoded `margin-bottom: 24px;`** — bypasses both tokens and the scale system. Caught by `lint:hardcoded-spacing`.
- **Inline `style="margin-bottom: 1.5rem"`** in stories or templates — same problem.
- **Adding `mb-4` to a Tier 3 component "for consistency."** Breaks parent-layout gap control.

---

## Common-trap: 4 doesn't mean 16px

The single biggest spacing gotcha: CivUI's `civ-{m|p|gap}-4` is **20px**, not the default Tailwind 16px. Designers and AI agents arriving from other Tailwind projects bring the 4px-base muscle memory and write `civ-p-4` expecting 16px chrome.

Mappings between the two scales:

| You expect (Tailwind default) | CivUI delivers | Closest CivUI |
|---:|---:|---|
| 4px | 5px (`civ-p-1`) | `1` |
| 8px | 10px (`civ-p-2`) | `2` |
| 12px | 15px (`civ-p-3`) | `3` |
| 16px | 20px (`civ-p-4`) | `4` |
| 20px | 25px (`civ-p-5`) | `5` |
| 24px | 30px (`civ-p-6`) | `6` |
| 32px | 40px (`civ-p-8`) | `8` |

The 5px-base scale is what makes CivUI surfaces feel slightly more breathing-roomy than a default-Tailwind UI. The audit calls out the `civ-p-N → N×5` mental conversion as a documentation must-have.

The MCP reference doc (`packages/mcp-server/src/resources/tailwind-reference.ts`) was historically generated from default-Tailwind values — every row was wrong. Corrected in this audit. See "Recommendations" below.

---

## Print

`@media print` overrides are sparse for spacing. The current rules in `civ.css` and `components.css` focus on:
- Reducing form-control padding to print-tight values.
- Preventing page breaks inside form fields (`break-inside: avoid`).
- Resetting input borders to black.

What's NOT covered:
- Print-tight versions of the block-stack cadence. A 30px page-header bottom margin renders as 30px in print, which is fine; tighter cadence isn't necessary for federal forms (paper waste isn't a primary concern).

No recommendation to change print spacing today — current behavior is acceptable.

---

## Page-level scale guarantees

When a consumer flips `[data-civ-scale="dense"]` on an admin page, **every CivUI component MUST shrink automatically** unless it's on the decorative-exception list. The path that makes this real:

- Token tuning happens in `scales.tokens.json` → `scales.dense` (multipliers for `--civ-spacing-*`).
- Components use `var(--civ-spacing-N)` or `civ-{p|m|gap}-N` Tailwind utilities (which map to the same tokens).
- Hardcoded `rem` / `px` values bypass the scale — caught by `lint:hardcoded-spacing`.
- Decorative-exception list (tap-target floors at 44px, etc.) lives in `tools/lint-hardcoded-spacing.ts` → `ALLOWLIST_CLASSES`.

This is the same story documented in `density-convention.md` + the typography rule's section on `font-size`. Spacing follows the same rules.

---

## What NOT to do

- **Hardcoded `padding: 1rem` in components.css.** Always use `var(--civ-spacing-N)` or `@apply civ-p-N`. Caught by `lint:hardcoded-spacing`.
- **Reach for `civ-p-px` (the one remaining orphan token).** It doesn't appear in production CSS today; using it signals an unusual choice that should justify itself in a comment. (`civ-p-2.5` / `civ-p-16` no longer exist — those tokens were removed 2026-05-31.)
- **Add `civ-mb-4` to a Tier 3 component "for consistency."** It will double-space when the component is placed inside a `civ-flex civ-flex-col civ-gap-4` parent.
- **Use Tailwind default 4px-base conversions** (`civ-p-4` to get 16px). It gets you 20px in CivUI.
- **Cross-bridge to em-units for spacing** unless the spacing should scale with parent font-size (rare). Default to the spacing tokens.
- **Add a `--lg` density modifier** to ratchet a component LARGER. The density convention documents `--sm` for ratchet-smaller; the opposite direction (`--full`, `--lg`, `--xl`) was renamed across the codebase to use variant-level naming instead.

---

## Orphan tokens

One token is defined in `spacing.tokens.json` but never used in `components.css` or `civ.css`:

| Token | Value | Status |
|---|---:|---|
| `spacing-px` | 1px | mentioned only in MCP tailwind-reference doc; available as `civ-{m|p}-px` Tailwind utility |

The `px` token exists primarily to support Tailwind's `civ-border-px` width utility (which renders a 1px border). It's the most likely to find a consumer eventually — a divider between dense table rows, a separator inside an accordion. Keep it.

The former orphans `spacing-2.5` (13px) and `spacing-16` (80px) were **removed 2026-05-31** (breaking `@civui/tokens` change) once `civ-w-16`, the last indirect consumer of `--civ-spacing-16`, was decoupled onto the dedicated `theme.extend.width` scale. They were pure scale-completeness artifacts — authors who needed 13px reached for 10px (`spacing-2`) or 15px (`spacing-3`); 80px went to 100px (`spacing-20`) or 60px (`spacing-12`).

---

## Recommendations to ship — prioritized

These are the proposed work items from the spacing audit, ordered by leverage. Some are committed in this audit's branch; the rest are follow-up.

1. ~~**Fix the MCP reference doc spacing table**~~ — shipped 2026-05-27. `packages/mcp-server/src/resources/tailwind-reference.ts` was using default-Tailwind values (4 = 16px, 16 = 64px, etc.) — every row was wrong. Corrected to match `spacing.tokens.json`. AI agents reading the MCP reference now get accurate guidance.
2. ~~**Add a Foundations/Spacing story**~~ — shipped 2026-05-27. New `packages/core/src/foundations/spacing.stories.ts` renders the three rhythm tiers side-by-side (top-of-page, block-stack, gap-controlled) and the heading inner-margin pattern. Designers see the cadence at a glance.
3. ~~**`lint:between-block-cadence`**~~ — shipped 2026-05-27. Gates the Tier 2 / Tier 3 contract from `tools/lint-between-block-cadence.ts`: each Tier 2 component (fieldset, card, alert, form-error-summary, filterable-list__filters, page-header--sm — 6 entries today) MUST declare `civ-mb-N` at its expected step; each Tier 3 component (callout, notice, section-intro, link-card, metric-tile, metric-group, itemized-total, support-resources, process-list, timeline, data-grid, divider, data-field, list — 16 selector entries including bare-host duplicates) must NOT carry a top-level margin-bottom other than `civ-mb-0`. Catalogs are hand-maintained at the top of the lint file; moving a component between tiers is a deliberate PR edit. Wired into `pnpm validate:lints` and the drift-lints CI gate. 26 helper tests in `tools/__tests__/lint-between-block-cadence.test.ts` cover the CSS rule-body parser (respects the `@layer components` wrapper + nested `@media`), margin-bottom step extraction (ignores comments), and the failure-recording loop. The first run caught a real misclassification — `civ-input-group` was wrongly listed as Tier 2 in the original audit; it's actually a flex layout primitive that strips `mb-4` from its children. Removed from the catalog + clarified in this doc.
4. ~~**Remove orphan tokens (`spacing-2.5`, `spacing-16`)**~~ — shipped 2026-05-31 (breaking `@civui/tokens` change). Removed the two confirmed-orphan tokens from `spacing.tokens.json`, the root Tailwind config `spacing` block, `scales.tokens.json` `spacingTokens`, the MCP `query-tokens` / `tailwind-reference` mirrors, and the docs Foundations table. `spacing-px` is kept (plausible future `civ-border-px` consumer). Unblocked by the input-width-ladder fix, which moved `civ-w-16` off `--civ-spacing-16` onto the dedicated width scale.
5. **Consider removing `spacing-5` and `spacing-12`** — used 2 and 1 times respectively, both in one-off positioning (data-grid bulk-actions footer, back-to-top right offset). Could substitute `4` and `10` for 5px / 10px shifts that almost certainly don't matter visually. Lower priority — defer until the next palette pass.

---

## Cross-references

- `packages/tokens/src/spacing.tokens.json` — the spacing scale source of truth.
- `packages/tokens/build/build-tokens.js` — token-flattening build script that emits `--civ-spacing-*` CSS custom properties and the Tailwind preset.
- `packages/core/src/styles/components.css` — every component's stack rhythm and inner spacing.
- `packages/core/src/styles/civ.css:73` — page-level scale variable bindings.
- `.claude/rules/density-convention.md` — the page-level scale + per-component opt-in mechanisms.
- `.claude/rules/typography.md` "Modular scale" — the matching font-size scale that lives alongside spacing.
- `.claude/rules/common-traps.md` "JSON-string attributes must be valid JSON arrays" — adjacent trap (not spacing) commonly seen on components like civ-progress-steps.
- `tools/lint-hardcoded-spacing.ts` — the lint that gates new hardcoded px/rem values in components.css.
- `packages/mcp-server/src/resources/tailwind-reference.ts` — the consumer-facing reference; corrected in this audit.

---

## Process

After tuning a spacing token: regenerate `pnpm --filter @civui/tokens build` and verify `packages/tokens/dist/css/tokens.css` reflects the new value. Run `pnpm validate:lints` to confirm no `lint:hardcoded-spacing` regressions. Run the Foundations/Spacing story in Storybook to eyeball the rhythm.

When adding a new component: pick the tier first. Tier 1 / 2 components own `civ-mb-N`; Tier 3 components don't. Story coverage should show the component at home in its target placement (Tier 2 as a sole block in a vertical stack; Tier 3 inside a `civ-grid` or other layout parent).

When seeing `civ-p-4` and expecting 16px: it's 20px. Convert via the table in "Common-trap: 4 doesn't mean 16px" above.
