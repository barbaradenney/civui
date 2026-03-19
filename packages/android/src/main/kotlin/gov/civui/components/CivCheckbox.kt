// CivUI — CivCheckbox for Jetpack Compose
// Accessible checkbox with inline label, optional description, and tile variant.
// Renders: hint -> error -> [checkbox + label] (Section 508 compliant)

package gov.civui.components

import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CheckboxDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TriStateCheckbox
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
import androidx.compose.ui.semantics.error
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.state.ToggleableState
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import gov.civui.i18n.CivLocale
import gov.civui.tokens.CivTokens

/**
 * Accessible checkbox for government applications.
 *
 * Supports:
 * - Inline label with optional description text
 * - Indeterminate (mixed) state
 * - Tile variant (bordered card style)
 * - Required indicator
 * - Error state with TalkBack announcement
 *
 * Usage:
 * ```kotlin
 * var agreed by remember { mutableStateOf(false) }
 * CivCheckbox(
 *     label = "I agree to the terms and conditions",
 *     checked = agreed,
 *     onCheckedChange = { agreed = it },
 *     required = true,
 * )
 * ```
 */
@Composable
fun CivCheckbox(
    label: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit,
    modifier: Modifier = Modifier,
    value: String = "",
    hint: String = "",
    error: String = "",
    description: String = "",
    required: Boolean = false,
    disabled: Boolean = false,
    indeterminate: Boolean = false,
    tile: Boolean = false,
    onChange: ((Boolean) -> Unit)? = null,
    onAnalytics: ((event: String, data: Map<String, Any>?) -> Unit)? = null,
) {
    val isDark = isSystemInDarkTheme()

    val labelColor = if (isDark) CivTokens.DarkColors.Base.darkest else CivTokens.Colors.Base.darkest
    val hintColor = if (isDark) CivTokens.DarkColors.Base.dark else CivTokens.Colors.Base.dark
    val errorColor = if (isDark) CivTokens.DarkColors.Error.default_ else CivTokens.Colors.Error.default_
    val descriptionColor = if (isDark) CivTokens.DarkColors.Base.dark else CivTokens.Colors.Base.dark
    val primaryColor = if (isDark) CivTokens.DarkColors.Primary.default_ else CivTokens.Colors.Primary.default_
    val borderColor = if (isDark) CivTokens.DarkColors.Base.light else CivTokens.Colors.Base.light

    val tileModifier = if (tile) {
        Modifier
            .fillMaxWidth()
            .border(
                width = if (checked) CivTokens.Border.Width._2 else CivTokens.Border.Width.default_,
                color = if (checked) primaryColor else borderColor,
                shape = RoundedCornerShape(CivTokens.Border.Radius.default_),
            )
            .padding(CivTokens.Spacing._3)
    } else {
        Modifier.padding(bottom = CivTokens.Spacing._2)
    }

    Column(modifier = modifier) {
        // Hint (above checkbox)
        CivHint(
            text = hint.ifEmpty { null },
            color = hintColor,
        )

        // Error (above checkbox)
        CivError(
            text = error.ifEmpty { null },
            color = errorColor,
        )

        Row(
            modifier = tileModifier
                .clickable(
                    enabled = !disabled,
                    role = Role.Checkbox,
                    onClick = {
                        val newChecked = !checked
                        onCheckedChange(newChecked)
                        onChange?.invoke(newChecked)
                        onAnalytics?.invoke("change", mapOf("field" to label, "checked" to newChecked, "value" to value))
                    },
                )
                .alpha(if (disabled) 0.5f else 1f)
                .semantics {
                    contentDescription = buildString {
                        append(label)
                        if (required) append(", required")
                        if (indeterminate) append(", partially checked")
                        if (description.isNotEmpty()) append(". $description")
                        if (error.isNotEmpty()) append(". Error: $error")
                    }
                    if (error.isNotEmpty()) {
                        error(error)
                    }
                },
            verticalAlignment = Alignment.Top,
        ) {
            if (indeterminate) {
                TriStateCheckbox(
                    state = ToggleableState.Indeterminate,
                    onClick = {
                        onCheckedChange(true)
                        onChange?.invoke(true)
                        onAnalytics?.invoke("change", mapOf("field" to label, "checked" to true, "value" to value))
                    },
                    enabled = !disabled,
                    colors = CheckboxDefaults.colors(
                        checkedColor = primaryColor,
                        checkmarkColor = if (isDark) CivTokens.DarkColors.White.default_ else CivTokens.Colors.White.default_,
                    ),
                )
            } else {
                Checkbox(
                    checked = checked,
                    onCheckedChange = null, // handled by Row clickable
                    enabled = !disabled,
                    colors = CheckboxDefaults.colors(
                        checkedColor = primaryColor,
                        checkmarkColor = if (isDark) CivTokens.DarkColors.White.default_ else CivTokens.Colors.White.default_,
                    ),
                )
            }

            Column(
                modifier = Modifier
                    .padding(start = CivTokens.Spacing._2)
                    .weight(1f),
            ) {
                Row {
                    Text(
                        text = label,
                        style = TextStyle(
                            fontSize = CivTokens.Typography.FontSize.base,
                        ),
                        color = labelColor,
                    )
                    if (required) {
                        Text(
                            text = " *",
                            style = TextStyle(
                                fontSize = CivTokens.Typography.FontSize.base,
                                fontWeight = FontWeight.Bold,
                            ),
                            color = errorColor,
                        )
                    }
                }

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
}

// MARK: - Preview

@Preview(showBackground = true, name = "CivCheckbox")
@Composable
private fun CivCheckboxPreview() {
    Column(modifier = Modifier.padding(16.dp)) {
        var agreed by remember { mutableStateOf(false) }
        CivCheckbox(
            label = "I agree to the terms and conditions",
            checked = agreed,
            onCheckedChange = { agreed = it },
            required = true,
        )

        var notify by remember { mutableStateOf(true) }
        CivCheckbox(
            label = "Email notifications",
            checked = notify,
            onCheckedChange = { notify = it },
            description = "Receive updates about your application status",
            tile = true,
        )

        CivCheckbox(
            label = "Partially selected",
            checked = false,
            onCheckedChange = {},
            indeterminate = true,
        )

        CivCheckbox(
            label = "Disabled option",
            checked = false,
            onCheckedChange = {},
            disabled = true,
        )
    }
}
