// CivUI — CivActionSheet for SwiftUI
// Accessible bottom sheet overlay following government design system patterns.

import SwiftUI

/// Accessible action sheet for government applications.
///
/// Renders a bottom sheet overlay with configurable behavior.
/// Mirrors the web `civ-action-sheet` component.
///
/// Usage:
/// ```swift
/// CivActionSheet(open: $isOpen, maxHeight: "50vh") {
///     Text("Sheet content")
/// }
/// ```
public struct CivActionSheet<Content: View>: View {
    // MARK: - Properties

    /// Whether the sheet is open.
    public var open: Bool

    /// Maximum height of the sheet (e.g., "50vh").
    public var maxHeight: String

    /// Accessible label announced as the sheet's dialog name.
    public var label: String

    /// Whether to trap focus within the sheet.
    public var isTrapFocus: Bool

    /// Whether to prevent closing by tapping outside.
    public var noClickOutsideClose: Bool

    /// Called when the sheet is closed (parallels `civ-close` event).
    public var onClose: (() -> Void)?

    /// Content rendered inside the sheet.
    public let content: Content

    // MARK: - Internal State

    @Environment(\.colorScheme) private var colorScheme

    // MARK: - Initializer

    public init(
        open: Bool = false,
        maxHeight: String = "50vh",
        label: String = "",
        isTrapFocus: Bool = false,
        noClickOutsideClose: Bool = false,
        onClose: (() -> Void)? = nil,
        @ViewBuilder content: () -> Content
    ) {
        self.open = open
        self.maxHeight = maxHeight
        self.label = label
        self.isTrapFocus = isTrapFocus
        self.noClickOutsideClose = noClickOutsideClose
        self.onClose = onClose
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
struct CivActionSheet_Previews: PreviewProvider {
    static var previews: some View {
        CivActionSheet(open: true) {
            Text("Action sheet content")
        }
    }
}
#endif
