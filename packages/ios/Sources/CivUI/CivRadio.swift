// CivUI — CivRadio & CivRadioGroup for SwiftUI
// Accessible radio button and radio group following government design system patterns.
// Renders: legend → hint → error → [radio options] (Section 508 compliant)

import SwiftUI

/// A single radio option for use within a CivRadioGroup.
///
/// Displays a radio indicator, label, and optional description.
/// Supports tile (card) variant styling.
///
/// Usage:
/// ```swift
/// CivRadioGroup(legend: "Preferred contact", value: $contact) {
///     CivRadio(label: "Email", value: "email")
///     CivRadio(label: "Phone", value: "phone", description: "We may call during business hours")
/// }
/// ```
public struct CivRadio: View {
    // MARK: - Properties

    /// Visible label text for this radio option.
    public let label: String

    /// Form value when this radio is selected.
    public let value: String

    /// Optional description below the label.
    public var description: String?

    /// Whether this radio is currently selected (managed by parent group).
    public var isChecked: Bool

    /// Whether to render in tile (card) style.
    public var isTile: Bool

    /// Whether the radio is disabled.
    public var isDisabled: Bool

    /// Action when this radio is tapped.
    public var onSelect: (() -> Void)?

    // MARK: - Internal State

    @Environment(\.colorScheme) private var colorScheme

    // MARK: - Initializer

    public init(
        label: String,
        value: String,
        description: String? = nil,
        isChecked: Bool = false,
        isTile: Bool = false,
        isDisabled: Bool = false,
        onSelect: (() -> Void)? = nil
    ) {
        self.label = label
        self.value = value
        self.description = description
        self.isChecked = isChecked
        self.isTile = isTile
        self.isDisabled = isDisabled
        self.onSelect = onSelect
    }

    // MARK: - Body

