// CivUI — CivOnThisPage for Jetpack Compose
// In-page table of contents with scroll-position highlight. Mirrors
// civ-on-this-page.
//
// Placeholder body — see .claude/rules/audit-debt.md → "Native platform implementation pass".

package gov.civui.components

import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

@Composable
fun CivOnThisPage(
    label: String = "",
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit = {},
) {
    Column(modifier = modifier) {
        // Placeholder — see audit-debt.md for native implementation status.
        content()
    }
}
