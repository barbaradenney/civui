// CivUI — CivRoutingNumber for Jetpack Compose
// Accessible bank routing number input (9-digit numeric).
// Thin wrapper around CivTextInput with routing number configuration.

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
 * Accessible bank routing number input for government applications.
 *
 * Wraps [CivTextInput] with 9-digit numeric constraint and number keyboard.
 *
 * Usage:
 * ```kotlin
 * var routing by remember { mutableStateOf("") }
 * CivRoutingNumber(
 *     value = routing,
 *     onValueChange = { routing = it },
 * )
 * ```
 */
@Composable
fun CivRoutingNumber(
    value: String,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier,
    label: String = "Routing number",
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
    CivTextInput(
        label = label,
        value = value,
        onValueChange = onValueChange,
        modifier = modifier,
        hint = hint ?: "9 digits, for example 021000021",
        error = error,
        required = required,
        disabled = disabled,
        readonly = readonly,
        inputType = CivInputType.Number,
        maxLength = 9,
        width = CivInputWidth.Medium,
        onChange = onChange,
        onAnalytics = onAnalytics,
        name = name,
        formState = formState,
    )
}

// MARK: - Preview

@Preview(showBackground = true, name = "CivRoutingNumber")
@Composable
private fun CivRoutingNumberPreview() {
    Column(modifier = Modifier.padding(16.dp)) {
        var routing by remember { mutableStateOf("") }
        CivRoutingNumber(
            value = routing,
            onValueChange = { routing = it },
            required = true,
        )

        CivRoutingNumber(
            value = "021000021",
            onValueChange = {},
            hint = "Find this on the bottom of your check",
        )

        CivRoutingNumber(
            value = "123",
            onValueChange = {},
            error = "Routing number must be 9 digits",
        )

        CivRoutingNumber(
            value = "",
            onValueChange = {},
            disabled = true,
        )
    }
}
