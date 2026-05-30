// CivUI — CivAlert for SwiftUI
// Accessible notification banner following government design system patterns.
// Renders: header bar (variant-colored) → content area (style-colored) with optional dismiss

import SwiftUI

/// Alert variant determines the header bar color and semantic role.
public enum AlertIntent: String, CaseIterable {
    case info, warning, error, success, neutral
}

/// Alert style controls the content area background treatment.
public enum AlertEmphasis: String, CaseIterable {
    case primary, secondary, tertiary
}

/// Accessible alert banner for government applications.
///
/// Displays a notification with a colored header bar and content area below.
/// The header bar color changes per variant (info=blue, warning=amber, error=red,
/// success=green). The content area background changes per emphasis. Mirrors
/// the web `civ-alert` component.
///
/// VoiceOver announces error alerts immediately; other variants use polite announcements.
///
/// Usage:
/// ```swift
/// CivAlert(
///     intent: .warning,
///     heading: "System maintenance",
///     label: "The system will be unavailable Saturday from 2-4 AM ET."
/// )
/// ```
public struct CivAlert: View {
    // MARK: - Properties

    /// Alert type — sets header color and ARIA role.
    public let intent: AlertIntent

    /// Visual treatment for the content area background.
    public var emphasis: AlertEmphasis

    /// Heading text displayed in the colored header bar.
    public var heading: String?

    /// Body text displayed in the content area.
    public let label: String

    /// Whether a close button is shown.
    public var dismissible: Bool

    /// Compact single-line variant (heading is ignored in slim mode).
    public var slim: Bool

    /// Called when the alert is dismissed.
    public var onDismiss: (() -> Void)?

    /// Called for analytics tracking (parallels `civ-analytics` event).
    public var onAnalytics: ((String, [String: Any]?) -> Void)?

    /// Heading level for accessibility (e.g., 2 = h2, 3 = h3).
    public var headingLevel: Int

    /// Spacing variant ("default", "sm").
    public var spacing: String

    /// Parity-only properties for the web-side `collapsible` /
    /// `open` / `fullWidth` modes. SwiftUI implementations of the
    /// collapse + site-banner behaviors are deferred per the
    /// native-stubs entry in `.claude/rules/audit-debt.md` —
    /// presentation patterns have platform quirks that need device
    /// verification. These declarations exist so schema-parity
    /// passes; the rendered Swift view ignores them today.
    public var collapsible: Bool
    public var open: Bool
    public var fullWidth: Bool

    // MARK: - Internal State

    @Environment(\.colorScheme) private var colorScheme
    @State private var isVisible = true

    // MARK: - Initializer

    public init(
        intent: AlertIntent = .info,
        emphasis: AlertEmphasis = .secondary,
        heading: String? = nil,
        label: String,
        dismissible: Bool = false,
        slim: Bool = false,
        onDismiss: (() -> Void)? = nil,
        onAnalytics: ((String, [String: Any]?) -> Void)? = nil,
        headingLevel: Int = 4,
        spacing: String = "default",
        collapsible: Bool = false,
        open: Bool = false,
        fullWidth: Bool = false
    ) {
        self.intent = intent
        self.emphasis = emphasis
        self.heading = heading
        self.label = label
        self.dismissible = dismissible
        self.slim = slim
        self.onDismiss = onDismiss
        self.onAnalytics = onAnalytics
        self.headingLevel = headingLevel
        self.spacing = spacing
        self.collapsible = collapsible
        self.open = open
        self.fullWidth = fullWidth
    }

    // MARK: - Body

    public var body: some View {
        if isVisible {
            VStack(alignment: .leading, spacing: CivTokens.Spacing._0) {
                // Slim variant: single compact line
                if slim {
                    slimView
                } else {
                    // Header bar (when heading is present)
                    if let heading, !heading.isEmpty {
                        headerView(heading: heading)
                    }

                    // Content area
                    contentView
                }
            }
            .cornerRadius(CivTokens.Border.Radius.default_)
            .overlay(
                RoundedRectangle(cornerRadius: CivTokens.Border.Radius.default_)
                    .stroke(variantBorderColor, lineWidth: CivTokens.Border.Width.default_)
            )
            .accessibilityElement(children: .combine)
            .accessibilityLabel(accessibilityDescription)
            .accessibilityAddTraits(intent == .error ? .updatesFrequently : .isStaticText)
            .onAppear {
                if intent == .error {
                    UIAccessibility.post(notification: .announcement, argument: label)
                }
            }
        }
    }

