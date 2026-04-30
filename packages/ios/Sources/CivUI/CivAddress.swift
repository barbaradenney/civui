// CivUI — CivAddress for SwiftUI
// Accessible structured address input following government design system patterns.
// Renders: legend → hint → error → street/city/state/zip fields (Section 508 compliant)

import SwiftUI

/// Structured address value matching the web `AddressValue` interface.
public struct AddressValue: Equatable {
    public var street1: String
    public var street2: String
    public var city: String
    public var state: String
    public var zip: String

    public init(
        street1: String = "",
        street2: String = "",
        city: String = "",
        state: String = "",
        zip: String = ""
    ) {
        self.street1 = street1
        self.street2 = street2
        self.city = city
        self.state = state
        self.zip = zip
    }

    /// Whether all required fields are empty.
    public var isEmpty: Bool {
        street1.isEmpty && city.isEmpty && state.isEmpty && zip.isEmpty
    }

    /// JSON-serialized value (matches web form submission format).
    public var jsonString: String {
        let parts = [
            "\"street1\":\"\(street1)\"",
            "\"street2\":\"\(street2)\"",
            "\"city\":\"\(city)\"",
            "\"state\":\"\(state)\"",
            "\"zip\":\"\(zip)\""
        ]
        return "{\(parts.joined(separator: ","))}"
    }
}

/// US states and territories for the state picker.
private let US_STATES: [(value: String, label: String)] = [
    ("", "- Select -"),
    ("AL", "Alabama"), ("AK", "Alaska"), ("AZ", "Arizona"), ("AR", "Arkansas"),
    ("CA", "California"), ("CO", "Colorado"), ("CT", "Connecticut"), ("DE", "Delaware"),
    ("DC", "District of Columbia"),
    ("FL", "Florida"), ("GA", "Georgia"), ("HI", "Hawaii"), ("ID", "Idaho"),
    ("IL", "Illinois"), ("IN", "Indiana"), ("IA", "Iowa"), ("KS", "Kansas"),
    ("KY", "Kentucky"), ("LA", "Louisiana"), ("ME", "Maine"), ("MD", "Maryland"),
    ("MA", "Massachusetts"), ("MI", "Michigan"), ("MN", "Minnesota"), ("MS", "Mississippi"),
    ("MO", "Missouri"), ("MT", "Montana"), ("NE", "Nebraska"), ("NV", "Nevada"),
    ("NH", "New Hampshire"), ("NJ", "New Jersey"), ("NM", "New Mexico"), ("NY", "New York"),
    ("NC", "North Carolina"), ("ND", "North Dakota"),
    ("OH", "Ohio"), ("OK", "Oklahoma"), ("OR", "Oregon"), ("PA", "Pennsylvania"),
    ("RI", "Rhode Island"), ("SC", "South Carolina"), ("SD", "South Dakota"), ("TN", "Tennessee"),
    ("TX", "Texas"), ("UT", "Utah"), ("VT", "Vermont"), ("VA", "Virginia"),
    ("WA", "Washington"), ("WV", "West Virginia"), ("WI", "Wisconsin"), ("WY", "Wyoming"),
    ("AS", "American Samoa"), ("GU", "Guam"), ("MP", "Northern Mariana Islands"),
    ("PR", "Puerto Rico"), ("VI", "U.S. Virgin Islands"),
]

/// Accessible structured address input for government applications.
///
/// Renders a fieldset with individual labeled inputs for street address,
/// city, state (picker), and ZIP code. Mirrors the web `civ-address` component.
///
/// VoiceOver announces field labels and errors for each sub-field.
///
/// Usage:
/// ```swift
/// CivAddress(
///     legend: "Mailing address",
///     value: $address,
///     hint: "Enter your current mailing address",
///     isRequired: true
/// )
/// ```
public struct CivAddress: View {
    // MARK: - Properties

    /// Legend text displayed above the address fields.
    public let legend: String

    /// Bound structured address value.
    @Binding public var value: AddressValue

    /// Help text shown below the legend.
    public var hint: String?

    /// Group-level error message. When set, renders with VoiceOver announcement.
    public var error: String?

    /// Error message for the street field.
    public var streetError: String?

    /// Error message for the city field.
    public var cityError: String?

    /// Error message for the state field.
    public var stateError: String?

    /// Error message for the ZIP code field.
    public var zipError: String?

    /// Whether the field is required.
    public var isRequired: Bool

    /// Whether the field is disabled.
    public var isDisabled: Bool

    /// Whether the field is read-only (visible but non-interactive).
    public var isReadonly: Bool

    /// Whether to show the Street address line 2 field.
    public var showStreet2: Bool

    /// Called on value change (parallels `civ-change` event).
    public var onChange: ((AddressValue) -> Void)?

