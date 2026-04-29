// CivUI — CivPhone for Jetpack Compose
// Accessible phone number input with domestic masking and international mode.
// Thin wrapper around CivTextInput with phone-specific configuration.

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
 * Accessible phone number input for government applications.
 *
 * Wraps [CivTextInput] with US phone mask ((###) ###-####) for domestic numbers,
 * or a plain telephone input for international numbers.
 *
 * Usage:
 * ```kotlin
 * var phone by remember { mutableStateOf("") }
 * CivPhone(
 *     value = phone,
 *     onValueChange = { phone = it },
 * )
 * ```
 */
@Composable
fun CivPhone(
    value: String,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier,
    label: String = "Phone number",
    international: Boolean = false,
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
    if (international) {
        CivTextInput(
            label = label,
            value = value,
            onValueChange = onValueChange,
            modifier = modifier,
            hint = hint ?: "Include country code, for example +44 20 7946 0958",
            error = error,
            required = required,
            disabled = disabled,
            readonly = readonly,
            inputType = CivInputType.Telephone,
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
            mask = CivInputMask.PhoneUs,
            onChange = onChange,
            onAnalytics = onAnalytics,
            name = name,
            formState = formState,
        )
    }
}

// MARK: - Preview

@Preview(showBackground = true, name = "CivPhone")
@Composable
private fun CivPhonePreview() {
    Column(modifier = Modifier.padding(16.dp)) {
        var phone by remember { mutableStateOf("") }
        CivPhone(
            value = phone,
            onValueChange = { phone = it },
            required = true,
        )

        var intlPhone by remember { mutableStateOf("") }
        CivPhone(
            label = "International phone number",
            value = intlPhone,
            onValueChange = { intlPhone = it },
            international = true,
        )

        CivPhone(
            value = "",
            onValueChange = {},
            error = "Please enter a valid phone number",
        )

        CivPhone(
            value = "",
            onValueChange = {},
            disabled = true,
        )
    }
}
