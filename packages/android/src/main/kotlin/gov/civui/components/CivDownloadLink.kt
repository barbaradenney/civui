// CivUI — CivDownloadLink for Jetpack Compose
// Download link with file name and size display.

package gov.civui.components

import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

@Composable
fun CivDownloadLink(
    label: String = "",
    href: String = "",
    filename: String = "",
    fileSize: String = "",
    disabled: Boolean = false,
    modifier: Modifier = Modifier,
) {
    Column(modifier = modifier) {}
}
