// CivUI — CivSelect for Jetpack Compose
// Accessible dropdown select following government design system patterns.
// Renders: label -> hint -> error -> dropdown (Section 508 compliant)

package gov.civui.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.border
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.MenuAnchorType
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.error
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import gov.civui.i18n.CivLocale
import gov.civui.tokens.CivTokens

/**
 * Option item for CivSelect (parallels web SelectOption).
 */
data class CivSelectOption(
    val value: String,
    val label: String,
    val disabled: Boolean = false,
)

/**
 * Accessible dropdown select for government applications.
 *
 * Uses Material 3 ExposedDropdownMenuBox for native behavior,
 * with CivUI styling and accessibility patterns.
 *
 * Usage:
 * ```kotlin
 * var state by remember { mutableStateOf("") }
 * CivSelect(
 *     label = "State or territory",
 *     value = state,
 *     onValueChange = { state = it },
 *     options = listOf(
 *         CivSelectOption("DC", "District of Columbia"),
 *         CivSelectOption("MD", "Maryland"),
 *         CivSelectOption("VA", "Virginia"),
 *     ),
 * )
 * ```
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CivSelect(
    label: String,
    value: String,
    onValueChange: (String) -> Unit,
    options: List<CivSelectOption>,
    modifier: Modifier = Modifier,
    hint: String = "",
    error: String = "",
    required: Boolean = false,
    disabled: Boolean = false,
    emptyLabel: String = CivLocale.t("selectEmpty"),
    name: String = "",
    formState: CivFormState? = null,
    onChange: ((String) -> Unit)? = null,
    onAnalytics: ((event: String, data: Map<String, Any>?) -> Unit)? = null,
) {
    val isDark = isSystemInDarkTheme()

    // Form state registration
    var formError by remember { mutableStateOf("") }
    val effectiveError = error.ifEmpty { formError }

    if (formState != null && name.isNotEmpty()) {
        androidx.compose.runtime.DisposableEffect(name) {
            formState.register(CivFormState.CivFieldRegistration(
                name = name,
                getValue = { value },
                setValue = { onValueChange(it) },
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
    val borderColor by animateColorAsState(
        targetValue = when {
            effectiveError.isNotEmpty() -> errorColor
            else -> if (isDark) CivTokens.DarkColors.Base.light else CivTokens.Colors.Base.light
        },
        label = "borderColor",
    )
    val backgroundColor = if (isDark) CivTokens.DarkColors.White.default_ else CivTokens.Colors.White.default_

    var expanded by remember { mutableStateOf(false) }

    // Find the label for the current value
    val selectedLabel = options.find { it.value == value }?.label ?: ""

    Column(
        modifier = modifier.padding(bottom = CivTokens.Spacing._4),
    ) {
        // 1. Label
        CivLabel(
            label = label,
            required = required,
            labelColor = labelColor,
            errorColor = errorColor,
        )

        // 2. Hint
        CivHint(
            text = hint.ifEmpty { null },
            color = hintColor,
        )

        // 3. Error
        CivError(
            text = effectiveError.ifEmpty { null },
            color = errorColor,
        )

        // 4. Dropdown
        ExposedDropdownMenuBox(
            expanded = expanded,
            onExpandedChange = { if (!disabled) expanded = it },
        ) {
            TextField(
                value = selectedLabel.ifEmpty { emptyLabel },
                onValueChange = {},
                readOnly = true,
                modifier = Modifier
                    .menuAnchor(MenuAnchorType.PrimaryNotEditable)
                    .fillMaxWidth()
                    .border(
                        width = if (effectiveError.isNotEmpty()) CivTokens.Border.Width._2 else CivTokens.Border.Width.default_,
                        color = borderColor,
                        shape = RoundedCornerShape(CivTokens.Border.Radius.default_),
                    )
                    .alpha(if (disabled) 0.5f else 1f)
                    .semantics {
                        contentDescription = buildString {
                            append(label)
                            if (required) append(", required")
                            if (selectedLabel.isNotEmpty()) append(", selected: $selectedLabel")
                            if (hint.isNotEmpty()) append(". $hint")
                            if (effectiveError.isNotEmpty()) append(". Error: $effectiveError")
                        }
                        if (effectiveError.isNotEmpty()) {
                            error(effectiveError)
                        }
                    },
                enabled = !disabled,
                textStyle = TextStyle(
                    fontSize = CivTokens.Typography.FontSize.base,
                    color = if (selectedLabel.isEmpty()) hintColor else labelColor,
                ),
                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded) },
                shape = RoundedCornerShape(CivTokens.Border.Radius.default_),
                colors = TextFieldDefaults.colors(
                    focusedContainerColor = backgroundColor,
                    unfocusedContainerColor = backgroundColor,
                    disabledContainerColor = backgroundColor,
                    focusedIndicatorColor = Color.Transparent,
                    unfocusedIndicatorColor = Color.Transparent,
                    disabledIndicatorColor = Color.Transparent,
                ),
            )

            ExposedDropdownMenu(
                expanded = expanded,
                onDismissRequest = { expanded = false },
            ) {
                // Empty option
                DropdownMenuItem(
                    text = {
                        Text(
                            text = emptyLabel,
                            style = TextStyle(
                                fontSize = CivTokens.Typography.FontSize.base,
                                color = hintColor,
                            ),
                        )
                    },
                    onClick = {
                        onValueChange("")
                        onChange?.invoke("")
                        onAnalytics?.invoke("change", mapOf("field" to label, "value" to ""))
                        expanded = false
                    },
                )

                // Options
                options.forEach { option ->
                    DropdownMenuItem(
                        text = {
                            Text(
                                text = option.label,
                                style = TextStyle(
                                    fontSize = CivTokens.Typography.FontSize.base,
                                    color = labelColor,
                                ),
                            )
                        },
                        onClick = {
                            if (!option.disabled) {
                                onValueChange(option.value)
                                onChange?.invoke(option.value)
                                onAnalytics?.invoke("change", mapOf("field" to label, "value" to option.value))
                                expanded = false
                            }
                        },
                        enabled = !option.disabled,
                    )
                }
            }
        }
    }
}

// MARK: - Preview

@Preview(showBackground = true, name = "CivSelect")
@Composable
private fun CivSelectPreview() {
    Column(modifier = Modifier.padding(16.dp)) {
        var state by remember { mutableStateOf("") }
        CivSelect(
            label = "State or territory",
            value = state,
            onValueChange = { state = it },
            options = listOf(
                CivSelectOption("DC", "District of Columbia"),
                CivSelectOption("MD", "Maryland"),
                CivSelectOption("VA", "Virginia"),
            ),
            hint = "Select your state of residence",
            required = true,
        )

        CivSelect(
            label = "Disabled select",
            value = "",
            onValueChange = {},
            options = emptyList(),
            disabled = true,
        )
    }
}
