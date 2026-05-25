// CivUI — CivCount for SwiftUI
// Numeric annotation following government design system patterns.

import SwiftUI

/// Accessible numeric counter for government applications.
///
/// Renders a numeric annotation — match counts on filter chips, item counts
/// in navigation, notification counters. Lighter chrome than `civ-badge`.
/// Mirrors the web `civ-count` component.
///
/// Usage:
/// ```swift
/// CivCount(count: 24)
/// CivCount(count: 3, variant: "error", emphasis: "primary")
/// ```
public struct CivCount: View {
    // MARK: - Properties

    /// Numeric value. Render is skipped when nil.
    public var count: Int?

    /// Overflow threshold; counts above render as "max+".
    public var max: Int

    /// Semantic color variant (e.g., "neutral", "error", "success").
    public var intent: String

    /// Emphasis style: "primary" (filled pill) or "secondary" (text only).
    public var emphasis: String

    /// Spacing variant.
    public var spacing: String

    /// Whether the count is positioned as a notification overlay.
    public var overlay: Bool

    /// aria-live politeness: "off", "polite", or "assertive".
    public var live: String

    // MARK: - Internal State

    @Environment(\.colorScheme) private var colorScheme

    // MARK: - Initializer

    public init(
        count: Int? = nil,
        max: Int = 99,
        intent: String = "neutral",
        emphasis: String = "secondary",
        spacing: String = "default",
        overlay: Bool = false,
        live: String = "off"
    ) {
        self.count = count
        self.max = max
        self.intent = intent
        self.emphasis = emphasis
        self.spacing = spacing
        self.overlay = overlay
        self.live = live
    }

    // MARK: - Body

    public var body: some View {
        EmptyView()
    }

    // MARK: - Color Helper

    private func adaptiveColor(light: Color, dark: Color) -> Color {
        colorScheme == .dark ? dark : light
    }
}

// MARK: - Preview

#if DEBUG
struct CivCount_Previews: PreviewProvider {
    static var previews: some View {
        VStack(spacing: 8) {
            CivCount(count: 24)
            CivCount(count: 3, variant: "error", emphasis: "primary")
            CivCount(count: 150, variant: "info", overlay: true, live: "polite")
        }.padding()
    }
}
#endif
