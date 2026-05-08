// CivUI — CivSignature for SwiftUI
// Accessible statement of truth component for form submission.
// Renders: legend → hint → error → statement → name field → certification toggle (Section 508 compliant)

import SwiftUI

/// Structured signature value matching the web `SignatureValue` interface.
public struct SignatureValue: Equatable {
    public var name: String
    public var certified: Bool

    public init(name: String = "", certified: Bool = false) {
        self.name = name
        self.certified = certified
    }
}

/// Accessible signature/statement of truth for government applications.
///
/// Renders a certification statement, full name text field, and certification
/// toggle. Used at the end of a review page before final submission. Mirrors
/// the web `civ-signature` component.
///
/// VoiceOver announces field labels, errors, and certification state.
///
/// Usage:
/// ```swift
/// CivSignature(
///     legend: "Statement of truth",
///     value: $signature,
///     statement: "I certify that the information I have provided is true and correct."
/// )
/// ```
public struct CivSignature: View {
    // MARK: - Properties

    /// Legend text displayed above the signature fields.
    public let legend: String

    /// Bound compound signature value.
    @Binding public var value: SignatureValue

    /// Help text shown below the legend.
    public var hint: String?

    /// Error message for the fieldset as a whole.
    public var error: String?

    /// Certification statement text displayed above the fields.
    public var statement: String?

    /// Error for the name field.
    public var nameError: String?

    /// Error for the certification toggle.
    public var certifyError: String?

    /// Whether the field is required.
    public var isRequired: Bool

    /// Whether the field is disabled.
    public var isDisabled: Bool

    /// Whether the field is read-only.
    public var isReadonly: Bool

    /// Called on value change (parallels `civ-change` event).
    public var onChange: ((SignatureValue) -> Void)?

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

    /// Whether the field contains PII (excluded from getFormData).
    public var isPii: Bool

    /// When true, render the signature block as an outlined card
    /// rather than a bare fieldset — highlights the legal weight
    /// of the action.
    public var card: Bool

    // MARK: - Internal State

    @Environment(\.colorScheme) private var colorScheme

    // MARK: - Computed

    /// Whether the signature is complete (name entered and certified).
    public var isComplete: Bool {
        !value.name.trimmingCharacters(in: .whitespaces).isEmpty && value.certified
    }

    // MARK: - Initializer

    public init(
        legend: String,
        value: Binding<SignatureValue>,
        hint: String? = nil,
        error: String? = nil,
        statement: String? = nil,
        nameError: String? = nil,
        certifyError: String? = nil,
        isRequired: Bool = false,
        isDisabled: Bool = false,
        isReadonly: Bool = false,
        onChange: ((SignatureValue) -> Void)? = nil,
        onAnalytics: ((String, [String: Any]?) -> Void)? = nil,
        formState: CivFormState? = nil,
        formName: String? = nil,
        requiredMessage: String? = nil,
        formValidate: (() -> String?)? = nil,
        isPii: Bool = false,
        card: Bool = true
    ) {
        self.legend = legend
        self._value = value
        self.hint = hint
        self.error = error
        self.statement = statement
        self.nameError = nameError
        self.certifyError = certifyError
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
        self.card = card
    }

    // MARK: - Body

