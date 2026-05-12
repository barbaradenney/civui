// CivUI — CivActionSheet for Jetpack Compose
// Bottom sheet action menu for mobile interactions.

package gov.civui.components

import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

@Composable
fun CivActionSheet(
    open: Boolean = false,
    maxHeight: String = "50vh",
    label: String = "",
    trapFocus: Boolean = false,
    noClickOutside: Boolean = false,
    onClose: (() -> Unit)? = null,
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit = {},
) {
    Column(modifier = modifier) {
        if (open) {
            content()
        }
    }
}
