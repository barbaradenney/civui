// CivUI — CivMetricTile for SwiftUI
// Display-only dashboard tile with label / value / unit / delta / trend.
// Mirrors civ-metric-tile.
//
// Placeholder body — the prop surface satisfies schema parity. See
// .claude/rules/audit-debt.md → "Native platform implementation pass".

import SwiftUI

public struct CivMetricTile: View {
    /// Headline label rendered above the value.
    public var label: String

    /// Primary numeric or text value.
    public var value: String

    /// Optional unit (e.g. `%`, `min`).
    public var unit: String

    /// Optional leading icon.
    public var icon: String

    /// Optional small descriptive line below the value.
    public var description: String

    /// Optional delta string (e.g. `+12%`, `-3`).
    public var delta: String

    /// Trend arrow direction. `''` | `up` | `down` | `flat`.
    public var trend: String

    /// Intent for delta + trend tinting. `''` | `positive` | `negative` | `neutral`.
    public var intent: String

    public init(
        label: String = "",
        value: String = "",
        unit: String = "",
        icon: String = "",
        description: String = "",
        delta: String = "",
        trend: String = "",
        intent: String = ""
    ) {
        self.label = label
        self.value = value
        self.unit = unit
        self.icon = icon
        self.description = description
        self.delta = delta
        self.trend = trend
        self.intent = intent
    }

    public var body: some View {
        EmptyView()
    }
}
