// CivUI — CivDisclosure for Jetpack Compose
// Inline expandable content (mirrors the web civ-disclosure component).
//
// Placeholder body — the prop surface satisfies schema parity. The
// implementation should wire a Compose AnimatedVisibility / expandable
// card with the label/icon/size affordances. See audit-debt.md.

package gov.civui.components

import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

/**
 * Accessible inline disclosure widget for "Why we ask?" justifications
 * and other supplementary content.
 */
@Composable
fun CivDisclosure(
    label: String = "",
    open: Boolean = false,
    icon: String = "chevron-right",
    size: String = "default",
    modifier: Modifier = Modifier,
    onToggle: ((Boolean) -> Unit)? = null,
    onAnalytics: ((event: String, data: Map<String, Any>?) -> Unit)? = null,
    content: @Composable () -> Unit = {},
) {
    Column(modifier = modifier) {
        // Placeholder — see audit-debt.md for native implementation status.
    }
}
