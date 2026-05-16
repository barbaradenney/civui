// CivUI — CivTimePicker for Jetpack Compose
// Time-of-day input (mirrors the web civ-time-picker component).
//
// Placeholder body — the prop surface satisfies schema parity.
// Implementation should use Material3 TimePicker or TimeInput. The
// `mode` prop maps to TimePicker (combo) vs TimeInput (select) per
// Material guidelines. See audit-debt.md.

package gov.civui.components

import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

/**
 * Self-contained time-of-day input. Stores its value in 24-hour ISO format (HH:MM);
 * the format property only affects display.
 */
@Composable
fun CivTimePicker(
    mode: String = "combo",
    legend: String = "",
    value: String,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier,
    name: String = "",
    format: String = "12",
    minuteStep: Int = 0,
    min: String = "",
    max: String = "",
    placeholder: String = "",
    hourLabel: String = "",
    minuteLabel: String = "",
    periodLabel: String = "",
    hideNowButton: Boolean = false,
    nowButtonLabel: String = "",
    hint: String = "",
    error: String = "",
    required: Boolean = false,
    disabled: Boolean = false,
    readonly: Boolean = false,
    onInput: ((String) -> Unit)? = null,
    onChange: ((String) -> Unit)? = null,
    onAnalytics: ((event: String, data: Map<String, Any>?) -> Unit)? = null,
) {
    Column(modifier = modifier) {
        // Placeholder — see audit-debt.md for native implementation status.
    }
}
