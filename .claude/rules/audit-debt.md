# CivUI Audit Debt

Items surfaced during component audits that were deliberately deferred — too large, too cross-cutting, or blocked on platform/design-team decisions to fix in the same pass. Each entry includes the audit date, the scope (file + LOC if relevant), and a one-sentence rationale for the deferral.

When you finish an audit, the audit skill writes new findings here (see `.claude/skills/audit/SKILL.md` — "Deferred items section"). When an item is fixed, remove its entry along with the commit. Don't let entries linger silently — review this file at the start of each audit round.

---

## Native platform implementation pass (iOS + Android)

- **Surfaced:** Overlays + Compound audits, 2026-05-11. Scope corrected 2026-05-12. Allowlist mechanised 2026-05-19.
- **Scale:** 20 iOS components currently return `EmptyView()`. Android stubs follow the same pattern (no real Compose body).
- **Source of truth:** The canonical list lives in [`tools/ios-stub-allowlist.ts`](../../tools/ios-stub-allowlist.ts). The `pnpm lint:ios-stub-allowlist` CI gate enforces it both ways — a new stub without an entry fails the build, and an entry whose body is no longer EmptyView is flagged stale. Editing the allowlist requires a deliberate human PR.
- **State:** Each component declares the schema's prop surface (so `schema-parity` is satisfied), but renders no actual native UI. Android equivalents render only `Column { ... }` placeholders.
- **Why deferred:** This is a real native-implementation pass, not a quick port. SwiftUI/Compose work without device verification is risky — modal/sheet presentation in particular has platform-specific quirks (focus trap, dismiss gestures, scrim, keyboard insets) that LLMs cannot test blind. The schema-driven prop surface keeps the parity contract stable; UI implementation should be scheduled as dedicated work with someone who can run the simulators.
- **What to watch for in the meantime:** When adding new props to a covered component, add them to the iOS/Android stubs too — schema parity requires it. Don't try to "fix" the empty bodies one component at a time without device testing. If you have device access and want to implement one for real, remove the entry from the allowlist in the same PR — the lint will flag the stale entry otherwise.

---

## Admin data-grid follow-ups

- **Surfaced:** Admin data-grid landing, 2026-05-17. Branch `claude/admin-data-grid-component-Jg8Uk`.
- **What landed:** Three new web components — `<civ-data-grid>` (semantic table, sort, selection, row-action menus, responsive stacked / scroll, empty/loading/error states), `<civ-pagination>` (USWDS-style), `<civ-menu>` + `<civ-menu-item>` (anchored kebab/overflow menu). Schemas, tests (94 new tests in total), Storybook stories, and Docusaurus pages all ship in the same change.
- **Explicitly out of v1 scope** (confirmed with user before implementation):
  1. **Inline editing.** Cell-level click-to-edit + validation flow. The grid currently renders read-only cells; a `column.editable` flag plus per-cell input swap is a follow-up. ColumnDef and RowDef are already shaped to accept this without breaking changes.
  2. **Nested / expandable rows.** Expand row → reveal child `<civ-data-grid>` or detail slot. Needs an `expandable`/`expanded` row flag and a child-row template slot. Currently not implemented.
- **Native + Drupal stubs (parity coverage) deferred.** `civ-menu`, `civ-menu-item`, `civ-pagination`, `civ-data-grid`, `civ-toolbar`, `civ-bulk-actions`, and `civ-column-visibility` schemas exist, validate cleanly, and produce documented Props/Events partials, but they are NOT registered in `tools/schema-parity.ts` `COVERED_COMPONENTS`. To register them, add: iOS Swift stubs (`packages/ios/Sources/CivUI/Civ{Menu,MenuItem,Pagination,DataGrid,Toolbar,BulkActions,ColumnVisibility}.swift`), Android Kotlin stubs (`packages/android/src/main/kotlin/gov/civui/components/Civ{Menu,MenuItem,Pagination,DataGrid,Toolbar,BulkActions,ColumnVisibility}.kt`), and Drupal SDC YAMLs (`packages/drupal/civui/components/{menu,menu-item,pagination,data-grid,toolbar,bulk-actions,column-visibility}/{name}.component.yml`). Pattern: same shape as `civ-action-sheet` for menu / column-visibility (both popovers with a triggers + panels), `civ-card` for data-grid / toolbar / bulk-actions. After registering, `pnpm parity:schema` will enforce prop surface across all platforms going forward.
- **Why deferred:** Same rationale as the existing native-stubs entry — modal/menu presentation has platform quirks that need device verification, and the data-grid is a meaty Swift / Compose implementation that shouldn't be written blind. Schemas being in place keeps the contract stable for whoever picks this up.
- **Architectural note:** `@civui/layout` now declares `@civui/overlays` as a workspace dependency so the data-grid can compose `civ-menu` for row-action menus. The CLAUDE.md "Build order" line is now approximate — turbo derives actual order from package.json. Update the docs sentence if it confuses anyone.

