// CivUI — CivEin for Jetpack Compose
// Accessible Employer Identification Number input with masking and PII protection.
// Thin wrapper around CivTextInput with EIN-specific configuration.

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
 * Accessible Employer Identification Number input for government applications.
 *
 * Wraps [CivTextInput] with EIN mask (##-#######) and PII protection.
 *
 * Usage:
 * ```kotlin
 * var ein by remember { mutableStateOf("") }
 * CivEin(
 *     value = ein,
 *     onValueChange = { ein = it },
 * )
 * ```
 */
@Composable
fun CivEin(
    value: String,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier,
    label: String = "Employer Identification Number",
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
        hint = hint,
        error = error,
        required = required,
        disabled = disabled,
        readonly = readonly,
        mask = CivInputMask.Ein,
        onChange = onChange,
        onAnalytics = onAnalytics,
        name = name,
        formState = formState,
    )
}

// MARK: - Preview

@Preview(showBackground = true, name = "CivEin")
@Composable
private fun CivEinPreview() {
    Column(modifier = Modifier.padding(16.dp)) {
        var ein by remember { mutableStateOf("") }
        CivEin(
            value = ein,
            onValueChange = { ein = it },
            required = true,
        )

        CivEin(
            value = "123456789",
            onValueChange = {},
            error = "Please enter a valid EIN",
        )

        CivEin(
            value = "",
            onValueChange = {},
            disabled = true,
        )
    }
}
