// CivUI — CivNotice for Jetpack Compose
// Icon-prefixed emphasis text for highlighting a specific passage
// inside longer content. GOV.UK "warning text" pattern extended with
// semantic intents. Mirrors civ-notice.
//
// Placeholder body — the prop surface satisfies schema parity. The
// Compose implementation should render a Row { Icon(...); Column {
// Text(header, FontWeight.Bold); Text(body) } } using the Material
// Icons mapping per intent. See .claude/rules/audit-debt.md →
// "Native platform implementation pass".

package gov.civui.components

import androidx.compose.foundation.layout.Box
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

@Composable
fun CivNotice(
    intent: String = "info",
    spacing: String = "default",
    emphasis: String = "primary",
    icon: String = "",
    header: String = "",
    body: String = "",
    srPrefix: String = "",
    modifier: Modifier = Modifier,
) {
    Box(modifier = modifier) {
        // Placeholder — see audit-debt.md for native implementation status.
    }
}
