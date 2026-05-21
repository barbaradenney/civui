// CivUI — CivTabs for SwiftUI
// ARIA tabs container. Mirrors civ-tabs.
//
// Placeholder body — the prop surface satisfies schema parity. The
// implementation should wire the platform-native equivalent. See
// .claude/rules/audit-debt.md → "Native platform implementation pass".

import SwiftUI

public struct CivTabs: View {
    /// label
    public var label: String

    /// value
    public var value: String

    /// Called on `civ-change`.
    public var onChange: (() -> Void)?

    /// Called for analytics tracking (parallels civ-analytics).
    public var onAnalytics: ((String, [String: Any]?) -> Void)?

    public init(
        label: String = "",
        value: String = "",
        onChange: (() -> Void)? = nil,
        onAnalytics: ((String, [String: Any]?) -> Void)? = nil
    ) {
        self.label = label
        self.value = value
        self.onChange = onChange
        self.onAnalytics = onAnalytics
    }

    public var body: some View {
        EmptyView()
    }
}
