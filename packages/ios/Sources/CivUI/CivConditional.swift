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

    /// Selector string for the controlling field (web parity).
    public var when: String

    /// Show content when the controlling field equals this value.
    public var equals: String

    /// Show content when the controlling field does not equal this value.
    public var notEquals: String

    /// Show content when the controlling field includes this value.
    public var includes: String

    /// Show content when the controlling field has any value.
    public var hasValue: Bool

    /// Show content when the controlling field matches this regex pattern.
    public var pattern: String

    /// Content rendered when visible.
    public let content: Content

    // MARK: - Initializer

    public init(
        isVisible: Binding<Bool>,
        when: String = "",
        equals: String = "",
        notEquals: String = "",
        includes: String = "",
        hasValue: Bool = false,
        pattern: String = "",
        @ViewBuilder content: () -> Content
    ) {
        self._isVisible = isVisible
        self.when = when
        self.equals = equals
        self.notEquals = notEquals
        self.includes = includes
        self.hasValue = hasValue
        self.pattern = pattern
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
