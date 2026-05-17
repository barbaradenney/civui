// CivUI — CivDisclosure for SwiftUI
// Inline expandable content (mirrors the web civ-disclosure component).
//
// Placeholder body — the prop surface satisfies schema parity. The
// implementation should wire SwiftUI's DisclosureGroup with the
// label affordance. See audit-debt.md for status.

import SwiftUI

/// Accessible inline disclosure widget for "Why we ask?" justifications
/// and other supplementary content.
public struct CivDisclosure: View {
    /// Trigger text displayed beside the caret.
    public var label: String

    /// Whether the disclosure is currently open.
    @Binding public var open: Bool

    /// Called when the open/closed state changes.
    public var onToggle: ((Bool) -> Void)?

    /// Called for analytics tracking.
    public var onAnalytics: ((String, [String: Any]?) -> Void)?

    public init(
        label: String = "",
        open: Binding<Bool> = .constant(false),
        onToggle: ((Bool) -> Void)? = nil,
        onAnalytics: ((String, [String: Any]?) -> Void)? = nil
    ) {
        self.label = label
        self._open = open
        self.onToggle = onToggle
        self.onAnalytics = onAnalytics
    }

    public var body: some View {
        EmptyView()
    }
}
