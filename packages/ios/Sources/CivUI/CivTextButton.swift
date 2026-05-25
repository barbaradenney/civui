// CivUI — CivTextButton for SwiftUI
// The small button primitive — a thin SwiftUI element wrapping the
// shared text-btn visual idiom that confirm / toggle / disclosure /
// read-more all compose on web.
//
// Placeholder body — the prop surface satisfies schema parity. A real
// SwiftUI implementation should render a Button with the emphasis-tuned
// background / foreground (primary = filled brand, secondary = gray
// pill, tertiary = transparent text-link). See audit-debt.md for
// status.

import SwiftUI

/// Visual emphasis level for the text-button family.
public enum TextButtonEmphasis: String, CaseIterable {
    case primary, secondary, tertiary
}

/// Density variant. `sm` shrinks padding and font-size for dense prose.
public enum TextButtonSpacing: String, CaseIterable {
    case `default`, sm
}

/// Small inline click affordance.
///
/// Use when you need the text-btn visual idiom but none of the state-
/// machine behaviors of `CivConfirmButton` (success receipt) or
/// `CivToggleButton` (pressed toggle). For page-level CTAs use
/// `CivButton`; for toolbar / row actions use `CivActionButton`.
public struct CivTextButton: View {
    /// Button text.
    public var label: String

    /// Visual emphasis (primary / secondary / tertiary).
    public var emphasis: TextButtonEmphasis

    /// Density variant.
    public var spacing: TextButtonSpacing

    /// Leading icon name. Rendered with accessibility hidden.
    public var iconStart: String

    /// Trailing icon name. Rendered with accessibility hidden.
    public var iconEnd: String

    /// HTML button-type analog. Carried for schema parity; on iOS
    /// every button is effectively a `.button` activation target so
    /// this is informational.
    public var type: String

    /// Whether the button is disabled.
    public var isDisabled: Bool

    /// Called on tap (parallels the `civ-click` event).
    public var onClick: (() -> Void)?

    /// Called for analytics tracking (parallels `civ-analytics`).
    public var onAnalytics: ((String, [String: Any]?) -> Void)?

    public init(
        label: String = "",
        emphasis: TextButtonEmphasis = .secondary,
        spacing: TextButtonSpacing = .default,
        iconStart: String = "",
        iconEnd: String = "",
        type: String = "button",
        isDisabled: Bool = false,
        onClick: (() -> Void)? = nil,
        onAnalytics: ((String, [String: Any]?) -> Void)? = nil
    ) {
        self.label = label
        self.emphasis = emphasis
        self.spacing = spacing
        self.iconStart = iconStart
        self.iconEnd = iconEnd
        self.type = type
        self.isDisabled = isDisabled
        self.onClick = onClick
        self.onAnalytics = onAnalytics
    }

    public var body: some View {
        EmptyView()
    }
}
