// CivUI — CivSideNav for Jetpack Compose
// Vertical hierarchical left-rail navigation. Mirrors civ-side-nav.
//
// Placeholder body — see .claude/rules/audit-debt.md → "Native platform implementation pass".

package gov.civui.components

import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

@Composable
fun CivSideNav(
    label: String = "",
    spacing: String = "default",
    emphasis: String = "secondary",
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit = {},
) {
    Column(modifier = modifier) {
        // Placeholder — see audit-debt.md for native implementation status.
        content()
    }
}
