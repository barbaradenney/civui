// CivUI — CivSpinner for Jetpack Compose
// Loading indicator. Mirrors civ-spinner.
//
// Placeholder body — see .claude/rules/audit-debt.md → "Native platform implementation pass".

package gov.civui.components

import androidx.compose.foundation.layout.Box
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

@Composable
fun CivSpinner(
    size: String = "md",
    label: String = "Loading",
    delay: Int = 0,
    minDuration: Int = 0,
    decorative: Boolean = false,
    modifier: Modifier = Modifier,
) {
    Box(modifier = modifier) {
        // Placeholder — see audit-debt.md for native implementation status.
    }
}
