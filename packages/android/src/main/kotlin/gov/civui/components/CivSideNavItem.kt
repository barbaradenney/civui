// CivUI — CivSideNavItem for Jetpack Compose
// Single rail entry with optional nested sub-items. Mirrors civ-side-nav-item.
//
// Placeholder body — see .claude/rules/audit-debt.md → "Native platform implementation pass".

package gov.civui.components

import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

@Composable
fun CivSideNavItem(
    label: String = "",
    href: String = "",
    current: Boolean = false,
    disabled: Boolean = false,
    open: Boolean = false,
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit = {},
) {
    Column(modifier = modifier) {
        // Placeholder — see audit-debt.md for native implementation status.
        content()
    }
}
