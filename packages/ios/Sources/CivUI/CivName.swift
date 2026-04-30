// CivUI — CivName for SwiftUI
// Accessible compound name input with first, middle, last, and suffix fields.
// Renders: legend → hint → error → name fields (Section 508 compliant)

import SwiftUI

/// Structured name value matching the web `NameValue` interface.
public struct NameValue: Equatable {
    public var first: String
    public var middle: String
    public var last: String
    public var suffix: String

    public init(first: String = "", middle: String = "", last: String = "", suffix: String = "") {
        self.first = first
        self.middle = middle
        self.last = last
        self.suffix = suffix
    }
}

/// Accessible compound name input for government applications.
///
/// Renders first name, optional middle name, last name, and optional suffix
/// select fields in a vertical stack. Mirrors the web `civ-name` component.
///
/// VoiceOver announces field labels and errors for each sub-field.
///
/// Usage:
/// ```swift
/// CivName(
///     legend: "Your name",
///     value: $name,
///     hint: "Enter your full legal name"
/// )
/// ```
public struct CivName: View {
    // MARK: - Properties

    /// Legend text displayed above the name fields.
    public let legend: String

    /// Bound compound name value.
    @Binding public var value: NameValue

    /// Help text shown below the legend.
    public var hint: String?

    /// Error message for the fieldset as a whole.
    public var error: String?

    /// Error for first name field.
    public var firstError: String?

    /// Error for middle name field.
    public var middleError: String?

    /// Error for last name field.
    public var lastError: String?

    /// Whether the field is required.
    public var isRequired: Bool

    /// Whether the field is disabled.
    public var isDisabled: Bool

    /// Whether the field is read-only.
    public var isReadonly: Bool

    /// Whether to show the middle name field.
    public var showMiddle: Bool

    /// Whether to show the suffix field.
    public var showSuffix: Bool

    /// Called on value change (parallels `civ-change` event).
    public var onChange: ((NameValue) -> Void)?

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

    /// Name format variant (e.g., "domestic", "international").
    public var format: String

    // MARK: - Internal State

    @Environment(\.colorScheme) private var colorScheme

    private let suffixOptions = ["Jr.", "Sr.", "II", "III", "IV"]

    // MARK: - Initializer

