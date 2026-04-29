// CivUI — CivSsn for Jetpack Compose
// Accessible Social Security number input with masking and PII protection.
// Thin wrapper around CivTextInput with SSN-specific configuration.

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
 * Accessible Social Security number input for government applications.
 *
 * Wraps [CivTextInput] with SSN mask (###-##-####) and PII protection.
 * Supports full SSN or last-4-digits mode.
 *
 * Usage:
 * ```kotlin
 * var ssn by remember { mutableStateOf("") }
 * CivSsn(
 *     value = ssn,
 *     onValueChange = { ssn = it },
 * )
 * ```
 */
@Composable
fun CivSsn(
    value: String,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier,
    label: String = "Social Security number",
    mode: String = "full",
    hint: String? = null,
    error: String? = null,
    required: Boolean = false,
    disabled: Boolean = false,
    readonly: Boolean = false,
    onChange: ((String) -> Unit)? = null,
    onAnalytics: ((event: String, data: Map<String, Any>?) -> Unit)? = null,
    name: String = "",
    formState: CivFormState? = null,
) {
    if (mode == "last4") {
        CivTextInput(
            label = label,
            value = value,
            onValueChange = onValueChange,
            modifier = modifier,
            hint = hint ?: "Last 4 digits",
            error = error,
            required = required,
            disabled = disabled,
            readonly = readonly,
            inputType = CivInputType.Number,
            maxLength = 4,
            width = CivInputWidth.XSmall,
            onChange = onChange,
            onAnalytics = onAnalytics,
            name = name,
            formState = formState,
        )
    } else {
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
            mask = CivInputMask.SSN,
            onChange = onChange,
            onAnalytics = onAnalytics,
            name = name,
            formState = formState,
        )
    }
}

// MARK: - Preview

@Preview(showBackground = true, name = "CivSsn")
@Composable
private fun CivSsnPreview() {
    Column(modifier = Modifier.padding(16.dp)) {
        var ssn by remember { mutableStateOf("") }
        CivSsn(
            value = ssn,
            onValueChange = { ssn = it },
            required = true,
        )

        var last4 by remember { mutableStateOf("") }
        CivSsn(
            label = "Last 4 of SSN",
            value = last4,
            onValueChange = { last4 = it },
            mode = "last4",
        )

        CivSsn(
            value = "123456789",
            onValueChange = {},
            error = "Please enter a valid Social Security number",
        )

        CivSsn(
            value = "",
            onValueChange = {},
            disabled = true,
        )
    }
}
