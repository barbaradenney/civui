// CivUI — CivLinkCard for SwiftUI
// Clickable card that navigates to a destination. The entire card is the tap target.
// Variants: primary (blue filled), secondary (blue border), tertiary (gray border), critical (gold)

import SwiftUI

/// Link card variant determines the visual treatment.
public enum LinkCardVariant: String, CaseIterable {
    case primary, secondary, tertiary, critical
}

/// Accessible link card for government applications.
///
/// A tappable card that navigates to a destination. Renders a heading
/// and optional description inside a styled container. The entire card
/// is the tap target.
///
/// Usage:
/// ```swift
/// CivLinkCard(
///     href: "/benefits/disability",
///     heading: "Disability compensation",
///     description: "File a claim for a service-connected disability."
/// )
/// ```
public struct CivLinkCard: View {
    // MARK: - Properties

    /// Navigation destination URL string.
    public let href: String

    /// Card heading text.
    public let heading: String

    /// Descriptive text below the heading.
    public var description: String

    /// Visual variant.
    public var variant: LinkCardVariant

    /// Called on tap (for programmatic navigation instead of href).
    public var onTap: (() -> Void)?

    /// Called for analytics tracking (parallels `civ-analytics` event).
    public var onAnalytics: ((String, [String: Any]?) -> Void)?

    /// Color variant.
    public var color: String

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
        href: String,
        heading: String,
        description: String = "",
        variant: LinkCardVariant = .primary,
        onTap: (() -> Void)? = nil,
        onAnalytics: ((String, [String: Any]?) -> Void)? = nil,
        color: String = "",
        spacing: String = "default",
        iconStart: String = "",
        iconEnd: String = ""
    ) {
        self.href = href
        self.heading = heading
        self.description = description
        self.variant = variant
        self.onTap = onTap
        self.onAnalytics = onAnalytics
        self.color = color
        self.spacing = spacing
        self.iconStart = iconStart
        self.iconEnd = iconEnd
    }

    // MARK: - Body

    public var body: some View {
        Button(action: handleTap) {
            VStack(alignment: .leading, spacing: CivTokens.Spacing._1) {
                Text(heading)
                    .font(.system(size: CivTokens.Typography.FontSize.lg,
                                  weight: CivTokens.Typography.FontWeight.bold))
                    .foregroundColor(headingColor)
                    .underline()

                if !description.isEmpty {
                    Text(description)
                        .font(.system(size: CivTokens.Typography.FontSize.sm))
                        .foregroundColor(descriptionColor)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(CivTokens.Spacing._4)
            .background(backgroundColor)
            .cornerRadius(CivTokens.Border.Radius.default_)
            .overlay(borderOverlay)
        }
        .buttonStyle(.plain)
        .accessibilityLabel(heading)
        .accessibilityHint(description)
        .accessibilityAddTraits(.isLink)
        .accessibilityRemoveTraits(.isButton)
    }

    // MARK: - Actions

    private func handleTap() {
        onAnalytics?("click", ["heading": heading, "variant": variant.rawValue])

        if !href.isEmpty, let url = URL(string: href) {
            UIApplication.shared.open(url)
        }

        onTap?()
    }

    // MARK: - Styling

    private var headingColor: Color {
        switch variant {
        case .primary:
            return adaptiveColor(
                light: CivTokens.Colors.White.default_,
                dark: CivTokens.DarkColors.White.default_
            )
        case .secondary, .tertiary:
            return adaptiveColor(
                light: CivTokens.Colors.Primary.default_,
                dark: CivTokens.DarkColors.Primary.default_
            )
        case .critical:
            return adaptiveColor(
                light: CivTokens.Colors.Base.darkest,
                dark: CivTokens.DarkColors.Base.darkest
            )
        }
    }

    private var descriptionColor: Color {
        switch variant {
        case .primary:
            return adaptiveColor(
                light: CivTokens.Colors.White.default_,
                dark: CivTokens.DarkColors.White.default_
            ).opacity(0.9)
        case .secondary, .tertiary:
            return adaptiveColor(
                light: CivTokens.Colors.Base.dark,
                dark: CivTokens.DarkColors.Base.dark
            )
        case .critical:
            return adaptiveColor(
                light: CivTokens.Colors.Base.darkest,
                dark: CivTokens.DarkColors.Base.darkest
            )
        }
    }

    private var backgroundColor: Color {
        switch variant {
        case .primary:
            return adaptiveColor(
                light: CivTokens.Colors.Primary.default_,
                dark: CivTokens.DarkColors.Primary.default_
            )
        case .secondary, .tertiary:
            return adaptiveColor(
                light: CivTokens.Colors.White.default_,
                dark: CivTokens.DarkColors.White.default_
            )
        case .critical:
            return Color(red: 250/255, green: 206/255, blue: 0/255) // #face00
        }
    }

    @ViewBuilder
    private var borderOverlay: some View {
        switch variant {
        case .primary:
            EmptyView()
        case .secondary:
            RoundedRectangle(cornerRadius: CivTokens.Border.Radius.default_)
                .stroke(
                    adaptiveColor(
                        light: CivTokens.Colors.Primary.default_,
                        dark: CivTokens.DarkColors.Primary.default_
                    ),
                    lineWidth: CivTokens.Border.Width._2
                )
        case .tertiary:
            RoundedRectangle(cornerRadius: CivTokens.Border.Radius.default_)
                .stroke(
                    adaptiveColor(
                        light: CivTokens.Colors.Base.light,
                        dark: CivTokens.DarkColors.Base.light
                    ),
                    lineWidth: CivTokens.Border.Width.default_
                )
        case .critical:
            EmptyView()
        }
    }

    // MARK: - Color Helper

    private func adaptiveColor(light: Color, dark: Color) -> Color {
        colorScheme == .dark ? dark : light
    }
}

// MARK: - Preview

#if DEBUG
struct CivLinkCard_Previews: PreviewProvider {
    struct PreviewWrapper: View {
        var body: some View {
            ScrollView {
                VStack(alignment: .leading, spacing: CivTokens.Spacing._4) {
                    CivLinkCard(
                        href: "/benefits",
                        heading: "Disability compensation",
                        description: "File a claim for a service-connected disability.",
                        variant: .primary
                    )

                    CivLinkCard(
                        href: "/healthcare",
                        heading: "Health care benefits",
                        description: "Apply for VA health care coverage.",
                        variant: .secondary
                    )

                    CivLinkCard(
                        href: "/education",
                        heading: "Education benefits",
                        description: "Apply for GI Bill and education benefits.",
                        variant: .tertiary
                    )

                    CivLinkCard(
                        href: "/action-needed",
                        heading: "Action required",
                        description: "You have documents that need your attention.",
                        variant: .critical
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