    public var body: some View {
        VStack(alignment: .leading, spacing: CivTokens.Spacing._1) {
            // 1. Legend
            legendView

            // 2. Hint
            if let hint, !hint.isEmpty {
                Text(hint)
                    .font(.system(size: CivTokens.Typography.FontSize.sm))
                    .foregroundColor(adaptiveColor(
                        light: CivTokens.Colors.Base.dark,
                        dark: CivTokens.DarkColors.Base.dark
                    ))
                    .accessibilityIdentifier("civ-hint")
            }

            // 3. Error (fieldset-level)
            if let error, !error.isEmpty {
                Text(error)
                    .font(.system(size: CivTokens.Typography.FontSize.sm,
                                  weight: CivTokens.Typography.FontWeight.bold))
                    .foregroundColor(adaptiveColor(
                        light: CivTokens.Colors.Error.default_,
                        dark: CivTokens.DarkColors.Error.default_
                    ))
                    .accessibilityIdentifier("civ-error")
            }

            // 4. Statement
            if let statement, !statement.isEmpty {
                Text(statement)
                    .font(.system(size: CivTokens.Typography.FontSize.base))
                    .foregroundColor(adaptiveColor(
                        light: CivTokens.Colors.Base.dark,
                        dark: CivTokens.DarkColors.Base.dark
                    ))
                    .padding(.bottom, CivTokens.Spacing._3)
            }

            // 5. Name field
            VStack(alignment: .leading, spacing: CivTokens.Spacing._0_5) {
                HStack(spacing: CivTokens.Spacing._0_5) {
                    Text("Your full name")
                        .font(.system(size: CivTokens.Typography.FontSize.base,
                                      weight: CivTokens.Typography.FontWeight.semibold))
                        .foregroundColor(adaptiveColor(
                            light: CivTokens.Colors.Base.darkest,
                            dark: CivTokens.DarkColors.Base.darkest
                        ))

                    if isRequired {
                        Text("*")
                            .foregroundColor(adaptiveColor(
                                light: CivTokens.Colors.Error.default_,
                                dark: CivTokens.DarkColors.Error.default_
                            ))
                            .accessibilityLabel("required")
                    }
                }

                Text("Type your full legal name as your signature")
                    .font(.system(size: CivTokens.Typography.FontSize.sm))
                    .foregroundColor(adaptiveColor(
                        light: CivTokens.Colors.Base.dark,
                        dark: CivTokens.DarkColors.Base.dark
                    ))

                if let nameError, !nameError.isEmpty {
                    Text(nameError)
                        .font(.system(size: CivTokens.Typography.FontSize.sm,
                                      weight: CivTokens.Typography.FontWeight.bold))
                        .foregroundColor(adaptiveColor(
                            light: CivTokens.Colors.Error.default_,
                            dark: CivTokens.DarkColors.Error.default_
                        ))
                }

                TextField("Your full name", text: Binding(
                    get: { value.name },
                    set: {
                        value.name = $0
                        onChange?(value)
                        onAnalytics?("change", nil)
                    }
                ))
                .textContentType(.name)
                .autocorrectionDisabled()
                .font(.system(size: CivTokens.Typography.FontSize.base))
                .padding(CivTokens.Spacing._2)
                .background(adaptiveColor(
                    light: CivTokens.Colors.White.default_,
                    dark: CivTokens.DarkColors.White.default_
                ))
                .cornerRadius(CivTokens.Border.Radius.default_)
                .overlay(
                    RoundedRectangle(cornerRadius: CivTokens.Border.Radius.default_)
                        .stroke(
                            nameError != nil && !(nameError?.isEmpty ?? true)
                                ? adaptiveColor(light: CivTokens.Colors.Error.default_,
                                                dark: CivTokens.DarkColors.Error.default_)
                                : adaptiveColor(light: CivTokens.Colors.Base.default_,
                                                dark: CivTokens.DarkColors.Base.default_),
                            lineWidth: CivTokens.Border.Width._1
                        )
                )
                .accessibilityLabel("Your full name")
            }
            .padding(.bottom, CivTokens.Spacing._2)

            // 6. Certification toggle
            VStack(alignment: .leading, spacing: CivTokens.Spacing._0_5) {
                if let certifyError, !certifyError.isEmpty {
                    Text(certifyError)
                        .font(.system(size: CivTokens.Typography.FontSize.sm,
                                      weight: CivTokens.Typography.FontWeight.bold))
                        .foregroundColor(adaptiveColor(
                            light: CivTokens.Colors.Error.default_,
                            dark: CivTokens.DarkColors.Error.default_
                        ))
                }

                Toggle(isOn: Binding(
                    get: { value.certified },
                    set: {
                        value.certified = $0
                        onChange?(value)
                        onAnalytics?("change", ["certified": $0])
                    }
                )) {
                    Text("I certify the information above is correct and true to the best of my knowledge and belief")
                        .font(.system(size: CivTokens.Typography.FontSize.base))
                        .foregroundColor(adaptiveColor(
                            light: CivTokens.Colors.Base.darkest,
                            dark: CivTokens.DarkColors.Base.darkest
                        ))
                }
                .toggleStyle(.switch)
                .tint(adaptiveColor(
                    light: CivTokens.Colors.Primary.default_,
                    dark: CivTokens.DarkColors.Primary.default_
                ))
                .accessibilityLabel("I certify the information above is correct")
            }
        }
        .padding(.bottom, CivTokens.Spacing._4)
        .disabled(isDisabled || isReadonly)
        .opacity(isDisabled ? 0.5 : 1.0)
        .accessibilityElement(children: .contain)
        .onChange(of: error) { newError in
            if let newError, !newError.isEmpty {
                UIAccessibility.post(notification: .announcement, argument: newError)
            }
        }
        .onAppear { registerWithFormState() }
        .onDisappear { unregisterFromFormState() }
    }

