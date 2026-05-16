// CivUI — CivIncome for Jetpack Compose
// Compound dollar-amount + pay-frequency input (mirrors civ-income on web).
//
// Placeholder body — the prop surface satisfies schema parity.
// Implementation should compose CivCurrency + CivSelect.

package gov.civui.components

import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

/**
 * Income reporting compound (amount + frequency).
 */
@Composable
fun CivIncome(
    legend: String = "",
    value: String,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier,
    name: String = "",
    amountLabel: String = "",
    frequencyLabel: String = "",
    amountError: String = "",
    frequencyError: String = "",
    frequencies: List<String> = listOf(
        "weekly", "biweekly", "semimonthly", "monthly",
        "quarterly", "annually", "one-time",
    ),
    hint: String = "",
    error: String = "",
    required: Boolean = false,
    disabled: Boolean = false,
    readonly: Boolean = false,
    onInput: ((String) -> Unit)? = null,
    onChange: ((String) -> Unit)? = null,
) {
    Column(modifier = modifier) {
        // Placeholder — see audit-debt.md for native implementation status.
    }
}
