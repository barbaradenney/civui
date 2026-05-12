# CivUI Audit Debt

Items surfaced during component audits that were deliberately deferred — too large, too cross-cutting, or blocked on platform/design-team decisions to fix in the same pass. Each entry includes the audit date, the scope (file + LOC if relevant), and a one-sentence rationale for the deferral.

When you finish an audit, the audit skill writes new findings here (see `.claude/skills/audit/SKILL.md` — "Deferred items section"). When an item is fixed, remove its entry along with the commit. Don't let entries linger silently — review this file at the start of each audit round.

---

## Native platform implementation

### `CivModal` / `CivActionSheet` (iOS, Android)
- **Surfaced:** Overlays audit, 2026-05-11.
- **Files:** `packages/ios/Sources/CivUI/CivModal.swift`, `packages/ios/Sources/CivUI/CivActionSheet.swift`, `packages/android/src/main/kotlin/gov/civui/components/CivModal.kt`, `packages/android/src/main/kotlin/gov/civui/components/CivActionSheet.kt`.
- **State:** iOS bodies return `EmptyView()`; Android bodies render only their child `content()` in a `Column` with no sheet/dialog presentation. The prop surface satisfies schema-parity, so parity passes — but there's no actual modal/sheet UI.
- **Why deferred:** Implementing native presentations (SwiftUI `.sheet` / `.confirmationDialog`, Compose `ModalBottomSheet` / `Dialog`) is a platform-implementation pass, not a parity correction.

### Compound-component Android stubs
- **Surfaced:** Compound audit, 2026-05-11.
- **Files:** `packages/android/src/main/kotlin/gov/civui/components/CivPartnershipHistory.kt` (41 LOC), `CivRelationship.kt` (43 LOC), `CivServiceHistory.kt` (33 LOC).
- **State:** Each declares the schema's prop surface but renders only `Column { if (open) content() }`. No real Compose UI.
- **Why deferred:** iOS counterparts are 150–500 LOC of working SwiftUI; Android implementation is a separate platform work item.

---

## Web-side technical debt

### `civ-repeater` is the largest fragile surface in form-patterns
- **Surfaced:** Form-patterns audit, 2026-05-12.
- **File:** `packages/form-patterns/src/repeater/civ-repeater.ts` (567 LOC).
- **State:** Builds rows via imperative `document.createElement` + manual `addEventListener` attachment for edit/remove buttons (rather than Lit templates). Listener cleanup relies on the buttons being GC'd with their parent row, plus one `AbortController` for the cloned form-step listener.
- **Why deferred:** Refactoring to a Lit-template-driven row model is a multi-day rewrite; the current code passes `lint:event-listener-leak` and works under the existing 470-test suite, so risk of regression is real.
- **What to watch for in the meantime:** Any new dynamically-added listener on a repeater row needs its own cleanup (signal-based or row-removal-based). Don't accept PRs that `addEventListener` on a child created outside a Lit template without an explicit teardown path.

### `civ-fieldset` ↔ `civ-form-fieldset` near-duplication
- **Surfaced:** Form-patterns audit, 2026-05-12.
- **Files:** `packages/form-patterns/src/fieldset/civ-fieldset.ts` (74 LOC), `packages/core/src/form-field/civ-form-fieldset.ts` (141 LOC).
- **State:** Both render `<fieldset>` + legend + hint + error. `civ-form-fieldset` adds `tightHint`, `requiredMessage`, and child `civ-error-change` event absorption. The differences are real but small.
- **Resolution so far:** Documented when-to-use-which in `apps/docs/docs/components/form/fieldset.mdx`. Consolidation deferred.
- **Why deferred:** Both are deliberately out-of-scope for cross-platform parity (CLAUDE.md: "Out of scope — web-specific layout wrappers"). Merging is a breaking change for consumers using `<civ-fieldset>` and the differences may be load-bearing for some compound forms. Decide consolidation strategy before changing.

---

## Process

Run `pnpm validate:drift` after each audit to confirm fixes don't introduce drift. Items in this file should be reviewed at the start of each audit round — if an entry is still here after three audits, escalate (file an issue or schedule the work).
