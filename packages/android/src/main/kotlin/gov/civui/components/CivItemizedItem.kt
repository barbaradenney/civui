// CivUI — CivItemizedItem for Jetpack Compose
// Single label + amount row inside a `civ-itemized-total`. Mirrors
// civ-itemized-item.
//
// Placeholder body — the prop surface satisfies schema parity. See
// .claude/rules/audit-debt.md → "Native platform implementation pass".

package gov.civui.components

import androidx.compose.foundation.layout.Row
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

@Composable
fun CivItemizedItem(
    label: String = "",
    amount: Double = 0.0,
    valueLabel: String = "",
    note: String = "",
    intent: String = "",
    modifier: Modifier = Modifier,
) {
    Row(modifier = modifier) {
        // Placeholder — see audit-debt.md for native implementation status.
    }
}
