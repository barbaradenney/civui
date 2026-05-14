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

## civ-link variant dedup vs civ-button[href] polymorphism

- **Surfaced:** 2026-05-14 alongside the polymorphic-href landing on civ-button + civ-action-button.
- **What overlaps now:** `civ-button[href] variant="primary"` and `civ-link variant="primary"` produce visually similar filled-button-shaped `<a>` affordances. Same for `secondary`. The `civ-link variant="tertiary"` (plain underlined text) and `variant="back"` (chevron-left navigation) have no button equivalent — those stay unique.
- **Why deferred:** The duplication is narrow (1–2 variants) and we don't yet have evidence about which API consumers reach for in real apps. Removing `civ-link variant="primary|secondary"` is a breaking change that cascades through schema + iOS + Android + Drupal SDC + 50+ doc pages and any consumer code. Better to let the polymorphism bake and watch real usage.
- **What to watch for:** During the next two audit rounds, grep `civ-link variant="primary"` and `civ-link variant="secondary"` usage in the docs site and in any tracked consumer apps. If both stay at zero or near-zero adoption after the polymorphism is GA, schedule the dedup. If consumers actively pick civ-link for these, keep both.
- **Adjacent decision:** Package merge (`@civui/actions` + `@civui/navigation` → one package) is a separate question. Cheap to do (mostly imports), but doesn't pay off until we also dedup the components — otherwise we just move the same surface under a new name. Bundle both into one breaking change when we land the dedup.

---

## Process

Run `pnpm validate:drift` after each audit to confirm fixes don't introduce drift. Items in this file should be reviewed at the start of each audit round — if an entry is still here after three audits, escalate (file an issue or schedule the work).