---

## Metric tile follow-ups

- **Surfaced:** Metric tile landing, 2026-05-23. Branch `claude/tab-component-styling-Ndmic`.
- **What landed:** Two new web components in `@civui/data` — `<civ-metric-tile>` (display-only dashboard tile with label / value / unit / icon / delta / trend / intent / description) and `<civ-metric-group>` (responsive grid wrapper that stacks to 1 col on mobile, 2 on tablet, up to `columns` on desktop). Schemas, tests (14 new tests), Storybook stories, and a Docusaurus page (`docs/components/data/metric-tile.mdx` — covers both components, per `HOST_PAGE_OVERRIDES`) all ship in the same change.
- **Explicitly out of v1 scope** (confirmed with user before implementation):
  1. **Polymorphic clickable tile.** The tile is display-only — no `href` / `<a>` rendering. Consumers who want a drillable tile wrap the content in `<civ-link-card>` (which already exists for that pattern). Adding `href` to `<civ-metric-tile>` later is non-breaking if a real use case appears.
  2. **Sparkline / inline trend chart.** No embedded SVG chart. Trend is conveyed by arrow + delta text only. A future sparkline variant would need a data-array prop and decisions about chart rendering library.
- **Native + Drupal stubs (parity coverage) deferred.** Schemas exist for `civ-metric-tile` and `civ-metric-group` and they validate cleanly + produce Props/Events partials, but neither is registered in `tools/schema-parity.ts` `COVERED_COMPONENTS`. To register: add iOS Swift stubs (`packages/ios/Sources/CivUI/Civ{MetricTile,MetricGroup}.swift`), Android Kotlin stubs (`packages/android/src/main/kotlin/gov/civui/components/Civ{MetricTile,MetricGroup}.kt`), and Drupal SDC YAMLs (`packages/drupal/civui/components/{metric-tile,metric-group}/{name}.component.yml`). Pattern: shape `civ-metric-tile` after `civ-card` (props-driven container with no children); shape `civ-metric-group` after `civ-list` (parent container, slot-projects children).
- **Why deferred:** Same rationale as the existing native-stubs entry — responsive grid behavior (SwiftUI `LazyVGrid` with adaptive size classes, Compose `LazyVerticalGrid` with `GridCells.Adaptive`) needs device verification.

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
- **Native + Drupal stubs (parity coverage) deferred.** Schemas exist for `civ-itemized-total` and `civ-itemized-item` and they validate cleanly + produce Props/Events partials, but neither is registered in `tools/schema-parity.ts` `COVERED_COMPONENTS`. To register: add iOS Swift stubs (`packages/ios/Sources/CivUI/Civ{ItemizedTotal,ItemizedItem}.swift`), Android Kotlin stubs (`packages/android/src/main/kotlin/gov/civui/components/Civ{ItemizedTotal,ItemizedItem}.kt`), and Drupal SDC YAMLs (`packages/drupal/civui/components/{itemized-total,itemized-item}/{name}.component.yml`). Pattern: shape `civ-itemized-total` after `civ-list` (parent container, slot-projects children, plus a summary footer row); shape `civ-itemized-item` after `civ-data-field` (per-row label + value pair).
- **Why deferred:** Same rationale as the existing native-stubs entry — `Intl.NumberFormat` has platform-specific equivalents (SwiftUI's `.formatted(.currency(code:))`, Compose's `java.text.NumberFormat.getCurrencyInstance(Locale)`) and tabular numeric alignment + currency-symbol positioning vary per OS in ways that need device verification. Schemas being in place keeps the contract stable for whoever picks this up.

---

## Notice follow-ups

