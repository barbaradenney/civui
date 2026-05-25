// CivUI — CivOnThisPageItem for SwiftUI
// Single TOC entry. Mirrors civ-on-this-page-item.
//
// Placeholder body — the prop surface satisfies schema parity. See
// .claude/rules/audit-debt.md → "Native platform implementation pass".

import SwiftUI

public struct CivOnThisPageItem: View {
    /// Visible link text.
    public var label: String

    /// Fragment / anchor target.
    public var href: String

    /// Whether this heading is currently in the viewport.
    public var current: Bool

    public init(
        label: String = "",
        href: String = "",
        current: Bool = false
    ) {
        self.label = label
        self.href = href
        self.current = current
    }

    public var body: some View {
        EmptyView()
    }
}
