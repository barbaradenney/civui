// CivUI — CivOnThisPageItem for Jetpack Compose
// Single TOC entry. Mirrors civ-on-this-page-item.
//
// Placeholder body — see .claude/rules/audit-debt.md → "Native platform implementation pass".

package gov.civui.components

import androidx.compose.foundation.layout.Box
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

@Composable
fun CivOnThisPageItem(
    label: String = "",
    href: String = "",
    current: Boolean = false,
    modifier: Modifier = Modifier,
) {
    Box(modifier = modifier) {
        // Placeholder — see audit-debt.md for native implementation status.
    }
}
