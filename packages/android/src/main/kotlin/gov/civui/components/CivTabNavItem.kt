// CivUI — CivTabNavItem for Jetpack Compose
// Single item in a tab-nav. Mirrors civ-tab-nav-item.
//
// Placeholder body — the prop surface satisfies schema parity. The
// implementation should wire the Compose-native equivalent. See
// .claude/rules/audit-debt.md → "Native platform implementation pass".

package gov.civui.components

import androidx.compose.foundation.layout.Box
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

@Composable
fun CivTabNavItem(
    label: String = "",
    href: String = "",
    current: Boolean = false,
    disabled: Boolean = false,
    modifier: Modifier = Modifier,
    onAnalytics: ((event: String, data: Map<String, Any>?) -> Unit)? = null,
    content: @Composable () -> Unit = {}
) {
    Box(modifier = modifier) {
        // Placeholder — see audit-debt.md for native implementation status.
        content()
    }
}