    // MARK: - Subviews

    private func headerView(heading: String) -> some View {
        HStack {
            Text(heading)
                .font(.system(size: CivTokens.Typography.FontSize.base,
                              weight: CivTokens.Typography.FontWeight.bold))
                .foregroundColor(adaptiveColor(
                    light: CivTokens.Colors.White.default_,
                    dark: CivTokens.Colors.White.default_
                ))
                .accessibilityAddTraits(.isHeader)

            Spacer()

            if dismissible {
                dismissButton(foreground: adaptiveColor(
                    light: CivTokens.Colors.White.default_,
                    dark: CivTokens.Colors.White.default_
                ))
            }
        }
        .padding(.horizontal, CivTokens.Spacing._4)
        .padding(.vertical, CivTokens.Spacing._3)
        .background(variantHeaderColor)
    }

    private var contentView: some View {
        HStack(alignment: .top) {
            Text(label)
                .font(.system(size: CivTokens.Typography.FontSize.base))
                .foregroundColor(adaptiveColor(
                    light: CivTokens.Colors.Base.darkest,
                    dark: CivTokens.DarkColors.Base.darkest
                ))

            Spacer()

            // Dismiss button in content area when no heading
            if dismissible && (heading == nil || heading?.isEmpty == true) {
                dismissButton(foreground: adaptiveColor(
                    light: CivTokens.Colors.Base.dark,
                    dark: CivTokens.DarkColors.Base.dark
                ))
            }
        }
        .padding(.horizontal, CivTokens.Spacing._4)
        .padding(.vertical, CivTokens.Spacing._3)
        .background(contentBackgroundColor)
    }

    private var slimView: some View {
        HStack(spacing: CivTokens.Spacing._2) {
            Rectangle()
                .fill(variantHeaderColor)
                .frame(width: CivTokens.Border.Width._4)

            Text(label)
                .font(.system(size: CivTokens.Typography.FontSize.sm))
                .foregroundColor(adaptiveColor(
                    light: CivTokens.Colors.Base.darkest,
                    dark: CivTokens.DarkColors.Base.darkest
                ))

            Spacer()

            if dismissible {
                dismissButton(foreground: adaptiveColor(
                    light: CivTokens.Colors.Base.dark,
                    dark: CivTokens.DarkColors.Base.dark
                ))
            }
        }
        .padding(.vertical, CivTokens.Spacing._2)
        .padding(.trailing, CivTokens.Spacing._3)
        .background(contentBackgroundColor)
    }

    private func dismissButton(foreground: Color) -> some View {
        Button(action: {
            onAnalytics?("dismiss", ["variant": intent.rawValue])
            withAnimation(.easeOut(duration: CivTokens.Motion.Duration.normal)) {
                isVisible = false
            }
            onDismiss?()
        }) {
            Image(systemName: "xmark")
                .font(.system(size: CivTokens.Typography.FontSize.sm,
                              weight: CivTokens.Typography.FontWeight.semibold))
                .foregroundColor(foreground)
                .frame(width: CivTokens.Spacing._6, height: CivTokens.Spacing._6)
        }
        .accessibilityLabel("Dismiss alert")
    }

    // MARK: - Color Helpers

    private var variantHeaderColor: Color {
        switch intent {
        case .info:
            return adaptiveColor(light: CivTokens.Colors.Info.default_,
                                 dark: CivTokens.DarkColors.Info.default_)
        case .warning:
            return adaptiveColor(light: CivTokens.Colors.Warning.default_,
                                 dark: CivTokens.DarkColors.Warning.default_)
        case .error:
            return adaptiveColor(light: CivTokens.Colors.Error.default_,
                                 dark: CivTokens.DarkColors.Error.default_)
        case .success:
            return adaptiveColor(light: CivTokens.Colors.Success.default_,
                                 dark: CivTokens.DarkColors.Success.default_)
        case .neutral:
            return adaptiveColor(light: CivTokens.Colors.Base.darker,
                                 dark: CivTokens.DarkColors.Base.darker)
        }
    }

