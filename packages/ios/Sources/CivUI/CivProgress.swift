// CivUI — CivProgress for SwiftUI
// Accessible step indicator following government design system patterns.
// Shows completed, current, and upcoming steps with VoiceOver support.

import SwiftUI

/// Step indicator orientation.
public enum CivProgressOrientation {
    case horizontal
    case vertical
}

/// Accessible progress step indicator for government applications.
///
/// Displays a series of steps with completed (checkmark), current (highlighted),
/// and upcoming (grayed) states. Uses SF Symbols for the checkmark icon.
///
/// VoiceOver announces each step as "Step X of Y: label, completed/current/upcoming".
///
/// Usage:
/// ```swift
/// CivProgress(
///     steps: ["Personal info", "Address", "Review", "Submit"],
///     current: 1, // zero-indexed
///     orientation: .horizontal
/// )
/// ```
public struct CivProgress: View {
    // MARK: - Properties

    /// Array of step label strings.
    public let steps: [String]

    /// Zero-indexed current step.
    public let current: Int

    /// Orientation of the step indicator.
    public var orientation: CivProgressOrientation

    /// Whether steps are clickable for navigation.
    public var clickable: Bool

    /// Whether to show a step counter (e.g., "Step 2 of 5").
    public var showCounter: Bool

    /// Comma-separated list of step indices that have errors.
    public var errorSteps: String

    /// Whether to show a back button.
    public var showBack: Bool

    /// Custom label for the back button.
    public var backLabel: String

    // MARK: - Internal State

    @Environment(\.colorScheme) private var colorScheme

    // MARK: - Initializer

    public init(
        steps: [String],
        current: Int,
        orientation: CivProgressOrientation = .horizontal,
        clickable: Bool = false,
        showCounter: Bool = false,
        errorSteps: String = "",
        showBack: Bool = false,
        backLabel: String = ""
    ) {
        self.steps = steps
        self.current = current
        self.orientation = orientation
        self.clickable = clickable
        self.showCounter = showCounter
        self.errorSteps = errorSteps
        self.showBack = showBack
        self.backLabel = backLabel
    }

    // MARK: - Body

    public var body: some View {
        switch orientation {
        case .horizontal:
            horizontalLayout
        case .vertical:
            verticalLayout
        }
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

    // MARK: - Vertical Layout

    private var verticalLayout: some View {
        VStack(alignment: .leading, spacing: 0) {
            ForEach(Array(steps.enumerated()), id: \.offset) { index, stepLabel in
                if index > 0 {
                    verticalConnector(isCompleted: index <= current)
                }
                HStack(alignment: .center, spacing: CivTokens.Spacing._3) {
                    stepCircle(index: index)
                    Text(stepLabel)
                        .font(.system(size: CivTokens.Typography.FontSize.base,
                                      weight: index == current
                                          ? CivTokens.Typography.FontWeight.bold
                                          : CivTokens.Typography.FontWeight.regular))
                        .foregroundColor(stepLabelColor(index: index))
                }
                .accessibilityElement(children: .combine)
                .accessibilityLabel(accessibilityText(index: index, label: stepLabel))
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

    private func verticalConnector(isCompleted: Bool) -> some View {
        HStack {
            Rectangle()
                .fill(isCompleted
                    ? adaptiveColor(light: CivTokens.Colors.Success.default_,
                                    dark: CivTokens.DarkColors.Success.default_)
                    : adaptiveColor(light: CivTokens.Colors.Base.lighter,
                                    dark: CivTokens.DarkColors.Base.lighter))
                .frame(width: 2, height: 20)
                .padding(.leading, 13) // center with circle
            Spacer()
        }
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
struct CivProgress_Previews: PreviewProvider {
    static var previews: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 32) {
                CivProgress(
                    steps: ["Personal info", "Address", "Review", "Submit"],
                    current: 2,
                    orientation: .horizontal
                )

                CivProgress(
                    steps: ["Personal info", "Address", "Review", "Submit"],
                    current: 1,
                    orientation: .vertical
                )

                CivProgress(
                    steps: ["Start", "Finish"],
                    current: 0,
                    orientation: .horizontal
                )
            }
            .padding()
        }
        .previewDisplayName("Light")
    }
}
#endif
