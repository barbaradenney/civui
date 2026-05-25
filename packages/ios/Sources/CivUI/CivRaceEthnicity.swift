// CivUI — CivRaceEthnicity for SwiftUI
// Accessible compound race and ethnicity input following OMB standards.
// Renders: legend → hint → error → ethnicity radios → race checkboxes (Section 508 compliant)

import SwiftUI

/// Structured race/ethnicity value matching OMB categories.
public struct RaceEthnicityValue: Equatable {
    public var ethnicity: String
    public var race: [String]

    public init(ethnicity: String = "", race: [String] = []) {
        self.ethnicity = ethnicity
        self.race = race
    }
}

/// Accessible compound race and ethnicity input for government applications.
///
/// Renders ethnicity (Hispanic/Latino) as radio buttons and race as checkboxes,
/// following the Office of Management and Budget (OMB) categories required
/// on federal forms. Mirrors the web `civ-race-ethnicity` component.
///
/// VoiceOver announces section labels, errors, and selected options.
///
/// Usage:
/// ```swift
/// CivRaceEthnicity(
///     legend: "Race and ethnicity",
///     value: $raceEthnicity,
///     isRequired: true
/// )
/// ```
public struct CivRaceEthnicity: View {
    // MARK: - Properties

    /// Legend text displayed above the component.
    public let legend: String

    /// Bound compound race/ethnicity value.
    @Binding public var value: RaceEthnicityValue

    /// Help text shown below the legend.
    public var hint: String?

    /// Error message for the fieldset as a whole.
    public var error: String?

    /// Error for the ethnicity section.
    public var ethnicityError: String?

    /// Error for the race section.
    public var raceError: String?

    /// Whether the field is required.
    public var isRequired: Bool

    /// Whether the field is disabled.
    public var isDisabled: Bool

    /// Whether the field is read-only.
    public var isReadonly: Bool

    /// Called on value change (parallels `civ-change` event).
    public var onChange: ((RaceEthnicityValue) -> Void)?

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

    /// Whether the field contains PII.
    public var isPii: Bool

    /// Legend for the ethnicity section.
    public var ethnicityLegend: String

    /// Legend for the race section.
    public var raceLegend: String

    /// Tile rendering variant forwarded to both inner groups.
    /// `auto` picks `card` for ≤4 options and `list` for 5+.
    public var layout: String

    // MARK: - Internal State

    @Environment(\.colorScheme) private var colorScheme

    // MARK: - Constants

    private let ethnicityOptions = [
        ("hispanic", "Hispanic or Latino"),
        ("not-hispanic", "Not Hispanic or Latino"),
        ("ethnicity-prefer-not", "Prefer not to answer")
    ]

    private let raceOptions = [
        ("american-indian-alaska-native", "American Indian or Alaska Native"),
        ("asian", "Asian"),
        ("black-african-american", "Black or African American"),
        ("native-hawaiian-pacific-islander", "Native Hawaiian or Other Pacific Islander"),
        ("white", "White"),
        ("race-prefer-not", "Prefer not to answer")
    ]

    // MARK: - Initializer

