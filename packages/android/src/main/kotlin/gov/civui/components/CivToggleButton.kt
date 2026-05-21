// CivUI — CivToggleButton for Jetpack Compose
// Two-state persistent toggle ("Show" ↔ "Hide"). Mirrors civ-toggle-button.
// Placeholder body — see audit-debt.md for native implementation status.

package gov.civui.components

import androidx.compose.foundation.layout.Box
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

/** Visual variant for the text-button family. */
enum class ToggleButtonVariant { CHIP, INLINE }

/**
 * Accessible two-state press-toggle (aria-pressed semantics on the
 * web; Compose `ToggleableState.On / Off` here).
 *
 * Use for password reveal (Show / Hide), mute / unmute, expand /
 * collapse on a custom surface — controls where each state has a
 * distinct, persistent name. For fire-and-forget actions with a
 * transient receipt, use [CivConfirmButton]; for native disclosure
 * (open / closed sections), use [CivDisclosure].
 */
@Composable
fun CivToggleButton(
    label: String = "",
    pressedLabel: String = "",
    pressed: Boolean = false,
    variant: ToggleButtonVariant = ToggleButtonVariant.CHIP,
    disabled: Boolean = false,
    modifier: Modifier = Modifier,
    onToggle: ((Boolean) -> Unit)? = null,
    onAnalytics: ((event: String, data: Map<String, Any>?) -> Unit)? = null,
) {
    Box(modifier = modifier) {
        // Placeholder — see audit-debt.md for native implementation status.
    }
}
