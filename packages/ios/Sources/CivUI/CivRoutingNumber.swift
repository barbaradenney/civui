// CivUI — CivRoutingNumber for SwiftUI
// Accessible bank routing number input with 9-digit mask.
// Delegates to CivTextInput with routing number-specific configuration.

import SwiftUI

/// Accessible routing number input for government applications.
///
/// Wraps `CivTextInput` with a 9-digit mask pattern, numeric keyboard,
/// and appropriate labeling. Used for direct deposit bank routing numbers.
///
/// Usage:
/// ```swift
/// CivRoutingNumber(value: $routing)
/// CivRoutingNumber(label: "Bank routing number", value: $routing, isRequired: true)
/// ```
public struct CivRoutingNumber: View {
    // MARK: - Properties

    /// Visible label text (defaults to "Routing number").
    public let label: String

    /// Bound input value (stores raw 9-digit string).
    @Binding public var value: String

    /// Help text shown below the label.
    public var hint: String?

    /// Error message. When set, renders with VoiceOver announcement.
    public var error: String?

    /// Whether the field is required.
    public var isRequired: Bool

    /// Whether the field is disabled.
    public var isDisabled: Bool

    /// Whether the field is read-only.
    public var isReadonly: Bool

    /// Called on committed change / focus loss (parallels `civ-change` event).
    public var onChange: ((String) -> Void)?

    /// Called for analytics tracking (parallels `civ-analytics` event).
    public var onAnalytics: ((String, [String: Any]?) -> Void)?

    /// Optional form state for centralized validation.
    public var formState: CivFormState?

    /// Field name for form state registration.
    public var formName: String?

    /// Custom required message for form validation.
    public var requiredMessage: String?

    /// Custom validation function. Returns error string or nil.
    public var formValidate: (() -> String?)?

    /// Whether the field contains PII.
    public var isPii: Bool

    // MARK: - Initializer

    public init(
        label: String = "Routing number",
        value: Binding<String>,
        hint: String? = nil,
        error: String? = nil,
        isRequired: Bool = false,
        isDisabled: Bool = false,
        isReadonly: Bool = false,
        onChange: ((String) -> Void)? = nil,
        onAnalytics: ((String, [String: Any]?) -> Void)? = nil,
        formState: CivFormState? = nil,
        formName: String? = nil,
        requiredMessage: String? = nil,
        formValidate: (() -> String?)? = nil,
        isPii: Bool = false
    ) {
        self.label = label
        self._value = value
        self.hint = hint
        self.error = error
        self.isRequired = isRequired
        self.isDisabled = isDisabled
        self.isReadonly = isReadonly
        self.onChange = onChange
        self.onAnalytics = onAnalytics
        self.formState = formState
        self.formName = formName
        self.requiredMessage = requiredMessage
        self.formValidate = formValidate
        self.isPii = isPii
    }

    // MARK: - Body

    public var body: some View {
        CivTextInput(
            label: label,
            value: $value,
            hint: hint ?? "9 digits, found on your check",
            error: error,
            isRequired: isRequired,
            isDisabled: isDisabled,
            isReadonly: isReadonly,
            maxLength: 9,
            inputType: CivInputType.number,
            width: CivInputWidth.medium,
            maskPattern: "#########",
            formState: formState,
            formName: formName,
            requiredMessage: requiredMessage,
            formValidate: formValidate,
            isPii: isPii
        )
    }
}

// MARK: - Preview

#if DEBUG
struct CivRoutingNumber_Previews: PreviewProvider {
    struct PreviewWrapper: View {
        @State private var routing = ""

        var body: some View {
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    CivRoutingNumber(
                        value: $routing,
                        isRequired: true
                    )

                    CivRoutingNumber(
                        label: "Bank routing number",
                        value: .constant(""),
                        hint: "The first 9 digits on the bottom of your check"
                    )

                    CivRoutingNumber(
                        value: .constant(""),
                        error: "Enter a 9-digit routing number",
                        isRequired: true
                    )

                    CivRoutingNumber(
                        value: .constant("021000021"),
                        isReadonly: true
                    )

                    CivRoutingNumber(
                        value: .constant(""),
                        isDisabled: true
                    )
                }
                .padding()
            }
        }
    }

    static var previews: some View {
        PreviewWrapper()
            .previewDisplayName("Light")
        PreviewWrapper()
            .preferredColorScheme(.dark)
            .previewDisplayName("Dark")
    }
}
#endif
