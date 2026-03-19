// CivUI — CivFieldset for Jetpack Compose
// Accessible fieldset container with legend, hint, error, and disabled cascade.
// Renders: legend -> hint -> error -> content (Section 508 compliant)

package gov.civui.components

import androidx.compose.foundation.border
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.compositionLocalOf
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
import gov.civui.i18n.CivLocale
import gov.civui.tokens.CivTokens

/**
 * CompositionLocal for cascading disabled state from a CivFieldset
 * to its children, mimicking native fieldset disabled behavior.
 */
val LocalCivFieldsetDisabled = compositionLocalOf { false }

/**
 * Accessible fieldset container for government applications.
 *
 * Provides a card-like container with legend, hint, error messaging,
 * and disabled cascade. Similar to a native HTML fieldset but
 * implemented as a Compose Column with border.
 *
 * Usage:
 * ```kotlin
 * CivFieldset(
 *     legend = "Mailing address",
 *     hint = "Enter your current mailing address",
 * ) {
 *     CivTextInput(label = "Street", value = street, onValueChange = { street = it })
 *     CivTextInput(label = "City", value = city, onValueChange = { city = it })
 * }
 * ```
 */
@Composable
fun CivFieldset(
    legend: String,
    modifier: Modifier = Modifier,
    hint: String? = null,
    error: String? = null,
    required: Boolean = false,
    disabled: Boolean = false,
    content: @Composable () -> Unit,
) {
    val isDark = isSystemInDarkTheme()

    val labelColor = if (isDark) CivTokens.DarkColors.Base.darkest else CivTokens.Colors.Base.darkest
    val hintColor = if (isDark) CivTokens.DarkColors.Base.dark else CivTokens.Colors.Base.dark
    val errorColor = if (isDark) CivTokens.DarkColors.Error.default_ else CivTokens.Colors.Error.default_
    val borderColor = if (isDark) CivTokens.DarkColors.Base.lighter else CivTokens.Colors.Base.lighter

    // Inherit disabled from parent fieldset if present
    val parentDisabled = LocalCivFieldsetDisabled.current
    val effectiveDisabled = disabled || parentDisabled

    Column(
        modifier = modifier
            .fillMaxWidth()
            .border(
                width = CivTokens.Border.Width.default_,
                color = borderColor,
                shape = RoundedCornerShape(CivTokens.Border.Radius.lg),
            )
            .padding(CivTokens.Spacing._4)
            .alpha(if (effectiveDisabled) 0.5f else 1f)
            .semantics {
                contentDescription = buildString {
                    append(legend)
                    if (required) append(", required")
                    if (effectiveDisabled) append(", disabled")
                    if (error != null) append(". Error: $error")
                }
                if (error != null) {
                    error(error)
                }
            },
    ) {
        // 1. Legend (rendered as bold heading-style text)
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

        // 4. Content with disabled cascade
        CompositionLocalProvider(LocalCivFieldsetDisabled provides effectiveDisabled) {
            content()
        }
    }
}

// MARK: - Preview

@Preview(showBackground = true, name = "CivFieldset")
@Composable
private fun CivFieldsetPreview() {
    Column(modifier = Modifier.padding(16.dp)) {
        var street by remember { mutableStateOf("") }
        var city by remember { mutableStateOf("") }

        CivFieldset(
            legend = "Mailing address",
            hint = "Enter your current mailing address",
        ) {
            CivTextInput(
                label = "Street address",
                value = street,
                onValueChange = { street = it },
                required = true,
            )
            CivTextInput(
                label = "City",
                value = city,
                onValueChange = { city = it },
                required = true,
            )
        }

        CivFieldset(
            legend = "Disabled section",
            disabled = true,
            error = "This section has an error",
        ) {
            CivTextInput(
                label = "Cannot edit",
                value = "",
                onValueChange = {},
            )
        }
    }
}
