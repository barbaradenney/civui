// CivUI — CivReadMore for SwiftUI
// Two-stage content disclosure (mirrors the web civ-read-more component).
//
// Placeholder body — the prop surface satisfies schema parity. The
// implementation should wire a VStack with the teaser always visible
// and the rest region show/hidden by an internal `@State` boolean.
// See audit-debt.md for status.

import SwiftUI

/// Accessible two-stage disclosure: a teaser paragraph stays visible
/// at all times; a "Read more" button reveals additional content.
public struct CivReadMore: View {
    /// Whether the rest region is currently visible.
    @Binding public var expanded: Bool

    /// Override the "Read more" trigger text.
    public var moreLabel: String

    /// Override the "Read less" trigger text.
    public var lessLabel: String

    /// Optional icon name shown before the label.
    public var icon: String

    /// Trigger size: "default" or "sm".
    public var size: String

    /// Called when the expanded state changes.
    public var onToggle: ((Bool) -> Void)?

    /// Called for analytics tracking.
    public var onAnalytics: ((String, [String: Any]?) -> Void)?

    public init(
        expanded: Binding<Bool> = .constant(false),
        moreLabel: String = "",
        lessLabel: String = "",
        icon: String = "",
        size: String = "default",
        onToggle: ((Bool) -> Void)? = nil,
        onAnalytics: ((String, [String: Any]?) -> Void)? = nil
    ) {
        self._expanded = expanded
        self.moreLabel = moreLabel
        self.lessLabel = lessLabel
        self.icon = icon
        self.size = size
        self.onToggle = onToggle
        self.onAnalytics = onAnalytics
    }

    public var body: some View {
        EmptyView()
    }
}
