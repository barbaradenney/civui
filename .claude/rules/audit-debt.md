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

## Process

Run `pnpm validate:drift` after each audit to confirm fixes don't introduce drift. Items in this file should be reviewed at the start of each audit round — if an entry is still here after three audits, escalate (file an issue or schedule the work).
