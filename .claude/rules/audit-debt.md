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

## Confirmation panel + timeline follow-ups

- **Surfaced:** Form-submission components landing, 2026-05-24. Branch `claude/form-submission-components-9zmdH`. Renamed `civ-activity-timeline` → `civ-timeline` and `civ-activity-item` → `civ-timeline-item` after landing so the component covers a broader set of "dated events, in order" use cases (audit logs, version histories, project milestones, document workflows).
- **What landed:** Three new web components — `<civ-confirmation-panel>` (post-submission success surface in `@civui/form-patterns`; USWDS-aligned left-border success header, optional reference-number summary box, slot-based body / pending-reference / next-steps / actions, auto-focuses heading + relies on `role="status"` for SR announcement on mount) and `<civ-timeline>` + `<civ-timeline-item>` (dated event list in `@civui/feedback`; `<ol role="list">` container, intent-colored rail dots with default semantic icons, `<time datetime>`-wrapped timestamps in relative / absolute / both formats via `Intl.RelativeTimeFormat`). Schemas (3 new), tests, Storybook stories, CSS, and Docusaurus pages all ship in the same change. `civ-timeline-item` lives on the timeline page via `HOST_PAGE_OVERRIDES`.
- **Explicitly out of v1 scope** (confirmed with user before implementation):
  1. **Confirmation-panel visual variants.** Only the success treatment is shipped. `info` / `warning` variants for partial submissions or "received but not yet validated" responses are speculative; add when a real case lands.
  2. **Auto-formatting of the reference number.** The `reference` prop is passed through verbatim. No hyphen insertion, no monospace forcing, no copy-to-clipboard button. Consumers wanting "Copy reference" can compose `<civ-confirm-button>` in the actions slot.
  3. **Timeline `reversed` prop / `compact` mode.** Items render in source order — consumers reverse the array themselves for newest-first audit logs. A `compact` density is not implemented; add when a dashboard placement needs it.
  4. **Clickable timeline items.** Items are display-only. Consumers needing per-item drill-down render a `<button>` or `<civ-link>` inside the item's body slot.
  5. **MutationObserver on the timeline.** Items added after `firstUpdated` are picked up by Lit's normal child capture flow, but dynamic `${items.map(...)}` patterns inside the timeline hit the known LightDomSlotMixin issue (see common-traps.md). Static authoring or wrapping the map in a static container is the documented workaround.
- **Native + Drupal stubs (parity coverage) deferred.** Schemas exist for `civ-confirmation-panel`, `civ-timeline`, and `civ-timeline-item` and they validate cleanly + produce Props/Events partials, but none are registered in `tools/schema-parity.ts` `COVERED_COMPONENTS`. To register: add iOS Swift stubs (`packages/ios/Sources/CivUI/Civ{ConfirmationPanel,Timeline,TimelineItem}.swift`), Android Kotlin stubs (`packages/android/src/main/kotlin/gov/civui/components/Civ{ConfirmationPanel,Timeline,TimelineItem}.kt`), and Drupal SDC YAMLs (`packages/drupal/civui/components/{confirmation-panel,timeline,timeline-item}/{name}.component.yml`). Pattern: shape `civ-confirmation-panel` after `civ-section-intro` (slot-projecting container with a heading + body composition); shape `civ-timeline` after `civ-list` (parent container, slot-projects children); shape `civ-timeline-item` after `civ-list-item` (per-row host with leading `aria-hidden` chrome + trailing content stack).
- **Why deferred:** Same rationale as the existing native-stubs entry — auto-focus on mount, `Intl.RelativeTimeFormat`, and timeline rail rendering have platform quirks (SwiftUI `accessibilityFocus`, Compose `Modifier.focusable` + LiveRegion, native relative-time formatters per OS) that need device verification. Schemas being in place keeps the contract stable for whoever picks this up.

---

## Process

Run `pnpm validate:drift` after each audit to confirm fixes don't introduce drift. Items in this file should be reviewed at the start of each audit round — if an entry is still here after three audits, escalate (file an issue or schedule the work).
