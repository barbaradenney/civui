// CivUI — CivProgressSteps for SwiftUI
// Accessible step indicator following government design system patterns.
// Shows completed, current, and upcoming steps with VoiceOver support.

import SwiftUI

/// Accessible segmented progress indicator for government applications.
///
/// Displays a row of segments — filled for completed, highlighted for current,
/// and empty for upcoming. Mirrors the web `civ-progress-steps` component.
///
/// Usage:
/// ```swift
/// CivProgressSteps(
///     steps: ["Personal info", "Address", "Review", "Submit"],
///     current: 1
/// )
/// ```
public struct CivProgressSteps: View {
    // MARK: - Properties

    /// Array of step label strings.
    public let steps: [String]

    /// Zero-indexed current step.
    public let current: Int

    /// Whether completed steps are clickable for navigation.
    public var clickable: Bool

    /// Comma-separated list of step indices that have errors.
    public var errorSteps: String

    // MARK: - Internal State

    @Environment(\.colorScheme) private var colorScheme

    // MARK: - Initializer

    public init(
        steps: [String],
        current: Int,
        clickable: Bool = false,
        errorSteps: String = ""
    ) {
        self.steps = steps
        self.current = current
        self.clickable = clickable
        self.errorSteps = errorSteps
    }

    // MARK: - Body

    public var body: some View {
        horizontalLayout
    }

    // MARK: - Horizontal Layout

    private var horizontalLayout: some View {
        HStack(alignment: .top, spacing: 0) {
            ForEach(Array(steps.enumerated()), id: \.offset) { index, stepLabel in
                if index > 0 {
                    connector(isCompleted: index <= current)
                }
                stepView(index: index, label: stepLabel)
            }
        }
        .padding(.bottom, CivTokens.Spacing._4)
    }

    // MARK: - Step Subviews

    private func stepView(index: Int, label: String) -> some View {
        VStack(spacing: CivTokens.Spacing._1) {
            stepCircle(index: index)
            Text(label)
                .font(.system(size: CivTokens.Typography.FontSize.xs,
                              weight: index == current
                                  ? CivTokens.Typography.FontWeight.bold
                                  : CivTokens.Typography.FontWeight.regular))
                .foregroundColor(stepLabelColor(index: index))
                .multilineTextAlignment(.center)
                .frame(maxWidth: 80)
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel(accessibilityText(index: index, label: label))
    }

    private func stepCircle(index: Int) -> some View {
        ZStack {
            if index < current {
                // Completed step — checkmark
                Circle()
                    .fill(adaptiveColor(
                        light: CivTokens.Colors.Success.default_,
                        dark: CivTokens.DarkColors.Success.default_
                    ))
                    .frame(width: 28, height: 28)
                Image(systemName: "checkmark")
                    .font(.system(size: CivTokens.Typography.FontSize.sm, weight: .bold))
                    .foregroundColor(adaptiveColor(
                        light: CivTokens.Colors.White.default_,
                        dark: CivTokens.DarkColors.White.default_
                    ))
            } else if index == current {
                // Current step — primary circle with number
                Circle()
                    .fill(adaptiveColor(
                        light: CivTokens.Colors.Primary.default_,
                        dark: CivTokens.DarkColors.Primary.default_
                    ))
                    .frame(width: 28, height: 28)
                Text("\(index + 1)")
                    .font(.system(size: CivTokens.Typography.FontSize.sm, weight: .bold))
                    .foregroundColor(adaptiveColor(
                        light: CivTokens.Colors.White.default_,
                        dark: CivTokens.DarkColors.White.default_
                    ))
            } else {
                // Upcoming step — gray circle with number
                Circle()
                    .fill(adaptiveColor(
                        light: CivTokens.Colors.Base.lighter,
                        dark: CivTokens.DarkColors.Base.lighter
                    ))
                    .frame(width: 28, height: 28)
                Text("\(index + 1)")
                    .font(.system(size: CivTokens.Typography.FontSize.sm, weight: .bold))
                    .foregroundColor(adaptiveColor(
                        light: CivTokens.Colors.Base.dark,
                        dark: CivTokens.DarkColors.Base.dark
                    ))
            }
        }
    }

    // MARK: - Connectors

    private func connector(isCompleted: Bool) -> some View {
        Rectangle()
            .fill(isCompleted
                ? adaptiveColor(light: CivTokens.Colors.Success.default_,
                                dark: CivTokens.DarkColors.Success.default_)
                : adaptiveColor(light: CivTokens.Colors.Base.lighter,
                                dark: CivTokens.DarkColors.Base.lighter))
            .frame(height: 2)
            .frame(maxWidth: .infinity)
            .padding(.top, 14) // center vertically with circle
    }

    // MARK: - Helpers

    private func stepLabelColor(index: Int) -> Color {
        if index < current {
            return adaptiveColor(light: CivTokens.Colors.Base.darkest,
                                 dark: CivTokens.DarkColors.Base.darkest)
        } else if index == current {
            return adaptiveColor(light: CivTokens.Colors.Primary.default_,
                                 dark: CivTokens.DarkColors.Primary.default_)
        } else {
            return adaptiveColor(light: CivTokens.Colors.Base.default_,
                                 dark: CivTokens.DarkColors.Base.default_)
        }
    }

    private func accessibilityText(index: Int, label: String) -> String {
        let status: String
        if index < current {
            status = "completed"
        } else if index == current {
            status = "current"
        } else {
            status = "upcoming"
        }
        return "Step \(index + 1) of \(steps.count): \(label), \(status)"
    }

    // MARK: - Color Helper

    private func adaptiveColor(light: Color, dark: Color) -> Color {
        colorScheme == .dark ? dark : light
    }
}

// MARK: - Preview

#if DEBUG
struct CivProgressSteps_Previews: PreviewProvider {
    static var previews: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 32) {
                CivProgressSteps(
                    steps: ["Personal info", "Address", "Review", "Submit"],
                    current: 2
                )

                CivProgressSteps(
                    steps: ["Personal info", "Address", "Review", "Submit"],
                    current: 1,
                    clickable: true
                )

                CivProgressSteps(
                    steps: ["Start", "Finish"],
                    current: 0
                )
            }
            .padding()
        }
        .previewDisplayName("Light")
    }
}
#endif
