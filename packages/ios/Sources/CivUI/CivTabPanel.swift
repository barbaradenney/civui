// CivUI — CivTabPanel for SwiftUI
// Body of a single tab. Mirrors civ-tab-panel.
//
// Placeholder body — the prop surface satisfies schema parity. The
// implementation should wire the platform-native equivalent. See
// .claude/rules/audit-debt.md → "Native platform implementation pass".

import SwiftUI

public struct CivTabPanel: View {
    /// value
    public var value: String

    /// Called for analytics tracking (parallels civ-analytics).
    public var onAnalytics: ((String, [String: Any]?) -> Void)?

    public init(
        value: String = "",
        onAnalytics: ((String, [String: Any]?) -> Void)? = nil
    ) {
        self.value = value
        self.onAnalytics = onAnalytics
    }

    public var body: some View {
        EmptyView()
    }
}
