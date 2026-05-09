// CivUI — CivDateRangePicker for Jetpack Compose
// Date range picker with start/end date fields and calendar constraints.

package gov.civui.components

import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

@Composable
fun CivDateRangePicker(
    legend: String = "",
    min: String = "",
    max: String = "",
    minRangeDays: Int = 0,
    maxRangeDays: Int = 0,
    startLabel: String = "",
    endLabel: String = "",
    startHint: String = "",
    endHint: String = "",
    startError: String = "",
    endError: String = "",
    locale: String = "en-US",
    weekStartsOn: Int = 0,
    label: String = "",
    name: String = "",
    value: String = "",
    onValueChange: (String) -> Unit = {},
    hint: String = "",
    error: String = "",
    required: Boolean = false,
    disabled: Boolean = false,
    readonly: Boolean = false,
    modifier: Modifier = Modifier,
    onInput: ((String) -> Unit)? = null,
    onChange: ((String) -> Unit)? = null,
    onAnalytics: ((String, Map<String, Any>?) -> Unit)? = null,
) {
    Column(modifier = modifier) {}
}
