// CivUI — CivYesNo for SwiftUI
// Accessible yes/no binary choice following government design system patterns.
// Renders: legend → hint → error → button pair (Section 508 compliant)

import SwiftUI

/// Accessible yes/no binary choice for government applications.
///
/// Renders two styled buttons (Yes/No) in an HStack. The selected button
/// uses a primary background with white text; the unselected button uses
/// a white background with a border. Mirrors the web `civ-yes-no` component.
///
/// VoiceOver announces "Yes, selected" or "No, selected" for the active choice.
///
/// Usage:
/// ```swift
/// CivYesNo(
///     legend: "Are you a U.S. citizen?",
///     value: $isCitizen,
///     hint: "Select one option"
/// )
/// ```
public struct CivYesNo: View {
    // MARK: - Properties

    /// Legend text displayed above the button pair.
    public let legend: String

    /// Bound value: "yes", "no", or "" (no selection).
    @Binding public var value: String

    /// Help text shown below the legend.
    public var hint: String?

    /// Error message. When set, renders with VoiceOver announcement.
    public var error: String?

    /// Whether the field is required.
    public var isRequired: Bool

    /// Whether the field is disabled.
    public var isDisabled: Bool

    /// Whether the field is read-only (visible but non-interactive).
    public var isReadonly: Bool

    /// Custom label for the "Yes" button.
    public var yesLabel: String

    /// Custom label for the "No" button.
    public var noLabel: String

    /// Optional label for a third button. When non-empty, a third option is rendered.
    public var unsureLabel: String

    /// Form value for the third option (default: "unsure").
    public var unsureValue: String

    /// Called on value change (parallels `civ-change` event).
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

    /// Whether the field contains PII (excluded from getFormData).
    public var isPii: Bool

    // MARK: - Internal State

    @Environment(\.colorScheme) private var colorScheme

    // MARK: - Initializer

    public init(
        legend: String,
        value: Binding<String>,
        hint: String? = nil,
        error: String? = nil,
        isRequired: Bool = false,
        isDisabled: Bool = false,
        isReadonly: Bool = false,
        yesLabel: String = "Yes",
        noLabel: String = "No",
        unsureLabel: String = "",
        unsureValue: String = "unsure",
        onChange: ((String) -> Void)? = nil,
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
        self.isRequired = isRequired
        self.isDisabled = isDisabled
        self.isReadonly = isReadonly
        self.yesLabel = yesLabel
        self.noLabel = noLabel
        self.unsureLabel = unsureLabel
        self.unsureValue = unsureValue
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

            // 4. Button pair
            HStack(spacing: CivTokens.Spacing._3) {
                choiceButton(label: yesLabel, choiceValue: "yes")
                choiceButton(label: noLabel, choiceValue: "no")
                if !unsureLabel.isEmpty {
                    choiceButton(label: unsureLabel, choiceValue: unsureValue)
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

    private func choiceButton(label: String, choiceValue: String) -> some View {
        let isSelected = value == choiceValue

        return Button(action: {
            guard !isDisabled && !isReadonly else { return }
            value = choiceValue
            onChange?(choiceValue)
            onAnalytics?("change", ["value": choiceValue])
        }) {
            Text(label)
                .font(.system(size: CivTokens.Typography.FontSize.base,
                              weight: CivTokens.Typography.FontWeight.semibold))
                .padding(.horizontal, CivTokens.Spacing._6)
                .padding(.vertical, CivTokens.Spacing._2_5)
                .foregroundColor(isSelected
                    ? adaptiveColor(light: CivTokens.Colors.White.default_,
                                    dark: CivTokens.DarkColors.White.default_)
                    : adaptiveColor(light: CivTokens.Colors.Primary.default_,
                                    dark: CivTokens.DarkColors.Primary.default_))
                .background(isSelected
                    ? adaptiveColor(light: CivTokens.Colors.Primary.default_,
                                    dark: CivTokens.DarkColors.Primary.default_)
                    : adaptiveColor(light: CivTokens.Colors.White.default_,
                                    dark: CivTokens.DarkColors.White.default_))
                .cornerRadius(CivTokens.Border.Radius.default_)
                .overlay(
                    RoundedRectangle(cornerRadius: CivTokens.Border.Radius.default_)
                        .stroke(
                            adaptiveColor(
                                light: CivTokens.Colors.Primary.default_,
                                dark: CivTokens.DarkColors.Primary.default_
                            ),
                            lineWidth: CivTokens.Border.Width._2
                        )
                )
        }
        .accessibilityLabel("\(label)\(isSelected ? ", selected" : "")")
        .accessibilityAddTraits(isSelected ? [.isSelected] : [])
    }

    // MARK: - Form State Registration

    private func registerWithFormState() {
        guard let formState, let formName, !formName.isEmpty else { return }
        formState.register(CivFormState.CivFieldRegistration(
            name: formName,
            label: legend,
            getValue: { value },
            setValue: { newValue in value = newValue },
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
struct CivYesNo_Previews: PreviewProvider {
    struct PreviewWrapper: View {
        @State private var citizen = ""
        @State private var veteran = "yes"

        var body: some View {
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    CivYesNo(
                        legend: "Are you a U.S. citizen?",
                        value: $citizen,
                        hint: "Select one option",
                        isRequired: true
                    )

                    CivYesNo(
                        legend: "Are you a veteran?",
                        value: $veteran
                    )

                    CivYesNo(
                        legend: "Do you have a service-connected disability?",
                        value: $citizen,
                        unsureLabel: "I'm not sure"
                    )

                    CivYesNo(
                        legend: "Disabled question",
                        value: .constant(""),
                        isDisabled: true
                    )

                    CivYesNo(
                        legend: "With error",
                        value: .constant(""),
                        error: "Please select an option",
                        isRequired: true
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
