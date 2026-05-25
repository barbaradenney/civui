// CivUI — CivSideNav for SwiftUI
// Vertical hierarchical left-rail navigation. Mirrors civ-side-nav.
//
// Placeholder body — the prop surface satisfies schema parity. See
// .claude/rules/audit-debt.md → "Native platform implementation pass".

import SwiftUI

public struct CivSideNav: View {
    /// Accessible label for the rail (announced as a `<nav>` landmark).
    public var label: String

    public init(label: String = "") {
        self.label = label
    }

    public var body: some View {
        EmptyView()
    }
}
