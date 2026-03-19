// CivUI — CivFormGroup for SwiftUI
// Accessible form group wrapper following government design system patterns.
// Renders: label → hint → error → content (Section 508 compliant)

import SwiftUI

/// Accessible form group wrapper for government applications.
///
/// Provides label, hint, and error rendering for custom or third-party
/// form controls. Uses `@ViewBuilder` for arbitrary content.
///
/// Usage:
/// ```swift
/// CivFormGroup(
///     label: "Custom rating",
///     hint: "Drag the slider to rate your experience",
///     error: ratingError
/// ) {
///     Slider(value: $rating, in: 1...5, step: 1)
/// }
/// ```
public struct CivFormGroup<Content: View>: View {
    // MARK: - Properties

    /// Visible label text.
    public let label: String

    /// Help text shown below the label.
    public var hint: String?

    /// Error message.
    public var error: String?

    /// Whether the field is required.
    public var isRequired: Bool

    /// Content rendered inside the form group.
    public let content: Content

    // MARK: - Internal State

    @Environment(\.colorScheme) private var colorScheme

    // MARK: - Initializer

    public init(
        label: String,
        hint: String? = nil,
        error: String? = nil,
        isRequired: Bool = false,
        @ViewBuilder content: () -> Content
    ) {
        self.label = label
        self.hint = hint
        self.error = error
        self.isRequired = isRequired
        self.content = content()
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
                    .accessibilityAddTraits(.updatesFrequently)
            }

            // 4. Content
            content
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

    // MARK: - Color Helper

    private func adaptiveColor(light: Color, dark: Color) -> Color {
        colorScheme == .dark ? dark : light
    }
}

// MARK: - Preview

#if DEBUG
struct CivFormGroup_Previews: PreviewProvider {
    struct PreviewWrapper: View {
        @State private var rating: Double = 3

        var body: some View {
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    CivFormGroup(
                        label: "Experience rating",
                        hint: "Drag the slider to rate your experience",
                        isRequired: true
                    ) {
                        Slider(value: $rating, in: 1...5, step: 1)
                        Text("Rating: \(Int(rating))")
                            .font(.system(size: CivTokens.Typography.FontSize.sm))
                    }

                    CivFormGroup(
                        label: "With error",
                        error: "Please provide a rating"
                    ) {
                        Slider(value: .constant(0), in: 1...5, step: 1)
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
