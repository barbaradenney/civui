// CivUI — CivBreadcrumbItem for SwiftUI
// Single crumb in a breadcrumb trail. Mirrors civ-breadcrumb-item.
//
// Placeholder body — the prop surface satisfies schema parity. The
// implementation should wire the platform-native equivalent. See
// .claude/rules/audit-debt.md → "Native platform implementation pass".

import SwiftUI

public struct CivBreadcrumbItem: View {
    /// label
    public var label: String

    /// href
    public var href: String

    /// current
    public var current: Bool

    /// Called for analytics tracking (parallels civ-analytics).
    public var onAnalytics: ((String, [String: Any]?) -> Void)?

    public init(
        label: String = "",
        href: String = "",
        current: Bool = false,
        onAnalytics: ((String, [String: Any]?) -> Void)? = nil
    ) {
        self.label = label
        self.href = href
        self.current = current
        self.onAnalytics = onAnalytics
    }

    public var body: some View {
        EmptyView()
    }
}
