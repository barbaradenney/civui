// CivUI — CivButtonGroup for Jetpack Compose
// Groups action buttons with consistent spacing and alignment.

package gov.civui.components

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

@Composable
fun CivButtonGroup(
    label: String = "",
    orientation: String = "horizontal",
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit = {},
) {
    if (orientation == "vertical") {
        Column(modifier = modifier) {
            content()
        }
    } else {
        Row(modifier = modifier) {
            content()
        }
    }
}
