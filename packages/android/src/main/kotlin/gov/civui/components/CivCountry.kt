// CivUI — CivCountry for Jetpack Compose
// Country select field with US-first ordering and include/exclude filtering.

package gov.civui.components

import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

@Composable
fun CivCountry(
    usFirst: Boolean = true,
    include: String = "",
    exclude: String = "",
    label: String = "",
    name: String = "",
    value: String = "",
    onValueChange: (String) -> Unit = {},
    modifier: Modifier = Modifier,
    hint: String = "",
    error: String = "",
    required: Boolean = false,
    disabled: Boolean = false,
    readonly: Boolean = false,
    onInput: ((String) -> Unit)? = null,
    onChange: ((String) -> Unit)? = null,
    onAnalytics: ((String, Map<String, Any>?) -> Unit)? = null,
) {
    Column(modifier = modifier) {}
}
