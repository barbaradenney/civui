# CivUI Audit Debt

Items surfaced during component audits that were deliberately deferred — too large, too cross-cutting, or blocked on platform/design-team decisions to fix in the same pass. Each entry includes the audit date, the scope (file + LOC if relevant), and a one-sentence rationale for the deferral.

When you finish an audit, the audit skill writes new findings here (see `.claude/skills/audit/SKILL.md` — "Deferred items section"). When an item is fixed, remove its entry along with the commit. Don't let entries linger silently — review this file at the start of each audit round.

---

## Color-system follow-ups from the 2026-05-27 shade-ladder restructure

- **Surfaced:** Code review of the shade-ladder restructure, 2026-05-27. Branch `claude/typography-system-design-RykOU`, commit `f02ae12` (token rename) + follow-up commit (this entry).
- **What landed in the restructure:** `warning`, `success`, `info` got a `lightest` slot (old `lighter` value preserved at the new name) plus a new mid-tone at `lighter`. `info` and `error` gained `darkest` shades for AAA / hero text. lint:contrast PAIRS extended with 7 new pairs covering the new mid-tone bgs and the new darkest text colors. The 14-finding code review caught a dark-mode `info.darkest` copy-paste (info.darkest was set to info.light's hex, inverting the semantic), three dark-mode `*.darkest` ≡ `*.light` aliases (warning/success/info), the failing AA contrast on new mid-tone bg + `*-dark` text, and ~10 doc/lint references that needed updating. All shipped in the same branch.
- **What did NOT land — all three follow-ups shipped 2026-05-28:**

  1. ~~**Asymmetric `error` ladder.**~~ ✅ Shipped 2026-05-28. Normalized error to match warning/success/info. The five recipe consumers (form-error-summary, alert--style-secondary--error, badge/count secondary error, card--red) migrated from `error-lighter` (peach #f4e3db) to `error-lightest` (pale pink-white #faf0f0). The freed `error-lighter` slot was retuned to a mid-pale red-pink `#f4caca` where it now serves as a real consumer pattern: the danger-button hover mid-tone (`.civ-btn--secondary.civ-btn--danger:hover`, two `civ-action-btn--danger:hover` variants) sitting between rest=`lightest` and active=`light`. RECIPE + EXTENDED_SELECTORS exceptions removed; PAIRS gained a new `error-lighter + error-darkest` AAA pair (9.68:1) plus a `error-lighter + error-dark` AA pair (6.60:1) covering the danger-hover combination. Dark-mode counterparts kept their existing values (#3a1a1a / #4a2020) — already matched the new semantic; added `$description` notes for clarity. Migration touched ~15 files: components.css (5 sites), light + dark token JSON, semantic-color-recipe lint + tests, lint-contrast PAIRS, colors.stories.ts, MCP tools (check-contrast, generate-document-checklist, generate-eligibility-screener, style-lookup, tailwind-reference, government-patterns, ai-guide), component-examples.json, trauma-informed-examples.stories.ts, figma manifest, design-rules.md + colors.md docs.
  2. ~~**`check-contrast.ts` is a hand-maintained mirror of `color.tokens.json`.**~~ ✅ Shipped 2026-05-28. `packages/mcp-server/src/tools/check-contrast.ts` now imports `tokens` + `darkTokens` from `@civui/tokens` and flattens at module load via a 24-LOC `flattenColors()` helper (collapses `DEFAULT` to the bare family alias, recurses through three-level paths for `accent.cool` / `accent.warm` / `tag.<color>.<bg|text>`). The `TOKEN_COLORS` hand-mirror was deleted. Side benefits: the resolver now knows `purple` and the eight `tag-<color>-bg/text` pairs (both were absent from the hand mirror). Dark-mode support: `checkContrast(fg, bg, mode?: 'light' \| 'dark')` and the MCP tool gained a `mode` param — agents validating dark-mode contrast now get the correct rendered hex instead of silently being served light values. `ContrastResult` carries the `mode` flag so consumers can read which palette resolved the names. To support the import-at-runtime use, the tokens build was tightened: the generated `dist/js/tokens.js` no longer carries TS-only syntax (`as const`, `export type TokenPath`, typed `token()` signature) — those moved to the companion `.d.ts`. The `darkTokens` export is new and declared in `tokens.d.ts`; `@civui/tokens` was added as a `@civui/mcp-server` dep. 18 new test cases cover the flattener (DEFAULT collapse, three-level recurse, tag pairs without DEFAULT), the unknown-token error listing both modes, dark-mode resolution (primary, error-lightest/lighter/darkest, white/black surface aliases inverting), and the `mode` flag on `ContrastResult`. Total file now 31 tests, all passing.
  3. ~~**Tailwind configs (root + `apps/civ-site`) duplicate the color block.**~~ ✅ Shipped 2026-05-28. `apps/civ-site/tailwind.config.ts` now imports the root `tailwind.config.ts` and spread-inherits its full theme (colors / fontFamily / fontWeight / fontSize / spacing / lineHeight / borderRadius / borderColor). The app config keeps only two genuine deltas: a wider `content` glob (also scans `forms/**/*.html` + the workspace `packages/*/src/`), and a `plugins` array registering `.civ-focus-ring` / `-inverse` plus a handful of logical-property shortcuts (`.civ-border-s-4`, `.civ-rounded-s`, `.civ-me-2`, etc. — duplicated with Tailwind 3.3+ built-ins, kept for now). Did NOT adopt `packages/tokens/dist/tailwind/preset.js`: the preset's shape diverges from the hand configs in three subtle ways that would silently break utilities — spacing key `'0_5'` vs `'0.5'` (8 consumers use the dotted form), `fontWeight.regular` vs `normal` (11 consumers use `civ-font-normal`), and missing `surface.*` + `borderColor.DEFAULT`. Importing the root config preserves the exact compiled-CSS shape; verified by checking the post-build docs-site CSS still contains `civ-bg-error-lightest`, `civ-font-normal`, `.civ-p-0\\.5`, and the resolved CSS-var refs. Storybook + Vite docs builds both green. Single source of truth for theme keys is now `tailwind.config.ts` at the repo root; a token-shape change in the JSON now propagates to both surfaces in one config edit instead of three. (One sucrase 3.35.1 quirk during the refactor: backticks in JSDoc-style `/** */` block comments with the pattern `` `text`/`text` `` confused its TS parser. Plain `//` comments avoided it; new doc comment on the app config uses `//` lines for safety.)
  4. ~~**`lint:semantic-color-recipe` scope.**~~ ✅ Shipped 2026-05-27. The lint now runs a second pass against an `EXTENDED_SELECTORS` static map covering 19 soft-bg / intent-tint rules outside the badge/count combinatorial recipe: alert--style-secondary × 5 intents, card categorical × 8 colors, process-list-item complete-state marker, timeline-item dot × 5 intents. `bodyHasToken()` accepts both `background-color: var(--civ-color-X)` and `@apply civ-bg-X` Tailwind-utility forms since components.css mixes the two for historical reasons (alert uses `@apply`, card / process-list / timeline use plain var). The lint catches the canonical regression mode: a refactor renaming `*-lightest` back to `*-lighter` "for brevity" now fails CI with a clear selector + line number. 16 new tests in `tools/__tests__/lint-semantic-color-recipe.test.ts` cover `bodyHasToken` (both forms, both kinds, shade-prefix non-matching, property-anchor correctness) and EXTENDED_SELECTORS completeness assertions (every alert secondary intent, every card categorical color, every timeline intent, the process-list marker, plus what used to be the documented `error-lighter` exceptions on alert + card — those were removed as part of the 2026-05-28 normalization).

- **What to watch for in the meantime:** When adding a new intent-typed surface to a component, copy the `*-lightest` bg + `*-darkest` text pattern (uniform across all five intents post 2026-05-28). Don't reach for `*-lighter` as a bg paired with `*-dark` text — `success-lighter + success-dark = 3.32:1` and `warning-lighter + warning-dark = 3.92:1` both fail AA body. The mid-tone `*-lighter` slot is for `*-lighter` + `*-darkest` pairings (success: 7.10, warning: 6.73, info: 8.20, error: 9.68 — all AAA), AND for the danger-button hover gradient `lightest → lighter → light` where the `*-dark` text pairing clears AA (`error`: 6.60:1).

---

## Orphan spacing tokens (`spacing-2.5`, `spacing-16`) — ✅ shipped 2026-05-31

- **Surfaced:** Spacing audit, 2026-05-27. Branch `claude/typography-system-design-RykOU` (filed during the typography → spacing follow-up).
- **Was:** Three tokens in `packages/tokens/src/spacing.tokens.json` were never used in production CSS. `spacing-2.5` (13px) and `spacing-16` (80px) were pure scale-completeness artifacts (authors needing ~13px reached for `2`/`3`; 80px for `12`/`20`). `spacing-16`'s only indirect consumer was `civ-w-16` (the `xs` input width) — decoupled onto the dedicated `theme.extend.width` scale by the input-width-ladder fix, so it became a true orphan too.
- **Removed (breaking `@civui/tokens` change):** Deleted `2.5` and `16` from `spacing.tokens.json`, the root `tailwind.config.ts` `spacing` block, `scales.tokens.json` `spacingTokens`, the MCP `query-tokens` spacing mirror + `tailwind-reference` table, and the docs Foundations table (`spacing-and-layout.mdx`). Regenerated tokens: `--civ-spacing-2_5` / `--civ-spacing-16` no longer emitted; `civ-p-2.5` / `civ-p-16` / `civ-m-16` / `civ-gap-16` Tailwind utilities are gone. `--civ-spacing-12` / `-20` and the `civ-w-16` width utility (64px, on the separate width scale) are unaffected. Verified no `civ-{p,m,gap}-{2.5,16}` consumers remain in components / stories. **Release note:** consumers using `civ-p-16` (80px) → `civ-p-20` (100px) or `civ-p-12` (60px); `civ-p-2.5` (13px) → `civ-p-2` (10px) or `civ-p-3` (15px).
- **Kept:** `spacing-px` (1px) — plausible future `civ-border-px` consumer (dense-row divider, accordion separator).

---

## Input-width ladder web/native px mismatch (`2xs`, `xs`) — ✅ shipped 2026-05-31

- **Surfaced:** audit-debt low-item triage, 2026-05-31. Found while verifying the orphan-spacing-token entry above.
- **Was:** The `InputWidth` ladder maps each variant to a Tailwind width class (`civ-w-12`, `civ-w-16`, …) plus declared native sizes (`iosPoints` / `androidDp`). The native points assume Tailwind's **default 4px-base** scale (`w-16` = 16 × 4 = 64px = `iosPoints: 64`). But Tailwind's `width` utilities inherit the `spacing` scale, and CivUI overrides `spacing` to **5px-base** for the keys it defines — so `2xs` (`civ-w-12`) rendered **60px** on web vs native 48, and `xs` (`civ-w-16`) **80px** vs native 64 (~25% wider). The other five variants (`w-24`/`40`/`60`/`72`/`96`) use keys CivUI doesn't override, so they fell through to the Tailwind default and already matched.
- **Fix (option (a) — the decoupled width scale):** Added a dedicated `theme.extend.width` block to the root `tailwind.config.ts` re-asserting the seven ladder keys at their intended 4px-based px (`12: 48px`, `16: 64px`, `24: 96px`, `40: 160px`, `60: 240px`, `72: 288px`, `96: 384px`). `civ-w-N` now matches the native points; the spacing-based `civ-p-N` / `civ-gap-N` / `civ-m-N` stay on the 5px scale (`civ-p-12` = 60px, unchanged) since only `width` was extended. Verified in the compiled docs CSS: `.civ-w-12{width:48px}` / `.civ-w-16{width:64px}` while `.civ-p-12{padding:var(--civ-spacing-12)}` (60px) is untouched. The data-table Actions column (the other `civ-w-12` consumer) correctly narrows to its intended 48px. No class names or schema `webClass` values changed → schema-parity unaffected (115/115). The docs site inherits the root config theme, so the fix propagates to Storybook + civ-site from one edit.
- **Regression guard:** `tools/__tests__/input-width-parity.test.ts` cross-checks, for every fixed-width variant, that the Tailwind `width` px equals the schema's `iosPoints`/`androidDp` — the validation that was missing and let the bug hide. Verified it fails when the `width` extend is removed. This also unblocks the `spacing-16` orphan-token removal (the only remaining `civ-w-16` dependency on `--civ-spacing-16` is gone).

---

## Non-inverting dark-text token for warning-light surfaces — ✅ shipped 2026-05-29

- **Surfaced:** Eyebrow contrast audit, 2026-05-26. Branch `claude/typography-system-design-RykOU`.
- **Was:** `.civ-link-card--critical` used a literal `#1b1b1b` text color rather than a token, because no token had "always dark, never inverts" semantics. The `warning-light` surface stays a soft yellow in BOTH light (#fee685) and dark (#f5d576) mode, so the text must also stay dark in both modes — but every neutral/black/white token inverts. Worse, two dark-mode override blocks (`@media (prefers-color-scheme: dark)` + `:root[data-civ-theme="dark"]`) set `color: var(--civ-color-black-DEFAULT)`, which swaps to `#ffffff` in dark mode → **white text on yellow, 1.43:1, effectively invisible.**
- **Fix (branch `claude/link-card-dark-mode-text-WHkDK`):** Added a non-inverting `warning.ink` token (`#1b1b1b` in BOTH `color.tokens.json` and `color-dark.tokens.json` — does NOT invert). `.civ-link-card--critical` now uses `color: var(--civ-color-warning-ink)`; the bg/border tokens swap automatically, so both dark-mode override blocks were deleted (they were redundant for bg/border and harmful for color). Light 13.84:1 / dark 12.03:1 — AAA both. The `civ-link-card--critical` entry in `tools/lint-hardcoded-hex.ts` `ALLOWLIST_CLASSES` was removed (the array is now empty); `scanCss` gained an injectable-allowlist param so the mechanism stays tested. `lint:contrast` `PAIRS` gained `link-card critical bg/text` (`warning.light` + `warning.ink`).
- **What to watch for:** When adding another "always-light surface" variant (cream, pastel-pink) that needs always-dark text, reuse `warning-ink` if the surface is yellow, or add a sibling non-inverting ink token the same way (identical value in both token files) — never reach for `base-darkest` (it inverts). The other warning-light-surface candidates flagged in the original entry (`civ-callout--warning`, `civ-alert--warning`, `civ-notice` warning, `civ-tag color="yellow"`) can now adopt `warning-ink` if a future audit finds the same dark-mode drift.

---

## Native platform implementation pass (iOS + Android)

- **Surfaced:** Overlays + Compound audits, 2026-05-11. Scope corrected 2026-05-12. Allowlist mechanised 2026-05-19.
- **Scale:** 61 iOS components currently return `EmptyView()` (up from 20 after the 2026-05-25 batches landed Drupal + native parity stubs for the navigation, secondary navigation, admin data-grid, accordion, timeline, process-list, metric-tile, itemized-total, notice, chip-family, callout/popover/skeleton/spinner/image, and tab-nav clusters). Android stubs follow the same pattern (no real Compose body).
- **Source of truth:** The canonical list lives in [`tools/ios-stub-allowlist.ts`](../../tools/ios-stub-allowlist.ts). The `pnpm lint:ios-stub-allowlist` CI gate enforces it both ways — a new stub without an entry fails the build, and an entry whose body is no longer EmptyView is flagged stale. Editing the allowlist requires a deliberate human PR.
- **State:** Each component declares the schema's prop surface (so `schema-parity` is satisfied), but renders no actual native UI. Android equivalents render only `Column { ... }` placeholders.
- **Why deferred:** This is a real native-implementation pass, not a quick port. SwiftUI/Compose work without device verification is risky — modal/sheet presentation in particular has platform-specific quirks (focus trap, dismiss gestures, scrim, keyboard insets) that LLMs cannot test blind. The schema-driven prop surface keeps the parity contract stable; UI implementation should be scheduled as dedicated work with someone who can run the simulators.
- **What to watch for in the meantime:** When adding new props to a covered component, add them to the iOS/Android stubs too — schema parity requires it. Don't try to "fix" the empty bodies one component at a time without device testing. If you have device access and want to implement one for real, remove the entry from the allowlist in the same PR — the lint will flag the stale entry otherwise.

---

## Admin data-grid follow-ups

- **Surfaced:** Admin data-grid landing, 2026-05-17. Branch `claude/admin-data-grid-component-Jg8Uk`.
- **What landed:** Three new web components — `<civ-data-grid>` (semantic table, sort, selection, row-action menus, responsive stacked / scroll, empty/loading/error states), `<civ-pagination>` (USWDS-style), `<civ-menu>` + `<civ-menu-item>` (anchored kebab/overflow menu). Schemas, tests (94 new tests in total), Storybook stories, and Docusaurus pages all ship in the same change.
- **~~Explicitly out of v1 scope~~ — both shipped since (cleared 2026-05-29 during the civ-data-grid audit):**
  1. ~~**Inline editing.**~~ ✅ Shipped — `column.editable` + `column.inputType` (`text`/`number`/`select`) + `column.validate`, with `_renderEditCell` / `_commitEdit` / `_cancelEdit` and the `civ-cell-edit-start` / `civ-cell-edit-commit` / `civ-cell-edit-cancel` events. Click or F2 enters edit; Enter/blur commits, Escape cancels; validation renders an inline `role="alert"`.
  2. ~~**Nested / expandable rows.**~~ ✅ Shipped — `row.expandable` + `expandedRowIds` (controlled) + `expandTemplate`, rendering a detail `<tr>` below the row with `aria-controls` / `aria-expanded` wiring and the `civ-row-expand` event.
- **Native + Drupal stubs (parity coverage) ✅ cleared 2026-05-25.** All seven (`civ-menu`, `civ-menu-item`, `civ-pagination`, `civ-data-grid`, `civ-toolbar`, `civ-bulk-actions`, `civ-column-visibility`) are now in `COVERED_COMPONENTS` with placeholder iOS / Android / Drupal stubs. UI implementation deferred (modal/menu presentation + the meaty data-grid Swift / Compose implementation need device verification).
- **Why deferred (UI only, not stubs):** Modal/menu presentation has platform quirks that need device verification, and the data-grid is a meaty Swift / Compose implementation that shouldn't be written blind. Stubs now keep the contract stable for whoever picks up the real implementation.
- **Architectural note:** `@civui/layout` now declares `@civui/overlays` as a workspace dependency so the data-grid can compose `civ-menu` for row-action menus. The CLAUDE.md "Build order" line is now approximate — turbo derives actual order from package.json. Update the docs sentence if it confuses anyone.

---

## Metric tile follow-ups

- **Surfaced:** Metric tile landing, 2026-05-23. Branch `claude/tab-component-styling-Ndmic`.
- **What landed:** Two new web components in `@civui/data` — `<civ-metric-tile>` (display-only dashboard tile with label / value / unit / icon / delta / trend / intent / description) and `<civ-metric-group>` (responsive grid wrapper that stacks to 1 col on mobile, 2 on tablet, up to `columns` on desktop). Schemas, tests (14 new tests), Storybook stories, and a Docusaurus page (`docs/components/data/metric-tile.mdx` — covers both components, per `HOST_PAGE_OVERRIDES`) all ship in the same change.
- **Explicitly out of v1 scope** (confirmed with user before implementation):
  1. **Polymorphic clickable tile.** The tile is display-only — no `href` / `<a>` rendering. Consumers who want a drillable tile wrap the content in `<civ-link-card>` (which already exists for that pattern). Adding `href` to `<civ-metric-tile>` later is non-breaking if a real use case appears.
  2. **Sparkline / inline trend chart.** No embedded SVG chart. Trend is conveyed by arrow + delta text only. A future sparkline variant would need a data-array prop and decisions about chart rendering library.
- **Native + Drupal stubs (parity coverage) ✅ cleared 2026-05-25.** `civ-metric-tile` and `civ-metric-group` are now in `COVERED_COMPONENTS` with placeholder iOS / Android / Drupal stubs. UI implementation deferred (responsive grid + `LazyVGrid` / `GridCells.Adaptive` need device verification).

---

## Itemized total follow-ups

- **Surfaced:** Itemized total landing, 2026-05-24. Branch `claude/itemized-totals-component-N2dSw`.
- **What landed:** Two new web components in `@civui/data` — `<civ-itemized-total>` (display-only ledger surface with optional heading, list of rows, top-bordered total row, configurable `currency` + `locale` via `Intl.NumberFormat`, auto-sum with `total-amount` override) and `<civ-itemized-item>` (single label + amount row with optional `note` and `value-label` escape hatch for non-numeric rows like `Pending`, plus a per-row `intent` for positive / negative tinting). Schemas, tests (18 new tests), Storybook stories, CSS, and a Docusaurus page (`docs/components/data/itemized-total.mdx` — covers both components, per `HOST_PAGE_OVERRIDES`) all ship in the same change.
- **Explicitly out of v1 scope** (confirmed with user before implementation):
  1. **Subtotals / sections.** No section-grouping element (e.g. an `itemized-section` wrapper) — the component is one flat list + one total. Tax-form-style nested subtotals are a v2 if a real placement needs them.
  2. **Percentages / running totals.** No "this line is 23% of total" annotations and no per-row running balance.
  3. **Inline editing.** Display-only — consumers wrap the row in their own affordance if they need a drillable line item.
  4. **Multi-currency.** One `currency` per component instance. Mixed-currency ledgers should be composed as two separate `<civ-itemized-total>` blocks.
  5. **Heading slot.** `heading` is a string prop. Decoration like a leading `civ-tag` ("Estimated", "As of Jan 2026") requires consumers to wrap the component themselves in a `<section>` with their own heading.
- **Native + Drupal stubs (parity coverage) ✅ cleared 2026-05-25.** `civ-itemized-total` and `civ-itemized-item` are now in `COVERED_COMPONENTS` with placeholder iOS / Android / Drupal stubs. UI implementation deferred (`Intl.NumberFormat` per-platform equivalents + tabular numeric alignment need device verification).

---

## Notice follow-ups

- **Surfaced:** Notice landing, 2026-05-24. Branch `claude/itemized-totals-component-N2dSw` (landed alongside itemized-total in the same branch since both were small additions in the same audit conversation).
- **What landed:** One new web component in `@civui/feedback` — `<civ-notice>` (icon-prefixed emphasis text, GOV.UK warning-text pattern generalized with five semantic intents: `info` / `warning` / `error` / `success` / `neutral`). Display-only, no background, no dismiss; `header` + `body` props for guaranteed-correct HTML; intent drives the default icon (override via `icon` prop); `spacing` `default` (GOV.UK-presence) / `sm` (inline-compact); `iconStyle` `filled` (default, heavier presence — uses `info-fill` / `warning-fill` / `error-fill` / `check-circle-fill`) or `outline` (lighter cue — uses the existing `info` / `warning` / `error` / `check-circle` glyphs); optional opt-in `sr-prefix` for visually-hidden screen-reader severity announcement. Schema, tests (~17 new tests), Storybook stories, CSS, and a Docusaurus page (`docs/components/feedback/notice.mdx`) all ship in the same change. **Initial landing was in `@civui/layout`; moved to `@civui/feedback` in a follow-up commit to sit alongside `civ-alert` and `civ-badge` (semantic-intent siblings).**
- **Explicitly out of v1 scope** (confirmed with user before implementation):
  1. **Rich body content with inline links.** `body` is a string prop; for body text that needs a link or other inline markup, consumers should use `civ-callout` instead. A body slot is a possible v2 if a real placement needs it.
  2. **Auto-derived screen-reader prefix.** `sr-prefix` is empty by default and opt-in per placement — teams decide when the severity needs to be announced verbally before the header. No hardcoded "Warning:" / "Success:" mapping.
  3. **Refactoring `civ-alert` to compose `civ-notice` internally.** The two components share visual DNA (icon + text + semantic intent) but `civ-alert` has additional behavior (dismiss, ARIA live region, focus management) that wasn't part of this scope. **Composition the other way works today** — civ-alert was migrated from `LightDomTextMixin` to `LightDomSlotMixin` in the same branch so consumers can place `<civ-notice>` (or any other markup) as a child of `<civ-alert>` when `label` is unset. The "label wins" precedence rule from the original behavior is preserved. If a future audit decides to also unify alert's internal icon rendering (alert currently has no icon at all), both could be migrated to a shared internal primitive.
  4. **Dismiss button.** That's `civ-alert`'s job. Notice is for emphasis in flowing content, not a notification handed to the user.
- **Native + Drupal stubs (parity coverage) ✅ cleared 2026-05-25.** `civ-notice` is now in `COVERED_COMPONENTS` with placeholder iOS / Android / Drupal stubs. The UI implementation in those stubs is still deferred (icon rendering + screen-reader prefix semantics need device verification) — the EmptyView() / placeholder bodies satisfy the prop-name parity contract without claiming an implementation.

---

## Navigation components follow-ups

- **Surfaced:** Navigation components landing, 2026-05-18. Branch `claude/add-navigation-components-YikKk`.
- **What landed:** Three new navigation-component clusters in `@civui/navigation` (originally landed in `@civui/actions`; extracted into the dedicated navigation package in PR #130) — `<civ-breadcrumb>` + `<civ-breadcrumb-item>` (anchor-based trail with CSS chevron separators and `aria-current="page"` on the final crumb), `<civ-nav>` + `<civ-nav-item>` (top-level horizontal site nav, stacks vertically at ≤480px, single-level only), `<civ-tabs>` + `<civ-tab>` + `<civ-tab-panel>` (full ARIA tabs pattern with roving tabindex, manual activation, arrow / Home / End keyboard navigation, and auto-wired `aria-controls` / `aria-labelledby`). Schemas, tests (33 new tests), Storybook stories, and Docusaurus pages all ship in the same change.
- **Explicitly out of v1 scope** (confirmed with user before implementation):
  1. **Tab panels backed by URL.** Tabs are JS-state-driven. A future addition could optionally sync the selected tab to the URL (hash or query param) so deep linking and back-button navigation work; today the consumer wires that up themselves via the `civ-change` event.
  2. **Multi-level nav with dropdown submenus.** `<civ-nav>` is single-level by design. Submenus (hover/click triggered dropdowns, mobile sheet collapse, focus management) are deliberately out of scope — use a separate menu component if needed.
- **Native + Drupal stubs (parity coverage) ✅ cleared 2026-05-25.** All seven cross-platform stubs (iOS Swift already existed; Android Kotlin already existed; Drupal SDC YAMLs new) are now in `COVERED_COMPONENTS`. UI implementation deferred (tab presentation quirks across `TabView` / `TabRow` / `ScrollableTabRow` need device verification).

---

## Accordion follow-ups

- **Surfaced:** Accordion landing, 2026-05-23. Branch `claude/accordion-component-design-qXQjU`.
- **What landed:** Two new web components in `@civui/layout` — `<civ-accordion>` (group container with `single`-open coordination) and `<civ-accordion-item>` (full-width expandable row built on native `<details>`/`<summary>`, with an optional `heading-level` 1–6 prop that wraps the label in an `<h1>`–`<h6>` for screen-reader rotor navigation). Composes the same visual language as `civ-disclosure` (chevron caret, 90° rotation on open) but with a larger tap target and full row width. Schemas, tests (23 new tests), Storybook stories, CSS, and a docs page all ship in the same change.
- **Explicitly out of v1 scope (form-field exclusion) ✅ cleared 2026-05-26.** Branch `claude/accordion-form-field-exclusion`. `civ-form.validate()` / `getFormData()` / `toFormData()` now exclude fields inside a collapsed `civ-accordion-item`, matching the existing `civ-conditional` exclusion. Walks every accordion-item ancestor (not just the nearest), so a field inside an OPEN inner accordion wrapped in a COLLAPSED outer one is correctly excluded. 6 new tests in `civ-form.test.ts`. Docs page + `common-traps.md` updated.
- **Tabs analog still open.** The original entry called this "matches `civ-tabs` behavior" — meaning tabs ALSO leaves inactive-tab fields in the form. If a future audit decides hidden tabs should behave the same as collapsed accordions, mirror the `_isInCollapsedAccordion` helper into `_isInInactiveTabPanel`. Today the tabs case is rare in practice (consumers tend to put per-tab forms in separate routes) so it's been left alone.
- **Native + Drupal stubs (parity coverage) ✅ cleared 2026-05-25.** `civ-accordion` and `civ-accordion-item` are now in `COVERED_COMPONENTS` with placeholder iOS / Android / Drupal stubs. UI implementation deferred (DisclosureGroup / AnimatedVisibility need device verification). Schema also gained a `civ-accordion-item-toggle` event entry (internal coordination event the source dispatches alongside the public `civ-toggle`); native implementations may omit it when they coordinate single-open via a different mechanism.

---

## Chip family expansion (sibling components, not a rename)

- **Surfaced:** Callout component landing, 2026-05-23. Branch `claude/callout-utility-component-AVY8b`. Filter-chip border was changed to fully-rounded (`civ-rounded-full`) in the same branch; the question of whether to broaden the component came up immediately after.
- **Status:** ✅ Shipped + parity-covered 2026-05-25. `civ-action-chip` and `civ-input-chip` both have full Lit implementations (`packages/actions/src/{action-chip,input-chip}/`) and are now in `COVERED_COMPONENTS` with iOS / Android / Drupal stubs. UI implementation in the native stubs is deferred per the broader native-platform pass.
- **Design rationale (kept for reference):** Distinct sibling components rather than a polymorphic `civ-chip`. Material's chip family follows the same pattern (`FilterChip` / `ActionChip` / `InputChip` are each distinct components) for the same reason — each chip type has a different contract:
  - **`civ-filter-chip`** — toggle (`selected` state + check icon + optional remove).
  - **`civ-action-chip`** — fire-and-forget rounded button (no toggle state, no check icon). Used for quick filters that immediately re-fetch, suggestion chips, secondary CTAs less prominent than `civ-button`.
  - **`civ-input-chip`** — user-entered token with a remove handle (tag inputs, recipient lists, applied-filter readouts).
- **Naming note (pushback guidance):** if someone proposes renaming `civ-filter-chip` → `civ-chip` with a `role` / `chip-role` prop, push back: it forces every consumer to thread a prop to distinguish behaviors that are semantically different, and the runtime cost (validation, conditional rendering of the check icon and remove button) is higher than three small components.

---

## Secondary navigation follow-ups (side-nav, on-this-page, back-to-top)

- **Surfaced:** Secondary navigation components landing, 2026-05-23. Branch `claude/nav-components-vads`.
- **What landed:** Three new navigation-component clusters in `@civui/navigation` (originally landed in `@civui/actions`; extracted into the dedicated navigation package in PR #130) — `<civ-side-nav>` + `<civ-side-nav-item>` (vertical hierarchical left-rail with leading-edge accent rail on the current item, nested sub-items via slot, disabled state), `<civ-on-this-page>` + `<civ-on-this-page-item>` (in-page TOC with two modes — auto-detect headings via `selector`/`scopeSelector` or manual children — and IntersectionObserver-driven `aria-current="location"` highlight), `<civ-back-to-top>` (floating chip anchored bottom-right, sentinel-based show/hide with no scroll listener, focus-moves to top landmark on click, honors `prefers-reduced-motion`). Schemas, tests, Storybook stories, and Docusaurus pages all ship in the same change.
- **Explicitly out of v1 scope** (confirmed with user before implementation):
  1. **Mobile collapse for `civ-side-nav`.** The rail stays as a vertical list at every breakpoint. Drawer / hamburger collapse for small screens is the consumer's responsibility (`<civ-drawer>` wrapper or CSS media-query swap to a top nav).
  2. **MutationObserver in `civ-on-this-page`.** Auto-detect runs once in `firstUpdated`. Headings rendered later (async fetches) are not picked up. Consumers wait for content to land before mounting the rail.
  3. **URL-routing for `civ-side-nav`.** The `current` flag is consumer-managed — there's no built-in route observer or path-matching helper. Document-position fragments work via `<civ-on-this-page>` instead.
- **Native + Drupal stubs (parity coverage) ✅ cleared 2026-05-25.** All five (`civ-side-nav`, `civ-side-nav-item`, `civ-on-this-page`, `civ-on-this-page-item`, `civ-back-to-top`) are now in `COVERED_COMPONENTS` with placeholder iOS / Android / Drupal stubs. UI implementation deferred (scroll-position tracking, IntersectionObserver, and top-landmark focus management need device verification).

---

## Timeline follow-ups

- **Surfaced:** Form-submission components landing, 2026-05-24. Branch `claude/form-submission-components-9zmdH`. Renamed `civ-activity-timeline` → `civ-timeline` and `civ-activity-item` → `civ-timeline-item` after landing so the component covers a broader set of "dated events, in order" use cases (audit logs, version histories, project milestones, document workflows). The `civ-confirmation-panel` that originally landed in the same branch was removed shortly after (2026-05-24, branch `claude/remove-confirmation-components-2QqXE`) — the post-submission success surface needs more design thinking before it ships again.
- **What landed:** `<civ-timeline>` + `<civ-timeline-item>` (dated event list in `@civui/feedback`; `<ol role="list">` container, intent-colored rail dots with default semantic icons, `<time datetime>`-wrapped timestamps in relative / absolute / both formats via `Intl.RelativeTimeFormat`). Schemas, tests, Storybook stories, CSS, and Docusaurus pages all ship in the same change. `civ-timeline-item` lives on the timeline page via `HOST_PAGE_OVERRIDES`.
- **Explicitly out of v1 scope** (confirmed with user before implementation):
  1. **Timeline `reversed` prop / `compact` mode.** Items render in source order — consumers reverse the array themselves for newest-first audit logs. A `compact` density is not implemented; add when a dashboard placement needs it.
  2. **Clickable timeline items.** Items are display-only. Consumers needing per-item drill-down render a `<button>` or `<civ-link>` inside the item's body slot.
  3. **MutationObserver on the timeline.** Items added after `firstUpdated` are picked up by Lit's normal child capture flow, but dynamic `${items.map(...)}` patterns inside the timeline hit the known LightDomSlotMixin issue (see common-traps.md). Static authoring or wrapping the map in a static container is the documented workaround.
- **Native + Drupal stubs (parity coverage) ✅ cleared 2026-05-25.** `civ-timeline` and `civ-timeline-item` are now in `COVERED_COMPONENTS` with placeholder iOS / Android / Drupal stubs. UI implementation deferred (`Intl.RelativeTimeFormat` equivalents + rail rendering need device verification).

---

## Process list follow-ups

- **Surfaced:** Process-list landing, 2026-05-24. Branch `claude/form-submission-components-9zmdH` (shipped alongside the confirmation-panel + timeline rename in the same PR train).
- **What landed:** Two new web components in `@civui/feedback` — `<civ-process-list>` (numbered vertical preview of upcoming steps; renders as `<ol role="list">`, auto-increments step numbers via a CSS counter on the parent list) and `<civ-process-list-item>` (rail + connecting line + heading + slotted body; `state="complete"` swaps the numbered marker for a check icon on a success-tinted background, and an explicit `icon` prop overrides both for affordance-specific markers like `lock` / `mail`). Schemas (2 new), tests (15 new), Storybook stories, CSS, and a Docusaurus page (`docs/components/feedback/process-list.mdx` — covers both components via `HOST_PAGE_OVERRIDES`) all ship in the same change.
- **Explicitly out of v1 scope** (confirmed with user before implementation):
  1. **`active` / in-progress state.** Only `default` (upcoming) and `complete` (finished) are modelled. The "you are here" pattern belongs to `civ-progress-steps`, not the process-list — process-list is a *preview*, not an active progress indicator. If a future mixed surface needs to highlight one step as in-progress inside an otherwise-preview list, add an `active` enum value rather than re-purposing the component.
  2. **Branching / sub-steps.** Items are a flat sequence — no nested children, no parallel branches. Consumers needing a tree should compose nested lists inside an item's body slot.
  3. **MutationObserver on the list.** Items captured once in `firstUpdated` via `LightDomSlotMixin`; dynamic `${items.map(...)}` patterns hit the same trap as timeline (see common-traps.md). Static authoring or wrapping the map in a static container is the documented workaround. The docs page calls this out in a `:::caution` block.
- **Native + Drupal stubs (parity coverage) ✅ cleared 2026-05-25.** `civ-process-list` and `civ-process-list-item` are now in `COVERED_COMPONENTS` with placeholder iOS / Android / Drupal stubs. UI implementation deferred (numbered-rail rendering + CSS-counter equivalents need device verification).

---

## Table primitive follow-ups

- **Surfaced:** Table primitive landing, 2026-05-24. Branch `claude/table-component-P3Xz3`.
- **What landed:** CSS classes only — `.civ-table` + `.civ-table--bordered` + `.civ-table--striped` + `.civ-table--sm` (density modifier, follows the system-wide `--sm` convention) + `.civ-table__num` (cell helper) + `.civ-table-wrap` (scroll container). Lives in `packages/core/src/styles/components.css` next to `.civ-data-grid`. Storybook stories in `packages/core/src/foundations/table.stories.ts`. Docs page at `apps/docs/docs/components/data/table.mdx`. No `civ-table` custom element, no schema entry, no Drupal SDC, no native parity stub.
- **Why no custom element:** `<thead>` / `<tbody>` / `<tr>` are foster-parented by the HTML parser when placed inside an unknown element — a slot-based component would silently break authored markup. The platform-blessed path for a thin styled-table primitive is a CSS class on a real `<table>`. Bootstrap, Tailwind UI, USWDS, GOV.UK Design System all follow the same pattern for the same reason.
- **Explicitly out of v1 scope** (confirmed with user before implementation):
  1. **Sortable headers, row selection, pagination, inline editing, row actions, sticky headers, column resize, mobile-stacked layout.** Every interactive table feature is `civ-data-grid`'s job. The split keeps `.civ-table` honest as a styling primitive — there's no growth path from CSS classes into JS-driven behavior.
  2. **Custom element wrapping a real `<table>`** (a `civ-table` element that nests a real `<table>` child for styling/caption pass-through). Rejected because the double-element pattern is awkward and the contract surface a custom element provides (schema, native parity) isn't worth it for what's fundamentally a CSS class.
  3. **Mobile-stacked layout.** Wide tables that overflow narrow viewports use the `.civ-table-wrap` horizontal-scroll container (WCAG SC 1.4.10 Reflow exemption pattern). Stacking rows into label/value blocks on mobile is what `civ-data-grid` does — if you need that, you need data-grid.
- **No native + Drupal stubs to defer.** Unlike most components, there's nothing for the iOS / Android / Drupal SDC implementations to mirror — `.civ-table` is just a styling treatment. The Drupal docs page shows the Twig template pattern (write the same `<table class="civ-table">` markup in Twig); iOS / Android consumers use the platform's native `Table` / `LazyColumn { Row {} }` primitives.
- **What to watch for in future audits:** If consumers start hand-rolling `.civ-table-{feature}` modifier classes for sortable, selectable, etc., that's a signal they should be using `civ-data-grid` instead — push back rather than growing the primitive.

---

## Density convention rollout

- **Surfaced:** Cross-component density audit, 2026-05-25. Branch `claude/density-convention-D3nz1`.
- **Convention doc:** [`.claude/rules/density-convention.md`](./density-convention.md). The rule prescribes `spacing="sm"` (prop) + `--sm` (CSS modifier) as the standard, Contract A vs Contract B contracts, and the page-level scale guarantee.
- **What the audit found:** CivUI's density system has TWO mechanisms (page-level `data-civ-scale` and per-component opt-in). The scale mechanism works well overall (most components use spacing tokens). The opt-in has fragmented: 15 classes use `--sm`, 2 use `--compact` (including the just-shipped `.civ-table--compact`), 1 uses `--slim`, 1 uses `--full` (opposite direction); the `spacing` prop has THREE conflated semantics (layout mode / pure shrink / surrounding margin) across 18 components. (Tier 1 cleared 2026-05-25: all `--compact` / `--slim` modifiers renamed to `--sm`. The `--full` opposite-direction modifier is intentional and out of scope.)

### Tier 1 — uncontroversial fixes (CSS-only renames, no consumer migration needed)

| Item | Action | Notes |
|---|---|---|
| ~~`.civ-table--compact` → `.civ-table--sm`~~ | ✅ Done in `claude/table-component-P3Xz3` (2026-05-25) | Renamed CSS, story export (`Compact` → `Sm`), docs page, and table-primitive audit-debt entry below. |
| ~~`.civ-progress-track--compact` → `.civ-progress-track--sm`~~ | ✅ Done in `claude/table-component-P3Xz3` (2026-05-25) | Internal-only — `civ-file-upload` was the sole consumer. |
| ~~`.civ-alert--slim` → `.civ-alert--sm`~~ | ✅ Done in `claude/table-component-P3Xz3` (2026-05-25) | `slim` boolean and `spacing="sm"` prop still produce the class; only the modifier name changed. Test coverage extended to lock both code paths produce `--sm`. Enforced going forward by `pnpm lint:density-modifier-names`. |

A new `pnpm lint:density-modifier-names` (wired into `pnpm validate:lints` and the drift-lints CI gate) prevents the next `--compact` / `--slim` / `--cozy` / `--tight` / `--small` modifier from being introduced — extend its allowlist (`tools/lint-density-modifier-names.ts`) only when a genuinely-justified non-`--sm` density step is added (e.g. an `--xs` for a three-step ladder).

### Tier 2 — prop renames with deprecation window

| Item | Action | Notes |
|---|---|---|
| ~~`civ-alert.slim` boolean → `civ-alert.spacing="sm"`~~ | **Skipped — not a true alias.** Investigation in branch `claude/audit-debt-alert-slim-finding`. | The 2026-05-25 audit assumed `slim` and `spacing="sm"` shared the same behavior because both produce the `.civ-alert--sm` CSS class. Re-reading `civ-alert.ts` shows `slim` does two more things `spacing` doesn't: (1) **hides the heading** (`hasHeading = !this.slim && this.heading`) and (2) **disables collapsible mode** (`collapsibleActive = this.collapsible && !!this.heading && !this.slim`). Deprecating `slim` in favor of `spacing="sm"` would silently lose both behaviors for consumers who migrate — a breaking change disguised as a deprecation. Per `density-convention.md` "Keep separate" rule, **`slim` is a layout mode** (different render shape) and belongs on `variant`, not `spacing`. If a future audit wants to clean this up: introduce `variant: 'default' \| 'slim'`, alias the `slim` boolean to it, and migrate consumers — but that's a bigger refactor than a one-PR deprecation. Leaving `slim` as-is for now; `spacing="sm"` is the right knob for "smaller padding only, heading preserved." |
| ~~`civ-read-more.size="sm"` → `civ-read-more.spacing="sm"`~~ | **Done** in `claude/read-more-spacing-rename` (PR #167). | `spacing` prop added on Lit / schema / iOS / Android; Drupal SDC YAML + Twig regenerated by `pnpm sync:drupal`. `size` kept as a backward-compat alias that emits a one-time `devWarn` when set (dedup-keyed on `civ-read-more:size-deprecated`). Storybook Small size story migrated to `spacing="sm"`. Safe true-alias because `size` only adds the `.civ-text-btn--sm` CSS class — no extra layout behavior (unlike the `civ-alert.slim` finding above). Schedule removal of `size` in the next major release. |
| ~~`civ-file-upload.variant="compact"` → split into `variant="default \| full"` + `spacing="default \| sm"`~~ | **Superseded** by the variant rename in `claude/file-upload-error-border-IOQWO` (PR #158). | `variant` enum was renamed: `compact` → `inline`, `full` → `large` — values now describe **layout**, not density. File-upload has no `spacing` prop today (file pickers don't typically appear in density-sensitive surfaces); add one if a real placement needs it. |

### Tier 3 — hardcoded-value cleanup (responds to `[data-civ-scale]` automatically once fixed)

| Item | Action | Notes |
|---|---|---|
| ~~`civ-accordion-item` triggers — `padding: 1rem` in four places (tertiary, flush, secondary, primary)~~ | ✅ Done in `claude/accordion-item-scale-tokens` (PR #163). Three full-row variants use `var(--civ-spacing-4)` uniformly; the primary chip-button variant uses asymmetric `var(--civ-spacing-3) var(--civ-spacing-4)` to preserve its button-like proportions (close to the original `1rem 1.25rem`). Accordions now respond to `[data-civ-scale="dense|spacious"]` automatically. |
| ~~`civ-notice` — `font-size: 2.5rem` (default icon), `1.5rem` (sm icon)~~ | ✅ Done in `claude/table-component-P3Xz3` (2026-05-25) | Migrated to `var(--civ-typography-fontSize-4xl)` (default, 2.25rem = 36px — exact tokens for 2.5rem don't exist; this is the closest at -4px) and `fontSize-2xl` (sm, 1.5rem — exact match). Both now scale with the page. |
| ~~`civ-count` — repeated `min-width: 1.25rem; line-height: 1.25rem;` (default) and `1rem` (sm)~~ | ✅ Done in `claude/table-component-P3Xz3` (2026-05-25) | Default → `var(--civ-spacing-4)` (20px exact). Sm → `var(--civ-spacing-3)` (15px, -1px shift from 1rem/16px). Both style-primary and style-secondary variants migrated. |
| ~~`civ-filter-chip` / `civ-chip` family — `min-height: 1.75rem` (default), `1.5rem` (`--sm`)~~ | ✅ Done via `max(token, floor)` in `claude/scale-tokens-tier3` (PR #165, 2026-05-25) | Migrated to `min-height: max(var(--civ-spacing-6), 1.5rem)` (default) and `min-height: max(var(--civ-spacing-5), 1.5rem)` (`--sm`), applied to `.civ-chip__action`, `button.civ-chip--action`, `.civ-chip--input .civ-chip__label`, and the three `--sm` selectors. The straight `--civ-spacing-N` recommendation would have shrunk to 18.75px / 22.5px under `data-civ-scale="dense"` (`spacingFactor: 0.75`) — below the WCAG SC 2.5.8 Target Size (Minimum) floor of 24px. `max(..., 1.5rem)` clamps the floor while preserving scale-aware upper range under `data-civ-scale="spacious"`. **Pattern for future tokenization of touch-target dimensions**: use `max()` with a WCAG-floor literal whenever the spacing token can dip below 24px under dense scale. |
| ~~`civ-action-btn` — `min-width: 2.5rem / 2rem; min-height: 2.5rem / 2rem;`~~ | ✅ Done in `claude/table-component-P3Xz3` (2026-05-25) | Added `/* not density: WCAG 2.5.5 tap target floor */` comments on both default + `--sm`. |
| ~~Spinner sizes, signature-preview height, file-preview thumbnails~~ | ✅ Done in `claude/table-component-P3Xz3` (2026-05-25) | Added `/* not density: decorative dimension */` comments on spinner ladder and signature-preview height. (File-preview thumbnails don't have a hardcoded dimension in `components.css` — the audit's reference was an over-generalization.) |

### Tier 4 — coverage gaps (most cleared 2026-05-25)

These components likely should expose `spacing="sm"` but don't. Each needs a design call on whether the placement justifies the opt-in:

| Component | Status | Notes |
|---|---|---|
| ~~`civ-data-grid`~~ | ✅ Done | 3-step ladder (`default | sm | xs`). `--sm` matches `.civ-table--sm`; `--xs` shrinks to `px-2 py-0.5` for ultra-dense admin grids (at the WCAG SC 2.5.8 24px target-size floor; documented in CSS to not shrink further). Contract A — pure cell-padding shrink, no chrome dropped. |
| ~~`civ-modal`~~ | ✅ Done | `spacing="default" | "sm"`. Cascades to `dialog.civ-modal` padding + header/body/footer rhythm. Schema prop marked `webOnly: true` — native platforms have their own density mechanisms (iOS size classes, Compose dynamic type) and modal presentation styles vary by OS. |
| ~~`civ-callout`~~ | ✅ Done | `spacing="default" | "sm"`. Pure rail-friendly padding shrink (`spacing-3/4` → `spacing-2/3`). Strong placement evidence — already used in data-grid empty state. |
| ~~`civ-btn`~~ | ✅ Documented (no API change) | `civ-action-button` is the canonical small-button affordance — added a `:::tip` block to the `civ-button` docs page and a "button vs action-button" selection table to the AI guide. Not bifurcating the main button API; consumers reach for action-button for toolbars, row actions, dense forms. |
| ~~`civ-input-group`~~ | ✅ Documented (no API change) | Pure pass-through container with no chrome of its own — adding a `spacing` prop that reaches into children to mutate state is leaky encapsulation. Documented the "set `spacing="sm"` on each child" pattern in the input-group docs page; the group's per-child border-radius math handles either density correctly. |
| ~~`civ-drawer`~~ | Skipped | Secondary-content panel, not density-sensitive. Inherits `[data-civ-scale]` fine. No story evidence consumers want a compact drawer. Add when a real placement asks for it. |
| ~~`civ-action-sheet`~~ | Skipped | Almost no internal chrome to compress; content is consumer-authored. Mobile bottom-sheet pattern is the more significant variant. Add when a real placement asks. |
| ~~`civ-radio-group` / `civ-checkbox-group`~~ | Cleared (no fix needed) | Investigation 2026-05-25: the `civ-gap-N` Tailwind utility maps to `var(--civ-spacing-N)` in `tailwind.config.ts`, and those tokens ARE overridden under `[data-civ-scale="dense"]` (e.g. `--civ-spacing-3: 15px` → `11px`). Group container gaps already scale with the page-level scale system automatically — the original audit finding was a false alarm. No per-component `spacing` prop needed unless a consumer wants a group denser than its surrounding page scale, which hasn't appeared. |

### Tier 5 — `spacing` prop conflated semantics (cleared 2026-05-25)

| Item | Status | Notes |
|---|---|---|
| ~~`civ-page-header.spacing="sm"` controls `margin-bottom` of the surrounding container, not the component's own padding~~ | ✅ Renamed to `rhythm` | `rhythm` prop is now canonical; `spacing` retained as a backward-compat alias that emits a one-time dev-mode warning when set to a non-default value. Same `civ-page-header--sm` modifier class; no CSS migration needed by consumers. Schedule removal of `spacing` in the next major release. |
| ~~`civ-divider.spacing="sm"` controls vertical margin around the divider, not its own dimensions~~ | ✅ Renamed to `rhythm` | Same deprecation pattern (mirrors PR #167 / `civ-read-more.size` → `spacing`). Internal CivUI consumers (stories, MCP examples, healthcare patterns) migrated to `rhythm` in the same PR. Pre-existing iOS bug fixed incidentally — `CivDivider.swift` referenced `variant` instead of the declared `emphasis` property; renamed to use `emphasis` consistently. |

### `lint:hardcoded-spacing` (shipped 2026-05-25)

The proposed lint is now live. `tools/lint-hardcoded-spacing.ts` scans `components.css` for every `padding`/`margin`/`gap`/`font-size`/`line-height`/`width`/`height` declaration that uses a `rem` or `px` literal and flags any that aren't:
- Inside a class on the curated `ALLOWLIST_CLASSES` (tap-target floors, decorative ladders, viewport-anchored overlays, field-width utility ladder, etc.), OR
- Preceded by a `/* not density: <reason> */` comment on the same stanza.

Wired into `pnpm validate:lints` (line 70 of `package.json`) so it runs in the drift-lints CI gate. 22-test helper suite in `tools/__tests__/lint-hardcoded-spacing.test.ts` covers declaration parsing, class-allowlist decision, and annotation detection. `em` / `%` / `vh` / `vw` / `dvh` / `dvw` units pass (font- and viewport-relative — they're either scale-aware via the parent's `font-size` or intentionally viewport-anchored).

To extend the allowlist or migrate a violation, see the docstring at the top of the lint file — it lays out the four valid responses (use a token, allowlist the class, add a `/* not density */` annotation, or migrate to a token).

### Process

All five tiers + the lint shipped (each as an independent PR). What remains is future component additions that should follow the convention from the start.

**Release-note checklist** for the next major release that removes the deprecation aliases:
- `civ-read-more.size` (deprecated PR #167, alias for `spacing`)
- `civ-page-header.spacing` (deprecated 2026-05-25, alias for `rhythm`)
- `civ-divider.spacing` (deprecated 2026-05-25, alias for `rhythm`)
- All three currently emit one-time dev-mode console warnings; consumers have a migration runway.

**Convention bypass requires sign-off:** if a future component needs a density modifier that doesn't fit Contract A or Contract B, document the new contract in `density-convention.md` in the same PR.

---

## @civui/actions audit follow-ups (2026-05-26)

- **Surfaced:** Full @civui/actions audit, branch `claude/combined-input-action-component-Zw9R3`. Major + Critical findings fixed in the same branch (iOS Swift `variant` → `emphasis` compilation fix, civ-link CSS resets, native filter-chip / action-chip default-value drift, Drupal SDC missing props for action-chip + input-chip, confirm/toggle-button renderOrder, etc.). Cross-cutting items below are deferred — they're tool / generator changes that affect many components.

### Schema spec lacks a dedicated `icon` render-element type

- **Files:** `packages/schema/src/schema.types.ts:184` (`RENDER_ELEMENT_TYPES`).
- **State:** The schema's render-element-type union is `['label', 'hint', 'error', 'input', 'select', 'checkbox', 'switch', 'button', 'slot', 'container']`. There is no `'icon'` type. Schemas with iconStart / iconEnd children currently use `type: 'label'` with `bindings: { text: 'iconStart' }`, which is misleading — native implementers reading `text: 'iconStart'` could plausibly render the literal string `"download"` as a label rather than an icon.
- **Why deferred:** Adding `'icon'` to the union is a schema-spec change that ripples through every schema with an iconStart / iconEnd (civ-button, civ-action-button, civ-link, civ-filter-chip, civ-action-chip — at least 5 schemas), the `validate-schemas.ts` checker, the doc-tables generator, and the Drupal sync. It's a coordinated change worth its own branch.
- **What to watch for in the meantime:** When a new component schema declares an icon child, follow the existing pattern (`type: 'label'` with the icon-prop bindings). Don't try to add `type: 'icon'` to a single schema — it'll trip the validator.

### ~~`lint:schema-default-values` for native default drift~~ — ✅ shipped 2026-05-30

- **Shipped:** `tools/lint-schema-default-values.ts` (+ `pnpm lint:schema-default-values`, wired into `validate:lints` and the drift-lints gate). For every `COVERED_COMPONENTS` entry it slices the Swift `init(...)` and Kotlin `fun CivX(...)` parameter lists, extracts each param's default, and compares against the schema `default:` — using the same name-normalization the parity gate uses (`iosPropAlternatives` / `androidPropAlternatives`).
- **Scope decision:** compares **number / boolean** defaults only. String defaults are deliberately excluded — native counterparts routinely default a `String` param to `""` and resolve the real value via a body-level i18n fallback (`label.isEmpty ? t("...") : label`) the parser can't see, so a `""` param default isn't the effective default and would false-positive. Non-literal native defaults (`nil`, `null`, `emptyList()`, `Modifier`, `CivLocale.t(...)`) are skipped, as are `webOnly` schema props. 11 helper tests in `tools/__tests__/lint-schema-default-values.test.ts`.
- **What it caught (all fixed in the same branch, every drift native-side — Lit == schema):** civ-checkbox/civ-radio/civ-radio-group/civ-checkbox-group `tile` (false → true), civ-repeater `min` (1 → 0), civ-back-to-top `threshold` (200 → 400) + `hidden` (false → true), civ-pagination `pageSize` (10 → 25), civ-data-grid `showGroupSubtotals` (false → true), civ-spinner `delay`/`minDuration` (0 → 200/400). The earlier chip drifts (civ-filter-chip `emphasis`/`variant`, civ-action-chip `count`) were enum/optional defaults already fixed in the actions branch.
- **Remaining gap (not blocking):** string-default drift and Drupal SDC `default:` drift are still un-gated for the reasons above. If a future audit wants string coverage, it needs to resolve the native body-level i18n fallback (parse `x.isEmpty ? t("k") : x` and treat `t("k")` as the effective default) — a meatier parser than this lint warrants today.

### `lint:sdc-enum-values` for orphan removals in Drupal SDC — ✅ shipped

- **Files:** Drupal SDC `*.component.yml` under `packages/drupal/civui/components/`; schema `values:` arrays under `packages/schema/src/components/`; `tools/lint-sdc-enum-values.ts`.
- **Additive direction:** `tools/sync-drupal-sdc.ts` reconciles enum constraints on existing props — adds an `enum:` line when the schema declares values but the YAML doesn't, and updates the line when the values differ. 39 existing YAMLs were brought into alignment.
- **Subtractive direction (the orphan-removal catch) — shipped.** `tools/lint-sdc-enum-values.ts` now exists and is wired into `validate:lints` + the drift gate. It walks each `COVERED_COMPONENTS` entry's SDC YAML `enum:` arrays and compares against the schema `values:`, reporting orphan-in-drupal (YAML lists a value the schema rejects) and drupal-over-constrains (schema isn't enum but YAML has one). Verified 2026-05-31: passes across 113 components / 125 enum props. The "sister PR" the entry was waiting on has landed, so when a schema enum value is removed, CI catches a stale SDC orphan instead of it silently lingering. (See the corresponding `common-traps.md` entry "Orphan enum values in Drupal SDC YAMLs" for the consumer-facing rule.)

### `lint:schema-spec` should support integer enums

- **Surfaced:** lint-sdc-enum-values branch, 2026-05-26. civ-alert.headingLevel has source type `2 | 3 | 4 | 5 | 6` (real integer union) but the schema spec's `values?: string[]` only accepts strings, so the schema declares `type: 'number'` (no enum constraint). The Drupal SDC YAML had a hand-added `enum: [2, 3, 4, 5, 6]` matching the source — over-constraining vs. schema. This branch removed the YAML enum to align with the schema; the proper fix is the inverse (extend the schema spec).
- **Files:** `packages/schema/src/schema.types.ts:N` (`values?: string[]`); `tools/sync-drupal-sdc.ts` (the `'${v}'` string quoting at line 222 would need to handle numbers); `tools/lint-schema-enum-values.ts` (the literal-union parser would need numeric-literal support); `tools/sync-doc-tables.ts` (the `\`'${v}'\`` rendering would need to skip quotes for numbers); civ-alert schema (would migrate from `type: 'number'` to `type: 'enum'` with `values: [2,3,4,5,6]`).
- **Why deferred:** Coordinated change across 4–5 files for one current use case. When a second integer-enum case appears (likely candidates: line-clamp limits, max-step counts, level constraints), bundle the spec extension with the new component's landing.

### `disabled` invisible in auto-generated Props tables for `CivBaseElement` components — ✅ resolved (stale entry, 2026-05-31)

- **Files:** `tools/sync-doc-tables.ts`, `tools/lib/inherited.ts`.
- **Was:** Concern that the Props-table generator filtered `INHERITED_FORM_PROPS` (including `disabled`) for components extending `CivBaseElement` (`civ-button`, `civ-action-button`, `civ-link`, `civ-link-card`), silently dropping a real public prop from the rendered docs.
- **Resolution:** No generator change was needed. `renderProps` in `sync-doc-tables.ts` does NOT filter `INHERITED_FORM_PROPS` — it renders every prop the schema's `props` block declares (the only filter, line 91, is a `webOnly` no-op). The actual fix was to **declare `disabled` explicitly in each schema** (`a2fff30` "document public props missing from action-cluster schemas"). Verified 2026-05-31: the generated `_button` / `_action-button` / `_link` / `_link-card` `.props.mdx` partials all contain a `disabled` row, sourced from the matching schema declaration. The proposed extends-detection logic was a more complex solution to a problem the explicit-declaration approach already solved.

### Native `loading` prop parity gap for confirm-button / toggle-button

- **Files:** the relevant Swift / Kotlin stubs.
- **State:** Web `civ-confirm-button` and `civ-toggle-button` do NOT use `LoadingMixin` because they're fast-completing UI state changes, not network actions. Native stubs likewise don't declare loading props. This is correct — but the asymmetry vs the sibling family (civ-button, civ-action-button, civ-text-button all DO use LoadingMixin) is non-obvious. A future audit might reflexively try to add `loading` to confirm/toggle for "consistency."
- **Why deferred:** No fix needed — it's documenting a deliberate asymmetry. Captured here so the rationale survives across audit cycles.

### Colored `civ-link-card` variants lack hover / active feedback

- **Files:** `packages/actions/src/link-card/civ-link-card.ts:103-105` (class selection); `packages/core/src/styles/components.css:4585-4593` (the missing hover/active hooks); `packages/core/src/styles/components.css:5847-5854` (the colored-card BEM that gets used in place).
- **State:** When a consumer sets both `color` and `variant="primary"` on `<civ-link-card>`, the renderer swaps the interactive `.civ-link-card--primary` class for the static `.civ-card--{color}-primary` class. The static class has no `:hover` / `:active` rules — so the link-card visually doesn't respond to mouse interaction, even though it's a real clickable affordance. The `ColorsPrimary` Storybook story (`civ-link-card.stories.ts:264-278`) is the documented placement that hits this.
- **Why deferred:** The proper fix is design-system-level — add hover/active rules to either the shared `.civ-card--{color}-primary` selectors (affects static civ-card too — wrong direction) or scope new rules to `.civ-link-card.civ-card--{color}-primary:hover` (cleaner, but multiplies CSS line count by 8 color values × 2 states). Either way the design choice of "what's the hover delta for a colored card?" deserves a design pass rather than picking arbitrarily — a slight darken via `filter: brightness(0.95)` is heavy-handed; a per-color hover-bg token is the principled fix and means new tokens.
- **What to watch for in the meantime:** Consumers wanting hover/active feedback on colored link-cards should use the non-colored `variant="primary"` (filled brand color) and accept the visual difference; or wrap the card in their own `:hover` rule that adjusts `filter` or `opacity` locally.

---

## Cross-overlay Escape coordination (nested overlays double-dismiss) — ✅ shipped 2026-05-30

- **Surfaced:** Overlays audit, 2026-05-30. Branch `claude/code-quality-components-FhUQi`.
- **Was:** Each dismissable overlay registered its own `document`-level `keydown` listener for Escape: `civ-popover`, `civ-action-sheet`, and `civ-menu` (via its inner popover). `civ-modal` / `civ-drawer` use the native `<dialog>` cancel path instead. When one document-listener overlay was nested inside another (e.g. a `civ-popover` opened inside a `civ-action-sheet`), a single Escape fired BOTH listeners and dismissed both layers at once instead of closing one layer per press.
- **Fix:** Added a shared overlay stack in `@civui/core` (`packages/core/src/a11y/overlay-stack.ts`) — `pushOverlay` / `removeOverlay` / `isTopOverlay` plus a per-event `claimOverlayKey` / `isOverlayKeyClaimed` claim. Each overlay pushes itself when it opens (`civ-popover._syncOpenState`, `civ-action-sheet._onOpen`) and removes itself on close + disconnect. Each Escape handler now bails when the event is already claimed OR the overlay isn't the top of the stack, then claims the event before acting. The **claim** is what makes it order-independent: document `keydown` listeners fire in registration order, not nesting order, so `isTopOverlay` alone isn't enough — a non-top overlay returns *before* claiming, leaving the top layer free to claim regardless of which listener runs first. Deliberately **not** `stopImmediatePropagation()` (the rejected band-aid): the handlers bail internally, so legitimate consumer-level `document` keydown listeners still see the event. `preventDefault()` is preserved on the handled Escape so a native-`<dialog>` ancestor's cancel doesn't also fire (popover-inside-modal still closes the popover only). `civ-menu` needed no change — its Escape delegates to its inner popover, which is on the stack.
- **Tests:** 6 unit tests for the stack module (`packages/core/src/a11y/overlay-stack.test.ts`) + 3 integration tests (`packages/overlays/src/action-sheet/nested-escape.test.ts`) proving popover-inside-action-sheet closes one layer per Escape (innermost first) and that a lone popover / lone action-sheet still close on the first Escape.
- **Adjacent note (NOT addressed — pre-existing, out of scope):** `civ-popover`'s `civ-close` event bubbles (`composed: true`), so a consumer that wires `sheet.addEventListener('civ-close', () => sheet.open = false)` without filtering on `e.target === sheet` will have the inner popover's bubbling close collapse the sheet too. That's a long-standing property of the bubbling event, independent of the Escape stack; the integration test filters by target to document the correct consumer pattern. If a future audit wants to tighten it, the options are scoping overlay close events to non-bubbling or documenting the target-filter requirement on the component pages.

---

## Repeater floor-row Remove button is statically gated (should be dynamic) — ✅ shipped 2026-05-30

- **Surfaced:** form-patterns audit, 2026-05-30. Branch `claude/code-quality-components-FhUQi`.
- **Was:** Whether a row rendered a Remove `<civ-action-button>` was decided **once, statically, when the row was built** (`rowCount >= min || index >= min`). But whether a row is actually *removable* is a function of the **live total count vs `min`** (`removeRow` refuses when `rowCount <= min`). At mount, `_rowCount` is seeded to `min`, so floor rows showed a Remove button that — while the list sat at the floor — only emitted the "minimum reached" announcement when clicked. A naive `index >= min` "fix" was wrong: it would permanently hide Remove on row 0 even after the list grew to N > min rows where row 0 *is* removable.
- **Fix:** Drive Remove-button visibility from the single live predicate `_rowCount > min`, re-evaluated on every mutation rather than baked in at build time.
  - **inline / form-steps modes:** the row-builder now *always* builds the Remove button (so it can be revealed without rebuilding the row) and hides it with the `civ-hidden` class while the list is at its floor. `civ-repeater._syncRemoveButtonVisibility()` toggles `civ-hidden` on every row's Remove button after every add / remove (and the form-steps save path), so a floor row's Remove appears the instant the list grows above `min` and disappears again when it shrinks back. The button stays in the DOM either way, so aria-label reindexing and the delegated click handler keep working. `appendInlineRow` / `appendFormStepsSummaryCard` gained a `min` + post-append `rowCount` param and compute the initial hidden state from them.
  - **route mode:** declarative, so the summary card simply renders the Remove `<civ-action-button>` only when `rows.length > min` (omitted entirely at the floor, which is cleaner than a hidden node in a Lit-controlled tree).
- **Tests:** new `civ-repeater floor-row Remove visibility` block — mount-at-floor (hidden), grow-above-floor (revealed on every row), shrink-back-to-floor (re-hidden), and `min=0` first-row-immediately-removable. Route-mode "does not render Remove at the floor" + "renders + fires remove above the floor". Row-builder unit tests updated to the build-always-but-hide contract (below-floor → button present with `civ-hidden`; above-floor → present and visible). 136 repeater tests pass; full form-patterns suite 372 pass.
- **What to watch for:** the predicate is `_rowCount > this.min` (strictly greater) — at the floor nothing is removable. Don't reintroduce a build-time `index`-based gate; visibility must stay a pure function of the live count so grow/shrink across the floor both work.

---

## Process

Run `pnpm validate:drift` after each audit to confirm fixes don't introduce drift. Items in this file should be reviewed at the start of each audit round — if an entry is still here after three audits, escalate (file an issue or schedule the work).
