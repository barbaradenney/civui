// CivUI — CivConditional for SwiftUI
// Simple show/hide container based on a boolean binding.
// The parent manages visibility logic (SwiftUI cannot listen for arbitrary
// field changes like the web component does with selectors).

import SwiftUI

/// Conditional visibility container for government applications.
///
/// Shows or hides its content based on a boolean binding. On native platforms
/// this is simpler than the web counterpart — the parent owns the visibility
/// state and passes it in directly.
///
/// Usage:
/// ```swift
/// @State private var hasMailingAddress = false
///
/// CivToggle(label: "Different mailing address?", checked: $hasMailingAddress)
///
/// CivConditional(isVisible: $hasMailingAddress) {
///     CivTextInput(label: "Mailing address", value: $mailingAddress)
/// }
/// ```
public struct CivConditional<Content: View>: View {
    // MARK: - Properties

    /// Whether the content is visible.
    @Binding public var isVisible: Bool

    /// Content rendered when visible.
    public let content: Content

    // MARK: - Initializer

    public init(
        isVisible: Binding<Bool>,
        @ViewBuilder content: () -> Content
    ) {
        self._isVisible = isVisible
        self.content = content()
    }

    // MARK: - Body

    public var body: some View {
        if isVisible {
            content
                .transition(.opacity.combined(with: .move(edge: .top)))
                .animation(.easeInOut(duration: CivTokens.Motion.Duration.normal), value: isVisible)
        }
    }
}

// MARK: - Preview

#if DEBUG
struct CivConditional_Previews: PreviewProvider {
    struct PreviewWrapper: View {
        @State private var showAddress = false
        @State private var address = ""

        var body: some View {
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    CivToggle(
                        label: "Different mailing address?",
                        checked: $showAddress
                    )

                    CivConditional(isVisible: $showAddress) {
                        CivTextInput(
                            label: "Mailing address",
                            value: $address,
                            isRequired: true
                        )
                    }
                }
                .padding()
            }
        }
    }

    static var previews: some View {
        PreviewWrapper()
    }
}
#endif
