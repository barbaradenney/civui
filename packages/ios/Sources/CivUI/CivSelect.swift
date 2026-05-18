// CivUI — CivSelect for SwiftUI
// Accessible dropdown select following government design system patterns.
// Renders: label → hint → error → picker (Section 508 compliant)

import SwiftUI

/// A single option for CivSelect (parallels web `SelectOption` interface).
public struct CivSelectOption: Identifiable, Hashable {
    public let id: String
    public let value: String
    public let label: String
    public let isDisabled: Bool

    public init(value: String, label: String, isDisabled: Bool = false) {
        self.id = value
        self.value = value
        self.label = label
        self.isDisabled = isDisabled
    }
}

/// Accessible dropdown select for government applications.
///
/// Implements the CivUI form field pattern with:
/// - Visible label (required for Section 508)
/// - Optional hint text
/// - Error message with VoiceOver announcement
/// - Empty/placeholder option
/// - Dark mode adaptive colors
///
/// Usage:
/// ```swift
/// CivSelect(
///     label: "State",
///     value: $state,
///     options: [
///         CivSelectOption(value: "CA", label: "California"),
///         CivSelectOption(value: "NY", label: "New York"),
///     ]
/// )
/// ```
public struct CivSelect: View {
    // MARK: - Properties

    /// Visible label text (required — never use placeholder as sole label).
    public let label: String

    /// Bound selected value.
    @Binding public var value: String

    /// Available options.
    public var options: [CivSelectOption]

    /// Help text shown below the label.
    public var hint: String?

    /// Error message. When set, renders with VoiceOver announcement.
    public var error: String?

    /// Whether the field is required.
    public var isRequired: Bool

    /// Whether the field is disabled.
    public var isDisabled: Bool

    /// Whether the field is read-only (visible but non-interactive, no opacity change).
    public var isReadonly: Bool

    /// Label for the empty/default option (parallels web `empty-label`).
    public var emptyLabel: String

    /// Called on value change (parallels `civ-input` and `civ-change` events).
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

    /// Width variant for the select field (e.g., "full", "auto").
    public var width: String

    /// Density variant — "default" or "sm" (compact). Suppresses chrome
    /// for use in dense surfaces like data-grid cell editors.
    public var spacing: String

    /// Autocomplete hint for the browser/OS.
    public var autocomplete: String

    /// Preset option set name (e.g., "us-states", "countries").
    public var preset: String

    /// Preset variant (e.g., "abbreviated", "full").
    public var presetVariant: String

    // MARK: - Internal State

    @Environment(\.colorScheme) private var colorScheme

    // MARK: - Initializer

    public init(
        label: String,
        value: Binding<String>,
        options: [CivSelectOption],
        hint: String? = nil,
        error: String? = nil,
        isRequired: Bool = false,
        isDisabled: Bool = false,
        isReadonly: Bool = false,
        emptyLabel: String? = nil,
        onChange: ((String) -> Void)? = nil,
        onAnalytics: ((String, [String: Any]?) -> Void)? = nil,
        formState: CivFormState? = nil,
        formName: String? = nil,
        requiredMessage: String? = nil,
        formValidate: (() -> String?)? = nil,
        isPii: Bool = false,
        width: String = "full",
        spacing: String = "default",
        autocomplete: String = "",
        preset: String = "",
        presetVariant: String = ""
    ) {
        self.label = label
        self._value = value
        self.options = options
        self.hint = hint
        self.error = error
        self.isRequired = isRequired
        self.isDisabled = isDisabled
        self.isReadonly = isReadonly
        self.emptyLabel = emptyLabel ?? CivLocale.shared.t("selectEmpty")
        self.onChange = onChange
        self.onAnalytics = onAnalytics
        self.formState = formState
        self.formName = formName
        self.requiredMessage = requiredMessage
        self.formValidate = formValidate
        self.isPii = isPii
        self.width = width
        self.spacing = spacing
        self.autocomplete = autocomplete
        self.preset = preset
        self.presetVariant = presetVariant
    }

    // MARK: - Body

    public var body: some View {
        VStack(alignment: .leading, spacing: CivTokens.Spacing._1) {
            // 1. Label
            labelView

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

            // 4. Picker
            pickerField
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

    private var pickerField: some View {
        Picker(selection: selectBinding, label: EmptyView()) {
            Text(emptyLabel).tag("")
            ForEach(options) { option in
                Text(option.label)
                    .tag(option.value)
            }
        }
        .pickerStyle(.menu)
        .font(.system(size: CivTokens.Typography.FontSize.base))
        .padding(.horizontal, CivTokens.Spacing._2)
        .padding(.vertical, CivTokens.Spacing._1_5)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(adaptiveColor(
            light: CivTokens.Colors.White.default_,
            dark: CivTokens.DarkColors.White.default_
        ))
        .cornerRadius(CivTokens.Border.Radius.default_)
        .overlay(borderOverlay)
        .disabled(isDisabled || isReadonly)
        .opacity(isDisabled ? 0.5 : 1.0)
        .accessibilityLabel(accessibilityLabelText)
        .accessibilityHint(accessibilityHintText)
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

    // MARK: - Select Binding

    private var selectBinding: Binding<String> {
        Binding(
            get: { value },
            set: { newValue in
                value = newValue
                onChange?(newValue)
                onAnalytics?("change", ["value": newValue])
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
struct CivSelect_Previews: PreviewProvider {
    struct PreviewWrapper: View {
        @State private var state = ""
        @State private var branch = "executive"

        var body: some View {
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    CivSelect(
                        label: "State or territory",
                        value: $state,
                        options: [
                            CivSelectOption(value: "CA", label: "California"),
                            CivSelectOption(value: "DC", label: "District of Columbia"),
                            CivSelectOption(value: "NY", label: "New York"),
                            CivSelectOption(value: "TX", label: "Texas"),
                        ],
                        hint: "Select your state of residence",
                        isRequired: true
                    )

                    CivSelect(
                        label: "Branch of government",
                        value: $branch,
                        options: [
                            CivSelectOption(value: "executive", label: "Executive"),
                            CivSelectOption(value: "legislative", label: "Legislative"),
                            CivSelectOption(value: "judicial", label: "Judicial"),
                        ]
                    )

                    CivSelect(
                        label: "Agency",
                        value: .constant(""),
                        options: [],
                        error: "Please select an agency",
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
