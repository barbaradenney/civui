// CivUI — CivZip for SwiftUI
// Accessible ZIP code input with standard 5-digit and extended ZIP+4 modes.
// Delegates to CivTextInput with ZIP-specific mask configuration.

import SwiftUI

/// Accessible ZIP code input for government applications.
///
/// Wraps `CivTextInput` with ZIP mask (5-digit or ZIP+4 extended format).
/// Numeric keyboard is applied automatically via the mask preset.
///
/// Usage:
/// ```swift
/// CivZip(value: $zip)
/// CivZip(label: "ZIP+4", value: $zip, extended: true)
/// ```
public struct CivZip: View {
    // MARK: - Properties

    /// Visible label text (defaults to "ZIP code").
    public let label: String

    /// Bound input value (stores raw unformatted digits).
    @Binding public var value: String

    /// Whether to use extended ZIP+4 format (#####-####).
    public var extended: Bool

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
        label: String = "ZIP code",
        value: Binding<String>,
        extended: Bool = false,
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
        self.extended = extended
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
            width: extended ? CivInputWidth.medium : CivInputWidth.small,
            mask: extended ? CivInputMask.zip4 : CivInputMask.zip,
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
struct CivZip_Previews: PreviewProvider {
    struct PreviewWrapper: View {
        @State private var zip = ""
        @State private var zip4 = ""

        var body: some View {
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    CivZip(
                        value: $zip,
                        isRequired: true
                    )

                    CivZip(
                        label: "ZIP+4 code",
                        value: $zip4,
                        extended: true
                    )

                    CivZip(
                        value: .constant(""),
                        error: "Enter a valid ZIP code",
                        isRequired: true
                    )

                    CivZip(
                        value: .constant("20500"),
                        isReadonly: true
                    )

                    CivZip(
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
