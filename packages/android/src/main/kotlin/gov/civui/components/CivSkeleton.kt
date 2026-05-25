// CivUI — CivSkeleton for Jetpack Compose
// Loading-state placeholder shape. Mirrors civ-skeleton.
//
// Placeholder body — see .claude/rules/audit-debt.md → "Native platform implementation pass".

package gov.civui.components

import androidx.compose.foundation.layout.Box
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

@Composable
fun CivSkeleton(
    shape: String = "text",
    width: String = "",
    lines: Int = 1,
    modifier: Modifier = Modifier,
) {
    Box(modifier = modifier) {
        // Placeholder — see audit-debt.md for native implementation status.
    }
}
