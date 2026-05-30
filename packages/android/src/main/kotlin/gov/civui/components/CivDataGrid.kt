// CivUI — CivDataGrid for Jetpack Compose
// Sortable / selectable admin data table. Mirrors civ-data-grid.
//
// Placeholder body — see .claude/rules/audit-debt.md → "Native platform implementation pass".

package gov.civui.components

import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

@Composable
fun CivDataGrid(
    caption: String = "",
    captionHidden: Boolean = false,
    sortBy: String = "",
    sortDirection: String = "none",
    multiSort: Boolean = false,
    responsive: String = "stacked",
    stickyHeader: Boolean = false,
    selectable: String = "none",
    loading: Boolean = false,
    errorMessage: String = "",
    emptyMessage: String = "",
    striped: Boolean = false,
    bordered: Boolean = false,
    interactive: Boolean = false,
    groupBy: String = "",
    stickyFooter: Boolean = false,
    showGroupSubtotals: Boolean = true,
    spacing: String = "default",
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit = {},
) {
    Column(modifier = modifier) {
        // Placeholder — see audit-debt.md for native implementation status.
        content()
    }
}
