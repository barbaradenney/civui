// CivUI — CivDrawer for SwiftUI
// Side-anchored slide-in dialog. Schema parity stub — native body
// is intentionally EmptyView() until the iOS implementation pass.

import SwiftUI

/// Side-anchored full-height drawer for government applications.
///
/// Mirrors the web `civ-drawer` component. Slides in from the leading
/// (`start`) or trailing (`end`) edge of the viewport. Used for
/// navigation menus, settings panels, and secondary content.
///
/// Usage:
/// ```swift
/// CivDrawer(open: $isOpen, position: "start", label: "Main menu") {
///     NavigationLinks()
/// }
/// ```
public struct CivDrawer<Content: View>: View {
    // MARK: - Properties

    /// Whether the drawer is open.
    public var open: Bool

    /// Which viewport edge the drawer slides in from. `start` (leading)
    /// or `end` (trailing). Logical — auto-mirrors in RTL.
    public var position: String

    /// Drawer width as a CSS length string. Native platforms convert
    /// to a CGFloat in the implementation pass; the prop is carried
    /// only to satisfy the schema-parity contract today.
    public var width: String

    /// Drawer heading text.
    public var heading: String

    /// Accessible label for the drawer (used when heading is empty).
    public var label: String

    /// Whether to hide the close button.
    public var noCloseButton: Bool

    /// Whether to prevent closing by tapping the backdrop.
    public var noBackdropClose: Bool

    /// Whether to prevent closing with the Escape key.
    public var noEscapeClose: Bool

    /// When true, header scrolls with the body instead of sticking to the top.
    public var noStickyHeader: Bool

    /// When true, footer scrolls with the body instead of sticking to the bottom.
    public var noStickyFooter: Bool

    /// Called when the drawer is closed (parallels `civ-close` event).
    public var onClose: (() -> Void)?

    /// Content rendered inside the drawer.
    public let content: Content

    // MARK: - Internal State

    @Environment(\.colorScheme) private var colorScheme

    // MARK: - Initializer

    public init(
        open: Bool = false,
        position: String = "start",
        width: String = "min(320px, 90vw)",
        heading: String = "",
        label: String = "",
        noCloseButton: Bool = false,
        noBackdropClose: Bool = false,
        noEscapeClose: Bool = false,
        noStickyHeader: Bool = false,
        noStickyFooter: Bool = false,
        onClose: (() -> Void)? = nil,
        @ViewBuilder content: () -> Content
    ) {
        self.open = open
        self.position = position
        self.width = width
        self.heading = heading
        self.label = label
        self.noCloseButton = noCloseButton
        self.noBackdropClose = noBackdropClose
        self.noEscapeClose = noEscapeClose
        self.noStickyHeader = noStickyHeader
        self.noStickyFooter = noStickyFooter
        self.onClose = onClose
        self.content = content()
    }

    // MARK: - Body

    public var body: some View {
        EmptyView()
    }
}

// MARK: - Preview

#if DEBUG
struct CivDrawer_Previews: PreviewProvider {
    static var previews: some View {
        CivDrawer(open: true, position: "start", heading: "Filters") {
            Text("Drawer content")
        }
    }
}
#endif
