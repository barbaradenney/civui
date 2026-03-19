// CivUI — CivFieldset for SwiftUI
// Accessible fieldset container following government design system patterns.
// Renders: legend → hint → error → content (Section 508 compliant)

import SwiftUI

/// Accessible fieldset container for government applications.
///
/// GroupBox-like container with legend, hint, error, and disabled cascade.
/// Uses `@ViewBuilder` for arbitrary content.
///
/// Usage:
/// ```swift
/// CivFieldset(legend: "Mailing address") {
///     CivTextInput(label: "Street address", value: $street)
///     CivTextInput(label: "City", value: $city)
///     CivTextInput(label: "State", value: $state)
///     CivTextInput(label: "ZIP code", value: $zip, mask: .zip)
/// }
/// ```
public struct CivFieldset<Content: View>: View {
    // MARK: - Properties

    /// Legend text for the fieldset.
    public let legend: String

    /// Help text shown below the legend.
    public var hint: String?

    /// Error message for the group.
    public var error: String?

    /// Whether the fieldset is required.
    public var isRequired: Bool

    /// Whether the fieldset and all contents are disabled.
    public var isDisabled: Bool

    /// Content rendered inside the fieldset.
    public let content: Content

    // MARK: - Internal State

    @Environment(\.colorScheme) private var colorScheme

    // MARK: - Initializer

    public init(
        legend: String,
        hint: String? = nil,
        error: String? = nil,
        isRequired: Bool = false,
        isDisabled: Bool = false,
        @ViewBuilder content: () -> Content
    ) {
        self.legend = legend
        self.hint = hint
        self.error = error
        self.isRequired = isRequired
        self.isDisabled = isDisabled
        self.content = content()
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

            // 4. Content
            VStack(alignment: .leading, spacing: 0) {
                content
            }
        }
        .padding(.bottom, CivTokens.Spacing._4)
        .disabled(isDisabled)
        .opacity(isDisabled ? 0.5 : 1.0)
        .accessibilityElement(children: .contain)
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

    // MARK: - Color Helper

    private func adaptiveColor(light: Color, dark: Color) -> Color {
        colorScheme == .dark ? dark : light
    }
}

// MARK: - Preview

#if DEBUG
struct CivFieldset_Previews: PreviewProvider {
    struct PreviewWrapper: View {
        @State private var street = ""
        @State private var city = ""
        @State private var state = ""
        @State private var zip = ""

        var body: some View {
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    CivFieldset(legend: "Mailing address", hint: "Enter your current mailing address") {
                        CivTextInput(label: "Street address", value: $street, isRequired: true)
                        CivTextInput(label: "City", value: $city, isRequired: true)
                        CivTextInput(label: "State", value: $state, isRequired: true)
                        CivTextInput(label: "ZIP code", value: $zip, isRequired: true, mask: .zip)
                    }

                    CivFieldset(legend: "Disabled section", isDisabled: true) {
                        CivTextInput(label: "Cannot edit", value: .constant(""))
                    }
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
