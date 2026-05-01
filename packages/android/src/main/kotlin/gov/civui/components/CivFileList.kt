// CivUI — CivFileList for Jetpack Compose
// Read-only display of uploaded files for review/confirmation pages.

package gov.civui.components

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

data class FileListItem(
    val name: String = "",
    val size: Int = 0,
    val url: String? = null,
    val type: String? = null,
)

@Composable
fun CivFileList(
    files: List<FileListItem> = emptyList(),
    label: String = "",
    modifier: Modifier = Modifier,
) {
    // TODO: Implement
}
