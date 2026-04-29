// CivUI — CivPhone for SwiftUI
// Accessible phone number input with domestic and international modes.
// Delegates to CivTextInput with phone-specific mask and keyboard.

import SwiftUI

/// Accessible phone number input for government applications.
///
/// Wraps `CivTextInput` with phone mask and telephone keyboard.
/// Supports domestic (US format with mask) and international (free-form) modes.
///
/// Usage:
/// ```swift
/// CivPhone(value: $phone)
/// CivPhone(label: "International phone", value: $phone, international: true)
/// ```
public struct CivPhone: View {
    // MARK: - Properties

    /// Visible label text (defaults to "Phone number").
    public let label: String

    /// Bound input value (stores raw unformatted digits).
    @Binding public var value: String

    /// Whether to use international mode (no mask, free-form entry).
    public var international: Bool

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
        label: String = "Phone number",
        value: Binding<String>,
        international: Bool = false,
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
        self.international = international
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
        if international {
            CivTextInput(
                label: label,
                value: $value,
                hint: hint ?? "Include country code, for example: +44 20 7946 0958",
                error: error,
                isRequired: isRequired,
                isDisabled: isDisabled,
                isReadonly: isReadonly,
                inputType: CivInputType.telephone,
                onChange: onChange,
                onAnalytics: onAnalytics,
                formState: formState,
                formName: formName,
                requiredMessage: requiredMessage,
                formValidate: formValidate,
                isPii: isPii
            )
        } else {
            CivTextInput(
                label: label,
                value: $value,
                hint: hint,
                error: error,
                isRequired: isRequired,
                isDisabled: isDisabled,
                isReadonly: isReadonly,
                inputType: CivInputType.telephone,
                mask: CivInputMask.phoneUS,
                onChange: onChange,
                onAnalytics: onAnalytics,
                formState: formState,
                formName: formName,
                requiredMessage: requiredMessage,
                formValidate: formValidate,
                isPii: isPii
            )
        }
    }
}

// MARK: - Preview

#if DEBUG
struct CivPhone_Previews: PreviewProvider {
    struct PreviewWrapper: View {
        @State private var phone = ""
        @State private var intlPhone = ""

        var body: some View {
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    CivPhone(
                        value: $phone,
                        isRequired: true
                    )

                    CivPhone(
                        label: "International phone number",
                        value: $intlPhone,
                        international: true
                    )

                    CivPhone(
                        value: .constant(""),
                        error: "Enter a valid phone number",
                        isRequired: true
                    )

                    CivPhone(
                        value: .constant("5551234567"),
                        isReadonly: true
                    )

                    CivPhone(
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
