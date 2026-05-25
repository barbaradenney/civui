// CivUI — CivMetricGroup for SwiftUI
// Responsive grid wrapper for `civ-metric-tile` children. Mirrors
// civ-metric-group.
//
// Placeholder body — the prop surface satisfies schema parity. The
// SwiftUI implementation should use LazyVGrid with adaptive size
// classes (1 / 2 / `columns` per breakpoint). See
// .claude/rules/audit-debt.md → "Native platform implementation pass".

import SwiftUI

public struct CivMetricGroup: View {
    /// Maximum number of columns on desktop breakpoints.
    public var columns: Int

    public init(columns: Int = 4) {
        self.columns = columns
    }

    public var body: some View {
        EmptyView()
    }
}
