// CivUI — CivEmailLink for Jetpack Compose
// Email link with address and optional subject.

package gov.civui.components

import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

@Composable
fun CivEmailLink(
    address: String = "",
    label: String = "",
    subject: String = "",
    disabled: Boolean = false,
    modifier: Modifier = Modifier,
) {
    Column(modifier = modifier) {}
}