    private var variantBorderColor: Color {
        switch intent {
        case .info:
            return adaptiveColor(light: CivTokens.Colors.Info.light,
                                 dark: CivTokens.DarkColors.Info.light)
        case .warning:
            return adaptiveColor(light: CivTokens.Colors.Warning.light,
                                 dark: CivTokens.DarkColors.Warning.light)
        case .error:
            return adaptiveColor(light: CivTokens.Colors.Error.light,
                                 dark: CivTokens.DarkColors.Error.light)
        case .success:
            return adaptiveColor(light: CivTokens.Colors.Success.light,
                                 dark: CivTokens.DarkColors.Success.light)
        case .neutral:
            return adaptiveColor(light: CivTokens.Colors.Base.darker,
                                 dark: CivTokens.DarkColors.Base.darker)
        }
    }

    private var contentBackgroundColor: Color {
        switch emphasis {
        case .primary:
            return variantContentPrimaryColor
        case .secondary:
            return variantContentSecondaryColor
        case .tertiary:
            return adaptiveColor(light: CivTokens.Colors.White.default_,
                                 dark: CivTokens.DarkColors.White.default_)
        }
    }

    private var variantContentPrimaryColor: Color {
        switch intent {
        case .info:
            return adaptiveColor(light: CivTokens.Colors.Info.lighter,
                                 dark: CivTokens.DarkColors.Info.lighter)
        case .warning:
            return adaptiveColor(light: CivTokens.Colors.Warning.lighter,
                                 dark: CivTokens.DarkColors.Warning.lighter)
        case .error:
            return adaptiveColor(light: CivTokens.Colors.Error.lighter,
                                 dark: CivTokens.DarkColors.Error.lighter)
        case .success:
            return adaptiveColor(light: CivTokens.Colors.Success.lighter,
                                 dark: CivTokens.DarkColors.Success.lighter)
        case .neutral:
            return adaptiveColor(light: CivTokens.Colors.Base.darker,
                                 dark: CivTokens.DarkColors.Base.darker)
        }
    }

    private var variantContentSecondaryColor: Color {
        switch intent {
        case .info:
            return adaptiveColor(light: CivTokens.Colors.Info.lighter,
                                 dark: CivTokens.DarkColors.Info.lighter).opacity(0.5)
        case .warning:
            return adaptiveColor(light: CivTokens.Colors.Warning.lighter,
                                 dark: CivTokens.DarkColors.Warning.lighter).opacity(0.5)
        case .error:
            return adaptiveColor(light: CivTokens.Colors.Error.lighter,
                                 dark: CivTokens.DarkColors.Error.lighter).opacity(0.5)
        case .success:
            return adaptiveColor(light: CivTokens.Colors.Success.lighter,
                                 dark: CivTokens.DarkColors.Success.lighter).opacity(0.5)
        case .neutral:
            return adaptiveColor(light: CivTokens.Colors.Base.lightest,
                                 dark: CivTokens.DarkColors.Base.lightest)
        }
    }

    private var accessibilityDescription: String {
        let typeLabel = "\(intent.rawValue) alert"
        if let heading, !heading.isEmpty {
            return "\(typeLabel): \(heading). \(label)"
        }
        return "\(typeLabel): \(label)"
    }

    private func adaptiveColor(light: Color, dark: Color) -> Color {
        colorScheme == .dark ? dark : light
    }
}

// MARK: - Preview

#if DEBUG
struct CivAlert_Previews: PreviewProvider {
    struct PreviewWrapper: View {
        var body: some View {
            ScrollView {
                VStack(alignment: .leading, spacing: CivTokens.Spacing._4) {
                    CivAlert(
                        intent: .info,
                        heading: "Important information",
                        label: "Your application has been received and is being processed."
                    )

                    CivAlert(
                        intent: .warning,
                        emphasis: .primary,
                        heading: "Action required",
                        label: "Your session will expire in 5 minutes.",
                        dismissible: true
                    )

                    CivAlert(
                        intent: .error,
                        heading: "Submission failed",
                        label: "Please correct the errors below and try again."
                    )

                    CivAlert(
                        intent: .success,
                        heading: "Application submitted",
                        label: "You will receive a confirmation email shortly."
                    )

                    CivAlert(
                        intent: .info,
                        label: "No heading variant with dismiss button.",
                        dismissible: true
                    )

                    CivAlert(
                        intent: .warning,
                        label: "Slim warning: scheduled maintenance tonight.",
                        slim: true
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
