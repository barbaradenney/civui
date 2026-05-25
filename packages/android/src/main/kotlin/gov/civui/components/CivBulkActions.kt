// CivUI — CivBulkActions for Jetpack Compose
// "N items selected" bar with action affordances. Mirrors civ-bulk-actions.
//
// Placeholder body — see .claude/rules/audit-debt.md → "Native platform implementation pass".

package gov.civui.components

import androidx.compose.foundation.layout.Row
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

@Composable
fun CivBulkActions(
    count: Int = 0,
    itemName: String = "",
    itemNamePlural: String = "",
    clearLabel: String = "",
    hideClear: Boolean = false,
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit = {},
) {
    Row(modifier = modifier) {
        // Placeholder — see audit-debt.md for native implementation status.
        content()
    }
}
