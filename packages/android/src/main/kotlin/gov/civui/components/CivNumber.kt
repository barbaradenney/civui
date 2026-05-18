// CivUI — CivNumber for Jetpack Compose
// Generic numeric input (mirrors the web civ-number component).
//
// Placeholder body — the prop surface satisfies schema parity.
// Compose implementation should use TextField with KeyboardOptions
// (keyboardType = KeyboardType.Number / Decimal) and an onValueChange
// filter for non-digit input. See audit-debt.md.

package gov.civui.components

import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

/**
 * Generic numeric input for quantities, counts, ages, and other non-currency numbers.
 */
@Composable
fun CivNumber(
    label: String,
    value: String,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier,
    name: String = "",
    min: Double? = null,
    max: Double? = null,
    allowDecimal: Boolean = false,
    allowNegative: Boolean = false,
    spacing: String = "default",
    placeholder: String = "",
    prefix: String = "",
    suffix: String = "",
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
