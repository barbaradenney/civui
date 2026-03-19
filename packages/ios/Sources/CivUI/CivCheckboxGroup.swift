// CivUI — CivCheckboxGroup for SwiftUI
// Accessible checkbox group following government design system patterns.
// Renders: legend → hint → error → [checkbox options] (Section 508 compliant)

import SwiftUI

/// Checkbox option definition for CivCheckboxGroup.
public struct CivCheckboxOption: Identifiable {
    public let id: String
    public let label: String
    public let value: String
    public var description: String?
    public var isDisabled: Bool

    public init(label: String, value: String, description: String? = nil, isDisabled: Bool = false) {
        self.id = value
        self.label = label
        self.value = value
        self.description = description
        self.isDisabled = isDisabled
    }
}

/// Accessible checkbox group for government applications.
///
/// Groups multiple checkboxes with a shared legend, hint, and error message.
/// Manages multi-select state via a `[String]` binding.
///
/// Usage:
/// ```swift
/// CivCheckboxGroup(
///     legend: "Select all that apply",
///     values: $selectedValues,
///     options: [
///         CivCheckboxOption(label: "Email updates", value: "email"),
///         CivCheckboxOption(label: "Text alerts", value: "sms"),
///         CivCheckboxOption(label: "Phone calls", value: "phone"),
///     ],
///     isRequired: true
/// )
/// ```
public struct CivCheckboxGroup: View {
    // MARK: - Properties

    /// Legend text for the group.
    public let legend: String

    /// Bound array of checked values.
    @Binding public var values: [String]

    /// Available checkbox options.
    public let options: [CivCheckboxOption]

    /// Help text shown below the legend.
    public var hint: String?

    /// Error message for the group.
    public var error: String?

    /// Whether at least one selection is required.
    public var isRequired: Bool

    /// Whether the group is disabled.
    public var isDisabled: Bool

    /// Whether to render in tile (card) style.
    public var isTile: Bool

    /// Called when the set of checked values changes.
    public var onChange: (([String]) -> Void)?

    // MARK: - Internal State

    @Environment(\.colorScheme) private var colorScheme

    // MARK: - Initializer

    public init(
        legend: String,
        values: Binding<[String]>,
        options: [CivCheckboxOption],
        hint: String? = nil,
        error: String? = nil,
        isRequired: Bool = false,
        isDisabled: Bool = false,
        isTile: Bool = false,
        onChange: (([String]) -> Void)? = nil
    ) {
        self.legend = legend
        self._values = values
        self.options = options
        self.hint = hint
        self.error = error
        self.isRequired = isRequired
        self.isDisabled = isDisabled
        self.isTile = isTile
        self.onChange = onChange
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
                    .accessibilityAddTraits(.updatesFrequently)
            }

            // 4. Checkbox options
            VStack(alignment: .leading, spacing: CivTokens.Spacing._2) {
                ForEach(options) { option in
                    CivCheckbox(
                        label: option.label,
                        checked: checkedBinding(for: option.value),
                        value: option.value,
                        description: option.description,
                        isDisabled: isDisabled || option.isDisabled,
                        isTile: isTile,
                        onChange: { checked, val in
                            if checked {
                                if !values.contains(val) {
                                    values.append(val)
                                }
                            } else {
                                values.removeAll { $0 == val }
                            }
                            onChange?(values)
                        }
                    )
                }
            }
        }
        .padding(.bottom, CivTokens.Spacing._4)
        .accessibilityElement(children: .contain)
    }

    // MARK: - Helpers

    private func checkedBinding(for value: String) -> Binding<Bool> {
        Binding(
            get: { values.contains(value) },
            set: { newValue in
                if newValue {
                    if !values.contains(value) {
                        values.append(value)
                    }
                } else {
                    values.removeAll { $0 == value }
                }
            }
        )
    }

    // MARK: - Subviews

    private var legendView: some View {
        HStack(spacing: CivTokens.Spacing._0_5) {
            Text(legend)
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

    // MARK: - Color Helper

    private func adaptiveColor(light: Color, dark: Color) -> Color {
        colorScheme == .dark ? dark : light
    }
}

// MARK: - Preview

#if DEBUG
struct CivCheckboxGroup_Previews: PreviewProvider {
    struct PreviewWrapper: View {
        @State private var notifications: [String] = ["email"]
        @State private var services: [String] = []

        var body: some View {
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    CivCheckboxGroup(
                        legend: "Notification preferences",
                        values: $notifications,
                        options: [
                            CivCheckboxOption(label: "Email updates", value: "email"),
                            CivCheckboxOption(label: "Text alerts", value: "sms"),
                            CivCheckboxOption(label: "Phone calls", value: "phone"),
                        ],
                        hint: "Select all that apply",
                        isRequired: true
                    )

                    CivCheckboxGroup(
                        legend: "Additional services",
                        values: $services,
                        options: [
                            CivCheckboxOption(label: "Expedited processing", value: "expedited", description: "Additional fee applies"),
                            CivCheckboxOption(label: "Certified copy", value: "certified", description: "Notarized document"),
                        ],
                        isTile: true
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
