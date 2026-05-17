# CivUI Audit Debt

Items surfaced during component audits that were deliberately deferred — too large, too cross-cutting, or blocked on platform/design-team decisions to fix in the same pass. Each entry includes the audit date, the scope (file + LOC if relevant), and a one-sentence rationale for the deferral.

When you finish an audit, the audit skill writes new findings here (see `.claude/skills/audit/SKILL.md` — "Deferred items section"). When an item is fixed, remove its entry along with the commit. Don't let entries linger silently — review this file at the start of each audit round.

---

## Native platform implementation pass (iOS + Android)

- **Surfaced:** Overlays + Compound audits, 2026-05-11. Scope corrected 2026-05-12.
- **Scale:** Larger than originally reported. **15 iOS components** return `EmptyView()` today, not the 4 the original audit-debt entry implied. Android stubs follow the same pattern (no real Compose body).
- **Stubbed iOS components** (those whose `public var body: some View` is `EmptyView()`):
  - Overlays: `CivModal`, `CivActionSheet`
  - Actions: `CivActionLink` (has `// TODO`)
  - Feedback: `CivBadge`, `CivCount`
  - Inputs: `CivCountry`, `CivDateRangePicker`
  - Filter: `CivFilterChip`, `CivFilterChipGroup`, `CivFilterableList` (has `// TODO`)
  - Layout: `CivImagePreview` (has `// TODO`), `CivInputGroup`
  - Compound: `CivPartnershipHistory`, `CivRelationship`, `CivServiceHistory`
- **State:** Each declares the schema's prop surface (so `schema-parity` is satisfied), but renders no actual native UI. Android equivalents render only `Column { ... }` placeholders.
- **Why deferred:** This is a real native-implementation pass, not a quick port. SwiftUI/Compose work without device verification is risky — modal/sheet presentation in particular has platform-specific quirks (focus trap, dismiss gestures, scrim, keyboard insets) that LLMs cannot test blind. The schema-driven prop surface keeps the parity contract stable; UI implementation should be scheduled as dedicated work with someone who can run the simulators.
- **What to watch for in the meantime:** When adding new props to a covered component, add them to the iOS/Android stubs too — schema parity requires it. Don't try to "fix" the empty bodies one component at a time without device testing.

---

## Admin data-grid follow-ups

- **Surfaced:** Admin data-grid landing, 2026-05-17. Branch `claude/admin-data-grid-component-Jg8Uk`.
- **What landed:** Three new web components — `<civ-data-grid>` (semantic table, sort, selection, row-action menus, responsive stacked / scroll, empty/loading/error states), `<civ-pagination>` (USWDS-style), `<civ-menu>` + `<civ-menu-item>` (anchored kebab/overflow menu). Schemas, tests (94 new tests in total), Storybook stories, and Docusaurus pages all ship in the same change.
- **Explicitly out of v1 scope** (confirmed with user before implementation):
  1. **Inline editing.** Cell-level click-to-edit + validation flow. The grid currently renders read-only cells; a `column.editable` flag plus per-cell input swap is a follow-up. ColumnDef and RowDef are already shaped to accept this without breaking changes.
  2. **Nested / expandable rows.** Expand row → reveal child `<civ-data-grid>` or detail slot. Needs an `expandable`/`expanded` row flag and a child-row template slot. Currently not implemented.
- **Native + Drupal stubs (parity coverage) deferred.** `civ-menu`, `civ-menu-item`, `civ-pagination`, and `civ-data-grid` schemas exist, validate cleanly, and produce documented Props/Events partials, but they are NOT registered in `tools/schema-parity.ts` `COVERED_COMPONENTS`. To register them, add: iOS Swift stubs (`packages/ios/Sources/CivUI/Civ{Menu,MenuItem,Pagination,DataGrid}.swift`), Android Kotlin stubs (`packages/android/src/main/kotlin/gov/civui/components/Civ{Menu,MenuItem,Pagination,DataGrid}.kt`), and Drupal SDC YAMLs (`packages/drupal/civui/components/{menu,menu-item,pagination,data-grid}/{name}.component.yml`). Pattern: same shape as `civ-action-sheet` for menu, `civ-card` for data-grid. After registering, `pnpm parity:schema` will enforce prop surface across all platforms going forward.
- **Why deferred:** Same rationale as the existing native-stubs entry — modal/menu presentation has platform quirks that need device verification, and the data-grid is a meaty Swift / Compose implementation that shouldn't be written blind. Schemas being in place keeps the contract stable for whoever picks this up.
- **Architectural note:** `@civui/layout` now declares `@civui/overlays` as a workspace dependency so the data-grid can compose `civ-menu` for row-action menus. The CLAUDE.md "Build order" line is now approximate — turbo derives actual order from package.json. Update the docs sentence if it confuses anyone.

---

## Process

Run `pnpm validate:drift` after each audit to confirm fixes don't introduce drift. Items in this file should be reviewed at the start of each audit round — if an entry is still here after three audits, escalate (file an issue or schedule the work).
