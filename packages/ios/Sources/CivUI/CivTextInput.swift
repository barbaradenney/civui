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

/// Accessible text input component for government applications.
///
/// Implements the CivUI form field pattern:
/// - Visible label (required for Section 508)
/// - Optional hint text with expected format
/// - Error message with immediate VoiceOver announcement
/// - Two-color focus ring (WCAG 2.2 SC 2.4.13)
/// - Dark mode adaptive colors
///
/// Usage:
/// ```swift
/// CivTextInput(
///     label: "Email address",
///     value: $email,
///     hint: "For example: name@agency.gov",
///     inputType: .email
/// )
/// ```
public struct CivTextInput: View {
    // MARK: - Properties

    /// Visible label text (required — never use placeholder as sole label).
    public let label: String

    /// Bound input value.
    @Binding public var value: String

    /// Help text shown below the label (e.g., "For example: 01/15/1990").
    public var hint: String?

    /// Error message. When set, renders with VoiceOver announcement.
    public var error: String?

    /// Whether the field is required. Shows asterisk and sets accessibility trait.
    public var isRequired: Bool

    /// Whether the field is disabled.
    public var isDisabled: Bool

    /// Placeholder text (never use as sole label).
    public var placeholder: String?

    /// Input type controlling keyboard and secure entry.
    public var inputType: CivInputType

    /// Width variant.
    public var width: CivInputWidth

    /// Called on every value change (parallels `civ-input` event).
    public var onInput: ((String) -> Void)?

    /// Called on committed change / focus loss (parallels `civ-change` event).
    public var onChange: ((String) -> Void)?

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
        placeholder: String? = nil,
        inputType: CivInputType = .text,
        width: CivInputWidth = .full,
        onInput: ((String) -> Void)? = nil,
        onChange: ((String) -> Void)? = nil
    ) {
        self.label = label
        self._value = value
        self.hint = hint
        self.error = error
        self.isRequired = isRequired
        self.isDisabled = isDisabled
        self.placeholder = placeholder
        self.inputType = inputType
        self.width = width
        self.onInput = onInput
        self.onChange = onChange
    }

    // MARK: - Body

    public var body: some View {
        VStack(alignment: .leading, spacing: CivTokens.Spacing._1) {
            // 1. Label
            labelView

            // 2. Hint
            if let hint {
                Text(hint)
                    .font(.system(size: CivTokens.Typography.FontSize.sm))
                    .foregroundColor(adaptiveColor(
                        light: CivTokens.Colors.Base.dark,
                        dark: CivTokens.DarkColors.Base.dark
                    ))
                    .accessibilityIdentifier("civ-hint")
            }

            // 3. Error
            if let error {
                Text(error)
                    .font(.system(size: CivTokens.Typography.FontSize.sm,
                                  weight: CivTokens.Typography.FontWeight.bold))
                    .foregroundColor(adaptiveColor(
                        light: CivTokens.Colors.Error.default_,
                        dark: CivTokens.DarkColors.Error.default_
                    ))
                    .accessibilityIdentifier("civ-error")
                    // role="alert" equivalent — announce immediately
                    .accessibilityAddTraits(.updatesFrequently)
            }

            // 4. Input
            inputField
        }
        .padding(.bottom, CivTokens.Spacing._4)
        .accessibilityElement(children: .contain)
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
            if inputType == .password {
                SecureField(placeholder ?? "", text: inputBinding)
                    .textFieldStyle(.plain)
            } else {
                TextField(placeholder ?? "", text: inputBinding)
                    .textFieldStyle(.plain)
                    .keyboardType(keyboardType)
                    .textContentType(contentType)
                    .textInputAutocapitalization(autocapitalization)
            }
        }
        .font(.system(size: CivTokens.Typography.FontSize.base))
        .padding(.horizontal, CivTokens.Spacing._2)
        .padding(.vertical, CivTokens.Spacing._1_5)
        .background(adaptiveColor(
            light: CivTokens.Colors.White.default_,
            dark: CivTokens.DarkColors.White.default_
        ))
        .cornerRadius(CivTokens.Border.Radius.default_)
        .overlay(borderOverlay)
        .civFocusRing(isFocused)
        .focused($isFocused)
        .disabled(isDisabled)
        .opacity(isDisabled ? 0.5 : 1.0)
        .frame(maxWidth: width.points ?? .infinity, alignment: .leading)
        // Accessibility
        .accessibilityLabel(accessibilityLabelText)
        .accessibilityHint(accessibilityHintText)
        .accessibilityValue(value)
        .accessibilityAddTraits(isRequired ? .startsMediaSession : [])

        if #available(iOS 17.0, *) {
            field
                .onChange(of: isFocused) { oldValue, newValue in
                    if oldValue && !newValue {
                        onChange?(value)
                    }
                }
        } else {
            field
                .onChange(of: isFocused) { newValue in
                    if !newValue {
                        onChange?(value)
                    }
                }
        }
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
            get: { value },
            set: { newValue in
                value = newValue
                onInput?(newValue)
            }
        )
    }

    // MARK: - Keyboard & Content Type Mapping

    private var keyboardType: UIKeyboardType {
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
        return parts.joined(separator: ", ")
    }

    private var accessibilityHintText: String {
        var parts: [String] = []
        if let hint { parts.append(hint) }
        if let error { parts.append("Error: \(error)") }
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
                        label: "Phone number",
                        value: .constant(""),
                        hint: "For example: 202-555-0100",
                        inputType: .telephone,
                        width: .medium
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
