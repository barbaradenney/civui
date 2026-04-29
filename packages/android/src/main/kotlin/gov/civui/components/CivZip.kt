// CivUI — CivZip for Jetpack Compose
// Accessible ZIP code input with standard 5-digit and extended ZIP+4 modes.
// Thin wrapper around CivTextInput with ZIP-specific configuration.

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
 * Accessible ZIP code input for government applications.
 *
 * Wraps [CivTextInput] with ZIP mask (#####) or ZIP+4 mask (#####-####).
 *
 * Usage:
 * ```kotlin
 * var zip by remember { mutableStateOf("") }
 * CivZip(
 *     value = zip,
 *     onValueChange = { zip = it },
 * )
 * ```
 */
@Composable
fun CivZip(
    value: String,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier,
    label: String = "ZIP code",
    extended: Boolean = false,
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
        mask = if (extended) CivInputMask.Zip4 else CivInputMask.Zip,
        width = if (extended) CivInputWidth.Medium else CivInputWidth.Small,
        onChange = onChange,
        onAnalytics = onAnalytics,
        name = name,
        formState = formState,
    )
}

// MARK: - Preview

@Preview(showBackground = true, name = "CivZip")
@Composable
private fun CivZipPreview() {
    Column(modifier = Modifier.padding(16.dp)) {
        var zip by remember { mutableStateOf("") }
        CivZip(
            value = zip,
            onValueChange = { zip = it },
            required = true,
        )

        var zip4 by remember { mutableStateOf("") }
        CivZip(
            label = "ZIP+4 code",
            value = zip4,
            onValueChange = { zip4 = it },
            extended = true,
        )

        CivZip(
            value = "",
            onValueChange = {},
            error = "Please enter a valid ZIP code",
        )

        CivZip(
            value = "",
            onValueChange = {},
            disabled = true,
        )
    }
}
