// CivUI — CivBackToTop for Jetpack Compose
// Floating "scroll to top" affordance. Mirrors civ-back-to-top.
//
// Placeholder body — see .claude/rules/audit-debt.md → "Native platform implementation pass".

package gov.civui.components

import androidx.compose.foundation.layout.Box
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

@Composable
fun CivBackToTop(
    label: String = "",
    threshold: Int = 400,
    hidden: Boolean = true,
    modifier: Modifier = Modifier,
) {
    Box(modifier = modifier) {
        // Placeholder — see audit-debt.md for native implementation status.
    }
}
