// CivUI — CivFilterChip for Jetpack Compose
// Toggleable filter chip with selection and icon support.
// For removable user-entered tokens, use CivInputChip instead.

package gov.civui.components

import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

@Composable
fun CivFilterChip(
    label: String = "",
    value: String = "",
    selected: Boolean = false,
    disabled: Boolean = false,
    emphasis: String = "default",
    variant: String = "checkbox",
    spacing: String = "default",
    iconStart: String = "",
    iconEnd: String = "",
    count: Int? = null,
    onChange: ((Boolean) -> Unit)? = null,
    onAnalytics: ((String, Map<String, Any>?) -> Unit)? = null,
    modifier: Modifier = Modifier,
) {
    Column(modifier = modifier) {}
}