- **Surfaced:** Notice landing, 2026-05-24. Branch `claude/itemized-totals-component-N2dSw` (landed alongside itemized-total in the same branch since both were small additions in the same audit conversation).
- **What landed:** One new web component in `@civui/feedback` — `<civ-notice>` (icon-prefixed emphasis text, GOV.UK warning-text pattern generalized with five semantic intents: `info` / `warning` / `error` / `success` / `neutral`). Display-only, no background, no dismiss; `header` + `body` props for guaranteed-correct HTML; intent drives the default icon (override via `icon` prop); `spacing` `default` (GOV.UK-presence) / `sm` (inline-compact); `iconStyle` `filled` (default, heavier presence — uses `info-fill` / `warning-fill` / `error-fill` / `check-circle-fill`) or `outline` (lighter cue — uses the existing `info` / `warning` / `error` / `check-circle` glyphs); optional opt-in `sr-prefix` for visually-hidden screen-reader severity announcement. Schema, tests (~17 new tests), Storybook stories, CSS, and a Docusaurus page (`docs/components/feedback/notice.mdx`) all ship in the same change. **Initial landing was in `@civui/layout`; moved to `@civui/feedback` in a follow-up commit to sit alongside `civ-alert` and `civ-badge` (semantic-intent siblings).**
- **Explicitly out of v1 scope** (confirmed with user before implementation):
  1. **Rich body content with inline links.** `body` is a string prop; for body text that needs a link or other inline markup, consumers should use `civ-callout` instead. A body slot is a possible v2 if a real placement needs it.
  2. **Auto-derived screen-reader prefix.** `sr-prefix` is empty by default and opt-in per placement — teams decide when the severity needs to be announced verbally before the header. No hardcoded "Warning:" / "Success:" mapping.
  3. **Refactoring `civ-alert` to compose `civ-notice` internally.** The two components share visual DNA (icon + text + semantic intent) but `civ-alert` has additional behavior (dismiss, ARIA live region, focus management) that wasn't part of this scope. **Composition the other way works today** — civ-alert was migrated from `LightDomTextMixin` to `LightDomSlotMixin` in the same branch so consumers can place `<civ-notice>` (or any other markup) as a child of `<civ-alert>` when `label` is unset. The "label wins" precedence rule from the original behavior is preserved. If a future audit decides to also unify alert's internal icon rendering (alert currently has no icon at all), both could be migrated to a shared internal primitive.
  4. **Dismiss button.** That's `civ-alert`'s job. Notice is for emphasis in flowing content, not a notification handed to the user.
- **Native + Drupal stubs (parity coverage) deferred.** Schema exists for `civ-notice` and validates cleanly + produces Props/Events partials, but it is NOT registered in `tools/schema-parity.ts` `COVERED_COMPONENTS`. To register: add an iOS Swift stub (`packages/ios/Sources/CivUI/CivNotice.swift`), an Android Kotlin stub (`packages/android/src/main/kotlin/gov/civui/components/CivNotice.kt`), and a Drupal SDC YAML (`packages/drupal/civui/components/notice/notice.component.yml`). Pattern: shape after `civ-alert` (props-driven container with icon + heading + body) — the SF Symbols / Material Icons mapping per intent should match what `civ-alert` already does on each platform.
- **Why deferred:** Same rationale as the existing native-stubs entry — icon rendering and screen-reader prefix semantics (visually-hidden text vs. `accessibilityLabel`) have platform-specific equivalents that need device verification. Schemas being in place keeps the contract stable for whoever picks this up.

---

## Navigation components follow-ups

