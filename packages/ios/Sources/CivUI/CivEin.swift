// CivUI — CivEin for SwiftUI
// Accessible Employer Identification Number input with EIN mask and PII protection.
// Delegates to CivTextInput with EIN-specific configuration.

import SwiftUI

/// Accessible EIN input for government applications.
///
/// Wraps `CivTextInput` with EIN mask (##-#######), numeric keyboard,
/// and PII flagging. Mirrors the web `civ-text-input[mask="ein"]` pattern.
///
/// Usage:
/// ```swift
/// CivEin(value: $ein)
/// CivEin(label: "Organization EIN", value: $ein, isRequired: true)
/// ```
public struct CivEin: View {
    // MARK: - Properties

    /// Visible label text (defaults to "Employer Identification Number").
    public let label: String

    /// Bound input value (stores raw unformatted digits).
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

    /// Whether the field contains PII (defaults to true for EIN).
    public var isPii: Bool

    // MARK: - Initializer

    public init(
        label: String = "Employer Identification Number",
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
        isPii: Bool = true
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
            hint: hint,
            error: error,
            isRequired: isRequired,
            isDisabled: isDisabled,
            isReadonly: isReadonly,
            inputType: CivInputType.number,
            mask: CivInputMask.ein,
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

// MARK: - Preview

#if DEBUG
struct CivEin_Previews: PreviewProvider {
    struct PreviewWrapper: View {
        @State private var ein = ""

        var body: some View {
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    CivEin(
                        value: $ein,
                        isRequired: true
                    )

                    CivEin(
                        label: "Organization EIN",
                        value: .constant(""),
                        hint: "Found on your IRS determination letter",
                        isRequired: true
                    )

                    CivEin(
                        value: .constant(""),
                        error: "Enter a valid Employer Identification Number",
                        isRequired: true
                    )

                    CivEin(
                        value: .constant("123456789"),
                        isReadonly: true
                    )

                    CivEin(
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
