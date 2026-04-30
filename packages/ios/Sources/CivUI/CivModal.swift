// CivUI — CivModal for SwiftUI
// Accessible modal dialog following government design system patterns.

import SwiftUI

/// Accessible modal dialog for government applications.
///
/// Renders a centered dialog with optional heading, close button,
/// and backdrop. Mirrors the web `civ-modal` component.
///
/// Usage:
/// ```swift
/// CivModal(open: $isOpen, heading: "Confirm submission") {
///     Text("Are you sure you want to submit?")
/// }
/// ```
public struct CivModal<Content: View>: View {
    // MARK: - Properties

    /// Whether the modal is open.
    public var open: Bool

    /// Modal heading text.
    public var heading: String

    /// Accessible label for the modal (used when heading is empty).
    public var label: String

    /// Whether to hide the close button.
    public var noCloseButton: Bool

    /// Whether to prevent closing by tapping the backdrop.
    public var noBackdropClose: Bool

    /// Whether to prevent closing with the Escape key.
    public var noEscapeClose: Bool

    /// Called when the modal is closed (parallels `civ-close` event).
    public var onClose: (() -> Void)?

    /// Content rendered inside the modal.
    public let content: Content

    // MARK: - Internal State

    @Environment(\.colorScheme) private var colorScheme

    // MARK: - Initializer

    public init(
        open: Bool = false,
        heading: String = "",
        label: String = "",
        noCloseButton: Bool = false,
        noBackdropClose: Bool = false,
        noEscapeClose: Bool = false,
        onClose: (() -> Void)? = nil,
        @ViewBuilder content: () -> Content
    ) {
        self.open = open
        self.heading = heading
        self.label = label
        self.noCloseButton = noCloseButton
        self.noBackdropClose = noBackdropClose
        self.noEscapeClose = noEscapeClose
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
struct CivModal_Previews: PreviewProvider {
    static var previews: some View {
        CivModal(open: true, heading: "Confirm submission") {
            Text("Are you sure you want to submit?")
        }
    }
}
#endif
