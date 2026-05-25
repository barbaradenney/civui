// CivUI — CivMetricGroup for Jetpack Compose
// Responsive grid wrapper for `civ-metric-tile` children. Mirrors
// civ-metric-group.
//
// Placeholder body — the prop surface satisfies schema parity. The
// Compose implementation should use LazyVerticalGrid with
// GridCells.Adaptive. See .claude/rules/audit-debt.md →
// "Native platform implementation pass".

package gov.civui.components

import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

@Composable
fun CivMetricGroup(
    columns: Int = 4,
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit = {},
) {
    Column(modifier = modifier) {
        // Placeholder — see audit-debt.md for native implementation status.
        content()
    }
}
