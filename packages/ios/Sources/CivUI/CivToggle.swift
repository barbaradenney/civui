// CivUI — CivToggle for SwiftUI
// Accessible toggle switch following government design system patterns.
// Renders: switch → label → description → hint → error (Section 508 compliant)

import SwiftUI

/// Accessible toggle switch for government applications.
///
/// Uses SwiftUI's native Toggle with a switch style, matching the web
/// component's `role="switch"` semantics. Renders switch before label
/// (like iOS/Android settings).
///
/// The web component dispatches `{ checked, value }` detail — the `onChange`
/// callback mirrors this with both parameters.
///
/// Usage:
/// ```swift
/// CivToggle(
///     label: "Enable notifications",
///     checked: $notificationsEnabled,
///     description: "Receive push notifications for status updates"
/// )
/// ```
public struct CivToggle: View {
    // MARK: - Properties

    /// Visible label text displayed beside the toggle.
    public let label: String

    /// Bound checked state.
    @Binding public var checked: Bool

    /// Form value submitted when checked (defaults to "on").
    public var value: String

    /// Optional description shown below the label.
    public var description: String?

    /// Help text shown below the toggle.
    public var hint: String?

    /// Error message. When set, renders with VoiceOver announcement.
    public var error: String?

    /// Whether the field is required.
    public var isRequired: Bool

    /// Whether the field is disabled.
    public var isDisabled: Bool

    /// Called on every checked state change (parallels `civ-input`/`civ-change` events).
    /// Parameters: (checked: Bool, value: String)
    public var onChange: ((Bool, String) -> Void)?

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
        label: String,
        checked: Binding<Bool>,
        value: String = "on",
        description: String? = nil,
        hint: String? = nil,
        error: String? = nil,
        isRequired: Bool = false,
        isDisabled: Bool = false,
        onChange: ((Bool, String) -> Void)? = nil,
        onAnalytics: ((String, [String: Any]?) -> Void)? = nil,
        formState: CivFormState? = nil,
        formName: String? = nil,
        requiredMessage: String? = nil,
        formValidate: (() -> String?)? = nil,
        isPii: Bool = false
    ) {
        self.label = label
        self._checked = checked
        self.value = value
        self.description = description
        self.hint = hint
        self.error = error
        self.isRequired = isRequired
        self.isDisabled = isDisabled
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
            // 1. Switch + Label (switch rendered before label like iOS/Android settings)
            HStack(alignment: .center, spacing: CivTokens.Spacing._3) {
                Toggle("", isOn: toggleBinding)
                    .toggleStyle(.switch)
                    .labelsHidden()
                    .tint(adaptiveColor(
                        light: CivTokens.Colors.Primary.default_,
                        dark: CivTokens.DarkColors.Primary.default_
                    ))

                VStack(alignment: .leading, spacing: CivTokens.Spacing._0_5) {
                    HStack(spacing: CivTokens.Spacing._0_5) {
                        Text(label)
                            .font(.system(size: CivTokens.Typography.FontSize.base))
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

                    if let description, !description.isEmpty {
                        Text(description)
                            .font(.system(size: CivTokens.Typography.FontSize.sm))
                            .foregroundColor(adaptiveColor(
                                light: CivTokens.Colors.Base.dark,
                                dark: CivTokens.DarkColors.Base.dark
                            ))
                    }
                }
            }

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
        }
        .padding(.bottom, CivTokens.Spacing._2)
        .disabled(isDisabled)
        .opacity(isDisabled ? 0.5 : 1.0)
        .accessibilityElement(children: .combine)
        .accessibilityLabel(accessibilityLabelText)
        .accessibilityValue(checked ? "on" : "off")
        .accessibilityHint(accessibilityHintText)
        .onChange(of: error) { newError in
            if let newError, !newError.isEmpty {
                UIAccessibility.post(notification: .announcement, argument: newError)
            }
        }
        .onAppear { registerWithFormState() }
        .onDisappear { unregisterFromFormState() }
    }

    // MARK: - Form State Registration

    private func registerWithFormState() {
        guard let formState, let formName, !formName.isEmpty else { return }
        formState.register(CivFormState.CivFieldRegistration(
            name: formName,
            label: label,
            getValue: { checked ? value : "" },
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

    // MARK: - Toggle Binding

    private var toggleBinding: Binding<Bool> {
        Binding(
            get: { checked },
            set: { newValue in
                checked = newValue
                onChange?(newValue, value)
                onAnalytics?("change", ["checked": newValue, "value": value])
            }
        )
    }

    // MARK: - Accessibility

    private var accessibilityLabelText: String {
        var parts = [label]
        if isRequired { parts.append("required") }
        return parts.joined(separator: ", ")
    }

    private var accessibilityHintText: String {
        var parts: [String] = []
        if let description, !description.isEmpty { parts.append(description) }
        if let hint, !hint.isEmpty { parts.append(hint) }
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
struct CivToggle_Previews: PreviewProvider {
    struct PreviewWrapper: View {
        @State private var notifications = true
        @State private var darkMode = false
        @State private var twoFactor = false

        var body: some View {
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    CivToggle(
                        label: "Enable notifications",
                        checked: $notifications,
                        description: "Receive push notifications for status updates"
                    )

                    CivToggle(
                        label: "Dark mode",
                        checked: $darkMode,
                        hint: "Uses your device color scheme when off"
                    )

                    CivToggle(
                        label: "Two-factor authentication",
                        checked: $twoFactor,
                        description: "Require a verification code when signing in",
                        isRequired: true
                    )

                    CivToggle(
                        label: "Disabled toggle",
                        checked: .constant(true),
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
