// CivUI — CivItemizedItem for SwiftUI
// Single label + amount row inside a `civ-itemized-total`. Mirrors
// civ-itemized-item.
//
// Placeholder body — the prop surface satisfies schema parity. See
// .claude/rules/audit-debt.md → "Native platform implementation pass".

import SwiftUI

public struct CivItemizedItem: View {
    /// Row label (left side).
    public var label: String

    /// Numeric amount (right side). Formatted by the parent's currency / locale.
    public var amount: Double

    /// Escape hatch for non-numeric value text (e.g. `Pending`).
    public var valueLabel: String

    /// Optional secondary note rendered below the label.
    public var note: String

    /// Per-row tint. `''` | `positive` | `negative` | `neutral`.
    public var intent: String

    public init(
        label: String = "",
        amount: Double = 0,
        valueLabel: String = "",
        note: String = "",
        intent: String = ""
    ) {
        self.label = label
        self.amount = amount
        self.valueLabel = valueLabel
        self.note = note
        self.intent = intent
    }

    public var body: some View {
        EmptyView()
    }
}
