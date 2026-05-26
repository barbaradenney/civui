// CivUI — CivActionChip for SwiftUI
// Fire-and-forget rounded chip button. Mirrors civ-action-chip.
//
// Placeholder body — the prop surface satisfies schema parity. See
// .claude/rules/audit-debt.md → "Native platform implementation pass".

import SwiftUI

public struct CivActionChip: View {
    /// Visible label.
    public var label: String

    /// Identifier passed in the click event detail.
    public var value: String

    /// Disabled state.
    public var disabled: Bool

    /// Padding density. `default` | `sm`.
    public var spacing: String

    /// Leading icon name.
    public var iconStart: String

    /// Trailing icon name (rendered after the label and count).
    public var iconEnd: String

    /// Optional count rendered as " (N)" after the label. `nil` = no count.
    public var count: Int?

    /// Click handler.
    public var onClick: ((String) -> Void)?

    /// Analytics tracker (parallels civ-analytics).
    public var onAnalytics: ((String, [String: Any]?) -> Void)?

    public init(
        label: String = "",
        value: String = "",
        disabled: Bool = false,
        spacing: String = "default",
        iconStart: String = "",
        iconEnd: String = "",
        count: Int? = nil,
        onClick: ((String) -> Void)? = nil,
        onAnalytics: ((String, [String: Any]?) -> Void)? = nil
    ) {
        self.label = label
        self.value = value
        self.disabled = disabled
        self.spacing = spacing
        self.iconStart = iconStart
        self.iconEnd = iconEnd
        self.count = count
        self.onClick = onClick
        self.onAnalytics = onAnalytics
    }

    public var body: some View {
        EmptyView()
    }
}
