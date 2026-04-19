// CivUI — CivDirectDeposit for SwiftUI
// Accessible compound financial input for bank account information.
// Renders: legend → hint → error → account type → routing → account (Section 508 compliant)

import SwiftUI

/// Structured direct deposit value matching the web `DirectDepositValue` interface.
public struct DirectDepositValue: Equatable {
    public var accountType: String // "checking", "savings", or ""
    public var routingNumber: String
    public var accountNumber: String

    public init(accountType: String = "", routingNumber: String = "", accountNumber: String = "") {
        self.accountType = accountType
        self.routingNumber = routingNumber
        self.accountNumber = accountNumber
    }
}

/// Accessible direct deposit input for government applications.
///
/// Renders account type picker (checking/savings), routing number, and account
/// number fields. Mirrors the web `civ-direct-deposit` component.
///
/// VoiceOver announces field labels and errors for each sub-field.
///
/// Usage:
/// ```swift
/// CivDirectDeposit(
///     legend: "Direct deposit information",
///     value: $deposit,
///     hint: "Enter your bank account details"
/// )
/// ```
public struct CivDirectDeposit: View {
    // MARK: - Properties

    /// Legend text displayed above the deposit fields.
    public let legend: String

    /// Bound compound deposit value.
    @Binding public var value: DirectDepositValue

    /// Help text shown below the legend.
    public var hint: String?

    /// Error message for the fieldset as a whole.
    public var error: String?

    /// Error for account type selection.
    public var typeError: String?

    /// Error for routing number field.
    public var routingError: String?

    /// Error for account number field.
    public var accountError: String?

    /// Whether the field is required.
    public var isRequired: Bool

    /// Whether the field is disabled.
    public var isDisabled: Bool

    /// Whether the field is read-only.
    public var isReadonly: Bool

    /// Called on value change (parallels `civ-change` event).
    public var onChange: ((DirectDepositValue) -> Void)?

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

    // MARK: - Internal State

    @Environment(\.colorScheme) private var colorScheme

    // MARK: - Initializer

    public init(
        legend: String,
        value: Binding<DirectDepositValue>,
        hint: String? = nil,
        error: String? = nil,
        typeError: String? = nil,
        routingError: String? = nil,
        accountError: String? = nil,
        isRequired: Bool = false,
        isDisabled: Bool = false,
        isReadonly: Bool = false,
        onChange: ((DirectDepositValue) -> Void)? = nil,
        onAnalytics: ((String, [String: Any]?) -> Void)? = nil,
        formState: CivFormState? = nil,
        formName: String? = nil,
        requiredMessage: String? = nil,
        formValidate: (() -> String?)? = nil,
        isPii: Bool = false
    ) {
        self.legend = legend
        self._value = value
        self.hint = hint
        self.error = error
        self.typeError = typeError
        self.routingError = routingError
        self.accountError = accountError
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

            // 4. Account type
            VStack(alignment: .leading, spacing: CivTokens.Spacing._0_5) {
                HStack(spacing: CivTokens.Spacing._0_5) {
                    Text("Account type")
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

                if let typeError, !typeError.isEmpty {
                    Text(typeError)
                        .font(.system(size: CivTokens.Typography.FontSize.sm,
                                      weight: CivTokens.Typography.FontWeight.bold))
                        .foregroundColor(adaptiveColor(
                            light: CivTokens.Colors.Error.default_,
                            dark: CivTokens.DarkColors.Error.default_
                        ))
                }

                HStack(spacing: CivTokens.Spacing._4) {
                    accountTypeButton(label: "Checking", typeValue: "checking")
                    accountTypeButton(label: "Savings", typeValue: "savings")
                }
            }
            .padding(.bottom, CivTokens.Spacing._2)

            // 5. Routing number
            VStack(alignment: .leading, spacing: CivTokens.Spacing._0_5) {
                HStack(spacing: CivTokens.Spacing._0_5) {
                    Text("Routing number")
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

                Text("9 digits, found on the bottom left of a check")
                    .font(.system(size: CivTokens.Typography.FontSize.sm))
                    .foregroundColor(adaptiveColor(
                        light: CivTokens.Colors.Base.dark,
                        dark: CivTokens.DarkColors.Base.dark
                    ))

                if let routingError, !routingError.isEmpty {
                    Text(routingError)
                        .font(.system(size: CivTokens.Typography.FontSize.sm,
                                      weight: CivTokens.Typography.FontWeight.bold))
                        .foregroundColor(adaptiveColor(
                            light: CivTokens.Colors.Error.default_,
                            dark: CivTokens.DarkColors.Error.default_
                        ))
                }

                TextField("Routing number", text: Binding(
                    get: { value.routingNumber },
                    set: {
                        value.routingNumber = $0
                        onChange?(value)
                        onAnalytics?("change", nil)
                    }
                ))
                .keyboardType(.numberPad)
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
                            routingError != nil && !(routingError?.isEmpty ?? true)
                                ? adaptiveColor(light: CivTokens.Colors.Error.default_,
                                                dark: CivTokens.DarkColors.Error.default_)
                                : adaptiveColor(light: CivTokens.Colors.Base.default_,
                                                dark: CivTokens.DarkColors.Base.default_),
                            lineWidth: CivTokens.Border.Width._1
                        )
                )
                .frame(maxWidth: 192)
                .accessibilityLabel("Routing number")
            }
            .padding(.bottom, CivTokens.Spacing._2)

            // 6. Account number
            VStack(alignment: .leading, spacing: CivTokens.Spacing._0_5) {
                HStack(spacing: CivTokens.Spacing._0_5) {
                    Text("Account number")
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

                Text("Found on the bottom of a check, after the routing number")
                    .font(.system(size: CivTokens.Typography.FontSize.sm))
                    .foregroundColor(adaptiveColor(
                        light: CivTokens.Colors.Base.dark,
                        dark: CivTokens.DarkColors.Base.dark
                    ))

                if let accountError, !accountError.isEmpty {
                    Text(accountError)
                        .font(.system(size: CivTokens.Typography.FontSize.sm,
                                      weight: CivTokens.Typography.FontWeight.bold))
                        .foregroundColor(adaptiveColor(
                            light: CivTokens.Colors.Error.default_,
                            dark: CivTokens.DarkColors.Error.default_
                        ))
                }

                TextField("Account number", text: Binding(
                    get: { value.accountNumber },
                    set: {
                        value.accountNumber = $0
                        onChange?(value)
                        onAnalytics?("change", nil)
                    }
                ))
                .keyboardType(.numberPad)
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
                            accountError != nil && !(accountError?.isEmpty ?? true)
                                ? adaptiveColor(light: CivTokens.Colors.Error.default_,
                                                dark: CivTokens.DarkColors.Error.default_)
                                : adaptiveColor(light: CivTokens.Colors.Base.default_,
                                                dark: CivTokens.DarkColors.Base.default_),
                            lineWidth: CivTokens.Border.Width._1
                        )
                )
                .accessibilityLabel("Account number")
            }
            .padding(.bottom, CivTokens.Spacing._2)
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

