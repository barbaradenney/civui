// CivUI — CivMenu for SwiftUI
// Anchored kebab / overflow menu. Mirrors civ-menu.
//
// Placeholder body — the prop surface satisfies schema parity. The
// implementation should wire the platform-native equivalent. See
// .claude/rules/audit-debt.md → "Native platform implementation pass".

import SwiftUI

public struct CivMenu: View {
    /// open
    public var open: Bool

    /// label
    public var label: String

    /// align
    public var align: String

    /// Called on `civ-open`.
    public var onMenuOpen: (() -> Void)?

    /// Called on `civ-close`.
    public var onMenuClose: (() -> Void)?

    /// Called on `civ-select`.
    public var onMenuSelect: (() -> Void)?

    /// Called for analytics tracking (parallels civ-analytics).
    public var onAnalytics: ((String, [String: Any]?) -> Void)?

    public init(
        open: Bool = false,
        label: String = "",
        align: String = "end",
        onMenuOpen: (() -> Void)? = nil,
        onMenuClose: (() -> Void)? = nil,
        onMenuSelect: (() -> Void)? = nil,
        onAnalytics: ((String, [String: Any]?) -> Void)? = nil
    ) {
        self.open = open
        self.label = label
        self.align = align
        self.onMenuOpen = onMenuOpen
        self.onMenuClose = onMenuClose
        self.onMenuSelect = onMenuSelect
        self.onAnalytics = onAnalytics
    }

    public var body: some View {
        EmptyView()
    }
}
