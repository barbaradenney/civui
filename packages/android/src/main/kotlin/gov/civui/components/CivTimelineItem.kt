// CivUI — CivTimelineItem for Jetpack Compose
// Single dated entry inside a `civ-timeline`. Mirrors civ-timeline-item.
//
// Placeholder body — the prop surface satisfies schema parity. See
// .claude/rules/audit-debt.md → "Native platform implementation pass".

package gov.civui.components

import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

@Composable
fun CivTimelineItem(
    timestamp: String = "",
    timestampFormat: String = "both",
    actor: String = "",
    action: String = "",
    intent: String = "neutral",
    icon: String = "",
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit = {},
) {
    Column(modifier = modifier) {
        // Placeholder — see audit-debt.md for native implementation status.
        content()
    }
}
