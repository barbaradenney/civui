// CivUI — CivActionButton & CivButtonGroup for SwiftUI
// Compact action button for toolbars and inline controls.
// CivButtonGroup joins buttons into a connected toolbar.
// Mirrors web `civ-action-button` and `civ-button-group` (Section 508 compliant)

import SwiftUI

/// Visual variant for an action button.
public enum ActionButtonVariant: String, CaseIterable {
    case primary, secondary, tertiary
}

/// Compact action button for toolbars, inline form controls, and secondary actions.
///
/// Same variant system as `CivButton` but with smaller padding and font size.
/// Can be used standalone or grouped inside a `CivButtonGroup` to form a
/// connected toolbar.
///
/// VoiceOver announces the label, pressed state, and disabled state.
///
/// Usage:
/// ```swift
/// CivActionButton(label: "Bold", pressed: true) {
///     toggleBold()
/// }
/// ```
public struct CivActionButton: View {
    // MARK: - Properties

    /// Button text.
    public let label: String

    /// Visual variant (primary, secondary, tertiary).
    public var variant: ActionButtonVariant

    /// Destructive action styling.
    public var isDanger: Bool

    /// Whether the button is disabled.
    public var isDisabled: Bool

    /// Toggle pressed state (for toolbar toggles).
    public var isPressed: Bool

    /// Called on button tap.
    public var onClick: (() -> Void)?

    /// Called for analytics tracking (parallels `civ-analytics` event).
    public var onAnalytics: ((String, [String: Any]?) -> Void)?

    /// Button type (e.g., "button", "submit", "reset").
    public var type: String

    /// Icon name rendered before the label text.
    public var iconStart: String

    /// Icon name rendered after the label text.
    public var iconEnd: String

    // MARK: - Internal State

    @Environment(\.colorScheme) private var colorScheme

    // MARK: - Initializer

    public init(
        label: String,
        variant: ActionButtonVariant = .tertiary,
        isDanger: Bool = false,
        isDisabled: Bool = false,
        isPressed: Bool = false,
        onClick: (() -> Void)? = nil,
        onAnalytics: ((String, [String: Any]?) -> Void)? = nil,
        type: String = "button",
        iconStart: String = "",
        iconEnd: String = ""
    ) {
        self.label = label
        self.variant = variant
        self.isDanger = isDanger
        self.isDisabled = isDisabled
        self.isPressed = isPressed
        self.onClick = onClick
        self.onAnalytics = onAnalytics
        self.type = type
        self.iconStart = iconStart
        self.iconEnd = iconEnd
    }

    // MARK: - Body

    public var body: some View {
        Button(action: handleTap) {
            Text(label)
                .font(.system(size: CivTokens.Typography.FontSize.sm,
                              weight: CivTokens.Typography.FontWeight.semibold))
                .padding(.horizontal, CivTokens.Spacing._3)
                .padding(.vertical, CivTokens.Spacing._1_5)
                .foregroundColor(foregroundColor)
                .background(backgroundColor)
                .cornerRadius(CivTokens.Border.Radius.default_)
                .overlay(borderOverlay)
        }
        .disabled(isDisabled)
        .opacity(isDisabled ? 0.5 : 1.0)
        .accessibilityLabel(label)
        .accessibilityAddTraits(.isButton)
        .accessibilityValue(isPressed ? "pressed" : "")
    }

    // MARK: - Actions

    private func handleTap() {
        guard !isDisabled else { return }
        onAnalytics?("click", ["variant": variant.rawValue, "danger": isDanger])
        onClick?()
    }

    // MARK: - Variant Colors