- **Surfaced:** Navigation components landing, 2026-05-18. Branch `claude/add-navigation-components-YikKk`.
- **What landed:** Three new navigation-component clusters in `@civui/navigation` (originally landed in `@civui/actions`; extracted into the dedicated navigation package in PR #130) — `<civ-breadcrumb>` + `<civ-breadcrumb-item>` (anchor-based trail with CSS chevron separators and `aria-current="page"` on the final crumb), `<civ-nav>` + `<civ-nav-item>` (top-level horizontal site nav, stacks vertically at ≤480px, single-level only), `<civ-tabs>` + `<civ-tab>` + `<civ-tab-panel>` (full ARIA tabs pattern with roving tabindex, manual activation, arrow / Home / End keyboard navigation, and auto-wired `aria-controls` / `aria-labelledby`). Schemas, tests (33 new tests), Storybook stories, and Docusaurus pages all ship in the same change.
- **Explicitly out of v1 scope** (confirmed with user before implementation):
  1. **Tab panels backed by URL.** Tabs are JS-state-driven. A future addition could optionally sync the selected tab to the URL (hash or query param) so deep linking and back-button navigation work; today the consumer wires that up themselves via the `civ-change` event.
  2. **Multi-level nav with dropdown submenus.** `<civ-nav>` is single-level by design. Submenus (hover/click triggered dropdowns, mobile sheet collapse, focus management) are deliberately out of scope — use a separate menu component if needed.
- **Native + Drupal stubs (parity coverage) deferred.** Schemas exist for `civ-breadcrumb`, `civ-breadcrumb-item`, `civ-nav`, `civ-nav-item`, `civ-tabs`, `civ-tab`, and `civ-tab-panel` and they validate cleanly + produce Props/Events partials, but none are registered in `tools/schema-parity.ts` `COVERED_COMPONENTS`. To register: add iOS Swift stubs (`packages/ios/Sources/CivUI/Civ{Breadcrumb,BreadcrumbItem,Nav,NavItem,Tabs,Tab,TabPanel}.swift`), Android Kotlin stubs (`packages/android/src/main/kotlin/gov/civui/components/Civ{Breadcrumb,...}.kt`), and Drupal SDC YAMLs (`packages/drupal/civui/components/{breadcrumb,breadcrumb-item,nav,nav-item,tabs,tab,tab-panel}/{name}.component.yml`). Pattern: shape `civ-nav` / `civ-breadcrumb` after `civ-list` (parent renders a container, child sets `role="listitem"`); shape `civ-tabs` after `civ-segmented-control` (parent owns roving tabindex + keyboard).
- **Why deferred:** Same rationale as the existing native-stubs entry — tab presentation has platform quirks (SwiftUI's `TabView` vs custom segmented-control vs `Picker`, Compose's `TabRow` / `ScrollableTabRow`) that need device verification. Schemas being in place keeps the contract stable for whoever picks this up.

---

## Accordion follow-ups

- **Surfaced:** Accordion landing, 2026-05-23. Branch `claude/accordion-component-design-qXQjU`.
- **What landed:** Two new web components in `@civui/layout` — `<civ-accordion>` (group container with `single`-open coordination) and `<civ-accordion-item>` (full-width expandable row built on native `<details>`/`<summary>`, with an optional `heading-level` 1–6 prop that wraps the label in an `<h1>`–`<h6>` for screen-reader rotor navigation). Composes the same visual language as `civ-disclosure` (chevron caret, 90° rotation on open) but with a larger tap target and full row width. Schemas, tests (23 new tests), Storybook stories, CSS, and a docs page all ship in the same change.
- **Explicitly out of v1 scope** (confirmed with user before implementation):
  1. **Form-field exclusion when collapsed.** Unlike `civ-conditional`, accordion-hidden content stays in the DOM and is included in `civ-form.getFormData()` / `validate()`. Documented in the docs page; not wired into the form-pattern exclusion path. Matches `civ-tabs` behavior.
- **Native + Drupal stubs (parity coverage) deferred.** Schemas exist for `civ-accordion` and `civ-accordion-item` and they validate cleanly + produce Props/Events partials, but neither is registered in `tools/schema-parity.ts` `COVERED_COMPONENTS`. To register: add iOS Swift stubs (`packages/ios/Sources/CivUI/Civ{Accordion,AccordionItem}.swift`), Android Kotlin stubs (`packages/android/src/main/kotlin/gov/civui/components/Civ{Accordion,AccordionItem}.kt`), and Drupal SDC YAMLs (`packages/drupal/civui/components/{accordion,accordion-item}/{name}.component.yml`). Pattern: shape `civ-accordion` after `civ-list` (parent renders a container, child sets `role`/state); shape `civ-accordion-item` after `civ-disclosure` (native disclosure primitive with chevron + label).
- **Why deferred:** Same rationale as the existing native-stubs entry — disclosure/expand presentation has platform quirks (SwiftUI `DisclosureGroup`, Compose `AnimatedVisibility` / `ExpandableCard`) that need device verification.

---

## Chip family expansion (sibling components, not a rename)

- **Surfaced:** Callout component landing, 2026-05-23. Branch `claude/callout-utility-component-AVY8b`. Filter-chip border was changed to fully-rounded (`civ-rounded-full`) in the same branch; the question of whether to broaden the component came up immediately after.
- **Decision:** When other "rounded button"–shaped affordances are needed, **add sibling components** (`civ-action-chip`, `civ-input-chip`) rather than rename `civ-filter-chip` to a polymorphic `civ-chip`. Material's chip family follows the same pattern (`FilterChip` / `ActionChip` / `InputChip` are each distinct components) for the same reason: each chip type has a different contract — selection toggle vs. fire-and-forget action vs. user-entered tag with a remove handle.
- **What the new siblings would be:**
  1. **`civ-action-chip`** — fire-and-forget rounded button (no toggle state, no check icon). Use cases: quick filters that immediately re-fetch ("Last 30 days"), suggestion chips in a chat composer, secondary CTAs that need a less prominent shape than `civ-button`. Contract: single `label`, optional `iconStart`, single `civ-click` event. No `selected` state.
  2. **`civ-input-chip`** — user-entered token with a remove handle (e.g. tag input, recipient list, applied-filter readouts). Distinct from `civ-filter-chip` because the chip *represents user-entered content*, not a toggleable filter option. Always has a remove `(X)`. Contract: `label`, `removable` (always true in practice), `civ-remove` event.
- **What stays on `civ-filter-chip`:** the existing toggle behavior (`selected` state + check icon + optional remove). Don't merge.
- **Shared CSS:** `civ-action-chip` and `civ-input-chip` can compose the same `.civ-filter-chip` wrapper styles (border-radius, padding, focus ring) via a shared BEM base class — likely rename the internal class to `.civ-chip` and have `.civ-filter-chip` / `.civ-action-chip` / `.civ-input-chip` be modifier classes off it. That refactor is internal-only; the public component tag names stay.
- **Naming note:** if someone proposes renaming `civ-filter-chip` → `civ-chip` with a `role` / `chip-role` prop, push back: it forces every consumer to thread a prop to distinguish behaviors that are semantically different, and the runtime cost (validation, conditional rendering of the check icon and remove button) is higher than three small components.
- **Why deferred:** No consumer has asked for the second chip type yet; the immediate filter-chip use case is fully served. Build a sibling when a real placement needs one.

---

## Secondary navigation follow-ups (side-nav, on-this-page, back-to-top)

- **Surfaced:** Secondary navigation components landing, 2026-05-23. Branch `claude/nav-components-vads`.
- **What landed:** Three new navigation-component clusters in `@civui/navigation` (originally landed in `@civui/actions`; extracted into the dedicated navigation package in PR #130) — `<civ-side-nav>` + `<civ-side-nav-item>` (vertical hierarchical left-rail with leading-edge accent rail on the current item, nested sub-items via slot, disabled state), `<civ-on-this-page>` + `<civ-on-this-page-item>` (in-page TOC with two modes — auto-detect headings via `selector`/`scopeSelector` or manual children — and IntersectionObserver-driven `aria-current="location"` highlight), `<civ-back-to-top>` (floating chip anchored bottom-right, sentinel-based show/hide with no scroll listener, focus-moves to top landmark on click, honors `prefers-reduced-motion`). Schemas, tests, Storybook stories, and Docusaurus pages all ship in the same change.
- **Explicitly out of v1 scope** (confirmed with user before implementation):
  1. **Mobile collapse for `civ-side-nav`.** The rail stays as a vertical list at every breakpoint. Drawer / hamburger collapse for small screens is the consumer's responsibility (`<civ-drawer>` wrapper or CSS media-query swap to a top nav).
  2. **MutationObserver in `civ-on-this-page`.** Auto-detect runs once in `firstUpdated`. Headings rendered later (async fetches) are not picked up. Consumers wait for content to land before mounting the rail.
  3. **URL-routing for `civ-side-nav`.** The `current` flag is consumer-managed — there's no built-in route observer or path-matching helper. Document-position fragments work via `<civ-on-this-page>` instead.
- **Native + Drupal stubs (parity coverage) deferred.** Schemas exist for `civ-side-nav`, `civ-side-nav-item`, `civ-on-this-page`, `civ-on-this-page-item`, and `civ-back-to-top` and they validate cleanly + produce Props/Events partials, but none are registered in `tools/schema-parity.ts` `COVERED_COMPONENTS`. To register: add iOS Swift stubs (`packages/ios/Sources/CivUI/Civ{SideNav,SideNavItem,OnThisPage,OnThisPageItem,BackToTop}.swift`), Android Kotlin stubs (`packages/android/src/main/kotlin/gov/civui/components/Civ{SideNav,…}.kt`), and Drupal SDC YAMLs (`packages/drupal/civui/components/{side-nav,side-nav-item,on-this-page,on-this-page-item,back-to-top}/{name}.component.yml`). Pattern: shape `civ-side-nav` / `civ-on-this-page` after `civ-list` (parent container, child sets role/state); `civ-side-nav-item` after `civ-disclosure` for the nested-children pattern; `civ-back-to-top` after `civ-action-button` for a single fixed-position interactive primitive.
- **Why deferred:** Same rationale as the existing native-stubs entry — scroll-position tracking, IntersectionObserver, and top-landmark focus management have platform quirks (SwiftUI `ScrollViewReader`, Compose `LazyListState.firstVisibleItemIndex`) that need device verification. Schemas being in place keeps the contract stable for whoever picks this up.

---

## Timeline follow-ups

- **Surfaced:** Form-submission components landing, 2026-05-24. Branch `claude/form-submission-components-9zmdH`. Renamed `civ-activity-timeline` → `civ-timeline` and `civ-activity-item` → `civ-timeline-item` after landing so the component covers a broader set of "dated events, in order" use cases (audit logs, version histories, project milestones, document workflows). The `civ-confirmation-panel` that originally landed in the same branch was removed shortly after (2026-05-24, branch `claude/remove-confirmation-components-2QqXE`) — the post-submission success surface needs more design thinking before it ships again.
- **What landed:** `<civ-timeline>` + `<civ-timeline-item>` (dated event list in `@civui/feedback`; `<ol role="list">` container, intent-colored rail dots with default semantic icons, `<time datetime>`-wrapped timestamps in relative / absolute / both formats via `Intl.RelativeTimeFormat`). Schemas, tests, Storybook stories, CSS, and Docusaurus pages all ship in the same change. `civ-timeline-item` lives on the timeline page via `HOST_PAGE_OVERRIDES`.
- **Explicitly out of v1 scope** (confirmed with user before implementation):
  1. **Timeline `reversed` prop / `compact` mode.** Items render in source order — consumers reverse the array themselves for newest-first audit logs. A `compact` density is not implemented; add when a dashboard placement needs it.
  2. **Clickable timeline items.** Items are display-only. Consumers needing per-item drill-down render a `<button>` or `<civ-link>` inside the item's body slot.
  3. **MutationObserver on the timeline.** Items added after `firstUpdated` are picked up by Lit's normal child capture flow, but dynamic `${items.map(...)}` patterns inside the timeline hit the known LightDomSlotMixin issue (see common-traps.md). Static authoring or wrapping the map in a static container is the documented workaround.
- **Native + Drupal stubs (parity coverage) deferred.** Schemas exist for `civ-timeline` and `civ-timeline-item` and they validate cleanly + produce Props/Events partials, but neither is registered in `tools/schema-parity.ts` `COVERED_COMPONENTS`. To register: add iOS Swift stubs (`packages/ios/Sources/CivUI/Civ{Timeline,TimelineItem}.swift`), Android Kotlin stubs (`packages/android/src/main/kotlin/gov/civui/components/Civ{Timeline,TimelineItem}.kt`), and Drupal SDC YAMLs (`packages/drupal/civui/components/{timeline,timeline-item}/{name}.component.yml`). Pattern: shape `civ-timeline` after `civ-list` (parent container, slot-projects children); shape `civ-timeline-item` after `civ-list-item` (per-row host with leading `aria-hidden` chrome + trailing content stack).
- **Why deferred:** Same rationale as the existing native-stubs entry — `Intl.RelativeTimeFormat` and timeline rail rendering have platform quirks (native relative-time formatters per OS, Compose Modifier composition for the rail) that need device verification. Schemas being in place keeps the contract stable for whoever picks this up.

---

## Process list follow-ups

- **Surfaced:** Process-list landing, 2026-05-24. Branch `claude/form-submission-components-9zmdH` (shipped alongside the confirmation-panel + timeline rename in the same PR train).
- **What landed:** Two new web components in `@civui/feedback` — `<civ-process-list>` (numbered vertical preview of upcoming steps; renders as `<ol role="list">`, auto-increments step numbers via a CSS counter on the parent list) and `<civ-process-list-item>` (rail + connecting line + heading + slotted body; `state="complete"` swaps the numbered marker for a check icon on a success-tinted background, and an explicit `icon` prop overrides both for affordance-specific markers like `lock` / `mail`). Schemas (2 new), tests (15 new), Storybook stories, CSS, and a Docusaurus page (`docs/components/feedback/process-list.mdx` — covers both components via `HOST_PAGE_OVERRIDES`) all ship in the same change.
- **Explicitly out of v1 scope** (confirmed with user before implementation):
  1. **`active` / in-progress state.** Only `default` (upcoming) and `complete` (finished) are modelled. The "you are here" pattern belongs to `civ-progress-steps`, not the process-list — process-list is a *preview*, not an active progress indicator. If a future mixed surface needs to highlight one step as in-progress inside an otherwise-preview list, add an `active` enum value rather than re-purposing the component.
  2. **Branching / sub-steps.** Items are a flat sequence — no nested children, no parallel branches. Consumers needing a tree should compose nested lists inside an item's body slot.
  3. **MutationObserver on the list.** Items captured once in `firstUpdated` via `LightDomSlotMixin`; dynamic `${items.map(...)}` patterns hit the same trap as timeline (see common-traps.md). Static authoring or wrapping the map in a static container is the documented workaround. The docs page calls this out in a `:::caution` block.
- **Native + Drupal stubs (parity coverage) deferred.** Schemas exist for `civ-process-list` and `civ-process-list-item` and they validate cleanly + produce Props/Events partials, but neither is registered in `tools/schema-parity.ts` `COVERED_COMPONENTS`. To register: add iOS Swift stubs (`packages/ios/Sources/CivUI/Civ{ProcessList,ProcessListItem}.swift`), Android Kotlin stubs (`packages/android/src/main/kotlin/gov/civui/components/Civ{ProcessList,ProcessListItem}.kt`), and Drupal SDC YAMLs (`packages/drupal/civui/components/{process-list,process-list-item}/{name}.component.yml`). Pattern: shape `civ-process-list` after `civ-list` (parent container, slot-projects children); shape `civ-process-list-item` after `civ-timeline-item` (per-row host with leading `aria-hidden` rail + numbered/icon marker + trailing heading/body stack). On native, the auto-numbering comes from the parent's `ForEach` / `LazyColumn` index rather than a CSS counter.
- **Why deferred:** Same rationale as the existing native-stubs entry — numbered-rail rendering and CSS-counter equivalents need device verification (SwiftUI `ForEach(Array(items.enumerated()))` indexing, Compose `itemsIndexed`). Schemas being in place keeps the contract stable for whoever picks this up.

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
| ~~`civ-read-more.size="sm"` → `civ-read-more.spacing="sm"`~~ | ✅ Done in `claude/table-component-P3Xz3` (2026-05-25) | Added `spacing` prop (parallels `size`'s values). `size` is now `@deprecated` in JSDoc and emits a `devWarn` when set to `'sm'`. Schema, iOS / Android stubs, and Drupal SDC updated to expose `spacing`. Story migrated. Test covers both code paths producing `civ-text-btn--sm`. |
| ~~`civ-file-upload.variant="compact"` → split into `variant="default \| full"` + `spacing="default \| sm"`~~ | **Superseded** by the variant rename in `claude/file-upload-error-border-IOQWO` (PR #158). | `variant` enum was renamed: `compact` → `inline`, `full` → `large` — values now describe **layout**, not density. File-upload has no `spacing` prop today (file pickers don't typically appear in density-sensitive surfaces); add one if a real placement needs it. |

### Tier 3 — hardcoded-value cleanup (responds to `[data-civ-scale]` automatically once fixed)

| Item | Action | Notes |
|---|---|---|
| ~~`civ-accordion-item` triggers — `padding: 1rem` in four places (tertiary, flush, secondary, primary)~~ | ✅ Done in `claude/accordion-item-scale-tokens` (PR #163). Three full-row variants use `var(--civ-spacing-4)` uniformly; the primary chip-button variant uses asymmetric `var(--civ-spacing-3) var(--civ-spacing-4)` to preserve its button-like proportions (close to the original `1rem 1.25rem`). Accordions now respond to `[data-civ-scale="dense|spacious"]` automatically. |
| ~~`civ-notice` — `font-size: 2.5rem` (default icon), `1.5rem` (sm icon)~~ | ✅ Done in `claude/table-component-P3Xz3` (2026-05-25) | Migrated to `var(--civ-typography-fontSize-4xl)` (default, 2.25rem = 36px — exact tokens for 2.5rem don't exist; this is the closest at -4px) and `fontSize-2xl` (sm, 1.5rem — exact match). Both now scale with the page. |
| ~~`civ-count` — repeated `min-width: 1.25rem; line-height: 1.25rem;` (default) and `1rem` (sm)~~ | ✅ Done in `claude/table-component-P3Xz3` (2026-05-25) | Default → `var(--civ-spacing-4)` (20px exact). Sm → `var(--civ-spacing-3)` (15px, -1px shift from 1rem/16px). Both style-primary and style-secondary variants migrated. |
| ~~`civ-filter-chip` — `min-height: 1.75rem` (default), `1.5rem` (`--sm`)~~ | ✅ Kept hardcoded (2026-05-25) | **Departure from audit recommendation.** The audit suggested `var(--civ-spacing-6)` / `--civ-spacing-5`, but spacing-6 at `[data-civ-scale="dense"]` resolves to 23px — below the WCAG 2.5.5 24px tap-target floor. Treating this as a WCAG floor (same as `civ-action-btn`); added `/* not density: WCAG 2.5.5 tap target floor */` comment so future audits don't re-flag. |
| ~~`civ-action-btn` — `min-width: 2.5rem / 2rem; min-height: 2.5rem / 2rem;`~~ | ✅ Done in `claude/table-component-P3Xz3` (2026-05-25) | Added `/* not density: WCAG 2.5.5 tap target floor */` comments on both default + `--sm`. |
| ~~Spinner sizes, signature-preview height, file-preview thumbnails~~ | ✅ Done in `claude/table-component-P3Xz3` (2026-05-25) | Added `/* not density: decorative dimension */` comments on spinner ladder and signature-preview height. (File-preview thumbnails don't have a hardcoded dimension in `components.css` — the audit's reference was an over-generalization.) |

### Tier 4 — coverage gaps (need design decision before implementing)

These components likely should expose `spacing="sm"` but don't. Each needs a design call on whether the placement justifies the opt-in:

| Component | Justification | Decision needed |
|---|---|---|
| `civ-data-grid` | Admin tables routinely need 3 row densities. Its `.civ-table` sibling has `--sm`; asymmetric API. | 2-step (`default \| sm`) or 3-step (`default \| sm \| xs`) ladder? |
| `civ-modal` / `civ-drawer` / `civ-action-sheet` | Dense admin "quick action" overlays don't need full-size chrome. | Add `spacing="sm"` to all three. |
| `civ-callout` | Inline emphasis inside dense surfaces (data-grid empty state, sidebar notes). | Add `spacing="sm"`. |
| `civ-btn` | Toolbars + table action menus want smaller buttons. Today consumers route through `civ-action-button` for that. | Add `spacing="sm"` to `civ-btn` OR document `civ-action-button` as the canonical small-button affordance. |
| `civ-input-group` | When `civ-input--sm` is used the group's border-radius / icon padding stay default and read mismatched. | Cascade `spacing` to the group's chrome. |
| `civ-radio-group` / `civ-checkbox-group` | Leaf radio/checkbox supports `spacing="sm"`; group container's gap doesn't track. | Cascade `spacing` to children, or document `data-civ-scale` as the answer. |

### Tier 5 — `spacing` prop conflated semantics (architectural fix)

| Item | Action | Notes |
|---|---|---|
| `civ-page-header.spacing="sm"` controls **`margin-bottom`** of the surrounding container, not the component's own padding | Rename to `margin="sm"` or `rhythm="sm"`, or move the rhythm control to the parent | Same prop name, different semantic from every other use. Confusing. |
| `civ-divider.spacing="sm"` controls **vertical margin** around the divider, not its own dimensions | Same as above | Same problem. |

### Lint proposal (deferred)

Once Tiers 1–3 are mostly cleared, add `lint:hardcoded-spacing` to the drift-lints CI gate. It scans `components.css` for `padding`/`margin`/`gap`/`font-size`/`width`/`height` declarations with hardcoded `rem` / `px` values and flags any class not on a curated decorative-exception allowlist (tap-target floors, thumbnail dimensions, spinner sizes, decorative cursive font, etc.). Premature today — too many intentional decorative hardcodes — but the right end state.

### Process

Tiers 1, 2, 3 can each ship as independent PRs against this convention. No tier blocks another. Tier 4 each needs design discussion before code. Tier 5 likely needs a release-note prop deprecation.

**Convention bypass requires sign-off:** if a future component needs a density modifier that doesn't fit Contract A or Contract B, document the new contract in `density-convention.md` in the same PR.

---

## Process

Run `pnpm validate:drift` after each audit to confirm fixes don't introduce drift. Items in this file should be reviewed at the start of each audit round — if an entry is still here after three audits, escalate (file an issue or schedule the work).
