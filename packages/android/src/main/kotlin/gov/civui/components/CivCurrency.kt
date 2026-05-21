// CivUI — CivCurrency for Jetpack Compose
// Accessible currency/dollar amount input with formatting.
// Thin wrapper around CivTextInput with currency-specific configuration.

package gov.civui.components

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp

/**
 * Accessible currency input for government applications.
 *
 * Wraps [CivTextInput] with currency mask (dollar prefix, decimal formatting).
 *
 * Usage:
 * ```kotlin
 * var amount by remember { mutableStateOf("") }
 * CivCurrency(
 *     value = amount,
 *     onValueChange = { amount = it },
 * )
 * ```
 */
@Composable
fun CivCurrency(
    value: String,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier,
    label: String = "Amount",
    hint: String? = null,
    error: String? = null,
    required: Boolean = false,
    disabled: Boolean = false,
    readonly: Boolean = false,
    onChange: ((String) -> Unit)? = null,
    onAnalytics: ((event: String, data: Map<String, Any>?) -> Unit)? = null,
    name: String = "",
    formState: CivFormState? = null,
    decimals: Int = 2,
    min: Double? = null,
    max: Double? = null,
    allowNegative: Boolean = false,
) {
    CivTextInput(
        label = label,
        value = value,
        onValueChange = onValueChange,
        modifier = modifier,
        hint = hint,
        error = error,
        required = required,
        disabled = disabled,
        readonly = readonly,
        mask = CivInputMask.Currency,
        onChange = onChange,
        onAnalytics = onAnalytics,
        name = name,
        formState = formState,
    )
}

// MARK: - Preview

@Preview(showBackground = true, name = "CivCurrency")
@Composable
private fun CivCurrencyPreview() {
    Column(modifier = Modifier.padding(16.dp)) {
        var amount by remember { mutableStateOf("") }
        CivCurrency(
            value = amount,
            onValueChange = { amount = it },
            label = "Monthly income",
            required = true,
        )

        CivCurrency(
            value = "1500.00",
            onValueChange = {},
            label = "Estimated cost",
            hint = "Enter the total amount in US dollars",
        )

        CivCurrency(
            value = "",
            onValueChange = {},
            label = "Amount owed",
            error = "Please enter a valid dollar amount",
        )

        CivCurrency(
            value = "",
            onValueChange = {},
            disabled = true,
        )
    }
}
