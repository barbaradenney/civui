// CivUI — CivVaFileNumber for SwiftUI
// Accessible VA file number input with numeric keyboard and 9-digit max.
// Delegates to CivTextInput with VA file number-specific configuration.

import SwiftUI

/// Accessible VA file number input for government applications.
///
/// Wraps `CivTextInput` with numeric keyboard and 9-character maximum length.
/// Used for Veterans Affairs file number entry on benefit forms.
///
/// Usage:
/// ```swift
/// CivVaFileNumber(value: $vaFileNumber)
/// CivVaFileNumber(label: "VA file number", value: $vaNum, isRequired: true)
/// ```
public struct CivVaFileNumber: View {
    // MARK: - Properties

    /// Visible label text (defaults to "VA file number").
    public let label: String

    /// Bound input value (stores raw numeric string).
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
        label: String = "VA file number",
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
            hint: hint ?? "Up to 9 digits",
            error: error,
            isRequired: isRequired,
            isDisabled: isDisabled,
            isReadonly: isReadonly,
            maxLength: 9,
            inputType: CivInputType.number,
            width: CivInputWidth.medium,
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
struct CivVaFileNumber_Previews: PreviewProvider {
    struct PreviewWrapper: View {
        @State private var vaNum = ""

        var body: some View {
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    CivVaFileNumber(
                        value: $vaNum,
                        isRequired: true
                    )

                    CivVaFileNumber(
                        value: .constant(""),
                        hint: "Your VA file number may be the same as your Social Security number",
                        isRequired: true
                    )

                    CivVaFileNumber(
                        value: .constant(""),
                        error: "Enter your VA file number",
                        isRequired: true
                    )

                    CivVaFileNumber(
                        value: .constant("123456789"),
                        isReadonly: true
                    )

                    CivVaFileNumber(
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
