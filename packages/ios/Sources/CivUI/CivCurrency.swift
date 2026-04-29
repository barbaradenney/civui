// CivUI — CivCurrency for SwiftUI
// Accessible currency input with dollar prefix and decimal keyboard.
// Delegates to CivTextInput with currency mask configuration.

import SwiftUI

/// Accessible currency input for government applications.
///
/// Wraps `CivTextInput` with currency mask, decimal keyboard, and
/// dollar sign prefix. Mirrors the web `civ-text-input[mask="currency"]` pattern.
///
/// Usage:
/// ```swift
/// CivCurrency(value: $amount)
/// CivCurrency(label: "Monthly income", value: $income, isRequired: true)
/// ```
public struct CivCurrency: View {
    // MARK: - Properties

    /// Visible label text (defaults to "Amount").
    public let label: String

    /// Bound input value (stores raw numeric string, e.g. "1234.56").
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
        label: String = "Amount",
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
            hint: hint,
            error: error,
            isRequired: isRequired,
            isDisabled: isDisabled,
            isReadonly: isReadonly,
            mask: CivInputMask.currency,
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
struct CivCurrency_Previews: PreviewProvider {
    struct PreviewWrapper: View {
        @State private var amount = ""
        @State private var income = "4500.00"

        var body: some View {
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    CivCurrency(
                        value: $amount,
                        isRequired: true
                    )

                    CivCurrency(
                        label: "Monthly income",
                        value: $income,
                        hint: "Before taxes"
                    )

                    CivCurrency(
                        value: .constant(""),
                        error: "Enter an amount",
                        isRequired: true
                    )

                    CivCurrency(
                        label: "Approved amount",
                        value: .constant("12500.00"),
                        isReadonly: true
                    )

                    CivCurrency(
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
