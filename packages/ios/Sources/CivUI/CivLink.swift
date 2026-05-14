// CivUI — CivLink for SwiftUI
// Accessible link component with variant styles.
// Variants: primary (bold + caret), secondary (plain, default), back (with chevron-back)

import SwiftUI

/// Link variant determines the visual treatment.
public enum LinkVariant: String, CaseIterable {
    case primary, secondary, back
}

/// Accessible link for government applications.
///
/// Always renders as a tappable link (never a button). Three
/// variants and an optional danger modifier for destructive actions.
/// All variants are underlined for accessibility compliance.
///
/// For navigation that should look like a button, use `CivButton`
/// with `href` — that renders the platform link affordance with
/// button chrome plus an underline.
///
/// Usage:
/// ```swift
/// CivLink(label: "View details", href: "/claims/123", variant: .primary)
/// CivLink(label: "Go back", variant: .back, onTap: { navigateBack() })
/// CivLink(label: "Remove file", variant: .secondary, isDanger: true)
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

    /// Icon name rendered before the label text.
    public var iconStart: String

    /// Icon name rendered after the label text.
    public var iconEnd: String

    /// Called on tap (for programmatic navigation instead of href).
    public var onTap: (() -> Void)?

    /// Called for analytics tracking (parallels `civ-analytics` event).
    public var onAnalytics: ((String, [String: Any]?) -> Void)?

    /// Link target (e.g., "_blank", "_self").
    public var target: String

    /// Link rel attribute (e.g., "noopener noreferrer").
    public var rel: String

    /// Download filename. When non-empty, triggers download behavior.
    public var download: String

    /// Device-action type ("phone" / "email" / "download"). Optional; when set, the
    /// platform builds an appropriate href and chooses a leading icon.
    public var type: String

    /// Phone number when `type == "phone"`. Stripped of formatting before being used.
    public var number: String

    /// Email address when `type == "email"`. Also used as default display text.
    public var address: String

    /// Pre-filled email subject when `type == "email"`.
    public var subject: String

    /// Suggested filename when `type == "download"`. Also used as default display text.
    public var filename: String

    /// Human-readable file size suffix when `type == "download"` (e.g. "1.2 MB").
    public var fileSize: String

    // MARK: - Internal State

    @Environment(\.colorScheme) private var colorScheme

    // MARK: - Initializer

    public init(
        label: String,
        href: String = "",
        variant: LinkVariant = .secondary,
        isDanger: Bool = false,
        isDisabled: Bool = false,
        iconStart: String = "",
        iconEnd: String = "",
        onTap: (() -> Void)? = nil,
        onAnalytics: ((String, [String: Any]?) -> Void)? = nil,
        target: String = "",
        rel: String = "",
        download: String = "",
        type: String = "",
        number: String = "",
        address: String = "",
        subject: String = "",
        filename: String = "",
        fileSize: String = ""
    ) {
        self.label = label
        self.href = href
        self.variant = variant
        self.isDanger = isDanger
        self.isDisabled = isDisabled
        self.iconStart = iconStart
        self.iconEnd = iconEnd
        self.onTap = onTap
        self.onAnalytics = onAnalytics
        self.target = target
        self.rel = rel
        self.download = download
        self.type = type
        self.number = number
        self.address = address
        self.subject = subject
        self.filename = filename
        self.fileSize = fileSize
    }

    private var leadingIconName: String {
        if !iconStart.isEmpty { return iconStart }
        if variant == .back { return "chevron-left" }
        return ""
    }

    private var trailingIconName: String {
        if !iconEnd.isEmpty { return iconEnd }
        if variant == .secondary { return "chevron-right" }
        return ""
    }

    // MARK: - Body

    public var body: some View {
        Button(action: handleTap) {
            HStack(spacing: CivTokens.Spacing._0_5) {
                if !leadingIconName.isEmpty {
                    CivIcon(name: leadingIconName, size: "sm")
                }

                Text(label)
                    .font(.system(size: fontSize, weight: fontWeight))
                    .underline()

                if !trailingIconName.isEmpty {
                    CivIcon(name: trailingIconName, size: "sm")
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
        case .secondary, .back:
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
                    CivLink(label: "Tertiary link", href: "#", variant: .secondary)
                    CivLink(label: "Go back", variant: .back)
                    CivLink(label: "Delete file", variant: .secondary, isDanger: true)
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
