// CivUI — CivNav for Jetpack Compose
// Top-level horizontal site nav. Mirrors civ-nav.
//
// Placeholder body — the prop surface satisfies schema parity. The
// implementation should wire the Compose-native equivalent. See
// .claude/rules/audit-debt.md → "Native platform implementation pass".

package gov.civui.components

import androidx.compose.foundation.layout.Box
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

@Composable
fun CivNav(
    label: String = "",
    modifier: Modifier = Modifier,
    onAnalytics: ((event: String, data: Map<String, Any>?) -> Unit)? = null,
    content: @Composable () -> Unit = {}
) {
    Box(modifier = modifier) {
        // Placeholder — see audit-debt.md for native implementation status.
        content()
    }
}
