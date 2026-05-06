// CivUI — CivProgressPercent for SwiftUI
// Accessible percentage-based progress indicator following government design system patterns.
// Renders: status text → percentage → track with colored fill bar

import SwiftUI

/// Accessible progress bar for government applications.
///
/// Displays a horizontal track with a colored fill bar representing percentage
/// completion. Shows optional status text and percentage label. At 100% the
/// fill switches to a green "complete" state. Mirrors the web `civ-progress-percent`
/// component.
///
/// VoiceOver announces the progress value and label.
///
/// Usage:
/// ```swift
/// CivProgressPercent(
///     value: 37.5,
///     label: "Application progress",
///     status: "3 of 8 sections complete"
/// )
/// ```
public struct CivProgressPercent: View {
    // MARK: - Properties

    /// Current progress percentage (0-100, clamped).
    public let value: Double

    /// Accessible label for the progress bar.
    public var label: String

    /// Optional status text (e.g., "3 of 8 sections complete").
    public var status: String?

    /// Whether to show the percentage text.
    public var showPercent: Bool

    // MARK: - Internal State

    @Environment(\.colorScheme) private var colorScheme

    // MARK: - Initializer

    public init(
        value: Double,
        label: String = "Progress",
        status: String? = nil,
        showPercent: Bool = true
    ) {
        self.value = value
        self.label = label
        self.status = status
        self.showPercent = showPercent
    }

    // MARK: - Body

    public var body: some View {
        let clamped = max(0, min(100, value))
        let isComplete = clamped >= 100
        let rounded = Int(clamped.rounded())

        VStack(alignment: .leading, spacing: CivTokens.Spacing._1) {
            // Status and percentage row
            HStack {
                if let status, !status.isEmpty {
                    Text(status)
                        .font(.system(size: CivTokens.Typography.FontSize.sm))
                        .foregroundColor(adaptiveColor(
                            light: CivTokens.Colors.Base.dark,
                            dark: CivTokens.DarkColors.Base.dark
                        ))
                }

                Spacer()

                if showPercent {
                    Text("\(rounded)%")
                        .font(.system(size: CivTokens.Typography.FontSize.sm,
                                      weight: CivTokens.Typography.FontWeight.bold))
                        .foregroundColor(adaptiveColor(
                            light: CivTokens.Colors.Base.darkest,
                            dark: CivTokens.DarkColors.Base.darkest
                        ))
                }
            }

            // Progress track
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    // Track background
                    RoundedRectangle(cornerRadius: CivTokens.Border.Radius.full)
                        .fill(adaptiveColor(
                            light: CivTokens.Colors.Base.lighter,
                            dark: CivTokens.DarkColors.Base.lighter
                        ))
                        .frame(height: trackHeight)

                    // Fill bar
                    RoundedRectangle(cornerRadius: CivTokens.Border.Radius.full)
                        .fill(fillColor(isComplete: isComplete))
                        .frame(
                            width: geometry.size.width * CGFloat(clamped / 100),
                            height: trackHeight
                        )
                        .animation(.easeInOut(duration: CivTokens.Motion.Duration.normal),
                                   value: clamped)
                }
            }
            .frame(height: trackHeight)
        }
        .padding(.bottom, CivTokens.Spacing._4)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(label)
        .accessibilityValue("\(rounded) percent\(status.map { ", \($0)" } ?? "")")
        .accessibilityAddTraits(.updatesFrequently)
    }

    // MARK: - Constants

    private var trackHeight: CGFloat { CivTokens.Spacing._2 }

    // MARK: - Color Helpers

    private func fillColor(isComplete: Bool) -> Color {
        if isComplete {
            return adaptiveColor(light: CivTokens.Colors.Success.default_,
                                 dark: CivTokens.DarkColors.Success.default_)
        }
        return adaptiveColor(light: CivTokens.Colors.Primary.default_,
                             dark: CivTokens.DarkColors.Primary.default_)
    }

    private func adaptiveColor(light: Color, dark: Color) -> Color {
        colorScheme == .dark ? dark : light
    }
}

// MARK: - Preview

#if DEBUG
struct CivProgressPercent_Previews: PreviewProvider {
    struct PreviewWrapper: View {
        var body: some View {
            ScrollView {
                VStack(alignment: .leading, spacing: CivTokens.Spacing._6) {
                    CivProgressPercent(
                        value: 0,
                        status: "0 of 8 sections complete"
                    )

                    CivProgressPercent(
                        value: 37.5,
                        label: "Application progress",
                        status: "3 of 8 sections complete"
                    )

                    CivProgressPercent(
                        value: 75,
                        status: "6 of 8 sections complete"
                    )

                    CivProgressPercent(
                        value: 100,
                        status: "8 of 8 sections complete"
                    )

                    CivProgressPercent(
                        value: 50,
                        label: "Upload progress",
                        showPercent: false
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
