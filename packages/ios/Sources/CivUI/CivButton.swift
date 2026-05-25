// CivUI — CivButton for SwiftUI
// Accessible button component following government design system patterns.
// Supports primary, secondary, tertiary, and danger variants.

import SwiftUI

/// Button variant determines the visual treatment.
public enum ButtonVariant: String, CaseIterable {
    case primary, secondary, tertiary, danger
}

/// Accessible button for government applications.
///
/// Renders a styled button with variant-based colors. When `href` is set,
/// the button opens the URL as a link action. Mirrors the web `civ-button`
/// component.
///
/// VoiceOver announces the button label and disabled state.
///
/// Usage:
/// ```swift
/// CivButton(label: "Submit application", variant: .primary) {
///     submitForm()
/// }
/// ```
public struct CivButton: View {
    // MARK: - Properties

    /// Button text.
    public let label: String

    /// Visual variant (primary, secondary, tertiary, danger).
    public var emphasis: ButtonVariant

    /// Whether the button is disabled.
    public var isDisabled: Bool

    /// Icon name rendered before the label text.
    public var iconStart: String

    /// Icon name rendered after the label text.
    public var iconEnd: String

    /// When true, the label is treated as accessible name only; the button shows just the icon.
    public var isIconOnly: Bool

    /// When set, the button functions as a link action opening this URL.
    public var href: String?

    /// Called on button tap (parallels `click` event).
    public var onClick: (() -> Void)?

    /// Called for analytics tracking (parallels `civ-analytics` event).
    public var onAnalytics: ((String, [String: Any]?) -> Void)?

    /// Whether the button triggers a destructive action.
    public var danger: Bool

    /// Button type (e.g., "button", "submit", "reset").
    public var type: String

    /// Async-in-flight state. Swaps the leading icon for a spinner and
    /// disables the button. Should announce `loadingLabel` via VoiceOver.
    public var isLoading: Bool

    /// Accessible label announced via VoiceOver while `isLoading` is true.
    public var loadingLabel: String

    // MARK: - Internal State

    @Environment(\.colorScheme) private var colorScheme

    // MARK: - Initializer

    public init(
        label: String,
        emphasis: ButtonVariant = .primary,
        isDisabled: Bool = false,
        iconStart: String = "",
        iconEnd: String = "",
        isIconOnly: Bool = false,
        href: String? = nil,
        onClick: (() -> Void)? = nil,
        onAnalytics: ((String, [String: Any]?) -> Void)? = nil,
        danger: Bool = false,
        type: String = "button",
        isLoading: Bool = false,
        loadingLabel: String = "Loading…"
    ) {
        self.label = label
        self.emphasis = emphasis
        self.isDisabled = isDisabled
        self.iconStart = iconStart
        self.iconEnd = iconEnd
        self.isIconOnly = isIconOnly
        self.href = href
        self.onClick = onClick
        self.onAnalytics = onAnalytics
        self.danger = danger
        self.type = type
        self.isLoading = isLoading
        self.loadingLabel = loadingLabel
    }

    // MARK: - Body

    public var body: some View {
        Button(action: handleTap) {
            HStack(spacing: CivTokens.Spacing._1) {
                // When loading, replace the leading icon with a
                // ProgressView spinner. The label stays visible; the
                // accessibility name (below) swaps to `loadingLabel`.
                if isLoading {
                    ProgressView()
                        .progressViewStyle(.circular)
                        .scaleEffect(0.7)
                } else if !iconStart.isEmpty {
                    CivIcon(name: iconStart, size: "sm")
                }
                Text(label)
                if !iconEnd.isEmpty {
                    CivIcon(name: iconEnd, size: "sm")
                }
            }
                .font(.system(size: CivTokens.Typography.FontSize.base,
                              weight: CivTokens.Typography.FontWeight.semibold))
                .padding(.horizontal, CivTokens.Spacing._6)
                .padding(.vertical, CivTokens.Spacing._2_5)
                .foregroundColor(foregroundColor)
                .background(backgroundColor)
                .cornerRadius(CivTokens.Border.Radius.default_)
                .overlay(borderOverlay)
        }
        // Loading implies disabled so taps don't fire concurrent work.
        .disabled(isDisabled || isLoading)
        .opacity(isDisabled ? 0.5 : 1.0)
        // VoiceOver hears the loading label instead of the static
        // button label while loading is in flight.
        .accessibilityLabel(isLoading ? Text(loadingLabel) : Text(label))
        .accessibilityAddTraits(href != nil ? .isLink : .isButton)
        .accessibilityRemoveTraits(href != nil ? .isButton : .isLink)
    }

    // MARK: - Actions

    private func handleTap() {
        guard !isDisabled else { return }
        onAnalytics?("click", ["variant": variant.rawValue])

        if let href, let url = URL(string: href) {
            UIApplication.shared.open(url)
        }

        onClick?()
    }

    // MARK: - Variant Colors

    private var foregroundColor: Color {
        switch variant {
        case .primary:
            return adaptiveColor(light: CivTokens.Colors.White.default_,
                                 dark: CivTokens.DarkColors.White.default_)
        case .secondary:
            return adaptiveColor(light: CivTokens.Colors.Base.darkest,
                                 dark: CivTokens.DarkColors.Base.darkest)
        case .tertiary:
            return adaptiveColor(light: CivTokens.Colors.Primary.default_,
                                 dark: CivTokens.DarkColors.Primary.default_)
        case .danger:
            return adaptiveColor(light: CivTokens.Colors.White.default_,
                                 dark: CivTokens.DarkColors.White.default_)
        }
    }

    private var backgroundColor: Color {
        switch variant {
        case .primary:
            return adaptiveColor(light: CivTokens.Colors.Primary.default_,
                                 dark: CivTokens.DarkColors.Primary.default_)
        case .secondary:
            return adaptiveColor(light: CivTokens.Colors.Base.lightest,
                                 dark: CivTokens.DarkColors.Base.lightest)
        case .tertiary:
            return Color.clear
        case .danger:
            return adaptiveColor(light: CivTokens.Colors.Error.default_,
                                 dark: CivTokens.DarkColors.Error.default_)
        }
    }

    private var borderOverlay: some View {
        Group {
            if variant == .tertiary {
                RoundedRectangle(cornerRadius: CivTokens.Border.Radius.default_)
                    .stroke(
                        adaptiveColor(light: CivTokens.Colors.Primary.default_,
                                      dark: CivTokens.DarkColors.Primary.default_),
                        lineWidth: CivTokens.Border.Width._2
                    )
            } else {
                EmptyView()
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
struct CivButton_Previews: PreviewProvider {
    struct PreviewWrapper: View {
        var body: some View {
            ScrollView {
                VStack(alignment: .leading, spacing: CivTokens.Spacing._4) {
                    CivButton(label: "Submit application", variant: .primary) {
                        // Action
                    }

                    CivButton(label: "Save draft", variant: .secondary) {
                        // Action
                    }

                    CivButton(label: "Cancel", variant: .tertiary) {
                        // Action
                    }

                    CivButton(label: "Delete record", variant: .danger) {
                        // Action
                    }

                    CivButton(
                        label: "Visit agency website",
                        variant: .primary,
                        href: "https://www.usa.gov"
                    )

                    CivButton(
                        label: "Disabled button",
                        variant: .primary,
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
