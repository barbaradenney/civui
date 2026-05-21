// CivUI — CivTab for SwiftUI
// Single tab in an ARIA tabs widget. Mirrors civ-tab.
//
// Placeholder body — the prop surface satisfies schema parity. The
// implementation should wire the platform-native equivalent. See
// .claude/rules/audit-debt.md → "Native platform implementation pass".

import SwiftUI

public struct CivTab: View {
    /// value
    public var value: String

    /// label
    public var label: String

    /// selected
    public var selected: Bool

    /// disabled
    public var disabled: Bool

    /// Called on `civ-tab-select`.
    public var onTabSelect: (() -> Void)?

    /// Called for analytics tracking (parallels civ-analytics).
    public var onAnalytics: ((String, [String: Any]?) -> Void)?

    public init(
        value: String = "",
        label: String = "",
        selected: Bool = false,
        disabled: Bool = false,
        onTabSelect: (() -> Void)? = nil,
        onAnalytics: ((String, [String: Any]?) -> Void)? = nil
    ) {
        self.value = value
        self.label = label
        self.selected = selected
        self.disabled = disabled
        self.onTabSelect = onTabSelect
        self.onAnalytics = onAnalytics
    }

    public var body: some View {
        EmptyView()
    }
}