    public init(
        legend: String,
        value: Binding<NameValue>,
        hint: String? = nil,
        error: String? = nil,
        firstError: String? = nil,
        middleError: String? = nil,
        lastError: String? = nil,
        isRequired: Bool = false,
        isDisabled: Bool = false,
        isReadonly: Bool = false,
        showMiddle: Bool = true,
        showSuffix: Bool = true,
        onChange: ((NameValue) -> Void)? = nil,
        onAnalytics: ((String, [String: Any]?) -> Void)? = nil,
        formState: CivFormState? = nil,
        formName: String? = nil,
        requiredMessage: String? = nil,
        formValidate: (() -> String?)? = nil,
        isPii: Bool = false,
        format: String = "domestic"
    ) {
        self.legend = legend
        self._value = value
        self.hint = hint
        self.error = error
        self.firstError = firstError
        self.middleError = middleError
        self.lastError = lastError
        self.isRequired = isRequired
        self.isDisabled = isDisabled
        self.isReadonly = isReadonly
        self.showMiddle = showMiddle
        self.showSuffix = showSuffix
        self.onChange = onChange
        self.onAnalytics = onAnalytics
        self.formState = formState
        self.formName = formName
        self.requiredMessage = requiredMessage
        self.formValidate = formValidate
        self.isPii = isPii
        self.format = format
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

            // 4. First name
            nameField(
                label: "First name",
                text: Binding(get: { value.first }, set: { value.first = $0 }),
                fieldError: firstError,
                isRequiredField: true,
                autocomplete: .givenName
            )

            // 5. Middle name (optional)
            if showMiddle {
                nameField(
                    label: "Middle name",
                    text: Binding(get: { value.middle }, set: { value.middle = $0 }),
                    fieldError: middleError,
                    isRequiredField: false,
                    autocomplete: .middleName
                )
            }

            // 6. Last name
            nameField(
                label: "Last name",
                text: Binding(get: { value.last }, set: { value.last = $0 }),
                fieldError: lastError,
                isRequiredField: true,
                autocomplete: .familyName
            )

            // 7. Suffix (optional)
            if showSuffix {
                VStack(alignment: .leading, spacing: CivTokens.Spacing._0_5) {
                    Text("Suffix")
                        .font(.system(size: CivTokens.Typography.FontSize.base,
                                      weight: CivTokens.Typography.FontWeight.semibold))
                        .foregroundColor(adaptiveColor(
                            light: CivTokens.Colors.Base.darkest,
                            dark: CivTokens.DarkColors.Base.darkest
                        ))

                    Picker("Suffix", selection: Binding(
                        get: { value.suffix },
                        set: {
                            value.suffix = $0
                            onChange?(value)
                            onAnalytics?("change", nil)
                        }
                    )) {
                        Text("— Select —").tag("")
                        ForEach(suffixOptions, id: \.self) { option in
                            Text(option).tag(option)
                        }
                    }
                    .pickerStyle(.menu)
                    .accessibilityLabel("Suffix")
                }
                .frame(maxWidth: 160)
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

    private func nameField(
        label: String,
        text: Binding<String>,
        fieldError: String?,
        isRequiredField: Bool,
        autocomplete: UITextContentType
    ) -> some View {
        VStack(alignment: .leading, spacing: CivTokens.Spacing._0_5) {
            HStack(spacing: CivTokens.Spacing._0_5) {
                Text(label)
                    .font(.system(size: CivTokens.Typography.FontSize.base,
                                  weight: CivTokens.Typography.FontWeight.semibold))
                    .foregroundColor(adaptiveColor(
                        light: CivTokens.Colors.Base.darkest,
                        dark: CivTokens.DarkColors.Base.darkest
                    ))

                if isRequired && self.isRequired {
                    Text("*")
                        .foregroundColor(adaptiveColor(
                            light: CivTokens.Colors.Error.default_,
                            dark: CivTokens.DarkColors.Error.default_
                        ))
                        .accessibilityLabel("required")
                }
            }

            if let fieldError, !fieldError.isEmpty {
                Text(fieldError)
                    .font(.system(size: CivTokens.Typography.FontSize.sm,
                                  weight: CivTokens.Typography.FontWeight.bold))
                    .foregroundColor(adaptiveColor(
                        light: CivTokens.Colors.Error.default_,
                        dark: CivTokens.DarkColors.Error.default_
                    ))
                    .accessibilityIdentifier("civ-field-error")
            }

            TextField(label, text: text)
                .textContentType(autocomplete)
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
                            fieldError != nil && !(fieldError?.isEmpty ?? true)
                                ? adaptiveColor(light: CivTokens.Colors.Error.default_,
                                                dark: CivTokens.DarkColors.Error.default_)
                                : adaptiveColor(light: CivTokens.Colors.Base.default_,
                                                dark: CivTokens.DarkColors.Base.default_),
                            lineWidth: CivTokens.Border.Width._1
                        )
                )
                .onChange(of: text.wrappedValue) { _ in
                    onChange?(value)
                    onAnalytics?("change", nil)
                }
                .accessibilityLabel(label)
        }
        .padding(.bottom, CivTokens.Spacing._2)
    }

    // MARK: - Form State Registration

    private func registerWithFormState() {
        guard let formState, let formName, !formName.isEmpty else { return }
        formState.register(CivFormState.CivFieldRegistration(
            name: formName,
            label: legend,
            getValue: { "\(value.first)|\(value.middle)|\(value.last)|\(value.suffix)" },
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
struct CivName_Previews: PreviewProvider {
    struct PreviewWrapper: View {
        @State private var name = NameValue()
        @State private var prefilled = NameValue(first: "Jane", middle: "Marie", last: "Doe", suffix: "Jr.")

        var body: some View {
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    CivName(
                        legend: "Your name",
                        value: $name,
                        hint: "Enter your full legal name",
                        isRequired: true
                    )

                    CivName(
                        legend: "Prefilled name",
                        value: $prefilled
                    )

                    CivName(
                        legend: "With errors",
                        value: .constant(NameValue()),
                        firstError: "Please enter your first name",
                        lastError: "Please enter your last name",
                        isRequired: true
                    )

                    CivName(
                        legend: "Without middle or suffix",
                        value: .constant(NameValue()),
                        showMiddle: false,
                        showSuffix: false
                    )

                    CivName(
                        legend: "Disabled",
                        value: .constant(NameValue()),
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
