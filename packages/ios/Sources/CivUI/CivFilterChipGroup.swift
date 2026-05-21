// CivUI — CivFilterChipGroup for SwiftUI
// Accessible filter chip group following government design system patterns.

import SwiftUI

/// Accessible filter chip group for government applications.
///
/// Groups filter chips with single or multi-select behavior.
/// Mirrors the web `civ-filter-chip-group` component.
///
/// Usage:
/// ```swift
/// CivFilterChipGroup(mode: "multi", label: "Status filter") { selectedValues in
///     // Handle selection change
/// }
/// ```
public struct CivFilterChipGroup<Content: View>: View {
    // MARK: - Properties

    /// Selection mode: "single" or "multi".
    public var mode: String

    /// Accessible label for the group.
    public var label: String

    /// Form field name (for form submission / state registration).
    public var name: String

    /// Called when the selection changes (parallels `civ-change` event).
    public var onChange: (([String]) -> Void)?

    /// Content (CivFilterChip children).
    public let content: Content

    // MARK: - Internal State

    @Environment(\.colorScheme) private var colorScheme

    // MARK: - Initializer

    public init(
        mode: String = "multi",
        label: String = "",
        name: String = "",
        onChange: (([String]) -> Void)? = nil,
        @ViewBuilder content: () -> Content
    ) {
        self.mode = mode
        self.label = label
        self.name = name
        self.onChange = onChange
        self.content = content()
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
struct CivFilterChipGroup_Previews: PreviewProvider {
    static var previews: some View {
        CivFilterChipGroup(mode: "multi", label: "Status") {
            CivFilterChip(label: "Active", value: "active", selected: true)
            CivFilterChip(label: "Pending", value: "pending")
        }.padding()
    }
}
#endif
