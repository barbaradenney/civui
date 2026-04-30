// CivUI — CivServiceHistory for Jetpack Compose
// Compound military service history form with branch, dates, and discharge fields.

package gov.civui.components

import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

@Composable
fun CivServiceHistory(
    legend: String = "",
    showServiceNumber: Boolean = false,
    branchError: String = "",
    startDateError: String = "",
    endDateError: String = "",
    dischargeError: String = "",
    serviceNumberError: String = "",
    name: String = "",
    value: String = "",
    onValueChange: (String) -> Unit = {},
    hint: String = "",
    error: String = "",
    required: Boolean = false,
    disabled: Boolean = false,
    readonly: Boolean = false,
    onInput: ((String) -> Unit)? = null,
    onChange: ((String) -> Unit)? = null,
    onAnalytics: ((String, Map<String, Any>?) -> Unit)? = null,
    modifier: Modifier = Modifier,
) {
    Column(modifier = modifier) {}
}
