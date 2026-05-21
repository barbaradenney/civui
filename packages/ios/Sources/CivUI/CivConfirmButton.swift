// CivUI — CivConfirmButton for SwiftUI
// Fire-and-forget action with a transient receipt ("Copy" → "Copied ✓"
// → "Copy"). Mirrors the web civ-confirm-button component.
//
// Placeholder body — the prop surface satisfies schema parity. The
// implementation should swap the label to the success copy for the
// configured success window then revert, announcing the transition
// via VoiceOver. See audit-debt.md for status.

import SwiftUI

/// Text-button variant determines the visual treatment.
public enum ConfirmButtonVariant: String, CaseIterable {
    case chip, inline
}

/// Accessible "do an action and confirm it happened" button.
///
/// Use for Copy, Paste, Scan, Generate — actions where the user benefits
/// from a quick visual confirmation but doesn't need a modal. The
/// consumer performs the work in the `onConfirm` closure; the component
/// owns the success-window timing and the label swap.
public struct CivConfirmButton: View {
    /// Default label shown when the button is idle.
    public var label: String

    /// Label shown during the success window after a click.
    public var successLabel: String

    /// Milliseconds the success label remains visible.
    public var successMs: Int

    /// Visual variant (chip = prominent pill, inline = text-link style).
    public var variant: ConfirmButtonVariant

    /// Whether the button is disabled.
    public var isDisabled: Bool

    /// Called on tap (parallels the `civ-confirm` event).
    public var onConfirm: (() -> Void)?

    /// Called for analytics tracking (parallels `civ-analytics`).
    public var onAnalytics: ((String, [String: Any]?) -> Void)?

    public init(
        label: String = "",
        successLabel: String = "",
        successMs: Int = 1500,
        variant: ConfirmButtonVariant = .chip,
        isDisabled: Bool = false,
        onConfirm: (() -> Void)? = nil,
        onAnalytics: ((String, [String: Any]?) -> Void)? = nil
    ) {
        self.label = label
        self.successLabel = successLabel
        self.successMs = successMs
        self.variant = variant
        self.isDisabled = isDisabled
        self.onConfirm = onConfirm
        self.onAnalytics = onAnalytics
    }

    public var body: some View {
        EmptyView()
    }
}