    public var body: some View {
        Button(action: { onSelect?() }) {
            HStack(alignment: .top, spacing: CivTokens.Spacing._2) {
                radioIndicator

                VStack(alignment: .leading, spacing: CivTokens.Spacing._0_5) {
                    Text(label)
                        .font(.system(size: CivTokens.Typography.FontSize.base))
                        .foregroundColor(adaptiveColor(
                            light: CivTokens.Colors.Base.darkest,
                            dark: CivTokens.DarkColors.Base.darkest
                        ))

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
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(isTile ? CivTokens.Spacing._3 : 0)
            .background(tileBackground)
            .cornerRadius(isTile ? CivTokens.Border.Radius.default_ : 0)
            .overlay(tileOverlay)
        }
        .buttonStyle(.plain)
        .disabled(isDisabled)
        .opacity(isDisabled ? 0.5 : 1.0)
        .accessibilityLabel(label)
        .accessibilityValue(isChecked ? "selected" : "not selected")
        .accessibilityAddTraits(.isButton)
        .accessibilityHint(description ?? "")
    }

    // MARK: - Subviews

    private var radioIndicator: some View {
        ZStack {
            Circle()
                .stroke(isChecked
                    ? adaptiveColor(light: CivTokens.Colors.Primary.default_, dark: CivTokens.DarkColors.Primary.default_)
                    : adaptiveColor(light: CivTokens.Colors.Base.light, dark: CivTokens.DarkColors.Base.light),
                    lineWidth: CivTokens.Border.Width._2)
                .frame(width: 20, height: 20)

            if isChecked {
                Circle()
                    .fill(adaptiveColor(
                        light: CivTokens.Colors.Primary.default_,
                        dark: CivTokens.DarkColors.Primary.default_
                    ))
                    .frame(width: 10, height: 10)
            }
        }
        .padding(.top, 2)
    }

    @ViewBuilder
    private var tileBackground: some View {
        if isTile {
            adaptiveColor(
                light: isChecked
                    ? CivTokens.Colors.Primary.lightest
                    : CivTokens.Colors.White.default_,
                dark: isChecked
                    ? CivTokens.DarkColors.Primary.lightest
                    : CivTokens.DarkColors.White.default_
            )
        } else {
            Color.clear
        }
    }

    @ViewBuilder
    private var tileOverlay: some View {
        if isTile {
            RoundedRectangle(cornerRadius: CivTokens.Border.Radius.default_)
                .stroke(
                    isChecked
                        ? adaptiveColor(light: CivTokens.Colors.Primary.default_, dark: CivTokens.DarkColors.Primary.default_)
                        : adaptiveColor(light: CivTokens.Colors.Base.light, dark: CivTokens.DarkColors.Base.light),
                    lineWidth: isChecked
                        ? CivTokens.Border.Width._2
                        : CivTokens.Border.Width.default_
                )
        }
    }

    // MARK: - Color Helper

    private func adaptiveColor(light: Color, dark: Color) -> Color {
        colorScheme == .dark ? dark : light
    }
}

/// Radio option definition for CivRadioGroup.
public struct CivRadioOption: Identifiable {
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

/// Accessible radio group for government applications.
///
/// Groups radio buttons with mutual exclusivity, shared legend, hint,
/// and error message. Implements roving selection with VoiceOver support.
///
/// Usage:
/// ```swift
/// CivRadioGroup(
///     legend: "Preferred contact method",
///     value: $contact,
///     options: [
///         CivRadioOption(label: "Email", value: "email"),
///         CivRadioOption(label: "Phone", value: "phone"),
///         CivRadioOption(label: "Mail", value: "mail"),
///     ]
/// )
/// ```
public struct CivRadioGroup: View {
    // MARK: - Properties

    /// Legend text for the group.
    public let legend: String

    /// Currently selected value.
    @Binding public var value: String

    /// Available radio options.
    public let options: [CivRadioOption]

    /// Help text shown below the legend.
    public var hint: String?

    /// Error message for the group.
    public var error: String?

    /// Whether a selection is required.
    public var isRequired: Bool

    /// Whether the group is disabled.
    public var isDisabled: Bool

    /// Whether to render in tile (card) style.
    public var isTile: Bool

    /// Called when the selected value changes.
    public var onChange: ((String) -> Void)?

    // MARK: - Internal State

    @Environment(\.colorScheme) private var colorScheme

    // MARK: - Initializer

    public init(
        legend: String,
        value: Binding<String>,
        options: [CivRadioOption],
        hint: String? = nil,
        error: String? = nil,
        isRequired: Bool = false,
        isDisabled: Bool = false,
        isTile: Bool = false,
        onChange: ((String) -> Void)? = nil
    ) {
        self.legend = legend
        self._value = value
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

            // 4. Radio options
            VStack(alignment: .leading, spacing: CivTokens.Spacing._2) {
                ForEach(options) { option in
                    CivRadio(
                        label: option.label,
                        value: option.value,
                        description: option.description,
                        isChecked: value == option.value,
                        isTile: isTile,
                        isDisabled: isDisabled || option.isDisabled,
                        onSelect: {
                            value = option.value
                            onChange?(option.value)
                        }
                    )
                }
            }
        }
        .padding(.bottom, CivTokens.Spacing._4)
        .accessibilityElement(children: .contain)
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
struct CivRadio_Previews: PreviewProvider {
    struct PreviewWrapper: View {
        @State private var contact = "email"
        @State private var delivery = ""

        var body: some View {
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    CivRadioGroup(
                        legend: "Preferred contact method",
                        value: $contact,
                        options: [
                            CivRadioOption(label: "Email", value: "email"),
                            CivRadioOption(label: "Phone", value: "phone", description: "We may call during business hours"),
                            CivRadioOption(label: "Mail", value: "mail"),
                        ],
                        isRequired: true
                    )

                    CivRadioGroup(
                        legend: "Delivery method",
                        value: $delivery,
                        options: [
                            CivRadioOption(label: "Standard", value: "standard", description: "5-7 business days"),
                            CivRadioOption(label: "Priority", value: "priority", description: "1-3 business days"),
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
