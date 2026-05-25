# CivUI Density Convention

How a component opts into a denser-than-default render. This rule codifies the audit findings from 2026-05-25 (branch `claude/density-convention-D3nz1`) so future components land consistently and the existing drift can be migrated against a single target.

CivUI has **two complementary density mechanisms**. They compose orthogonally; pick the right one (or both).

---

## Mechanism 1 — Page-level scale (CSS-token)

`[data-civ-scale="dense|spacious"]` on a parent retunes `--civ-spacing-*` and `--civ-typography-fontSize-*` for everything inside. ANY component whose chrome reads from those tokens responds automatically — no per-component code needed.

**Default expectation for every new component**: read padding / gap / font-size from tokens (`var(--civ-spacing-2)`, `civ-px-3`, `var(--civ-typography-fontSize-sm)`, etc.). Hardcoded `rem` / `px` values for padding or font-size bypass the scale system and produce visible drift inside `[data-civ-scale="dense"]` admin surfaces.

**Decorative exceptions** (hardcoded is fine): spinner size ladders, tap-target floors (44px WCAG SC 2.5.5), thumbnail dimensions, signature-preview cursive font, file-preview avatars. Flag with `/* not density: <reason> */` so future audits don't re-grep them.

---

## Mechanism 2 — Per-component opt-in (modifier)

A per-component density modifier exists for **the placement-specific case the scale can't cover**: this surface needs to read denser than its surroundings (or vice versa). The page-level scale shrinks everything; the modifier ratchets one component.

**Add a modifier when ALL THREE hold:**

1. **The component owns its own chrome** — padding, gap, font-size that isn't already determined by a child it composes. A pass-through wrapper doesn't need its own density.
2. **There is a documented placement where the component sits inside a denser surface than its surroundings.** Concretely: data-grid cells, dropdown panels, dense reference tables, admin toolbars, embedded views.
3. **The page-level scale is insufficient.** Either the component sits inside an otherwise-default-scale page, or the consumer doesn't want everything around it to shrink — just this one surface.

If only (1) holds, leave it to the scale. Don't add a prop nobody asked for.

---

## Naming standard

| Layer | Name | Values | Notes |
|---|---|---|---|
| Component prop | `spacing` | `'default' \| 'sm'` (and `'xs'` only when a 3-step ladder is genuinely needed, e.g. data-grid row density) | Adopted by 18 components today. New components MUST use this prop name. |
| CSS modifier | `--sm` | (boolean) | Adopted by 15 classes today. New components MUST use this token. |

**Do NOT introduce**: `--compact`, `--slim`, `--cozy`, `--tight`, `--dense`, `--xs` for a single dense step, `--small`. The audit found these in active use and they should be migrated to `--sm` (see audit-debt entry).

**Keep separate** — these axes are NOT density and MUST NOT be unified under `spacing`:

| Axis | Prop | Used by | What it means |
|---|---|---|---|
| Typography hierarchy | `size` | `civ-label`, `civ-legend`, `civ-page-header`, `civ-form-step` (`headerSize`), `civ-repeater`, `civ-progress-header` | Heading prominence step (`md` / `lg` / `xl`). Affects font-size only. |
| Decorative dimensions | `size` | `civ-spinner`, `civ-image`, `civ-image-preview` | Pixel-level dimensions (`sm` / `md` / `lg`) — unrelated to scale. |
| Layout mode | `variant` | `civ-file-upload` (`'default' \| 'full'`), `civ-image` (`'thumbnail' \| 'content'`) | Different render shape, not a density adjustment. |

`civ-read-more.size="sm"` is a naming outlier — the value is density, not hierarchy. Should migrate to `spacing="sm"` (see audit-debt).

---

## Two modifier contracts

A component MUST pick one contract and stick to it. Don't combine.

### Contract A — pure shrink (the default — most components)

- Reduce padding by one ladder step (`spacing-2` → `spacing-1`, `spacing-3` → `spacing-2`).
- Optionally reduce font-size by one step (`fontSize-base` → `fontSize-sm`).
- Do NOT change layout structure or hide chrome.
- Use ONLY token variables, never hardcoded `rem`/`px`.

```css
/* Reference implementation: .civ-table--sm */
:where(.civ-table--sm) th,
:where(.civ-table--sm) td {
  padding: var(--civ-spacing-1) var(--civ-spacing-2);
}
```

Apply this to: `civ-card`, `civ-link-card`, `civ-tag`, `civ-badge`, `civ-count`, `civ-filter-chip`, `civ-action-button`, `civ-list-item`, `civ-callout`, `civ-modal` (when added), `civ-drawer` (when added), `civ-action-sheet` (when added), `civ-data-grid` (when added).

### Contract B — bare-chrome mode (data-grid cell editors only)

- Drop label / hint / error / description chrome.
- Switch host `display` so the control sits inline inside a table cell.
- Render a bare control with `spacing="sm"` Tailwind padding ladder.
- Require `aria-label` on the host for screen-reader name (since the visible label is gone).

```ts
// Reference implementations: civ-text-input, civ-textarea, civ-select,
// civ-combobox, civ-date-picker, civ-number, civ-checkbox
@property({ type: String }) spacing: 'default' | 'sm' = 'default';

render() {
  if (this.spacing === 'sm') return this._renderCompact();
  return this._renderFull();
}
```

**Reserved for `<input>`-shaped controls placed inside data-grid cells.** Don't extend Contract B to surfaces that aren't bare data-grid cells — once consumers see "compact = drops the label" on a card or callout, the contract becomes unpredictable.

---

## Three things `spacing="sm"` MUST NOT mean

The audit found these existing semantics conflated under one prop. Do not introduce new instances:

1. **"Smaller surrounding margin"** — controls margin between the component and a sibling, not internal padding. This is a layout-rhythm prop, not density. **Use `rhythm="sm"` instead** (see `civ-page-header.rhythm` and `civ-divider.rhythm`, which both expose this knob and keep `spacing` only as a backward-compat alias that emits a one-time dev-mode warning). If a new component needs to expose "smaller surrounding margin," the prop name is `rhythm`, not `spacing` or `margin` — the rename happened in 2026-05-25 (Tier 5 of the density-convention rollout) so the family stays consistent.
2. **"Larger render mode"** — `civ-file-upload.variant="full"` is the inverse direction. Don't fold opposite-direction modifiers into `spacing`; they belong on `variant`.
3. **"Different layout entirely"** — when a `--sm` variant changes the host display, hides chrome, or restructures the DOM, it's Contract B and should be reserved for data-grid editor use.

---

## Page-level scale guarantees (what consumers expect)

When a consumer flips `[data-civ-scale="dense"]` on an admin page, **every CivUI component MUST shrink automatically** unless it's on the decorative-exception list. The path to make that real:

- Replace hardcoded padding / font-size in `components.css` with token equivalents.
- Add `/* not density: <reason> */` comments on intentional hardcoded values so a future lint can scan past them.
- A future `lint:hardcoded-spacing` (proposed) would enforce this with an allowlist for the decorative cases.

---

## Cross-references

- Audit-debt entry `Density convention rollout` (2026-05-25) — the punch list of existing drift to migrate against this convention.
- `CLAUDE.md` "Density System" — the page-level scale mechanism overview.
- `apps/docs/docs/components/data/table.mdx` "Density: page-level scale vs per-table modifier" — consumer-facing explanation of how the two mechanisms compose.
