// CivUI — CivFilterChipGroup for Jetpack Compose
// Container for filter chips with multi/single selection modes.

package gov.civui.components

import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

@Composable
fun CivFilterChipGroup(
    mode: String = "multi",
    label: String = "",
    onChange: ((List<String>) -> Unit)? = null,
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit = {},
) {
    Column(modifier = modifier) {
        content()
    }
}
