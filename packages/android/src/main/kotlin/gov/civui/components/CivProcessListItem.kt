// CivUI — CivProcessListItem for Jetpack Compose
// Single step inside a `civ-process-list`. Mirrors civ-process-list-item.
//
// Placeholder body — the prop surface satisfies schema parity. See
// .claude/rules/audit-debt.md → "Native platform implementation pass".

package gov.civui.components

import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

@Composable
fun CivProcessListItem(
    heading: String = "",
    headingLevel: Int = 3,
    state: String = "default",
    icon: String = "",
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit = {},
) {
    Column(modifier = modifier) {
        // Placeholder — see audit-debt.md for native implementation status.
        content()
    }
}
