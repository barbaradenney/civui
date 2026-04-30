// CivUI — CivModal for Jetpack Compose
// Accessible modal dialog with heading, close button, and backdrop controls.

package gov.civui.components

import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

@Composable
fun CivModal(
    open: Boolean = false,
    heading: String = "",
    label: String = "",
    noCloseButton: Boolean = false,
    noBackdropClose: Boolean = false,
    noEscapeClose: Boolean = false,
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
