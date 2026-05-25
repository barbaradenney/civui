// CivUI — CivAccordionItem for SwiftUI
// Single expandable row inside a `civ-accordion`. Mirrors civ-accordion-item.
//
// Placeholder body — the prop surface satisfies schema parity. The
// SwiftUI implementation should use DisclosureGroup with the label as
// the row trigger. See .claude/rules/audit-debt.md →
// "Native platform implementation pass".

import SwiftUI

public struct CivAccordionItem: View {
    /// Header text rendered on the full-width trigger row.
    public var label: String

    /// Whether the panel is currently expanded.
    public var open: Bool

    /// Disables interaction; the row is dimmed and not toggleable.
    public var disabled: Bool

    /// Called on `civ-toggle`.
    public var onToggle: ((Bool) -> Void)?

    /// Called for analytics tracking (parallels civ-analytics).
    public var onAnalytics: ((String, [String: Any]?) -> Void)?

    public init(
        label: String = "",
        open: Bool = false,
        disabled: Bool = false,
        onToggle: ((Bool) -> Void)? = nil,
        onAnalytics: ((String, [String: Any]?) -> Void)? = nil
    ) {
        self.label = label
        self.open = open
        self.disabled = disabled
        self.onToggle = onToggle
        self.onAnalytics = onAnalytics
    }

    public var body: some View {
        EmptyView()
    }
}
