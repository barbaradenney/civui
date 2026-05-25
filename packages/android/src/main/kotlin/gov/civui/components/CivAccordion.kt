// CivUI — CivAccordion for Jetpack Compose
// Group container for `civ-accordion-item` rows. Mirrors civ-accordion.
//
// Placeholder body — the prop surface satisfies schema parity. See
// .claude/rules/audit-debt.md → "Native platform implementation pass".

package gov.civui.components

import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

@Composable
fun CivAccordion(
    single: Boolean = false,
    disabled: Boolean = false,
    variant: String = "tertiary",
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit = {},
) {
    Column(modifier = modifier) {
        // Placeholder — see audit-debt.md for native implementation status.
        content()
    }
}
