// CivUI — CivProgressHeader for SwiftUI
// Compact step counter: "Step X of Y: Title" with configurable emphasis.

import SwiftUI

/// Compact step counter header for multi-step forms.
///
/// Displays "Step X of Y: Title" with three emphasis variants:
/// primary (large with dividers), secondary (medium), tertiary (compact).
/// Mirrors the web `civ-progress-header` component.
public struct CivProgressHeader: View {
    /// Current step index (0-based).
    public var current: Int
    /// Total number of steps.
    public var total: Int
    /// Title of the current step.
    public var stepTitle: String
    /// Visual emphasis: "primary", "secondary", "tertiary".
    public var emphasis: String
    /// Semantic heading level (1–6).
    public var headingLevel: Int

    public init(
        current: Int = 0,
        total: Int = 0,
        stepTitle: String = "",
        emphasis: String = "secondary",
        headingLevel: Int = 2
    ) {
        self.current = current
        self.total = total
        self.stepTitle = stepTitle
        self.emphasis = emphasis
        self.headingLevel = headingLevel
    }

    public var body: some View {
        if total > 1 {
            VStack(alignment: .leading, spacing: 0) {
                Text("Step \(min(max(current, 0), total - 1) + 1) of \(total): ")
                    .bold()
                + Text(stepTitle)
            }
            .accessibilityElement(children: .combine)
            .accessibilityLabel("Step \(min(max(current, 0), total - 1) + 1) of \(total): \(stepTitle)")
        }
    }
}
