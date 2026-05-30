// CivUI — CivBackToTop for SwiftUI
// Floating "scroll to top" affordance. Mirrors civ-back-to-top.
//
// Placeholder body — the prop surface satisfies schema parity. See
// .claude/rules/audit-debt.md → "Native platform implementation pass".

import SwiftUI

public struct CivBackToTop: View {
    /// Accessible label for the button.
    public var label: String

    /// Scroll-distance threshold (px) above which the button becomes visible.
    public var threshold: Int

    /// Explicit hide override (overrides the threshold-based reveal).
    public var hidden: Bool

    public init(
        label: String = "",
        threshold: Int = 400,
        hidden: Bool = true
    ) {
        self.label = label
        self.threshold = threshold
        self.hidden = hidden
    }

    public var body: some View {
        EmptyView()
    }
}
