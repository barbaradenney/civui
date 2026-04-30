// CivUI — CivCheckboxGroup for Jetpack Compose
// Accessible checkbox group with legend, hint, and error support.
// Renders: legend -> hint -> error -> checkbox options (Section 508 compliant)

package gov.civui.components

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.error
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import gov.civui.i18n.CivLocale
import gov.civui.tokens.CivTokens

/**
 * Data class representing a checkbox option within a group.
 */
data class CivCheckboxOption(
    val value: String,
    val label: String,
    val description: String = "",
    val disabled: Boolean = false,
)

/**
 * Accessible checkbox group for government applications.
 *
 * Groups multiple checkboxes with a shared legend, hint, and error message.
 * Manages a list of selected values and reports changes via [onValuesChange].
 *
 * Usage:
 * ```kotlin
 * var selected by remember { mutableStateOf(listOf<String>()) }
 * CivCheckboxGroup(
 *     legend = "Select all that apply",
 *     values = selected,
 *     onValuesChange = { selected = it },
 *     options = listOf(
 *         CivCheckboxOption(value = "a", label = "Option A"),
 *         CivCheckboxOption(value = "b", label = "Option B"),
 *     ),
 * )
 * ```
 */
@Composable
fun CivCheckboxGroup(
    legend: String,
    values: List<String>,
    onValuesChange: (List<String>) -> Unit,
    options: List<CivCheckboxOption>,
    modifier: Modifier = Modifier,
    hint: String? = null,
    error: String? = null,
    tile: Boolean = false,
    orientation: CivOrientation = CivOrientation.Vertical,
    required: Boolean = false,
    disabled: Boolean = false,
    readonly: Boolean = false,
    name: String = "",
    showSelectAll: Boolean = false,
    preset: String = "",
    presetVariant: String = "",
    maxSelections: Int = 0,
    minSelections: Int = 0,
    onAnalytics: ((event: String, data: Map<String, Any>?) -> Unit)? = null,
) {
    val isDark = isSystemInDarkTheme()

    val labelColor = if (isDark) CivTokens.DarkColors.Base.darkest else CivTokens.Colors.Base.darkest
    val hintColor = if (isDark) CivTokens.DarkColors.Base.dark else CivTokens.Colors.Base.dark
    val errorColor = if (isDark) CivTokens.DarkColors.Error.default_ else CivTokens.Colors.Error.default_

    Column(
        modifier = modifier
            .padding(bottom = CivTokens.Spacing._4)
            .then(
                if (error != null) Modifier.semantics { error(error) } else Modifier
            ),
    ) {
        // 1. Legend
        CivLabel(
            label = legend,
            required = required,
            labelColor = labelColor,
            errorColor = errorColor,
        )

        // 2. Hint
        CivHint(text = hint, color = hintColor)

        // 3. Error
        CivError(text = error, color = errorColor)

        // 4. Checkbox options
        val content: @Composable () -> Unit = {
            options.forEach { option ->
                CivCheckbox(
                    label = option.label,
                    checked = values.contains(option.value),
                    onCheckedChange = { checked ->
                        val newValues = if (checked) {
                            values + option.value
                        } else {
                            values - option.value
                        }
                        onValuesChange(newValues)
                        onAnalytics?.invoke("change", mapOf("field" to legend, "values" to newValues))
                    },
                    value = option.value,
                    description = option.description,
                    tile = tile,
                    disabled = disabled || option.disabled,
                    readonly = readonly,
                )
            }
        }

        if (orientation == CivOrientation.Horizontal) {
            Row(
                horizontalArrangement = Arrangement.spacedBy(CivTokens.Spacing._4),
            ) {
                content()
            }
        } else {
            Column {
                content()
            }
        }
    }
}

// MARK: - Preview

@Preview(showBackground = true, name = "CivCheckboxGroup")
@Composable
private fun CivCheckboxGroupPreview() {
    Column(modifier = Modifier.padding(16.dp)) {
        var selected by remember { mutableStateOf(listOf("email")) }
        CivCheckboxGroup(
            legend = "How should we contact you?",
            values = selected,
            onValuesChange = { selected = it },
            options = listOf(
                CivCheckboxOption(value = "email", label = "Email"),
                CivCheckboxOption(value = "phone", label = "Phone"),
                CivCheckboxOption(value = "mail", label = "Mail", description = "Physical mail to your address on file"),
            ),
            required = true,
            hint = "Select all that apply",
        )

        var tileSelected by remember { mutableStateOf(listOf<String>()) }
        CivCheckboxGroup(
            legend = "Document types needed",
            values = tileSelected,
            onValuesChange = { tileSelected = it },
            options = listOf(
                CivCheckboxOption(value = "passport", label = "Passport"),
                CivCheckboxOption(value = "license", label = "Driver's license"),
            ),
            tile = true,
            error = "Select at least one document type",
        )
    }
}
