// CivUI — CivBulkActions for SwiftUI
// "N items selected" bar with action affordances. Mirrors civ-bulk-actions.
//
// Placeholder body — the prop surface satisfies schema parity. See
// .claude/rules/audit-debt.md → "Native platform implementation pass".

import SwiftUI

public struct CivBulkActions: View {
    /// Number of currently-selected items.
    public var count: Int

    /// Singular item label (e.g. `row`).
    public var itemName: String

    /// Plural item label (e.g. `rows`).
    public var itemNamePlural: String

    /// Label for the clear-selection button.
    public var clearLabel: String

    /// Hide the clear-selection affordance entirely.
    public var hideClear: Bool

    public init(
        count: Int = 0,
        itemName: String = "",
        itemNamePlural: String = "",
        clearLabel: String = "",
        hideClear: Bool = false
    ) {
        self.count = count
        self.itemName = itemName
        self.itemNamePlural = itemNamePlural
        self.clearLabel = clearLabel
        self.hideClear = hideClear
    }

    public var body: some View {
        EmptyView()
    }
}
