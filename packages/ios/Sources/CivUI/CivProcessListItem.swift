// CivUI — CivProcessListItem for SwiftUI
// Single step inside a `civ-process-list`. Mirrors civ-process-list-item.
//
// Placeholder body — the prop surface satisfies schema parity. See
// .claude/rules/audit-debt.md → "Native platform implementation pass".

import SwiftUI

public struct CivProcessListItem: View {
    /// Heading text for the step.
    public var heading: String

    /// HTML heading level (2–6) applied to the heading.
    public var headingLevel: Int

    /// `default` (upcoming, numbered marker) or `complete` (check icon).
    public var state: String

    /// Override the default marker icon.
    public var icon: String

    public init(
        heading: String = "",
        headingLevel: Int = 3,
        state: String = "default",
        icon: String = ""
    ) {
        self.heading = heading
        self.headingLevel = headingLevel
        self.state = state
        self.icon = icon
    }

    public var body: some View {
        EmptyView()
    }
}
