// CivUI — CivActionChip for Jetpack Compose
// Fire-and-forget rounded chip button. Mirrors civ-action-chip.
//
// Placeholder body — see .claude/rules/audit-debt.md → "Native platform implementation pass".

package gov.civui.components

import androidx.compose.foundation.layout.Box
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

@Composable
fun CivActionChip(
    label: String = "",
    value: String = "",
    disabled: Boolean = false,
    spacing: String = "default",
    iconStart: String = "",
    iconEnd: String = "",
    count: Int = 0,
    modifier: Modifier = Modifier,
    onClick: ((String) -> Unit)? = null,
    onAnalytics: ((event: String, data: Map<String, Any>?) -> Unit)? = null,
) {
    Box(modifier = modifier) {
        // Placeholder — see audit-debt.md for native implementation status.
    }
}
