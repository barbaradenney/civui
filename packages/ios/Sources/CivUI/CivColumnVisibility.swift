// CivUI — CivColumnVisibility for SwiftUI
// Popover for toggling data-grid column visibility. Mirrors
// civ-column-visibility.
//
// Placeholder body — the prop surface satisfies schema parity. See
// .claude/rules/audit-debt.md → "Native platform implementation pass".

import SwiftUI

public struct CivColumnVisibility: View {
    /// Accessible label for the trigger button.
    public var label: String

    /// Minimum number of columns that must stay visible.
    public var minVisible: Int

    /// Popover alignment. `start` | `end`.
    public var align: String

    /// Whether the popover is currently open.
    public var open: Bool

    public init(
        label: String = "",
        minVisible: Int = 1,
        align: String = "end",
        open: Bool = false
    ) {
        self.label = label
        self.minVisible = minVisible
        self.align = align
        self.open = open
    }

    public var body: some View {
        EmptyView()
    }
}
