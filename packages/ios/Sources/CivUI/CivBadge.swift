// CivUI — CivBadge for SwiftUI
// Accessible badge component for notifications and counts.

import SwiftUI

/// Accessible badge for government applications.
///
/// Renders a small notification indicator with optional count.
/// Mirrors the web `civ-badge` component.
///
/// Usage:
/// ```swift
/// CivBadge(label: "Notifications", count: 5)
/// ```
public struct CivBadge: View {
    // MARK: - Properties

    /// Badge text label.
    public var label: String

    /// Numeric count to display. When nil, no count is shown.
    public var count: Int?

    /// Maximum count to display before showing "max+".
    public var max: Int

    /// Whether to render as a small dot indicator instead of a count.
    public var dot: Bool

    /// Color variant (e.g., "neutral", "error", "success").
    public var variant: String

    /// Badge style (e.g., "default", "outline").
    public var badgeStyle: String

    /// Spacing variant.
    public var spacing: String

    /// Whether the badge overlays its parent content.
    public var overlay: Bool

    // MARK: - Internal State

    @Environment(\.colorScheme) private var colorScheme

    // MARK: - Initializer

    public init(
        label: String = "",
        count: Int? = nil,
        max: Int = 99,
        dot: Bool = false,
        variant: String = "neutral",
        badgeStyle: String = "default",
        spacing: String = "default",
        overlay: Bool = false
    ) {
        self.label = label
        self.count = count
        self.max = max
        self.dot = dot
        self.variant = variant
        self.badgeStyle = badgeStyle
        self.spacing = spacing
        self.overlay = overlay
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
struct CivBadge_Previews: PreviewProvider {
    static var previews: some View {
        VStack(spacing: 8) {
            CivBadge(label: "Notifications", count: 5)
            CivBadge(label: "Alert", dot: true, variant: "error")
        }.padding()
    }
}
#endif
