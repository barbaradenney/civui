// CivUI — CivPageHeader for SwiftUI
// Structured page heading with tag, eyebrow, heading, and subheading areas.

import SwiftUI

/// Accessible page header for government applications.
///
/// Renders a structured heading area with optional tag, eyebrow text,
/// main heading, and subheading. Follows the government design system
/// pattern for page titles.
///
/// Usage:
/// ```swift
/// CivPageHeader(heading: "Apply for disability compensation")
///
/// CivPageHeader(
///     heading: "Apply for disability compensation",
///     eyebrow: "Benefits",
///     subheading: "VA Form 21-526EZ",
///     tag: "In progress",
///     tagVariant: .teal
/// )
/// ```
public struct CivPageHeader: View {
    // MARK: - Properties

    /// Main heading text.
    public let heading: String

    /// Small text above the heading (e.g., category name).
    public var eyebrow: String

    /// Text below the heading (e.g., form number).
    public var subheading: String

    /// Optional tag label displayed above the eyebrow.
    public var tag: String

    /// Tag variant for color styling.
    public var tagVariant: CivTagVariant

    /// Tag style (primary = dark bg, secondary = light bg).
    public var tagStyle: String

    /// Spacing variant.
    public var spacing: String

    /// Icon name rendered before the heading text.
    public var iconStart: String

    /// Icon name rendered after the heading text.
    public var iconEnd: String

    // MARK: - Internal State

    @Environment(\.colorScheme) private var colorScheme

    // MARK: - Initializer

    public init(
        heading: String,
        eyebrow: String = "",
        subheading: String = "",
        tag: String = "",
        tagVariant: CivTagVariant = .gray,
        tagStyle: String = "secondary",
        spacing: String = "default",
        iconStart: String = "",
        iconEnd: String = ""
    ) {
        self.heading = heading
        self.eyebrow = eyebrow
        self.subheading = subheading
        self.tag = tag
        self.tagVariant = tagVariant
        self.tagStyle = tagStyle
        self.spacing = spacing
        self.iconStart = iconStart
        self.iconEnd = iconEnd
    }

    // MARK: - Body

    public var body: some View {
        VStack(alignment: .leading, spacing: CivTokens.Spacing._1) {
            // 1. Tag
            if !tag.isEmpty {
                CivTag(label: tag, variant: tagVariant, tagStyle: tagStyle)
                    .padding(.bottom, CivTokens.Spacing._0_5)
            }

            // 2. Eyebrow
            if !eyebrow.isEmpty {
                Text(eyebrow)
                    .font(.system(size: CivTokens.Typography.FontSize.sm,
                                  weight: CivTokens.Typography.FontWeight.semibold))
                    .foregroundColor(adaptiveColor(
                        light: CivTokens.Colors.Base.dark,
                        dark: CivTokens.DarkColors.Base.dark
                    ))
                    .textCase(.uppercase)
                    .accessibilityAddTraits(.isHeader)
            }

            // 3. Heading
            Text(heading)
                .font(.system(size: CivTokens.Typography.FontSize._2xl,
                              weight: CivTokens.Typography.FontWeight.bold))
                .foregroundColor(adaptiveColor(
                    light: CivTokens.Colors.Base.darkest,
                    dark: CivTokens.DarkColors.Base.darkest
                ))
                .accessibilityAddTraits(.isHeader)

            // 4. Subheading
            if !subheading.isEmpty {
                Text(subheading)
                    .font(.system(size: CivTokens.Typography.FontSize.base))
                    .foregroundColor(adaptiveColor(
                        light: CivTokens.Colors.Base.dark,
                        dark: CivTokens.DarkColors.Base.dark
                    ))
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.bottom, CivTokens.Spacing._4)
        .accessibilityElement(children: .combine)
    }

    // MARK: - Color Helper

    private func adaptiveColor(light: Color, dark: Color) -> Color {
        colorScheme == .dark ? dark : light
    }
}

// MARK: - Preview

#if DEBUG
struct CivPageHeader_Previews: PreviewProvider {
    struct PreviewWrapper: View {
        var body: some View {
            ScrollView {
                VStack(alignment: .leading, spacing: CivTokens.Spacing._6) {
                    CivPageHeader(heading: "Dashboard")

                    CivPageHeader(
                        heading: "Apply for disability compensation",
                        eyebrow: "Benefits",
                        subheading: "VA Form 21-526EZ"
                    )

                    CivPageHeader(
                        heading: "Claim status",
                        eyebrow: "Disability",
                        tag: "In progress",
                        tagVariant: .teal
                    )

                    CivPageHeader(
                        heading: "Urgent action needed",
                        subheading: "Please upload your supporting documents",
                        tag: "Action required",
                        tagVariant: .gold,
                        tagStyle: "primary"
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
