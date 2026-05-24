// CivUI — CivPopover for SwiftUI
// Anchored popover surface. Mirrors civ-popover.
//
// Placeholder body — the prop surface satisfies schema parity. The
// implementation should wire the platform-native equivalent. See
// .claude/rules/audit-debt.md → "Native platform implementation pass".

import SwiftUI

public struct CivPopover: View {
    /// open
    public var open: Bool

    /// label
    public var label: String

    /// align
    public var align: String

    /// panelRole
    public var panelRole: String

    /// triggerHaspopup
    public var triggerHaspopup: String

    /// noTabClose
    public var noTabClose: Bool

    /// noClickOutsideClose
    public var noClickOutsideClose: Bool

    /// noEscapeClose
    public var noEscapeClose: Bool

    /// Called on `civ-open`.
    public var onPopoverOpen: (() -> Void)?

    /// Called on `civ-close`.
    public var onPopoverClose: (() -> Void)?

    /// Called on `civ-popover-trigger-arrow`.
    public var onPopoverTriggerArrow: (() -> Void)?

    /// Called for analytics tracking (parallels civ-analytics).
    public var onAnalytics: ((String, [String: Any]?) -> Void)?

    public init(
        open: Bool = false,
        label: String = "",
        align: String = "end",
        panelRole: String = "dialog",
        triggerHaspopup: String = "true",
        noTabClose: Bool = false,
        noClickOutsideClose: Bool = false,
        noEscapeClose: Bool = false,
        onPopoverOpen: (() -> Void)? = nil,
        onPopoverClose: (() -> Void)? = nil,
        onPopoverTriggerArrow: (() -> Void)? = nil,
        onAnalytics: ((String, [String: Any]?) -> Void)? = nil
    ) {
        self.open = open
        self.label = label
        self.align = align
        self.panelRole = panelRole
        self.triggerHaspopup = triggerHaspopup
        self.noTabClose = noTabClose
        self.noClickOutsideClose = noClickOutsideClose
        self.noEscapeClose = noEscapeClose
        self.onPopoverOpen = onPopoverOpen
        self.onPopoverClose = onPopoverClose
        self.onPopoverTriggerArrow = onPopoverTriggerArrow
        self.onAnalytics = onAnalytics
    }

    public var body: some View {
        EmptyView()
    }
}
