// CivUI — CivYesNo for Jetpack Compose
// Accessible yes/no binary choice with two styled buttons.
// Renders: legend -> hint -> error -> button pair (Section 508 compliant)

package gov.civui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.error
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.selected
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import gov.civui.tokens.CivTokens

/**
 * Accessible yes/no binary choice for government applications.
 *
 * Renders two buttons in a Row. The selected button uses a filled primary
 * style; the unselected button uses an outlined style. Mirrors the web
 * `civ-yes-no` component.
 *
 * TalkBack announces "Yes, selected" or "No, selected" for the active choice.
 *
 * Usage:
 * ```kotlin
 * var isCitizen by remember { mutableStateOf("") }
 * CivYesNo(
 *     legend = "Are you a U.S. citizen?",
 *     value = isCitizen,
 *     onValueChange = { isCitizen = it },
 *     hint = "Select one option",
 * )
 * ```
 */
@Composable
fun CivYesNo(
    legend: String,
    value: String,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier,
    hint: String = "",
    error: String = "",
    required: Boolean = false,
    disabled: Boolean = false,
    readonly: Boolean = false,
    yesLabel: String = "Yes",
    noLabel: String = "No",
    unsureLabel: String = "",
    unsureValue: String = "unsure",
    skipLabel: String = "",
    skipValue: String = "",
    onChange: ((String) -> Unit)? = null,
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
    val primaryColor = if (isDark) CivTokens.DarkColors.Primary.default_ else CivTokens.Colors.Primary.default_
    val whiteColor = if (isDark) CivTokens.DarkColors.White.default_ else CivTokens.Colors.White.default_

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

        // 3. Error
        CivError(text = effectiveError.ifEmpty { null }, color = errorColor)

        // 4. Button pair
        Row(
            horizontalArrangement = Arrangement.spacedBy(CivTokens.Spacing._3),
            modifier = Modifier.padding(top = CivTokens.Spacing._1),
        ) {
            // Yes button
            ChoiceButton(
                label = yesLabel,
                isSelected = value == "yes",
                primaryColor = primaryColor,
                whiteColor = whiteColor,
                enabled = !disabled && !readonly,
                onClick = {
                    onValueChange("yes")
                    onChange?.invoke("yes")
                    onAnalytics?.invoke("change", mapOf("value" to "yes"))
                },
            )

            // No button
            ChoiceButton(
                label = noLabel,
                isSelected = value == "no",
                primaryColor = primaryColor,
                whiteColor = whiteColor,
                enabled = !disabled && !readonly,
                onClick = {
                    onValueChange("no")
                    onChange?.invoke("no")
                    onAnalytics?.invoke("change", mapOf("value" to "no"))
                },
            )

            // Optional unsure button
            if (unsureLabel.isNotEmpty()) {
                ChoiceButton(
                    label = unsureLabel,
                    isSelected = value == unsureValue,
                    primaryColor = primaryColor,
                    whiteColor = whiteColor,
                    enabled = !disabled && !readonly,
                    onClick = {
                        onValueChange(unsureValue)
                        onChange?.invoke(unsureValue)
                        onAnalytics?.invoke("change", mapOf("value" to unsureValue))
                    },
                )
            }
        }
    }
}

@Composable
private fun ChoiceButton(
    label: String,
    isSelected: Boolean,
    primaryColor: androidx.compose.ui.graphics.Color,
    whiteColor: androidx.compose.ui.graphics.Color,
    enabled: Boolean,
    onClick: () -> Unit,
) {
    if (isSelected) {
        Button(
            onClick = onClick,
            enabled = enabled,
            colors = ButtonDefaults.buttonColors(
                containerColor = primaryColor,
                contentColor = whiteColor,
            ),
            modifier = Modifier.semantics {
                selected = true
                role = Role.Button
            },
        ) {
            Text(
                text = label,
                style = TextStyle(
                    fontSize = CivTokens.Typography.FontSize.base,
                    fontWeight = FontWeight.SemiBold,
                ),
            )
        }
    } else {
        OutlinedButton(
            onClick = onClick,
            enabled = enabled,
            border = BorderStroke(CivTokens.Border.Width._2, primaryColor),
            colors = ButtonDefaults.outlinedButtonColors(
                contentColor = primaryColor,
            ),
            modifier = Modifier.semantics {
                selected = false
                role = Role.Button
            },
        ) {
            Text(
                text = label,
                style = TextStyle(
                    fontSize = CivTokens.Typography.FontSize.base,
                    fontWeight = FontWeight.SemiBold,
                ),
            )
        }
    }
}

// MARK: - Preview

@Preview(showBackground = true, name = "CivYesNo")
@Composable
private fun CivYesNoPreview() {
    Column(modifier = Modifier.padding(16.dp)) {
        var citizen by remember { mutableStateOf("") }
        CivYesNo(
            legend = "Are you a U.S. citizen?",
            value = citizen,
            onValueChange = { citizen = it },
            hint = "Select one option",
            required = true,
        )

        var veteran by remember { mutableStateOf("yes") }
        CivYesNo(
            legend = "Are you a veteran?",
            value = veteran,
            onValueChange = { veteran = it },
        )

        var disability by remember { mutableStateOf("") }
        CivYesNo(
            legend = "Do you have a service-connected disability?",
            value = disability,
            onValueChange = { disability = it },
            unsureLabel = "I'm not sure",
        )

        CivYesNo(
            legend = "Disabled question",
            value = "",
            onValueChange = {},
            disabled = true,
        )

        CivYesNo(
            legend = "With error",
            value = "",
            onValueChange = {},
            error = "Please select an option",
            required = true,
        )
    }
}
