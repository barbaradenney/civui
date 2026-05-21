// CivUI — CivConfirmButton for Jetpack Compose
// Fire-and-forget action with a transient receipt ("Copy" → "Copied ✓"
// → "Copy"). Mirrors the web civ-confirm-button component.
//
// Placeholder body — the prop surface satisfies schema parity. The
// implementation should swap the label to the success copy for the
// configured window and announce the transition via TalkBack. See
// audit-debt.md for status.

package gov.civui.components

import androidx.compose.foundation.layout.Box
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

/** Visual variant for the text-button family. */
enum class ConfirmButtonVariant { CHIP, INLINE }

/**
 * Accessible "do an action and confirm it happened" button.
 *
 * Use for Copy, Paste, Scan, Generate — actions where the user benefits
 * from a quick visual confirmation but doesn't need a modal. The
 * consumer performs the work in the [onConfirm] lambda; the component
 * owns the success-window timing and the label swap.
 */
@Composable
fun CivConfirmButton(
    label: String = "",
    successLabel: String = "",
    successMs: Int = 1500,
    variant: ConfirmButtonVariant = ConfirmButtonVariant.CHIP,
    disabled: Boolean = false,
    modifier: Modifier = Modifier,
    onConfirm: (() -> Unit)? = null,
    onAnalytics: ((event: String, data: Map<String, Any>?) -> Unit)? = null,
) {
    Box(modifier = modifier) {
        // Placeholder — see audit-debt.md for native implementation status.
    }
}
