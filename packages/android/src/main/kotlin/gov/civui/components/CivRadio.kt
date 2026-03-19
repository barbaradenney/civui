// CivUI — CivRadio and CivRadioGroup for Jetpack Compose
// Accessible radio button and group following government design system patterns.
// Renders: legend -> hint -> error -> radio options (Section 508 compliant)

package gov.civui.components

import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.RadioButton
import androidx.compose.material3.RadioButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import gov.civui.tokens.CivTokens

/**
 * Data class representing a radio option.
 */
data class CivRadioOption(
    val value: String,
    val label: String,
    val description: String = "",
    val disabled: Boolean = false,
)

/**
 * Accessible radio button with label, description, and tile variant.
 *
 * Typically used within [CivRadioGroup] for mutual exclusivity,
 * but can be used standalone when managing state externally.
 *
 * Usage:
 * ```kotlin
 * CivRadio(
 *     label = "Option A",
 *     value = "a",
 *     selected = selectedValue == "a",
 *     onSelect = { selectedValue = "a" },
 * )
 * ```
 */
@Composable
fun CivRadio(
    label: String,
    value: String,
    selected: Boolean,
    onSelect: (String) -> Unit,
    modifier: Modifier = Modifier,
    description: String = "",
    tile: Boolean = false,
    disabled: Boolean = false,
) {
    val isDark = isSystemInDarkTheme()

    val labelColor = if (isDark) CivTokens.DarkColors.Base.darkest else CivTokens.Colors.Base.darkest
    val descriptionColor = if (isDark) CivTokens.DarkColors.Base.dark else CivTokens.Colors.Base.dark
    val primaryColor = if (isDark) CivTokens.DarkColors.Primary.default_ else CivTokens.Colors.Primary.default_
    val borderColor = if (isDark) CivTokens.DarkColors.Base.light else CivTokens.Colors.Base.light

    val tileModifier = if (tile) {
        Modifier
            .fillMaxWidth()
            .border(
                width = if (selected) CivTokens.Border.Width._2 else CivTokens.Border.Width.default_,
                color = if (selected) primaryColor else borderColor,
                shape = RoundedCornerShape(CivTokens.Border.Radius.default_),
            )
            .padding(CivTokens.Spacing._3)
    } else {
        Modifier.padding(bottom = CivTokens.Spacing._2)
    }

    Row(
        modifier = modifier
            .then(tileModifier)
            .clickable(
                enabled = !disabled,
                role = Role.RadioButton,
                onClick = { onSelect(value) },
            )
            .alpha(if (disabled) 0.5f else 1f)
            .semantics {
                contentDescription = buildString {
                    append(label)
                    if (selected) append(", selected")
                    if (description.isNotEmpty()) append(". $description")
                }
            },
        verticalAlignment = Alignment.Top,
    ) {
        RadioButton(
            selected = selected,
            onClick = null, // handled by Row clickable
            enabled = !disabled,
            colors = RadioButtonDefaults.colors(
                selectedColor = primaryColor,
            ),
        )

        Column(
            modifier = Modifier
                .padding(start = CivTokens.Spacing._2)
                .weight(1f),
        ) {
            Text(
                text = label,
                style = TextStyle(
                    fontSize = CivTokens.Typography.FontSize.base,
                ),
                color = labelColor,
            )

            if (description.isNotEmpty()) {
                Text(
                    text = description,
                    style = TextStyle(
                        fontSize = CivTokens.Typography.FontSize.sm,
                    ),
                    color = descriptionColor,
                    modifier = Modifier.padding(top = CivTokens.Spacing._0_5),
                )
            }
        }
    }
}

/**
 * Accessible radio group for government applications.
 *
 * Groups multiple radio options with mutual exclusivity, a shared legend,
 * hint, and error message. Implements Section 508 compliance with
 * TalkBack semantics.
 *
 * Usage:
 * ```kotlin
 * var selected by remember { mutableStateOf("") }
 * CivRadioGroup(
 *     legend = "Preferred contact method",
 *     value = selected,
 *     onValueChange = { selected = it },
 *     options = listOf(
 *         CivRadioOption(value = "email", label = "Email"),
 *         CivRadioOption(value = "phone", label = "Phone"),
 *     ),
 * )
 * ```
 */
@Composable
fun CivRadioGroup(
    legend: String,
    value: String,
    onValueChange: (String) -> Unit,
    options: List<CivRadioOption>,
    modifier: Modifier = Modifier,
    hint: String? = null,
    error: String? = null,
    tile: Boolean = false,
    orientation: CivOrientation = CivOrientation.Vertical,
    required: Boolean = false,
    disabled: Boolean = false,
) {
    val isDark = isSystemInDarkTheme()

    val labelColor = if (isDark) CivTokens.DarkColors.Base.darkest else CivTokens.Colors.Base.darkest
    val hintColor = if (isDark) CivTokens.DarkColors.Base.dark else CivTokens.Colors.Base.dark
    val errorColor = if (isDark) CivTokens.DarkColors.Error.default_ else CivTokens.Colors.Error.default_

    Column(
        modifier = modifier.padding(bottom = CivTokens.Spacing._4),
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

        // 4. Radio options
        if (orientation == CivOrientation.Horizontal) {
            Row(
                horizontalArrangement = Arrangement.spacedBy(CivTokens.Spacing._4),
            ) {
                options.forEach { option ->
                    CivRadio(
                        label = option.label,
                        value = option.value,
                        selected = value == option.value,
                        onSelect = { onValueChange(it) },
                        description = option.description,
                        tile = tile,
                        disabled = disabled || option.disabled,
                    )
                }
            }
        } else {
            Column {
                options.forEach { option ->
                    CivRadio(
                        label = option.label,
                        value = option.value,
                        selected = value == option.value,
                        onSelect = { onValueChange(it) },
                        description = option.description,
                        tile = tile,
                        disabled = disabled || option.disabled,
                    )
                }
            }
        }
    }
}

/// Orientation for group layout components.
enum class CivOrientation {
    Vertical,
    Horizontal,
}

// MARK: - Preview

@Preview(showBackground = true, name = "CivRadioGroup")
@Composable
private fun CivRadioGroupPreview() {
    Column(modifier = Modifier.padding(16.dp)) {
        var selected by remember { mutableStateOf("email") }
        CivRadioGroup(
            legend = "Preferred contact method",
            value = selected,
            onValueChange = { selected = it },
            options = listOf(
                CivRadioOption(value = "email", label = "Email"),
                CivRadioOption(value = "phone", label = "Phone", description = "We may call during business hours"),
                CivRadioOption(value = "mail", label = "Mail"),
            ),
            required = true,
        )

        var tileSelected by remember { mutableStateOf("") }
        CivRadioGroup(
            legend = "Account type",
            value = tileSelected,
            onValueChange = { tileSelected = it },
            options = listOf(
                CivRadioOption(value = "individual", label = "Individual"),
                CivRadioOption(value = "business", label = "Business"),
            ),
            tile = true,
            hint = "Select the type of account you want to create",
        )
    }
}
