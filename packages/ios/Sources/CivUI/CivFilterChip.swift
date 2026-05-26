// CivUI — CivFilterChip for SwiftUI
// Accessible filter chip following government design system patterns.

import SwiftUI

/// Accessible filter chip for government applications.
///
/// A selectable chip for filtering content. Can be used standalone
/// or within a CivFilterChipGroup. Mirrors the web `civ-filter-chip` component.
///
/// Usage:
/// ```swift
/// CivFilterChip(label: "Active", value: "active", selected: true)
/// ```
public struct CivFilterChip: View {
    // MARK: - Properties

    /// Chip text.
    public var label: String

    /// Value associated with this chip.
    public var value: String

    /// Whether the chip is selected.
    public var selected: Bool

    /// Whether the chip is disabled.
    public var isDisabled: Bool

    /// Chip style variant (e.g., "default", "outline").
    public var emphasis: String

    /// ARIA role for the chip (e.g., "checkbox", "radio").
    public var variant: String

    /// Spacing variant.
    public var spacing: String

    /// Icon name rendered before the label text.
    public var iconStart: String

    /// Icon name rendered after the label text.
    public var iconEnd: String

    /// Optional count to display on the chip.
    public var count: Int?

    /// Called when selection state changes (parallels `civ-change` event).
    public var onChange: ((Bool, String) -> Void)?

    /// Called for analytics tracking (parallels `civ-analytics` event).
    public var onAnalytics: ((String, [String: Any]?) -> Void)?

    // MARK: - Internal State

    @Environment(\.colorScheme) private var colorScheme

    // MARK: - Initializer

    public init(
        label: String = "",
        value: String = "",
        selected: Bool = false,
        isDisabled: Bool = false,
        emphasis: String = "secondary",
        variant: String = "toggle",
        spacing: String = "default",
        iconStart: String = "",
        iconEnd: String = "",
        count: Int? = nil,
        onChange: ((Bool, String) -> Void)? = nil,
        onAnalytics: ((String, [String: Any]?) -> Void)? = nil
    ) {
        self.label = label
        self.value = value
        self.selected = selected
        self.isDisabled = isDisabled
        self.emphasis = emphasis
        self.variant = variant
        self.spacing = spacing
        self.iconStart = iconStart
        self.iconEnd = iconEnd
        self.count = count
        self.onChange = onChange
        self.onAnalytics = onAnalytics
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
struct CivFilterChip_Previews: PreviewProvider {
    static var previews: some View {
        HStack(spacing: 8) {
            CivFilterChip(label: "Active", value: "active", selected: true)
            CivFilterChip(label: "Pending", value: "pending")
            CivFilterChip(label: "Closed", value: "closed")
        }.padding()
    }
}
#endif
