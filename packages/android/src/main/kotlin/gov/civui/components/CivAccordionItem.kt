// CivUI — CivAccordionItem for Jetpack Compose
// Single expandable row inside a `civ-accordion`. Mirrors civ-accordion-item.
//
// Placeholder body — the prop surface satisfies schema parity. See
// .claude/rules/audit-debt.md → "Native platform implementation pass".

package gov.civui.components

import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

@Composable
fun CivAccordionItem(
    label: String = "",
    open: Boolean = false,
    disabled: Boolean = false,
    modifier: Modifier = Modifier,
    onToggle: ((Boolean) -> Unit)? = null,
    onAnalytics: ((event: String, data: Map<String, Any>?) -> Unit)? = null,
    content: @Composable () -> Unit = {},
) {
    Column(modifier = modifier) {
        // Placeholder — see audit-debt.md for native implementation status.
        content()
    }
}
