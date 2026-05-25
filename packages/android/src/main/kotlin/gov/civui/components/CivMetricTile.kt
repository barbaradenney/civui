// CivUI — CivMetricTile for Jetpack Compose
// Display-only dashboard tile. Mirrors civ-metric-tile.
//
// Placeholder body — the prop surface satisfies schema parity. See
// .claude/rules/audit-debt.md → "Native platform implementation pass".

package gov.civui.components

import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

@Composable
fun CivMetricTile(
    label: String = "",
    value: String = "",
    unit: String = "",
    icon: String = "",
    description: String = "",
    delta: String = "",
    trend: String = "",
    intent: String = "",
    modifier: Modifier = Modifier,
) {
    Column(modifier = modifier) {
        // Placeholder — see audit-debt.md for native implementation status.
    }
}