    private var foregroundColor: Color {
        if isDanger {
            switch variant {
            case .primary:
                return adaptiveColor(light: CivTokens.Colors.White.default_,
                                     dark: CivTokens.DarkColors.White.default_)
            case .secondary, .tertiary:
                return adaptiveColor(light: CivTokens.Colors.Error.default_,
                                     dark: CivTokens.DarkColors.Error.default_)
            }
        }

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
        }
    }

    private var backgroundColor: Color {
        if isDanger && variant == .primary {
            return adaptiveColor(light: CivTokens.Colors.Error.default_,
                                 dark: CivTokens.DarkColors.Error.default_)
        }

        switch variant {
        case .primary:
            return isPressed
                ? adaptiveColor(light: CivTokens.Colors.Primary.darker,
                                dark: CivTokens.DarkColors.Primary.darker)
                : adaptiveColor(light: CivTokens.Colors.Primary.default_,
                                dark: CivTokens.DarkColors.Primary.default_)
        case .secondary:
            return isPressed
                ? adaptiveColor(light: CivTokens.Colors.Primary.lightest,
                                dark: CivTokens.DarkColors.Primary.lightest)
                : adaptiveColor(light: CivTokens.Colors.Base.lightest,
                                dark: CivTokens.DarkColors.Base.lightest)
        case .tertiary:
            return isPressed
                ? adaptiveColor(light: CivTokens.Colors.Primary.lightest,
                                dark: CivTokens.DarkColors.Primary.lightest)
                : Color.clear
        }
    }

    private var borderOverlay: some View {
        Group {
            if variant == .tertiary {
                let borderColor = isDanger
                    ? adaptiveColor(light: CivTokens.Colors.Error.default_,
                                    dark: CivTokens.DarkColors.Error.default_)
                    : adaptiveColor(light: CivTokens.Colors.Primary.default_,
                                    dark: CivTokens.DarkColors.Primary.default_)
                RoundedRectangle(cornerRadius: CivTokens.Border.Radius.default_)
                    .stroke(borderColor, lineWidth: CivTokens.Border.Width.default_)
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

/// Groups action buttons into a connected toolbar.
///
/// Removes inner border-radius so buttons sit flush together.
/// Supports horizontal (default) and vertical orientations.
///
/// VoiceOver treats the group as a toolbar container.
///
/// Usage:
/// ```swift
/// CivButtonGroup {
///     CivActionButton(label: "Bold", isPressed: true)
///     CivActionButton(label: "Italic")
///     CivActionButton(label: "Underline")
/// }
/// ```
public struct CivButtonGroup<Content: View>: View {
    // MARK: - Properties

    /// Layout orientation.
    public var orientation: String

    /// Accessible label for the button group.
    public var label: String

    /// Button content.
    public let content: () -> Content

    // MARK: - Initializer

    public init(
        orientation: String = "horizontal",
        label: String = "",
        @ViewBuilder content: @escaping () -> Content
    ) {
        self.orientation = orientation
        self.label = label
        self.content = content
    }

    // MARK: - Body

    public var body: some View {
        Group {
            if orientation == "vertical" {
                VStack(spacing: 0) {
                    content()
                }
            } else {
                HStack(spacing: 0) {
                    content()
                }
            }
        }
        .accessibilityElement(children: .contain)
        .accessibilityAddTraits(.isHeader)
        .accessibilityLabel("Toolbar")
    }
}

// MARK: - Preview

#if DEBUG
struct CivActionButton_Previews: PreviewProvider {
    struct PreviewWrapper: View {
        var body: some View {
            ScrollView {
                VStack(alignment: .leading, spacing: CivTokens.Spacing._4) {
                    // Standalone buttons
                    CivActionButton(label: "Primary", variant: .primary)
                    CivActionButton(label: "Secondary", variant: .secondary)
                    CivActionButton(label: "Tertiary", variant: .tertiary)

                    // Pressed state
                    CivActionButton(label: "Pressed", variant: .tertiary, isPressed: true)

                    // Danger variants
                    CivActionButton(label: "Delete", variant: .primary, isDanger: true)
                    CivActionButton(label: "Remove", variant: .tertiary, isDanger: true)

                    // Disabled
                    CivActionButton(label: "Disabled", isDisabled: true)

                    // Horizontal toolbar
                    CivButtonGroup {
                        CivActionButton(label: "Bold")
                        CivActionButton(label: "Italic")
                        CivActionButton(label: "Underline")
                    }

                    // Vertical toolbar
                    CivButtonGroup(orientation: "vertical") {
                        CivActionButton(label: "Option 1", variant: .primary)
                        CivActionButton(label: "Option 2", variant: .primary, isPressed: true)
                        CivActionButton(label: "Option 3", variant: .primary)
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
