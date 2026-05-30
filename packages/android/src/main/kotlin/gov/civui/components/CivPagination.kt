// CivUI — CivPagination for Jetpack Compose
// USWDS-style page-list pagination. Mirrors civ-pagination.
//
// Placeholder body — see .claude/rules/audit-debt.md → "Native platform implementation pass".

package gov.civui.components

import androidx.compose.foundation.layout.Row
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

@Composable
fun CivPagination(
    totalItems: Int = 0,
    pageSize: Int = 25,
    page: Int = 1,
    pageSizeOptions: String = "",
    siblingCount: Int = 1,
    label: String = "",
    itemName: String = "",
    itemNamePlural: String = "",
    modifier: Modifier = Modifier,
) {
    Row(modifier = modifier) {
        // Placeholder — see audit-debt.md for native implementation status.
    }
}
