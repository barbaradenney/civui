// CivUI — CivInputChip for Jetpack Compose
// User-entered token with a remove handle. Mirrors civ-input-chip.
//
// Placeholder body — see .claude/rules/audit-debt.md → "Native platform implementation pass".

package gov.civui.components

import androidx.compose.foundation.layout.Box
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

@Composable
fun CivInputChip(
    label: String = "",
    value: String = "",
    disabled: Boolean = false,
    spacing: String = "default",
    modifier: Modifier = Modifier,
    onRemove: ((String) -> Unit)? = null,
    onAnalytics: ((event: String, data: Map<String, Any>?) -> Unit)? = null,
) {
    Box(modifier = modifier) {
        // Placeholder — see audit-debt.md for native implementation status.
    }
}
