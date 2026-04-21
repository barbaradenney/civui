// CivUI — CivLink for SwiftUI
// Accessible link component with variant styles.
// Variants: primary (button-styled), secondary (with caret), tertiary (plain), back (with chevron)

import SwiftUI

/// Link variant determines the visual treatment.
public enum LinkVariant: String, CaseIterable {
    case primary, secondary, tertiary, back
}

/// Accessible link for government applications.
///
/// Always renders as a tappable link (never a button). Supports four
/// variants and an optional danger modifier for destructive actions.
/// All variants are underlined for accessibility compliance.
///
/// Usage:
/// ```swift
/// CivLink(label: "View details", href: "/claims/123", variant: .secondary)
/// CivLink(label: "Go back", variant: .back, onTap: { navigateBack() })
/// CivLink(label: "Remove file", variant: .tertiary, isDanger: true)
/// ```
public struct CivLink: View {
    // MARK: - Properties

    /// Link text.
    public let label: String

    /// Navigation destination URL string.
    public var href: String

    /// Visual variant.
    public var variant: LinkVariant

    /// Whether to use danger (destructive) styling.
    public var isDanger: Bool

    /// Whether the link is disabled.
    public var isDisabled: Bool

    /// Called on tap (for programmatic navigation instead of href).
    public var onTap: (() -> Void)?

    /// Called for analytics tracking (parallels `civ-analytics` event).
    public var onAnalytics: ((String, [String: Any]?) -> Void)?

    // MARK: - Internal State

    @Environment(\.colorScheme) private var colorScheme

    // MARK: - Initializer

    public init(
        label: String,
        href: String = "",
        variant: LinkVariant = .tertiary,
        isDanger: Bool = false,
        isDisabled: Bool = false,
        onTap: (() -> Void)? = nil,
        onAnalytics: ((String, [String: Any]?) -> Void)? = nil
    ) {
        self.label = label
        self.href = href
        self.variant = variant
        self.isDanger = isDanger
        self.isDisabled = isDisabled
        self.onTap = onTap
        self.onAnalytics = onAnalytics
    }

    // MARK: - Body

    public var body: some View {
        Button(action: handleTap) {
            HStack(spacing: CivTokens.Spacing._0_5) {
                if variant == .back {
                    Image(systemName: "chevron.left")
                        .font(.system(size: CivTokens.Typography.FontSize.sm))
                }

                Text(label)
                    .font(.system(size: fontSize, weight: fontWeight))
                    .underline()

                if variant == .secondary {
                    Image(systemName: "chevron.right")
                        .font(.system(size: CivTokens.Typography.FontSize.sm))
                }
            }
            .foregroundColor(foregroundColor)
            .padding(.horizontal, variant == .primary ? CivTokens.Spacing._6 : 0)
            .padding(.vertical, variant == .primary ? CivTokens.Spacing._2_5 : CivTokens.Spacing._1)
            .background(variant == .primary ? primaryBackground : Color.clear)
            .cornerRadius(variant == .primary ? CivTokens.Border.Radius.default_ : 0)
        }
        .buttonStyle(.plain)
        .disabled(isDisabled)
        .opacity(isDisabled ? 0.5 : 1.0)
        .accessibilityLabel(label)
        .accessibilityAddTraits(.isLink)
        .accessibilityRemoveTraits(.isButton)
    }

    // MARK: - Actions

    private func handleTap() {
        guard !isDisabled else { return }
        onAnalytics?("click", ["variant": variant.rawValue, "danger": isDanger])

        if !href.isEmpty, let url = URL(string: href) {
            UIApplication.shared.open(url)
        }

        onTap?()
    }

    // MARK: - Styling

    private var foregroundColor: Color {
        if isDanger {
            return adaptiveColor(
                light: CivTokens.Colors.Error.default_,
                dark: CivTokens.DarkColors.Error.default_
            )
        }

        switch variant {
        case .primary:
            return adaptiveColor(
                light: CivTokens.Colors.White.default_,
                dark: CivTokens.DarkColors.White.default_
            )
        case .secondary, .tertiary, .back:
            return adaptiveColor(
                light: CivTokens.Colors.Primary.default_,
                dark: CivTokens.DarkColors.Primary.default_
            )
        }
    }

    private var primaryBackground: Color {
        if isDanger {
            return adaptiveColor(
                light: CivTokens.Colors.Error.default_,
                dark: CivTokens.DarkColors.Error.default_
            )
        }
        return adaptiveColor(
            light: CivTokens.Colors.Primary.default_,
            dark: CivTokens.DarkColors.Primary.default_
        )
    }

    private var fontSize: CGFloat {
        variant == .back ? CivTokens.Typography.FontSize.sm : CivTokens.Typography.FontSize.base
    }

    private var fontWeight: Font.Weight {
        variant == .primary ? CivTokens.Typography.FontWeight.semibold : CivTokens.Typography.FontWeight.regular
    }

    // MARK: - Color Helper

    private func adaptiveColor(light: Color, dark: Color) -> Color {
        colorScheme == .dark ? dark : light
    }
}

// MARK: - Preview

#if DEBUG
struct CivLink_Previews: PreviewProvider {
    struct PreviewWrapper: View {
        var body: some View {
            ScrollView {
                VStack(alignment: .leading, spacing: CivTokens.Spacing._4) {
                    CivLink(label: "Primary link", href: "#", variant: .primary)
                    CivLink(label: "Secondary link", href: "#", variant: .secondary)
                    CivLink(label: "Tertiary link", href: "#", variant: .tertiary)
                    CivLink(label: "Go back", variant: .back)
                    CivLink(label: "Delete file", variant: .tertiary, isDanger: true)
                    CivLink(label: "Disabled link", href: "#", variant: .secondary, isDisabled: true)
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