    public init(
        legend: String = "Race and ethnicity",
        value: Binding<RaceEthnicityValue>,
        hint: String? = nil,
        error: String? = nil,
        ethnicityError: String? = nil,
        raceError: String? = nil,
        isRequired: Bool = false,
        isDisabled: Bool = false,
        isReadonly: Bool = false,
        onChange: ((RaceEthnicityValue) -> Void)? = nil,
        onAnalytics: ((String, [String: Any]?) -> Void)? = nil,
        formState: CivFormState? = nil,
        formName: String? = nil,
        requiredMessage: String? = nil,
        formValidate: (() -> String?)? = nil,
        isPii: Bool = false,
        ethnicityLegend: String = "Ethnicity",
        raceLegend: String = "Race",
        layout: String = "auto"
    ) {
        self.legend = legend
        self._value = value
        self.hint = hint
        self.error = error
        self.ethnicityError = ethnicityError
        self.raceError = raceError
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
        self.ethnicityLegend = ethnicityLegend
        self.raceLegend = raceLegend
        self.layout = layout
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

            // 4. Ethnicity section (radio buttons)
            ethnicitySection

            // 5. Race section (checkboxes)
            raceSection
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

    private var ethnicitySection: some View {
        VStack(alignment: .leading, spacing: CivTokens.Spacing._1) {
            // Section label
            Text("Ethnicity")
                .font(.system(size: CivTokens.Typography.FontSize.base,
                              weight: CivTokens.Typography.FontWeight.semibold))
                .foregroundColor(adaptiveColor(
                    light: CivTokens.Colors.Base.darkest,
                    dark: CivTokens.DarkColors.Base.darkest
                ))

            // Ethnicity error
            if let ethnicityError, !ethnicityError.isEmpty {
                Text(ethnicityError)
                    .font(.system(size: CivTokens.Typography.FontSize.sm,
                                  weight: CivTokens.Typography.FontWeight.bold))
                    .foregroundColor(adaptiveColor(
                        light: CivTokens.Colors.Error.default_,
                        dark: CivTokens.DarkColors.Error.default_
                    ))
                    .accessibilityIdentifier("civ-field-error")
            }

            // Radio buttons
            VStack(alignment: .leading, spacing: CivTokens.Spacing._2) {
                ForEach(ethnicityOptions, id: \.0) { optionValue, optionLabel in
                    CivRadio(
                        label: optionLabel,
                        value: optionValue,
                        isChecked: value.ethnicity == optionValue,
                        isDisabled: isDisabled || isReadonly,
                        onSelect: {
                            value.ethnicity = optionValue
                            onChange?(value)
                            onAnalytics?("change", ["ethnicity": optionValue])
                        }
                    )
                }
            }
        }
        .padding(.top, CivTokens.Spacing._2)
    }

    private var raceSection: some View {
        VStack(alignment: .leading, spacing: CivTokens.Spacing._1) {
            // Section label
            Text("Race")
                .font(.system(size: CivTokens.Typography.FontSize.base,
                              weight: CivTokens.Typography.FontWeight.semibold))
                .foregroundColor(adaptiveColor(
                    light: CivTokens.Colors.Base.darkest,
                    dark: CivTokens.DarkColors.Base.darkest
                ))

            Text("Select all that apply")
                .font(.system(size: CivTokens.Typography.FontSize.sm))
                .foregroundColor(adaptiveColor(
                    light: CivTokens.Colors.Base.dark,
                    dark: CivTokens.DarkColors.Base.dark
                ))

            // Race error
            if let raceError, !raceError.isEmpty {
                Text(raceError)
                    .font(.system(size: CivTokens.Typography.FontSize.sm,
                                  weight: CivTokens.Typography.FontWeight.bold))
                    .foregroundColor(adaptiveColor(
                        light: CivTokens.Colors.Error.default_,
                        dark: CivTokens.DarkColors.Error.default_
                    ))
                    .accessibilityIdentifier("civ-field-error")
            }

            // Checkboxes
            VStack(alignment: .leading, spacing: CivTokens.Spacing._0_5) {
                ForEach(raceOptions, id: \.0) { optionValue, optionLabel in
                    CivCheckbox(
                        label: optionLabel,
                        checked: Binding(
                            get: { value.race.contains(optionValue) },
                            set: { isChecked in
                                if isChecked {
                                    if !value.race.contains(optionValue) {
                                        value.race.append(optionValue)
                                    }
                                } else {
                                    value.race.removeAll { $0 == optionValue }
                                }
                                onChange?(value)
                                onAnalytics?("change", ["race": value.race])
                            }
                        ),
                        value: optionValue,
                        isDisabled: isDisabled || isReadonly
                    )
                }
            }
        }
        .padding(.top, CivTokens.Spacing._2)
    }

    // MARK: - Form State Registration

    private func registerWithFormState() {
        guard let formState, let formName, !formName.isEmpty else { return }
        formState.register(CivFormState.CivFieldRegistration(
            name: formName,
            label: legend,
            getValue: { "\(value.ethnicity)|\(value.race.joined(separator: ","))" },
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
struct CivRaceEthnicity_Previews: PreviewProvider {
    struct PreviewWrapper: View {
        @State private var empty = RaceEthnicityValue()
        @State private var prefilled = RaceEthnicityValue(
            ethnicity: "not-hispanic",
            race: ["white", "asian"]
        )

        var body: some View {
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    CivRaceEthnicity(
                        value: $empty,
                        hint: "This information is used for statistical purposes only",
                        isRequired: true
                    )

                    CivRaceEthnicity(
                        legend: "Prefilled",
                        value: $prefilled
                    )

                    CivRaceEthnicity(
                        value: .constant(RaceEthnicityValue()),
                        error: "Please complete the race and ethnicity section",
                        ethnicityError: "Select an ethnicity",
                        raceError: "Select at least one race",
                        isRequired: true
                    )

                    CivRaceEthnicity(
                        value: .constant(RaceEthnicityValue()),
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
