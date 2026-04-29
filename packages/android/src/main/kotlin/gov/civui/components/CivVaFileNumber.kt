// CivUI — CivVaFileNumber for Jetpack Compose
// Accessible VA file number input (up to 9 digits, numeric).
// Thin wrapper around CivTextInput with VA file number configuration.

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
 * Accessible VA file number input for government applications.
 *
 * Wraps [CivTextInput] with numeric constraint and 9-character maximum.
 * VA file numbers are typically the veteran's SSN or a unique identifier
 * assigned by the Department of Veterans Affairs.
 *
 * Usage:
 * ```kotlin
 * var vaFileNumber by remember { mutableStateOf("") }
 * CivVaFileNumber(
 *     value = vaFileNumber,
 *     onValueChange = { vaFileNumber = it },
 * )
 * ```
 */
@Composable
fun CivVaFileNumber(
    value: String,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier,
    label: String = "VA file number",
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
        hint = hint ?: "Up to 9 digits",
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

@Preview(showBackground = true, name = "CivVaFileNumber")
@Composable
private fun CivVaFileNumberPreview() {
    Column(modifier = Modifier.padding(16.dp)) {
        var vaFile by remember { mutableStateOf("") }
        CivVaFileNumber(
            value = vaFile,
            onValueChange = { vaFile = it },
            required = true,
        )

        CivVaFileNumber(
            value = "123456789",
            onValueChange = {},
            hint = "Your VA file number is on your benefit letter",
        )

        CivVaFileNumber(
            value = "",
            onValueChange = {},
            error = "Please enter your VA file number",
        )

        CivVaFileNumber(
            value = "",
            onValueChange = {},
            disabled = true,
        )
    }
}
