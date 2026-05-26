// CivUI — CivSideNav for SwiftUI
// Vertical hierarchical left-rail navigation. Mirrors civ-side-nav.
//
// Placeholder body — the prop surface satisfies schema parity. See
// .claude/rules/audit-debt.md → "Native platform implementation pass".

import SwiftUI

public struct CivSideNav: View {
    /// Accessible label for the rail (announced as a `<nav>` landmark).
    public var label: String

    /// Tap-target density. `default` keeps the compact rail; `lg`
    /// raises every row to the WCAG 2.5.5 AAA 44pt floor.
    public var spacing: String

    /// Typographic weight. `secondary` keeps the quiet sub-nav
    /// treatment; `primary` swaps in bold body text to match civ-nav.
    public var emphasis: String

    public init(label: String = "", spacing: String = "default", emphasis: String = "secondary") {
        self.label = label
        self.spacing = spacing
        self.emphasis = emphasis
    }

    public var body: some View {
        EmptyView()
    }
}
