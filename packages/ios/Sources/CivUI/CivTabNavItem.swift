// CivUI — CivTabNavItem for SwiftUI
// Single item in a tab-nav. Mirrors civ-tab-nav-item.
//
// Placeholder body — the prop surface satisfies schema parity. The
// implementation should wire the platform-native equivalent. See
// .claude/rules/audit-debt.md → "Native platform implementation pass".

import SwiftUI

public struct CivTabNavItem: View {
    /// label
    public var label: String

    /// href
    public var href: String

    /// current
    public var current: Bool

    /// disabled
    public var disabled: Bool

    /// Called for analytics tracking (parallels civ-analytics).
    public var onAnalytics: ((String, [String: Any]?) -> Void)?

    public init(
        label: String = "",
        href: String = "",
        current: Bool = false,
        disabled: Bool = false,
        onAnalytics: ((String, [String: Any]?) -> Void)? = nil
    ) {
        self.label = label
        self.href = href
        self.current = current
        self.disabled = disabled
        self.onAnalytics = onAnalytics
    }

    public var body: some View {
        EmptyView()
    }
}
