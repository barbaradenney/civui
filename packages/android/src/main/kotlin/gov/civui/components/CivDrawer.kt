// CivUI — CivDrawer for Jetpack Compose
// Side-anchored slide-in dialog. Schema parity stub — body is a
// placeholder Column until the Android implementation pass.

package gov.civui.components

import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

@Composable
fun CivDrawer(
    open: Boolean = false,
    align: String = "start",
    width: String = "min(320px, 90vw)",
    heading: String = "",
    label: String = "",
    noCloseButton: Boolean = false,
    noBackdropClose: Boolean = false,
    noEscapeClose: Boolean = false,
    noStickyHeader: Boolean = false,
    noStickyFooter: Boolean = false,
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
