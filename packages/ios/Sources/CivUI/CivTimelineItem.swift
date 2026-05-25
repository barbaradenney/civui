// CivUI — CivTimelineItem for SwiftUI
// Single dated entry inside a `civ-timeline`. Mirrors civ-timeline-item.
//
// Placeholder body — the prop surface satisfies schema parity. See
// .claude/rules/audit-debt.md → "Native platform implementation pass".

import SwiftUI

public struct CivTimelineItem: View {
    /// ISO 8601 timestamp.
    public var timestamp: String

    /// `relative` | `absolute` | `both`.
    public var timestampFormat: String

    /// Who took the action.
    public var actor: String

    /// What they did.
    public var action: String

    /// Rail dot intent. `success` | `info` | `warning` | `error` | `neutral`.
    public var intent: String

    /// Override the default intent icon.
    public var icon: String

    public init(
        timestamp: String = "",
        timestampFormat: String = "both",
        actor: String = "",
        action: String = "",
        intent: String = "neutral",
        icon: String = ""
    ) {
        self.timestamp = timestamp
        self.timestampFormat = timestampFormat
        self.actor = actor
        self.action = action
        self.intent = intent
        self.icon = icon
    }

    public var body: some View {
        EmptyView()
    }
}
