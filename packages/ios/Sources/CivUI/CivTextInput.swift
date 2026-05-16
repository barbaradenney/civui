// CivUI — CivTextInput for SwiftUI
// Accessible text input following government design system patterns.
// Renders: label → hint → error → input (Section 508 compliant)

import SwiftUI

/// Keyboard type mapping for CivTextInput (parallels web `type` attribute).
public enum CivInputType {
    case text
    case email
    case number
    case password
    case search
    case telephone
    case url
}

/// Width variant for CivTextInput (parallels web `width` prop).
public enum CivInputWidth {
    case full      // default
    case xxSmall   // 2xs → 48pt
    case xSmall    // xs  → 64pt
    case small     // sm  → 96pt
    case medium    // md  → 160pt
    case large     // lg  → 240pt
    case xLarge    // xl  → 288pt
    case xxLarge   // 2xl → 384pt

    var points: CGFloat? {
        switch self {
        case .full: return nil
        case .xxSmall: return 48
        case .xSmall: return 64
        case .small: return 96
        case .medium: return 160
        case .large: return 240
        case .xLarge: return 288
        case .xxLarge: return 384
        }
    }
}

/// Input mask preset (parallels web `mask` prop).
public enum CivInputMask: String {
    case none = ""
    case ssn = "ssn"
    case phoneUS = "phone-us"
    case zip = "zip"
    case zip4 = "zip4"
    case ein = "ein"
    case currency = "currency"

    /// The mask pattern string (# = digit).
    var pattern: String {
        switch self {
        case .none: return ""
        case .ssn: return "###-##-####"
        case .phoneUS: return "(###) ###-####"
        case .zip: return "#####"
        case .zip4: return "#####-####"
        case .ein: return "##-#######"
        case .currency: return "" // currency uses special formatting
        }
    }

    /// Hint text describing the expected format.
    var hint: String {
        switch self {
        case .ssn: return CivLocale.shared.t("maskSsnHint")
        case .phoneUS: return CivLocale.shared.t("maskPhoneUsHint")
        case .zip: return CivLocale.shared.t("maskZipHint")
        case .zip4: return CivLocale.shared.t("maskZip4Hint")
        case .ein: return CivLocale.shared.t("maskEinHint")
        case .currency: return CivLocale.shared.t("maskCurrencyHint")
        default: return ""
        }
    }

    /// Keyboard type to use for this mask.
    var keyboardType: UIKeyboardType {
        switch self {
        case .currency: return .decimalPad
        default: return pattern.isEmpty ? .default : .numberPad
        }
    }
}

/// Accessible text input component for government applications.
///
/// Implements the CivUI form field pattern:
/// - Visible label (required for Section 508)
/// - Optional hint text with expected format
/// - Error message with immediate VoiceOver announcement
/// - Input masking for SSN, phone, zip, EIN, currency
/// - Readonly mode
/// - Two-color focus ring (WCAG 2.2 SC 2.4.13)
/// - Dark mode adaptive colors
///
/// Usage:
/// ```swift
/// CivTextInput(
///     label: "Social Security number",
///     value: $ssn,
///     mask: .ssn
/// )
/// ```
public struct CivTextInput: View {
    // MARK: - Properties

    /// Visible label text (required — never use placeholder as sole label).
    public let label: String

    /// Bound input value (stores raw unformatted value).
    @Binding public var value: String

    /// Help text shown below the label (e.g., "For example: 01/15/1990").
    public var hint: String?

    /// Error message. When set, renders with VoiceOver announcement.
    public var error: String?

    /// Whether the field is required. Shows asterisk and sets accessibility trait.
    public var isRequired: Bool

    /// Whether the field is disabled.
    public var isDisabled: Bool

    /// Whether the field is readonly (visible but not editable).
    public var isReadonly: Bool

    /// Placeholder text (never use as sole label).
    public var placeholder: String?

    /// Input type controlling keyboard and secure entry.
    public var inputType: CivInputType