    // MARK: - Subviews

    private var legendView: some View {
        HStack(spacing: CivTokens.Spacing._0_5) {
            Text(legend)
                .font(.system(size: CivTokens.Typography.FontSize.lg,
                              weight: CivTokens.Typography.FontWeight.bold))
                .foregroundColor(adaptiveColor(
                    light: CivTokens.Colors.Base.darkest,
                    dark: CivTokens.DarkColors.Base.darkest
                ))

            if isRequired {
                Text("*")
                    .font(.system(size: CivTokens.Typography.FontSize.lg,
                                  weight: CivTokens.Typography.FontWeight.bold))
                    .foregroundColor(adaptiveColor(
                        light: CivTokens.Colors.Error.default_,
                        dark: CivTokens.DarkColors.Error.default_
                    ))
                    .accessibilityLabel("required")
            }
        }
    }

    // MARK: - Form State Registration

    private func registerWithFormState() {
        guard let formState, let formName, !formName.isEmpty else { return }
        formState.register(CivFormState.CivFieldRegistration(
            name: formName,
            label: legend,
            getValue: { "\(value.name)|\(value.certified)" },
            setValue: { _ in },
            isRequired: isRequired,
            requiredMessage: requiredMessage ?? "",
            validate: formValidate,
            isPii: isPii
        ))
    }

    private func unregisterFromFormState() {
        guard let formState, let formName, !formName.isEmpty else { return }
        formState.unregister(formName)
    }

    // MARK: - Color Helper

    private func adaptiveColor(light: Color, dark: Color) -> Color {
        colorScheme == .dark ? dark : light
    }
}

// MARK: - Preview

#if DEBUG
struct CivSignature_Previews: PreviewProvider {
    struct PreviewWrapper: View {
        @State private var signature = SignatureValue()
        @State private var prefilled = SignatureValue(name: "Jane Marie Doe", certified: true)

        var body: some View {
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    CivSignature(
                        legend: "Statement of truth",
                        value: $signature,
                        statement: "I certify that the information I have provided is true and correct to the best of my knowledge and belief.",
                        isRequired: true
                    )

                    CivSignature(
                        legend: "Completed signature",
                        value: $prefilled,
                        statement: "I certify that the information I have provided is true and correct."
                    )

                    CivSignature(
                        legend: "With errors",
                        value: .constant(SignatureValue()),
                        nameError: "Please enter your full name",
                        certifyError: "You must certify to continue",
                        isRequired: true
                    )

                    CivSignature(
                        legend: "Disabled",
                        value: .constant(SignatureValue()),
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
