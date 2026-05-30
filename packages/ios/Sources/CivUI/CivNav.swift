// CivUI — CivNav for SwiftUI
// Top-level horizontal site nav. Mirrors civ-nav.
//
// Placeholder body — the prop surface satisfies schema parity. The
// implementation should wire the platform-native equivalent. See
// .claude/rules/audit-debt.md → "Native platform implementation pass".

import SwiftUI

public struct CivNav: View {
    /// label
    public var label: String

    /// emphasis — `primary` (default) bold treatment, `secondary` quiet.
    public var emphasis: String

    /// Called for analytics tracking (parallels civ-analytics).
    public var onAnalytics: ((String, [String: Any]?) -> Void)?

    public init(
        label: String = "",
        emphasis: String = "primary",
        onAnalytics: ((String, [String: Any]?) -> Void)? = nil
    ) {
        self.label = label
        self.emphasis = emphasis
        self.onAnalytics = onAnalytics
    }

    public var body: some View {
        EmptyView()
    }
}