    /// Width variant.
    public var width: CivInputWidth

    /// Input mask preset.
    public var mask: CivInputMask

    /// Maximum number of characters allowed. When set, truncates input to this length.
    public var maxLength: Int?

    /// Minimum number of characters expected. Stored for validation; not enforced during input.
    public var minLength: Int?

    /// Called on every value change (parallels `civ-input` event).
    public var onInput: ((String) -> Void)?

    /// Called on committed change / focus loss (parallels `civ-change` event).
    public var onChange: ((String) -> Void)?

    /// Called for analytics tracking (parallels `civ-analytics` event).
    public var onAnalytics: ((String, [String: Any]?) -> Void)?

    /// Custom mask pattern. `#` = digit, `A` = letter, `*` = any character.
    /// When set, overrides the `mask` preset pattern.
    public var maskPattern: String

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

    /// Regex pattern for input validation.
    public var pattern: String

    /// Whether to hide the character count indicator.
    public var hideCharCount: Bool

    /// HTML autocomplete attribute value.
    public var autocomplete: String

    /// HTML inputmode attribute value.
    public var inputmode: String

    /// Text prefix displayed before the input (e.g., "$").
    public var prefix: String

    /// Text suffix displayed after the input (e.g., "lbs").
    public var suffix: String

    /// Whether to show a clear button.
    public var clearable: Bool

    /// Leading icon name.
    public var leadingIcon: String

    /// Accessible label for the leading icon.
    public var leadingIconLabel: String

    /// Trailing icon name.
    public var trailingIcon: String

    /// Accessible label for the trailing icon.
    public var trailingIconLabel: String

    /// Currency mask only: decimal places (0 = whole-dollar mode).
    public var decimals: Int

    /// Currency mask only: minimum allowed amount.
    public var min: Double?

    /// Currency mask only: maximum allowed amount.
    public var max: Double?

    /// Currency mask only: accept negative amounts.
    public var allowNegative: Bool

    /// Mask display mode (e.g., "blur", "always").
    public var maskMode: String

    /// Declarative validation type (e.g., "email", "phone").
    public var validateType: String

    // MARK: - Internal State

    @FocusState private var isFocused: Bool
    @Environment(\.colorScheme) private var colorScheme

    // MARK: - Initializer

    public init(
        label: String,
        value: Binding<String>,
        hint: String? = nil,
        error: String? = nil,
        isRequired: Bool = false,
        isDisabled: Bool = false,
        isReadonly: Bool = false,
        placeholder: String? = nil,
        maxLength: Int? = nil,
        minLength: Int? = nil,
        inputType: CivInputType = .text,
        width: CivInputWidth = .full,
        mask: CivInputMask = .none,
        onInput: ((String) -> Void)? = nil,
        onChange: ((String) -> Void)? = nil,
        onAnalytics: ((String, [String: Any]?) -> Void)? = nil,
        maskPattern: String = "",
        formState: CivFormState? = nil,
        formName: String? = nil,
        requiredMessage: String? = nil,
        formValidate: (() -> String?)? = nil,
        isPii: Bool = false,
        pattern: String = "",
        hideCharCount: Bool = false,
        autocomplete: String = "",
        inputmode: String = "",
        prefix: String = "",
        suffix: String = "",
        clearable: Bool = false,
        leadingIcon: String = "",
        leadingIconLabel: String = "",
        trailingIcon: String = "",
        trailingIconLabel: String = "",
        maskMode: String = "blur",
        validateType: String = "",
        decimals: Int = 2,
        min: Double? = nil,
        max: Double? = nil,
        allowNegative: Bool = false
    ) {
        self.label = label
        self._value = value
        self.hint = hint
        self.error = error
        self.isRequired = isRequired
        self.isDisabled = isDisabled
        self.isReadonly = isReadonly
        self.placeholder = placeholder
        self.maxLength = maxLength
        self.minLength = minLength
        self.inputType = inputType
        self.width = width
        self.mask = mask
        self.onInput = onInput
        self.onChange = onChange
        self.onAnalytics = onAnalytics
        self.maskPattern = maskPattern
        self.formState = formState
        self.formName = formName
        self.requiredMessage = requiredMessage
        self.formValidate = formValidate
        self.isPii = isPii
        self.pattern = pattern
        self.hideCharCount = hideCharCount
        self.autocomplete = autocomplete
        self.inputmode = inputmode
        self.prefix = prefix
        self.suffix = suffix
        self.clearable = clearable
        self.leadingIcon = leadingIcon
        self.leadingIconLabel = leadingIconLabel
        self.trailingIcon = trailingIcon
        self.trailingIconLabel = trailingIconLabel
        self.maskMode = maskMode
        self.validateType = validateType
        self.decimals = decimals
        self.min = min
        self.max = max
        self.allowNegative = allowNegative
    }