    /// Called on every field change (parallels `civ-input` event).
    public var onInput: ((AddressValue) -> Void)?

    /// Called on form reset (parallels `civ-reset` event).
    public var onReset: (() -> Void)?

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

    /// Whether to show the country field.
    public var showCountry: Bool

    /// Whether to show military address options (APO/FPO/DPO).
    public var showMilitary: Bool

    /// Whether to show a third street address line.
    public var showStreet3: Bool

    /// Custom address validation callback. Returns error string or nil.
    public var validateAddress: ((AddressValue) -> String?)?

    // MARK: - Internal State

    @Environment(\.colorScheme) private var colorScheme

    // MARK: - Initializer

    public init(
        legend: String,
        value: Binding<AddressValue>,
        hint: String? = nil,
        error: String? = nil,
        streetError: String? = nil,
        cityError: String? = nil,
        stateError: String? = nil,
        zipError: String? = nil,
        isRequired: Bool = false,
        isDisabled: Bool = false,
        isReadonly: Bool = false,
        showStreet2: Bool = true,
        onChange: ((AddressValue) -> Void)? = nil,
        onInput: ((AddressValue) -> Void)? = nil,
        onReset: (() -> Void)? = nil,
        onAnalytics: ((String, [String: Any]?) -> Void)? = nil,
        formState: CivFormState? = nil,
        formName: String? = nil,
        requiredMessage: String? = nil,
        formValidate: (() -> String?)? = nil,
        isPii: Bool = false,
        showCountry: Bool = false,
        showMilitary: Bool = false,
        showStreet3: Bool = false,
        validateAddress: ((AddressValue) -> String?)? = nil
    ) {
        self.legend = legend
        self._value = value
        self.hint = hint
        self.error = error
        self.streetError = streetError
        self.cityError = cityError
        self.stateError = stateError
        self.zipError = zipError
        self.isRequired = isRequired
        self.isDisabled = isDisabled
        self.isReadonly = isReadonly
        self.showStreet2 = showStreet2
        self.onChange = onChange
        self.onInput = onInput
        self.onReset = onReset
        self.onAnalytics = onAnalytics
        self.formState = formState
        self.formName = formName
        self.requiredMessage = requiredMessage
        self.formValidate = formValidate
        self.isPii = isPii
        self.showCountry = showCountry
        self.showMilitary = showMilitary
        self.showStreet3 = showStreet3
        self.validateAddress = validateAddress
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

            // 3. Group-level error
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

            // 4. Address fields
            VStack(alignment: .leading, spacing: CivTokens.Spacing._3) {
                // Street address line 1
                addressField(
                    label: "Street address",
                    text: $value.street1,
                    fieldError: streetError,
                    showRequired: isRequired,
                    contentType: .streetAddressLine1,
                    keyboardType: .default
                )

                // Street address line 2
                if showStreet2 {
                    addressField(
                        label: "Street address line 2",
                        text: $value.street2,
                        fieldError: nil,
                        showRequired: false,
                        contentType: .streetAddressLine2,
                        keyboardType: .default
                    )
                }

                // City, State, ZIP row
                HStack(alignment: .top, spacing: CivTokens.Spacing._3) {
                    // City
                    addressField(
                        label: "City",
                        text: $value.city,
                        fieldError: cityError,
                        showRequired: isRequired,
                        contentType: .addressCity,
                        keyboardType: .default
                    )

                    // State picker
                    VStack(alignment: .leading, spacing: CivTokens.Spacing._0_5) {
                        fieldLabel(text: "State", showRequired: isRequired)

                        if let stateError, !stateError.isEmpty {
                            fieldErrorText(stateError)
                        }

                        Picker("State", selection: $value.state) {
                            ForEach(US_STATES, id: \.value) { state in
                                Text(state.label).tag(state.value)
                            }
                        }
                        .pickerStyle(.menu)
                        .padding(CivTokens.Spacing._2)
                        .background(adaptiveColor(
                            light: CivTokens.Colors.White.default_,
                            dark: CivTokens.DarkColors.White.default_
                        ))
                        .cornerRadius(CivTokens.Border.Radius.default_)
                        .overlay(
                            RoundedRectangle(cornerRadius: CivTokens.Border.Radius.default_)
                                .stroke(
                                    stateError != nil && !(stateError?.isEmpty ?? true)
                                        ? adaptiveColor(
                                            light: CivTokens.Colors.Error.default_,
                                            dark: CivTokens.DarkColors.Error.default_
                                        )
                                        : adaptiveColor(
                                            light: CivTokens.Colors.Base.light,
                                            dark: CivTokens.DarkColors.Base.light
                                        ),
                                    lineWidth: stateError != nil && !(stateError?.isEmpty ?? true)
                                        ? CivTokens.Border.Width._2
                                        : CivTokens.Border.Width.default_
                                )
                        )
                        .accessibilityLabel("State")
                    }
                    .frame(minWidth: 120)

                    // ZIP code
                    addressField(
                        label: "ZIP code",
                        text: $value.zip,
                        fieldError: zipError,
                        showRequired: isRequired,
                        contentType: .postalCode,
                        keyboardType: .numberPad
                    )
                    .frame(maxWidth: 120)
                }
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
        .onChange(of: value) { newValue in
            onChange?(newValue)
            onAnalytics?("change", ["value": newValue.jsonString])
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

    /// Renders a label with optional required indicator.
    private func fieldLabel(text: String, showRequired: Bool) -> some View {
        HStack(spacing: CivTokens.Spacing._0_5) {
            Text(text)
                .font(.system(size: CivTokens.Typography.FontSize.sm,
                              weight: CivTokens.Typography.FontWeight.semibold))
                .foregroundColor(adaptiveColor(
                    light: CivTokens.Colors.Base.darkest,
                    dark: CivTokens.DarkColors.Base.darkest
                ))

            if showRequired {
                Text("*")
                    .font(.system(size: CivTokens.Typography.FontSize.sm,
                                  weight: CivTokens.Typography.FontWeight.bold))
                    .foregroundColor(adaptiveColor(
                        light: CivTokens.Colors.Error.default_,
                        dark: CivTokens.DarkColors.Error.default_
                    ))
                    .accessibilityHidden(true)
            }
        }
    }

    /// Renders a field-level error message.
    private func fieldErrorText(_ message: String) -> some View {
        Text(message)
            .font(.system(size: CivTokens.Typography.FontSize.xs,
                          weight: CivTokens.Typography.FontWeight.bold))
            .foregroundColor(adaptiveColor(
                light: CivTokens.Colors.Error.default_,
                dark: CivTokens.DarkColors.Error.default_
            ))
            .accessibilityIdentifier("civ-field-error")
    }

    /// Renders a text field with label, error, and styled border.
    private func addressField(
        label: String,
        text: Binding<String>,
        fieldError: String?,
        showRequired: Bool,
        contentType: UITextContentType,
        keyboardType: UIKeyboardType
    ) -> some View {
        VStack(alignment: .leading, spacing: CivTokens.Spacing._0_5) {
            fieldLabel(text: label, showRequired: showRequired)

            if let fieldError, !fieldError.isEmpty {
                fieldErrorText(fieldError)
            }

            TextField("", text: text)
                .font(.system(size: CivTokens.Typography.FontSize.base))
                .textContentType(contentType)
                .keyboardType(keyboardType)
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
                                ? adaptiveColor(
                                    light: CivTokens.Colors.Error.default_,
                                    dark: CivTokens.DarkColors.Error.default_
                                )
                                : adaptiveColor(
                                    light: CivTokens.Colors.Base.light,
                                    dark: CivTokens.DarkColors.Base.light
                                ),
                            lineWidth: fieldError != nil && !(fieldError?.isEmpty ?? true)
                                ? CivTokens.Border.Width._2
                                : CivTokens.Border.Width.default_
                        )
                )
                .accessibilityLabel(label)
        }
    }

    // MARK: - Form State Registration

    private func registerWithFormState() {
        guard let formState, let formName, !formName.isEmpty else { return }
        formState.register(CivFormState.CivFieldRegistration(
            name: formName,
            label: legend,
            getValue: { value.jsonString },
            setValue: { _ in /* Address uses structured binding */ },
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
struct CivAddress_Previews: PreviewProvider {
    struct PreviewWrapper: View {
        @State private var mailing = AddressValue()
        @State private var billing = AddressValue(
            street1: "1600 Pennsylvania Ave NW",
            city: "Washington",
            state: "DC",
            zip: "20500"
        )

        var body: some View {
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    CivAddress(
                        legend: "Mailing address",
                        value: $mailing,
                        hint: "Enter your current mailing address",
                        isRequired: true
                    )

                    CivAddress(
                        legend: "Billing address",
                        value: $billing
                    )

                    CivAddress(
                        legend: "Disabled address",
                        value: .constant(AddressValue()),
                        isDisabled: true
                    )

                    CivAddress(
                        legend: "With errors",
                        value: .constant(AddressValue()),
                        error: "Please complete all required fields",
                        streetError: "Street address is required",
                        cityError: "City is required",
                        stateError: "State is required",
                        zipError: "ZIP code is required",
                        isRequired: true
                    )

                    CivAddress(
                        legend: "Without street line 2",
                        value: $mailing,
                        isRequired: true,
                        showStreet2: false
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
