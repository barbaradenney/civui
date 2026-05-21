// CivUI — CivPopover for Jetpack Compose
// Anchored popover surface. Mirrors civ-popover.
//
// Placeholder body — the prop surface satisfies schema parity. The
// implementation should wire the Compose-native equivalent. See
// .claude/rules/audit-debt.md → "Native platform implementation pass".

package gov.civui.components

import androidx.compose.foundation.layout.Box
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

@Composable
fun CivPopover(
    open: Boolean = false,
    label: String = "",
    align: String = "end",
    panelRole: String = "dialog",
    triggerHaspopup: String = "true",
    noTabClose: Boolean = false,
    noClickOutsideClose: Boolean = false,
    noEscapeClose: Boolean = false,
    modifier: Modifier = Modifier,
    onPopoverOpen: (() -> Unit)? = null,
    onPopoverClose: (() -> Unit)? = null,
    onPopoverTriggerArrow: (() -> Unit)? = null,
    onAnalytics: ((event: String, data: Map<String, Any>?) -> Unit)? = null,
    content: @Composable () -> Unit = {}
) {
    Box(modifier = modifier) {
        // Placeholder — see audit-debt.md for native implementation status.
        content()
    }
}
