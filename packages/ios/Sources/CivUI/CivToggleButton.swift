// CivUI — CivToggleButton for SwiftUI
// Two-state persistent toggle ("Show" ↔ "Hide"). Mirrors the web
// civ-toggle-button component.
//
// Placeholder body — the prop surface satisfies schema parity. The
// implementation should render a button with `accessibilityAddTraits(.isSelected)`
// reflecting `pressed`, swap the label between `label` and `pressedLabel`
// on each tap, and emit `onToggle` with the NEW pressed state. See
// audit-debt.md for status.

import SwiftUI

/// Visual emphasis level for the text-button family.
public enum ToggleButtonEmphasis: String, CaseIterable {
    case primary, secondary, tertiary
}

/// Text-button variant determines the visual treatment.
/// - Note: Deprecated; use `ToggleButtonEmphasis` instead. Kept for
///   schema parity with the web component's backward-compat alias.
public enum ToggleButtonVariant: String, CaseIterable {
    case chip, inline
}

/// Accessible two-state press-toggle (aria-pressed semantics).
///
/// Use for password reveal (Show / Hide), mute / unmute, expand /
/// collapse on a custom surface — controls where each state has a
/// distinct, persistent name. For fire-and-forget actions with a
/// transient receipt, use `CivConfirmButton`; for native disclosure
/// (open / closed sections), use `CivDisclosure`.
public struct CivToggleButton: View {
    /// Label shown when `pressed` is false.
    public var label: String

    /// Label shown when `pressed` is true.
    public var pressedLabel: String

    /// Pressed state. Two-way bindable — consumers can drive the
    /// rendered label and accessibility trait without going through a tap.
    @Binding public var pressed: Bool

    /// Visual emphasis (primary = filled brand, secondary = gray pill, tertiary = transparent text-link).
    public var emphasis: ToggleButtonEmphasis

    /// Deprecated visual variant — kept for backward compatibility.
    /// Use `emphasis` instead. `variant="chip"` ≡ `emphasis="secondary"`;
    /// `variant="inline"` ≡ `emphasis="tertiary"`.
    public var variant: ToggleButtonVariant?

    /// Optional leading icon name from the CivUI icon library.
    public var iconStart: String

    /// Whether the button is disabled.
    public var isDisabled: Bool

    /// Called on tap with the NEW pressed state (parallels `civ-toggle`).
    public var onToggle: ((Bool) -> Void)?

    /// Called for analytics tracking (parallels `civ-analytics`).
    public var onAnalytics: ((String, [String: Any]?) -> Void)?

    public init(
        label: String = "",
        pressedLabel: String = "",
        pressed: Binding<Bool> = .constant(false),
        emphasis: ToggleButtonEmphasis = .secondary,
        variant: ToggleButtonVariant? = nil,
        iconStart: String = "",
        isDisabled: Bool = false,
        onToggle: ((Bool) -> Void)? = nil,
        onAnalytics: ((String, [String: Any]?) -> Void)? = nil
    ) {
        self.label = label
        self.pressedLabel = pressedLabel
        self._pressed = pressed
        self.emphasis = emphasis
        self.variant = variant
        self.iconStart = iconStart
        self.isDisabled = isDisabled
        self.onToggle = onToggle
        self.onAnalytics = onAnalytics
    }

    public var body: some View {
        EmptyView()
    }
}
