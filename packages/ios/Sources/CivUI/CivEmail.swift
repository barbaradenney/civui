// CivUI — CivEmail for SwiftUI
// Accessible email address input with email keyboard and validation.
// Delegates to CivTextInput with email-specific configuration.

import SwiftUI

/// Accessible email input for government applications.
///
/// Wraps `CivTextInput` with email keyboard type, email autocomplete,
/// and email validation. Mirrors the web `civ-text-input[type="email"]` pattern.
///
/// Usage:
/// ```swift
/// CivEmail(value: $email)
/// CivEmail(label: "Work email", value: $email, isRequired: true)
/// ```
public struct CivEmail: View {
    // MARK: - Properties

    /// Visible label text (defaults to "Email address").
    public let label: String

    /// Bound input value.
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
        label: String = "Email address",
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
            hint: hint ?? "For example: name@agency.gov",
            error: error,
            isRequired: isRequired,
            isDisabled: isDisabled,
            isReadonly: isReadonly,
            inputType: CivInputType.email,
            onChange: onChange,
            onAnalytics: onAnalytics,
            formState: formState,
            formName: formName,
            requiredMessage: requiredMessage,
            formValidate: formValidate ?? defaultEmailValidation,
            isPii: isPii
        )
    }

    // MARK: - Default Validation

    private var defaultEmailValidation: (() -> String?)? {
        guard formValidate == nil else { return nil }
        return {
            guard !value.isEmpty else { return nil }
            let pattern = #"^[^\s@]+@[^\s@]+\.[^\s@]+$"#
            guard value.range(of: pattern, options: .regularExpression) != nil else {
                return "Enter a valid email address"
            }
            return nil
        }
    }
}

// MARK: - Preview

#if DEBUG
struct CivEmail_Previews: PreviewProvider {
    struct PreviewWrapper: View {
        @State private var email = ""

        var body: some View {
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    CivEmail(
                        value: $email,
                        isRequired: true
                    )

                    CivEmail(
                        label: "Work email",
                        value: .constant(""),
                        hint: "Use your .gov or .mil address",
                        isRequired: true
                    )

                    CivEmail(
                        value: .constant("invalid"),
                        error: "Enter a valid email address",
                        isRequired: true
                    )

                    CivEmail(
                        value: .constant("jane.doe@agency.gov"),
                        isReadonly: true
                    )

                    CivEmail(
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
