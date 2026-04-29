// CivUI — CivSsn for SwiftUI
// Accessible Social Security number input with full and last-4 modes.
// Delegates to CivTextInput with SSN mask and PII protection.

import SwiftUI

/// SSN input mode — full 9-digit or last 4 digits only.
public enum CivSsnMode {
    case full
    case last4
}

/// Accessible Social Security number input for government applications.
///
/// Wraps `CivTextInput` with SSN-specific mask, PII flagging, and keyboard
/// configuration. Supports full 9-digit and last-4-only modes.
///
/// Usage:
/// ```swift
/// CivSsn(value: $ssn)
/// CivSsn(label: "Last 4 of SSN", value: $ssnLast4, mode: .last4)
/// ```
public struct CivSsn: View {
    // MARK: - Properties

    /// Visible label text (defaults to "Social Security number").
    public let label: String

    /// Bound input value (stores raw unformatted digits).
    @Binding public var value: String

    /// SSN mode — full 9-digit or last 4 only.
    public var mode: CivSsnMode

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

    /// Whether the field contains PII (defaults to true for SSN).
    public var isPii: Bool

    // MARK: - Initializer

    public init(
        label: String = "Social Security number",
        value: Binding<String>,
        mode: CivSsnMode = .full,
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
        self.mode = mode
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
        switch mode {
        case .full:
            CivTextInput(
                label: label,
                value: $value,
                hint: hint,
                error: error,
                isRequired: isRequired,
                isDisabled: isDisabled,
                isReadonly: isReadonly,
                mask: CivInputMask.ssn,
                onChange: onChange,
                onAnalytics: onAnalytics,
                formState: formState,
                formName: formName,
                requiredMessage: requiredMessage,
                formValidate: formValidate,
                isPii: isPii
            )
        case .last4:
            CivTextInput(
                label: label,
                value: $value,
                hint: hint ?? "Last 4 digits",
                error: error,
                isRequired: isRequired,
                isDisabled: isDisabled,
                isReadonly: isReadonly,
                maxLength: 4,
                inputType: CivInputType.number,
                width: CivInputWidth.small,
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
struct CivSsn_Previews: PreviewProvider {
    struct PreviewWrapper: View {
        @State private var ssn = ""
        @State private var last4 = ""

        var body: some View {
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    CivSsn(
                        value: $ssn,
                        isRequired: true
                    )

                    CivSsn(
                        label: "Last 4 of SSN",
                        value: $last4,
                        mode: .last4,
                        isRequired: true
                    )

                    CivSsn(
                        value: .constant(""),
                        error: "Enter your Social Security number",
                        isRequired: true
                    )

                    CivSsn(
                        value: .constant("123456789"),
                        isReadonly: true
                    )

                    CivSsn(
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
