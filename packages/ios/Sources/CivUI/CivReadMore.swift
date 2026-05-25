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
    @Binding public var open: Bool

    /// Override the "Read more" trigger text.
    public var moreLabel: String

    /// Override the "Read less" trigger text.
    public var lessLabel: String

    /// Optional icon name shown before the label.
    public var icon: String

    /// Trigger size: "default" or "sm". DEPRECATED — use `spacing` instead.
    public var size: String

    /// Trigger padding density: "default" or "sm".
    public var spacing: String

    /// Render inline so the trigger flows as the last words of the teaser.
    public var isInline: Bool

    /// Opt out of the default fade-and-overlay treatment (block mode only).
    /// When true, the trigger sits below the teaser as a plain button instead
    /// of floating over a gradient at the bottom of the text.
    public var isNoFadeTrigger: Bool

    /// Called when the open state changes.
    public var onToggle: ((Bool) -> Void)?

    /// Called for analytics tracking.
    public var onAnalytics: ((String, [String: Any]?) -> Void)?

    public init(
        open: Binding<Bool> = .constant(false),
        moreLabel: String = "",
        lessLabel: String = "",
        icon: String = "",
        size: String = "default",
        spacing: String = "default",
        isInline: Bool = false,
        isNoFadeTrigger: Bool = false,
        onToggle: ((Bool) -> Void)? = nil,
        onAnalytics: ((String, [String: Any]?) -> Void)? = nil
    ) {
        self._expanded = open
        self.moreLabel = moreLabel
        self.lessLabel = lessLabel
        self.icon = icon
        self.size = size
        self.spacing = spacing
        self.isInline = isInline
        self.isNoFadeTrigger = isNoFadeTrigger
        self.onToggle = onToggle
        self.onAnalytics = onAnalytics
    }

    public var body: some View {
        EmptyView()
    }
}
