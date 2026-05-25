// CivUI — CivToolbar for Jetpack Compose
// Above-grid toolbar container. Mirrors civ-toolbar.
//
// Placeholder body — see .claude/rules/audit-debt.md → "Native platform implementation pass".

package gov.civui.components

import androidx.compose.foundation.layout.Row
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

@Composable
fun CivToolbar(
    label: String = "",
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit = {},
) {
    Row(modifier = modifier) {
        // Placeholder — see audit-debt.md for native implementation status.
        content()
    }
}
