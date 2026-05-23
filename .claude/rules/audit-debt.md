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

## Navigation components follow-ups

- **Surfaced:** Navigation components landing, 2026-05-18. Branch `claude/add-navigation-components-YikKk`.
- **What landed:** Three new navigation-component clusters in `@civui/actions` — `<civ-breadcrumb>` + `<civ-breadcrumb-item>` (anchor-based trail with CSS chevron separators and `aria-current="page"` on the final crumb), `<civ-nav>` + `<civ-nav-item>` (top-level horizontal site nav, stacks vertically at ≤480px, single-level only), `<civ-tabs>` + `<civ-tab>` + `<civ-tab-panel>` (full ARIA tabs pattern with roving tabindex, manual activation, arrow / Home / End keyboard navigation, and auto-wired `aria-controls` / `aria-labelledby`). Schemas, tests (33 new tests), Storybook stories, and Docusaurus pages all ship in the same change.
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

## Process

Run `pnpm validate:drift` after each audit to confirm fixes don't introduce drift. Items in this file should be reviewed at the start of each audit round — if an entry is still here after three audits, escalate (file an issue or schedule the work).
