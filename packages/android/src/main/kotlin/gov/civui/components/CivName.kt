// CivUI — CivName for Jetpack Compose
// Accessible compound name input with first, middle, last, and suffix fields.
// Renders: legend -> hint -> error -> name fields (Section 508 compliant)

package gov.civui.components

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.error
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import gov.civui.tokens.CivTokens

/**
 * Structured name value matching the web `NameValue` interface.
 */
data class NameValue(
    val first: String = "",
    val middle: String = "",
    val last: String = "",
    val suffix: String = "",
)

private val SUFFIX_OPTIONS = listOf("Jr.", "Sr.", "II", "III", "IV")

/**
 * Accessible compound name input for government applications.
 *
 * Renders first name, optional middle name, last name, and optional suffix
 * fields in a vertical layout. Mirrors the web `civ-name` component.
 *
 * TalkBack announces field labels and errors for each sub-field.
 *
 * Usage:
 * ```kotlin
 * var name by remember { mutableStateOf(NameValue()) }
 * CivName(
 *     legend = "Your name",
 *     value = name,
 *     onValueChange = { name = it },
 *     hint = "Enter your full legal name",
 * )
 * ```
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CivName(
    legend: String,
    value: NameValue,
    onValueChange: (NameValue) -> Unit,
    modifier: Modifier = Modifier,
    hint: String = "",
    error: String = "",
    firstError: String = "",
    middleError: String = "",
    lastError: String = "",
    required: Boolean = false,
    disabled: Boolean = false,
    readonly: Boolean = false,
    hideMiddle: Boolean = true,
    hideSuffix: Boolean = true,
    onChange: ((NameValue) -> Unit)? = null,
    onAnalytics: ((event: String, data: Map<String, Any>?) -> Unit)? = null,
    name: String = "",
    formState: CivFormState? = null,
) {
    val isDark = isSystemInDarkTheme()

    // Form state registration
    var formError by remember { mutableStateOf("") }
    val effectiveError = error.ifEmpty { formError }

    if (formState != null && name.isNotEmpty()) {
        androidx.compose.runtime.DisposableEffect(name) {
            formState.register(CivFormState.CivFieldRegistration(
                name = name,
                getValue = { "${value.first}|${value.middle}|${value.last}|${value.suffix}" },
                setValue = { },
                isRequired = required,
                getError = { formError },
                setError = { formError = it },
            ))
            onDispose { formState.unregister(name) }
        }
    }

    val labelColor = if (isDark) CivTokens.DarkColors.Base.darkest else CivTokens.Colors.Base.darkest
    val hintColor = if (isDark) CivTokens.DarkColors.Base.dark else CivTokens.Colors.Base.dark
    val errorColor = if (isDark) CivTokens.DarkColors.Error.default_ else CivTokens.Colors.Error.default_
    val primaryColor = if (isDark) CivTokens.DarkColors.Primary.default_ else CivTokens.Colors.Primary.default_

    Column(
        modifier = modifier
            .padding(bottom = CivTokens.Spacing._4)
            .alpha(if (disabled) 0.5f else 1f)
            .semantics {
                contentDescription = buildString {
                    append(legend)
                    if (required) append(", required")
                    if (effectiveError.isNotEmpty()) append(". Error: $effectiveError")
                }
                if (effectiveError.isNotEmpty()) {
                    error(effectiveError)
                }
            },
    ) {
        // 1. Legend
        CivLabel(
            label = legend,
            required = required,
            labelColor = labelColor,
            errorColor = errorColor,
        )

        // 2. Hint
        CivHint(text = hint.ifEmpty { null }, color = hintColor)

        // 3. Error (fieldset-level)
        CivError(text = effectiveError.ifEmpty { null }, color = errorColor)

        // 4. First name
        NameTextField(
            label = "First name or given name",
            value = value.first,
            onValueChange = {
                val updated = value.copy(first = it)
                onValueChange(updated)
                onChange?.invoke(updated)
                onAnalytics?.invoke("change", null)
            },
            fieldError = firstError,
            isRequired = required,
            disabled = disabled || readonly,
            labelColor = labelColor,
            errorColor = errorColor,
        )

        // 5. Middle name (optional)
        if (hideMiddle) {
            NameTextField(
                label = "Middle name",
                value = value.middle,
                onValueChange = {
                    val updated = value.copy(middle = it)
                    onValueChange(updated)
                    onChange?.invoke(updated)
                    onAnalytics?.invoke("change", null)
                },
                fieldError = middleError,
                isRequired = false,
                disabled = disabled || readonly,
                labelColor = labelColor,
                errorColor = errorColor,
            )
        }

        // 6. Last name
        NameTextField(
            label = "Last name or family name",
            value = value.last,
            onValueChange = {
                val updated = value.copy(last = it)
                onValueChange(updated)
                onChange?.invoke(updated)
                onAnalytics?.invoke("change", null)
            },
            fieldError = lastError,
            isRequired = required,
            disabled = disabled || readonly,
            labelColor = labelColor,
            errorColor = errorColor,
        )

        // 7. Suffix (optional)
        if (hideSuffix) {
            var expanded by remember { mutableStateOf(false) }

            Column(modifier = Modifier.padding(bottom = CivTokens.Spacing._2)) {
                Text(
                    text = "Suffix",
                    style = TextStyle(
                        fontSize = CivTokens.Typography.FontSize.base,
                        fontWeight = FontWeight.SemiBold,
                        color = labelColor,
                    ),
                    modifier = Modifier.padding(bottom = CivTokens.Spacing._0_5),
                )

                ExposedDropdownMenuBox(
                    expanded = expanded,
                    onExpandedChange = { if (!disabled && !readonly) expanded = it },
                    modifier = Modifier.width(160.dp),
                ) {
                    OutlinedTextField(
                        value = value.suffix.ifEmpty { "— Select —" },
                        onValueChange = {},
                        readOnly = true,
                        enabled = !disabled && !readonly,
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded) },
                        modifier = Modifier.menuAnchor(),
                    )

                    ExposedDropdownMenu(
                        expanded = expanded,
                        onDismissRequest = { expanded = false },
                    ) {
                        DropdownMenuItem(
                            text = { Text("— Select —") },
                            onClick = {
                                val updated = value.copy(suffix = "")
                                onValueChange(updated)
                                onChange?.invoke(updated)
                                expanded = false
                            },
                        )
                        SUFFIX_OPTIONS.forEach { option ->
                            DropdownMenuItem(
                                text = { Text(option) },
                                onClick = {
                                    val updated = value.copy(suffix = option)
                                    onValueChange(updated)
                                    onChange?.invoke(updated)
                                    onAnalytics?.invoke("change", null)
                                    expanded = false
                                },
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun NameTextField(
    label: String,
    value: String,
    onValueChange: (String) -> Unit,
    fieldError: String,
    isRequired: Boolean,
    disabled: Boolean,
    labelColor: androidx.compose.ui.graphics.Color,
    errorColor: androidx.compose.ui.graphics.Color,
) {
    Column(modifier = Modifier.padding(bottom = CivTokens.Spacing._2)) {
        Row(horizontalArrangement = Arrangement.spacedBy(CivTokens.Spacing._0_5)) {
            Text(
                text = label,
                style = TextStyle(
                    fontSize = CivTokens.Typography.FontSize.base,
                    fontWeight = FontWeight.SemiBold,
                    color = labelColor,
                ),
            )
            if (isRequired) {
                Text(
                    text = "*",
                    style = TextStyle(
                        fontSize = CivTokens.Typography.FontSize.base,
                        fontWeight = FontWeight.Bold,
                        color = errorColor,
                    ),
                )
            }
        }

        CivError(text = fieldError.ifEmpty { null }, color = errorColor)

        OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            enabled = !disabled,
            isError = fieldError.isNotEmpty(),
            modifier = Modifier
                .fillMaxWidth()
                .semantics {
                    contentDescription = buildString {
                        append(label)
                        if (isRequired) append(", required")
                        if (fieldError.isNotEmpty()) append(". Error: $fieldError")
                    }
                    if (fieldError.isNotEmpty()) {
                        error(fieldError)
                    }
                },
        )
    }
}

// MARK: - Preview

@Preview(showBackground = true, name = "CivName")
@Composable
private fun CivNamePreview() {
    Column(modifier = Modifier.padding(16.dp)) {
        var name by remember { mutableStateOf(NameValue()) }
        CivName(
            legend = "Your name",
            value = name,
            onValueChange = { name = it },
            hint = "Enter your full legal name",
            required = true,
        )

        var prefilled by remember {
            mutableStateOf(NameValue(first = "Jane", middle = "Marie", last = "Doe", suffix = "Jr."))
        }
        CivName(
            legend = "Prefilled name",
            value = prefilled,
            onValueChange = { prefilled = it },
        )

        CivName(
            legend = "With errors",
            value = NameValue(),
            onValueChange = {},
            firstError = "Please enter your first name",
            lastError = "Please enter your last name",
            required = true,
        )

        CivName(
            legend = "Without middle or suffix",
            value = NameValue(),
            onValueChange = {},
            hideMiddle = false,
            hideSuffix = false,
        )

        CivName(
            legend = "Disabled",
            value = NameValue(),
            onValueChange = {},
            disabled = true,
        )
    }
}
