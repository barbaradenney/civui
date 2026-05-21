// CivUI — CivMenuItem for SwiftUI
// Single entry in a civ-menu. Mirrors civ-menu-item.
//
// Placeholder body — the prop surface satisfies schema parity. The
// implementation should wire the platform-native equivalent. See
// .claude/rules/audit-debt.md → "Native platform implementation pass".

import SwiftUI

public struct CivMenuItem: View {
    /// label
    public var label: String

    /// disabled
    public var disabled: Bool

    /// destructive
    public var destructive: Bool

    /// href
    public var href: String

    /// value
    public var value: String

    /// icon
    public var icon: String

    /// Called for analytics tracking (parallels civ-analytics).
    public var onAnalytics: ((String, [String: Any]?) -> Void)?

    public init(
        label: String = "",
        disabled: Bool = false,
        destructive: Bool = false,
        href: String = "",
        value: String = "",
        icon: String = "",
        onAnalytics: ((String, [String: Any]?) -> Void)? = nil
    ) {
        self.label = label
        self.disabled = disabled
        self.destructive = destructive
        self.href = href
        self.value = value
        self.icon = icon
        self.onAnalytics = onAnalytics
    }

    public var body: some View {
        EmptyView()
    }
}
