// CivUI — CivInputChip for SwiftUI
// User-entered token with a remove handle. Mirrors civ-input-chip.
//
// Placeholder body — see .claude/rules/audit-debt.md → "Native platform implementation pass".

import SwiftUI

public struct CivInputChip: View {
    /// Visible label.
    public var label: String

    /// Identifier passed in the remove-event detail.
    public var value: String

    /// Disabled state.
    public var disabled: Bool

    /// Padding density. `default` | `sm`.
    public var spacing: String

    /// Remove handler.
    public var onRemove: ((String) -> Void)?

    /// Analytics tracker (parallels civ-analytics).
    public var onAnalytics: ((String, [String: Any]?) -> Void)?

    public init(
        label: String = "",
        value: String = "",
        disabled: Bool = false,
        spacing: String = "default",
        onRemove: ((String) -> Void)? = nil,
        onAnalytics: ((String, [String: Any]?) -> Void)? = nil
    ) {
        self.label = label
        self.value = value
        self.disabled = disabled
        self.spacing = spacing
        self.onRemove = onRemove
        self.onAnalytics = onAnalytics
    }

    public var body: some View {
        EmptyView()
    }
}
