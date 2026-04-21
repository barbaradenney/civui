// CivUI — CivSkipLink for SwiftUI
// Accessible skip navigation link. Visually hidden until focused.
// Allows VoiceOver users to bypass navigation and jump to main content.

import SwiftUI

/// Accessible skip navigation link for government applications.
///
/// Renders an accessibility-first link that allows VoiceOver users
/// to skip navigation elements and jump directly to the main content.
/// On iOS, this is implemented as a hidden accessibility element that
/// VoiceOver users can activate to scroll to the target view.
///
/// Usage:
/// ```swift
/// CivSkipLink(label: "Skip to main content", targetId: "main-content")
/// ```
public struct CivSkipLink: View {
    // MARK: - Properties

    /// Link text announced by VoiceOver.
    public var label: String

    /// Target anchor identifier to scroll to.
    public var targetId: String

    /// Action to perform when activated (e.g., scroll to content).
    public var onActivate: (() -> Void)?

    // MARK: - Initializer

    public init(
        label: String = "Skip to main content",
        targetId: String = "main-content",
        onActivate: (() -> Void)? = nil
    ) {
        self.label = label
        self.targetId = targetId
        self.onActivate = onActivate
    }

    // MARK: - Body

    public var body: some View {
        Button(action: {
            onActivate?()
        }) {
            Text(label)
        }
        .frame(width: 0, height: 0)
        .clipped()
        .accessibilityLabel(label)
        .accessibilityAddTraits(.isLink)
        .accessibilityRemoveTraits(.isButton)
        .accessibilityIdentifier("civ-skip-link")
    }
}

// MARK: - Preview

#if DEBUG
struct CivSkipLink_Previews: PreviewProvider {
    static var previews: some View {
        VStack {
            CivSkipLink()
            Text("Main content area")
                .accessibilityIdentifier("main-content")
        }
    }
}
#endif
