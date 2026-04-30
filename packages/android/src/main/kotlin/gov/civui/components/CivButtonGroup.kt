// CivUI — CivButtonGroup for Jetpack Compose
// Groups action buttons with consistent spacing and alignment.

package gov.civui.components

import androidx.compose.foundation.layout.Row
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

@Composable
fun CivButtonGroup(
    label: String = "",
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit = {},
) {
    Row(modifier = modifier) {
        content()
    }
}
