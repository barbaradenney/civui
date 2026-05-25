// CivUI — CivSkeleton for SwiftUI
// Loading-state placeholder shape. Mirrors civ-skeleton.
//
// Placeholder body — see .claude/rules/audit-debt.md → "Native platform implementation pass".

import SwiftUI

public struct CivSkeleton: View {
    /// Shape preset. `text` | `circle` | `rect`.
    public var shape: String

    /// Explicit width override (`100%`, `200px`, etc.).
    public var width: String

    /// Number of stacked lines (only meaningful for `text` shape).
    public var lines: Int

    public init(
        shape: String = "text",
        width: String = "",
        lines: Int = 1
    ) {
        self.shape = shape
        self.width = width
        self.lines = lines
    }

    public var body: some View {
        EmptyView()
    }
}
