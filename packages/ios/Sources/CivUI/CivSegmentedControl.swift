// CivUI — CivSegmentedControl for SwiftUI
// Accessible segmented control following government design system patterns.
// Renders: legend → hint → error → native Picker with .segmented style (Section 508 compliant)

import SwiftUI

/// Option for CivSegmentedControl.
public struct CivSegmentOption: Identifiable, Equatable {
    public let id: String
    public let value: String
    public let label: String

    public init(value: String, label: String) {
        self.id = value
        self.value = value
        self.label = label
    }
}

/// Accessible segmented control for government applications.
///
/// Wraps SwiftUI's native `Picker` with `.segmented` style, adding
/// CivUI form field chrome: legend, hint, error, and token-based styling.
///
/// Usage:
/// ```swift
/// CivSegmentedControl(
///     legend: "View mode",
///     value: $viewMode,
///     options: [
///         CivSegmentOption(value: "list", label: "List"),
///         CivSegmentOption(value: "grid", label: "Grid"),
///         CivSegmentOption(value: "map", label: "Map"),
///     ]
/// )
/// ```
public struct CivSegmentedControl: View {
    // MARK: - Properties

    /// Legend text for the control.
    public let legend: String

    /// Currently selected value.
    @Binding public var value: String

    /// Available segment options.
    public let options: [CivSegmentOption]

    /// Help text shown below the legend.
    public var hint: String?

    /// Error message.
    public var error: String?

    /// Whether a selection is required.
    public var isRequired: Bool

    /// Whether the control is disabled.
    public var isDisabled: Bool

    /// Whether the control is read-only (visible but non-interactive, no opacity change).
    public var isReadonly: Bool

    /// Field name for form state registration.
    public var formName: String

    /// Called when the selected value changes.
    public var onChange: ((String) -> Void)?

    /// Called for analytics tracking (parallels `civ-analytics` event).
    public var onAnalytics: ((String, [String: Any]?) -> Void)?

    // MARK: - Internal State

    @Environment(\.colorScheme) private var colorScheme

    // MARK: - Initializer

    public init(
        legend: String,
        value: Binding<String>,
        options: [CivSegmentOption],
        hint: String? = nil,
        error: String? = nil,
        isRequired: Bool = false,
        isDisabled: Bool = false,
        isReadonly: Bool = false,
        formName: String = "",
        onChange: ((String) -> Void)? = nil,
        onAnalytics: ((String, [String: Any]?) -> Void)? = nil
    ) {
        self.legend = legend
        self._value = value
        self.options = options
        self.hint = hint
        self.error = error
        self.isRequired = isRequired
        self.isDisabled = isDisabled
        self.isReadonly = isReadonly
        self.formName = formName
        self.onChange = onChange
        self.onAnalytics = onAnalytics
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

            // 4. Segmented Picker
            Picker(legend, selection: pickerBinding) {
                ForEach(options) { option in
                    Text(option.label).tag(option.value)
                }
            }
            .pickerStyle(.segmented)
            .disabled(isDisabled || isReadonly)
            .opacity(isDisabled ? 0.5 : 1.0)
            .accessibilityLabel(legend)
            .accessibilityHint(accessibilityHintText)
        }
        .padding(.bottom, CivTokens.Spacing._4)
        .accessibilityElement(children: .contain)
        .onChange(of: error) { newError in
            if let newError, !newError.isEmpty {
                UIAccessibility.post(notification: .announcement, argument: newError)
            }
        }
    }

    // MARK: - Picker Binding

    private var pickerBinding: Binding<String> {
        Binding(
            get: { value },
            set: { newValue in
                value = newValue
                onChange?(newValue)
                onAnalytics?("change", ["value": newValue])
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

    // MARK: - Accessibility

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
struct CivSegmentedControl_Previews: PreviewProvider {
    struct PreviewWrapper: View {
        @State private var viewMode = "list"
        @State private var status = ""

        var body: some View {
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    CivSegmentedControl(
                        legend: "View mode",
                        value: $viewMode,
                        options: [
                            CivSegmentOption(value: "list", label: "List"),
                            CivSegmentOption(value: "grid", label: "Grid"),
                            CivSegmentOption(value: "map", label: "Map"),
                        ]
                    )

                    CivSegmentedControl(
                        legend: "Application status",
                        value: $status,
                        options: [
                            CivSegmentOption(value: "pending", label: "Pending"),
                            CivSegmentOption(value: "approved", label: "Approved"),
                            CivSegmentOption(value: "denied", label: "Denied"),
                        ],
                        hint: "Filter by status",
                        isRequired: true
                    )

                    CivSegmentedControl(
                        legend: "Disabled control",
                        value: .constant("a"),
                        options: [
                            CivSegmentOption(value: "a", label: "Option A"),
                            CivSegmentOption(value: "b", label: "Option B"),
                        ],
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
