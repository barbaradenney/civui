// CivUI — CivTab for Jetpack Compose
// Single tab in an ARIA tabs widget. Mirrors civ-tab.
//
// Placeholder body — the prop surface satisfies schema parity. The
// implementation should wire the Compose-native equivalent. See
// .claude/rules/audit-debt.md → "Native platform implementation pass".

package gov.civui.components

import androidx.compose.foundation.layout.Box
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

@Composable
fun CivTab(
    value: String = "",
    label: String = "",
    selected: Boolean = false,
    disabled: Boolean = false,
    modifier: Modifier = Modifier,
    onTabSelect: (() -> Unit)? = null,
    onAnalytics: ((event: String, data: Map<String, Any>?) -> Unit)? = null,
    content: @Composable () -> Unit = {}
) {
    Box(modifier = modifier) {
        // Placeholder — see audit-debt.md for native implementation status.
        content()
    }
}
