// CivUI — CivSideNavItem for SwiftUI
// Single rail entry with optional nested sub-items. Mirrors civ-side-nav-item.
//
// Placeholder body — the prop surface satisfies schema parity. See
// .claude/rules/audit-debt.md → "Native platform implementation pass".

import SwiftUI

public struct CivSideNavItem: View {
    /// Visible link text.
    public var label: String

    /// Navigation target.
    public var href: String

    /// Mark this item as the currently selected page.
    public var current: Bool

    /// Disables interaction; rendered with reduced opacity.
    public var disabled: Bool

    /// Whether the nested sub-item group (if any) is expanded.
    public var open: Bool

    public init(
        label: String = "",
        href: String = "",
        current: Bool = false,
        disabled: Bool = false,
        open: Bool = false
    ) {
        self.label = label
        self.href = href
        self.current = current
        self.disabled = disabled
        self.open = open
    }

    public var body: some View {
        EmptyView()
    }
}