    private func accountTypeButton(label: String, typeValue: String) -> some View {
        let isSelected = value.accountType == typeValue

        return Button(action: {
            guard !isDisabled && !isReadonly else { return }
            value.accountType = typeValue
            onChange?(value)
            onAnalytics?("change", ["value": typeValue])
        }) {
            HStack(spacing: CivTokens.Spacing._1) {
                Image(systemName: isSelected ? "largecircle.fill.circle" : "circle")
                    .foregroundColor(adaptiveColor(
                        light: CivTokens.Colors.Primary.default_,
                        dark: CivTokens.DarkColors.Primary.default_
                    ))
                Text(label)
                    .font(.system(size: CivTokens.Typography.FontSize.base))
                    .foregroundColor(adaptiveColor(
                        light: CivTokens.Colors.Base.darkest,
                        dark: CivTokens.DarkColors.Base.darkest
                    ))
            }
        }
        .buttonStyle(.plain)
        .accessibilityLabel("\(label)\(isSelected ? ", selected" : "")")
        .accessibilityAddTraits(isSelected ? [.isSelected] : [])
    }

    // MARK: - Form State Registration

    private func registerWithFormState() {
        guard let formState, let formName, !formName.isEmpty else { return }
        formState.register(CivFormState.CivFieldRegistration(
            name: formName,
            label: legend,
            getValue: { "\(value.accountType)|\(value.routingNumber)|\(value.accountNumber)" },
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
struct CivDirectDeposit_Previews: PreviewProvider {
    struct PreviewWrapper: View {
        @State private var deposit = DirectDepositValue()
        @State private var prefilled = DirectDepositValue(
            accountType: "checking",
            routingNumber: "021000021",
            accountNumber: "1234567890"
        )

        var body: some View {
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    CivDirectDeposit(
                        legend: "Direct deposit information",
                        value: $deposit,
                        hint: "Enter your bank account details",
                        isRequired: true
                    )

                    CivDirectDeposit(
                        legend: "Prefilled deposit",
                        value: $prefilled
                    )

                    CivDirectDeposit(
                        legend: "With errors",
                        value: .constant(DirectDepositValue()),
                        typeError: "Please select an account type",
                        routingError: "Routing number must be 9 digits",
                        accountError: "Please enter an account number",
                        isRequired: true
                    )

                    CivDirectDeposit(
                        legend: "Disabled",
                        value: .constant(DirectDepositValue()),
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
