// CivUI — CivToggle for Jetpack Compose
// Accessible toggle switch with inline label and optional description.
// Renders: switch -> label -> description, hint, error (Section 508 compliant)
// Switch renders before label (like iOS/Android native settings pattern)

package gov.civui.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
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
import androidx.compose.ui.semantics.error
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import gov.civui.i18n.CivLocale
import gov.civui.tokens.CivTokens

/**
 * Accessible toggle switch for government applications.
 *
 * Uses Material 3 Switch with CivUI styling. The switch renders
 * before the label, matching native iOS/Android settings patterns.
 *
 * Supports:
 * - Inline label with optional description
 * - Required indicator
 * - Error/hint state with TalkBack announcement
 *
 * Usage:
 * ```kotlin
 * var darkMode by remember { mutableStateOf(false) }
 * CivToggle(
 *     label = "Dark mode",
 *     checked = darkMode,
 *     onCheckedChange = { darkMode = it },
 *     description = "Use dark theme for reduced eye strain",
 * )
 * ```
 */
@Composable
fun CivToggle(
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
    readonly: Boolean = false,
    onChange: ((Boolean) -> Unit)? = null,
    name: String = "",
    formState: CivFormState? = null,
    onInput: ((Boolean, String) -> Unit)? = null,
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
                getValue = { if (checked) value.ifEmpty { "on" } else "" },
                setValue = { onCheckedChange(it.isNotEmpty()) },
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
    val descriptionColor = if (isDark) CivTokens.DarkColors.Base.dark else CivTokens.Colors.Base.dark
    val primaryColor = if (isDark) CivTokens.DarkColors.Primary.default_ else CivTokens.Colors.Primary.default_
    val trackColor = if (isDark) CivTokens.DarkColors.Base.lighter else CivTokens.Colors.Base.lighter

    Column(
        modifier = modifier.padding(bottom = CivTokens.Spacing._2),
    ) {
        Row(
            modifier = Modifier
                .clickable(
                    enabled = !disabled && !readonly,
                    role = Role.Switch,
                    onClick = {
                        val newChecked = !checked
                        onCheckedChange(newChecked)
                        onChange?.invoke(newChecked)
                        onInput?.invoke(newChecked, value)
                        onAnalytics?.invoke("change", mapOf("field" to label, "checked" to newChecked, "value" to value))
                    },
                )
                .alpha(if (disabled) 0.5f else 1f)
                .semantics {
                    contentDescription = buildString {
                        append(label)
                        if (required) append(", required")
                        append(if (checked) ", on" else ", off")
                        if (description.isNotEmpty()) append(". $description")
                        if (effectiveError.isNotEmpty()) append(". Error: $effectiveError")
                    }
                    if (effectiveError.isNotEmpty()) {
                        error(effectiveError)
                    }
                },
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(CivTokens.Spacing._3),
        ) {
            // Switch renders BEFORE label (like iOS/Android settings)
            Switch(
                checked = checked,
                onCheckedChange = null, // handled by Row clickable
                enabled = !disabled && !readonly,
                colors = SwitchDefaults.colors(
                    checkedTrackColor = primaryColor,
                    uncheckedTrackColor = trackColor,
                    checkedThumbColor = if (isDark) CivTokens.DarkColors.White.default_ else CivTokens.Colors.White.default_,
                    uncheckedThumbColor = if (isDark) CivTokens.DarkColors.White.default_ else CivTokens.Colors.White.default_,
                ),
            )

            Column {
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

        // Hint (below toggle row)
        CivHint(
            text = hint.ifEmpty { null },
            color = hintColor,
        )

        // Error (below toggle row)
        CivError(
            text = effectiveError.ifEmpty { null },
            color = errorColor,
        )
    }
}

// MARK: - Preview

@Preview(showBackground = true, name = "CivToggle")
@Composable
private fun CivTogglePreview() {
    Column(modifier = Modifier.padding(16.dp)) {
        var notifications by remember { mutableStateOf(true) }
        CivToggle(
            label = "Email notifications",
            checked = notifications,
            onCheckedChange = { notifications = it },
            description = "Receive updates about your application",
        )

        var darkMode by remember { mutableStateOf(false) }
        CivToggle(
            label = "Dark mode",
            checked = darkMode,
            onCheckedChange = { darkMode = it },
        )

        CivToggle(
            label = "Required toggle",
            checked = false,
            onCheckedChange = {},
            required = true,
            error = "You must enable this setting",
        )

        CivToggle(
            label = "Disabled toggle",
            checked = true,
            onCheckedChange = {},
            disabled = true,
        )
    }
}