    // MARK: - Body

    public var body: some View {
        VStack(alignment: .leading, spacing: CivTokens.Spacing._1) {
            // 1. Label
            labelView

            // 2. Hint
            if let effectiveHint {
                Text(effectiveHint)
                    .font(.system(size: CivTokens.Typography.FontSize.sm))
                    .foregroundColor(adaptiveColor(
                        light: CivTokens.Colors.Base.dark,
                        dark: CivTokens.DarkColors.Base.dark
                    ))
                    .accessibilityIdentifier("civ-hint")
            }

            // 3. Error
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

            // 4. Input
            if mask == .currency {
                currencyInputField
            } else {
                inputField
            }
        }
        .padding(.bottom, CivTokens.Spacing._4)
        .accessibilityElement(children: .contain)
        .onChange(of: error) { newError in
            if let newError, !newError.isEmpty {
                UIAccessibility.post(notification: .announcement, argument: newError)
            }
        }
        .onAppear { registerWithFormState() }
        .onDisappear { unregisterFromFormState() }
        .onChange(of: value) { newValue in
            if let maxLength, newValue.count > maxLength {
                value = String(newValue.prefix(maxLength))
            }
        }
    }

    // MARK: - Form State Registration

    private func registerWithFormState() {
        guard let formState, let formName, !formName.isEmpty else { return }
        formState.register(CivFormState.CivFieldRegistration(
            name: formName,
            label: label,
            getValue: { value },
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

    // MARK: - Effective Hint

    /// Returns the mask hint if no explicit hint is provided.
    private var effectiveHint: String? {
        if let hint, !hint.isEmpty { return hint }
        let maskHint = mask.hint
        return maskHint.isEmpty ? nil : maskHint
    }

    // MARK: - Subviews

    private var labelView: some View {
        HStack(spacing: CivTokens.Spacing._0_5) {
            Text(label)
                .font(.system(size: CivTokens.Typography.FontSize.base,
                              weight: CivTokens.Typography.FontWeight.bold))
                .foregroundColor(adaptiveColor(
                    light: CivTokens.Colors.Base.darkest,
                    dark: CivTokens.DarkColors.Base.darkest
                ))

            if isRequired {
                Text("*")
                    .font(.system(size: CivTokens.Typography.FontSize.base,
                                  weight: CivTokens.Typography.FontWeight.bold))
                    .foregroundColor(adaptiveColor(
                        light: CivTokens.Colors.Error.default_,
                        dark: CivTokens.DarkColors.Error.default_
                    ))
                    .accessibilityLabel("required")
            }
        }
    }

    @ViewBuilder
    private var inputField: some View {
        let field = Group {
            if isReadonly {
                Text(displayValue)
                    .font(.system(size: CivTokens.Typography.FontSize.base))
                    .frame(maxWidth: .infinity, alignment: .leading)
            } else if inputType == .password {
                SecureField(placeholder ?? "", text: inputBinding)
                    .textFieldStyle(.plain)
            } else {
                TextField(placeholder ?? "", text: inputBinding)
                    .textFieldStyle(.plain)
                    .keyboardType(effectiveKeyboardType)
                    .textContentType(contentType)
                    .textInputAutocapitalization(autocapitalization)
            }
        }
        .font(.system(size: CivTokens.Typography.FontSize.base))
        .padding(.horizontal, CivTokens.Spacing._2)
        .padding(.vertical, CivTokens.Spacing._1_5)
        .background(adaptiveColor(
            light: isReadonly
                ? CivTokens.Colors.Base.lightest
                : CivTokens.Colors.White.default_,
            dark: isReadonly
                ? CivTokens.DarkColors.Base.lightest
                : CivTokens.DarkColors.White.default_
        ))
        .cornerRadius(CivTokens.Border.Radius.default_)
        .overlay(borderOverlay)
        .civFocusRing(isFocused)
        .focused($isFocused)
        .disabled(isDisabled || isReadonly)
        .opacity(isDisabled ? 0.5 : 1.0)
        .frame(maxWidth: width.points ?? .infinity, alignment: .leading)
        // Accessibility
        .accessibilityLabel(accessibilityLabelText)
        .accessibilityHint(accessibilityHintText)
        .accessibilityValue(displayValue)
        .accessibilityAddTraits(isRequired ? .startsMediaSession : [])

        if #available(iOS 17.0, *) {
            field
                .onChange(of: isFocused) { oldValue, newValue in
                    if oldValue && !newValue {
                        onChange?(value)
                        onAnalytics?("change", ["value": value])
                    }
                }
        } else {
            field
                .onChange(of: isFocused) { newValue in
                    if !newValue {
                        onChange?(value)
                        onAnalytics?("change", ["value": value])
                    }
                }
        }
    }

    @ViewBuilder
    private var currencyInputField: some View {
        let field = HStack(spacing: 0) {
            Text("$")
                .font(.system(size: CivTokens.Typography.FontSize.base))
                .foregroundColor(adaptiveColor(
                    light: CivTokens.Colors.Base.dark,
                    dark: CivTokens.DarkColors.Base.dark
                ))
                .padding(.leading, CivTokens.Spacing._2)

            if isReadonly {
                Text(formattedCurrencyValue)
                    .font(.system(size: CivTokens.Typography.FontSize.base))
                    .frame(maxWidth: .infinity, alignment: .trailing)
                    .padding(.trailing, CivTokens.Spacing._2)
            } else {
                TextField(placeholder ?? "0.00", text: currencyBinding)
                    .textFieldStyle(.plain)
                    .keyboardType(.decimalPad)
                    .multilineTextAlignment(.trailing)
                    .padding(.trailing, CivTokens.Spacing._2)
            }
        }
        .font(.system(size: CivTokens.Typography.FontSize.base))
        .padding(.vertical, CivTokens.Spacing._1_5)
        .background(adaptiveColor(
            light: isReadonly
                ? CivTokens.Colors.Base.lightest
                : CivTokens.Colors.White.default_,
            dark: isReadonly
                ? CivTokens.DarkColors.Base.lightest
                : CivTokens.DarkColors.White.default_
        ))
        .cornerRadius(CivTokens.Border.Radius.default_)
        .overlay(borderOverlay)
        .civFocusRing(isFocused)
        .focused($isFocused)
        .disabled(isDisabled || isReadonly)
        .opacity(isDisabled ? 0.5 : 1.0)
        .frame(maxWidth: width.points ?? .infinity, alignment: .leading)
        .accessibilityLabel(accessibilityLabelText)
        .accessibilityHint(accessibilityHintText)
        .accessibilityValue(formattedCurrencyValue)

        if #available(iOS 17.0, *) {
            field
                .onChange(of: isFocused) { oldValue, newValue in
                    if oldValue && !newValue {
                        onChange?(value)
                        onAnalytics?("change", ["value": value])
                    }
                }
        } else {
            field
                .onChange(of: isFocused) { newValue in
                    if !newValue {
                        onChange?(value)
                        onAnalytics?("change", ["value": value])
                    }
                }
        }
    }

    // MARK: - Display Value

    /// The effective mask pattern — custom maskPattern takes precedence over preset.
    private var effectivePattern: String {
        if !maskPattern.isEmpty { return maskPattern }
        return mask.pattern
    }

    /// Returns the formatted display value based on mask.
    private var displayValue: String {
        let pattern = effectivePattern
        guard !pattern.isEmpty else { return value }
        return CivTextInput.applyMask(value, pattern: pattern)
    }

    /// Returns the formatted currency value for display.
    private var formattedCurrencyValue: String {
        guard !value.isEmpty else { return "" }
        guard let num = Double(value), !num.isNaN else { return value }
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        formatter.minimumFractionDigits = 2
        formatter.maximumFractionDigits = 2
        return formatter.string(from: NSNumber(value: num)) ?? value
    }

    // MARK: - Mask Helpers

    /// Applies a mask pattern to a raw string.
    /// `#` = digit slot, `A` = letter slot, `*` = any character slot; other characters are literals.
    static func applyMask(_ raw: String, pattern: String) -> String {
        var result = ""
        var rawIndex = raw.startIndex
        for ch in pattern {
            guard rawIndex < raw.endIndex else { break }
            if ch == "#" || ch == "A" || ch == "*" {
                result.append(raw[rawIndex])
                rawIndex = raw.index(after: rawIndex)
            } else {
                result.append(ch)
            }
        }
        return result
    }

    /// Strips characters from a string keeping only those matching mask slot types.
    /// For digit-only masks, strips non-digits. For mixed masks, strips non-alphanumerics.
    static func stripToDigits(_ text: String) -> String {
        text.filter { $0.isNumber }
    }

    /// Strips a string keeping only characters valid for the given mask pattern.
    static func stripForPattern(_ text: String, pattern: String) -> String {
        let hasLetterSlot = pattern.contains("A")
        let hasAnySlot = pattern.contains("*")
        if hasAnySlot {
            // Keep all alphanumeric characters
            return text.filter { $0.isLetter || $0.isNumber }
        } else if hasLetterSlot {
            // Keep letters and digits
            return text.filter { $0.isLetter || $0.isNumber }
        } else {
            // Digit-only mask
            return text.filter { $0.isNumber }
        }
    }

    /// Returns the maximum raw character count for the current mask.
    private var maskMaxDigits: Int? {
        let pattern = effectivePattern
        guard !pattern.isEmpty else { return nil }
        return pattern.filter { $0 == "#" || $0 == "A" || $0 == "*" }.count
    }

    // MARK: - Border

    private var borderOverlay: some View {
        RoundedRectangle(cornerRadius: CivTokens.Border.Radius.default_)
            .stroke(borderColor, lineWidth: error != nil
                ? CivTokens.Border.Width._2
                : CivTokens.Border.Width.default_)
    }

    private var borderColor: Color {
        if error != nil {
            return adaptiveColor(
                light: CivTokens.Colors.Error.default_,
                dark: CivTokens.DarkColors.Error.default_
            )
        }
        return adaptiveColor(
            light: CivTokens.Colors.Base.light,
            dark: CivTokens.DarkColors.Base.light
        )
    }

    // MARK: - Input Binding (fires onInput on every change)

    private var inputBinding: Binding<String> {
        Binding(
            get: { displayValue },
            set: { newValue in
                let pattern = effectivePattern
                if !pattern.isEmpty {
                    // Strip to raw characters valid for the pattern and limit to max
                    var raw = CivTextInput.stripForPattern(newValue, pattern: pattern)
                    if let max = maskMaxDigits, raw.count > max {
                        raw = String(raw.prefix(max))
                    }
                    value = raw
                } else if mask != .none {
                    var raw = CivTextInput.stripToDigits(newValue)
                    if let max = maskMaxDigits, raw.count > max {
                        raw = String(raw.prefix(max))
                    }
                    value = raw
                } else {
                    value = newValue
                }
                onInput?(value)
            }
        )
    }

    private var currencyBinding: Binding<String> {
        Binding(
            get: { value },
            set: { newValue in
                // Allow only digits and one decimal point, max 2 decimal places
                var raw = newValue.filter { $0.isNumber || $0 == "." }
                let parts = raw.split(separator: ".", omittingEmptySubsequences: false)
                if parts.count > 2 {
                    raw = parts[0] + "." + parts.dropFirst().joined()
                }
                let finalParts = raw.split(separator: ".", omittingEmptySubsequences: false)
                if finalParts.count == 2 && finalParts[1].count > 2 {
                    raw = finalParts[0] + "." + finalParts[1].prefix(2)
                }
                value = raw
                onInput?(value)
            }
        )
    }

    // MARK: - Keyboard & Content Type Mapping

    private var effectiveKeyboardType: UIKeyboardType {
        if !maskPattern.isEmpty {
            // Custom mask: use default keyboard if pattern has letter/any slots
            let hasLetters = maskPattern.contains("A") || maskPattern.contains("*")
            return hasLetters ? .default : .numberPad
        }
        if mask != .none { return mask.keyboardType }
        switch inputType {
        case .email: return .emailAddress
        case .number: return .decimalPad
        case .telephone: return .phonePad
        case .url: return .URL
        case .search: return .default
        case .text, .password: return .default
        }
    }

    private var contentType: UITextContentType? {
        switch inputType {
        case .email: return .emailAddress
        case .telephone: return .telephoneNumber
        case .url: return .URL
        case .password: return .password
        default: return nil
        }
    }

    private var autocapitalization: TextInputAutocapitalization {
        switch inputType {
        case .email, .url: return .never
        default: return .sentences
        }
    }

    // MARK: - Accessibility

    private var accessibilityLabelText: String {
        var parts = [label]
        if isRequired { parts.append("required") }
        if isReadonly { parts.append("read only") }
        return parts.joined(separator: ", ")
    }

    private var accessibilityHintText: String {
        var parts: [String] = []
        if let effectiveHint { parts.append(effectiveHint) }
        if let error, !error.isEmpty { parts.append("Error: \(error)") }
        return parts.joined(separator: ". ")
    }

    // MARK: - Color Helper

    private func adaptiveColor(light: Color, dark: Color) -> Color {
        colorScheme == .dark ? dark : light
    }
}

// MARK: - Preview

#if DEBUG
struct CivTextInput_Previews: PreviewProvider {
    struct PreviewWrapper: View {
        @State private var email = ""
        @State private var name = "Jane Doe"
        @State private var ssn = ""
        @State private var phone = ""
        @State private var amount = ""

        var body: some View {
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    CivTextInput(
                        label: "Full name",
                        value: $name,
                        hint: "First and last name",
                        isRequired: true
                    )

                    CivTextInput(
                        label: "Email address",
                        value: $email,
                        hint: "For example: name@agency.gov",
                        error: email.isEmpty ? nil : (email.contains("@") ? nil : "Enter a valid email address"),
                        isRequired: true,
                        inputType: .email
                    )

                    CivTextInput(
                        label: "Social Security number",
                        value: $ssn,
                        isRequired: true,
                        mask: .ssn
                    )

                    CivTextInput(
                        label: "Phone number",
                        value: $phone,
                        mask: .phoneUS,
                        onInput: { print("phone: \($0)") }
                    )

                    CivTextInput(
                        label: "Amount",
                        value: $amount,
                        mask: .currency
                    )

                    CivTextInput(
                        label: "Case ID",
                        value: .constant("GOV-2024-001"),
                        isReadonly: true
                    )

                    CivTextInput(
                        label: "Notes",
                        value: .constant(""),
                        isDisabled: true,
                        placeholder: "Disabled field"
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
