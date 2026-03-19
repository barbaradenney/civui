// CivUI — CivFormGroup for Jetpack Compose
// Simple wrapper that provides label, hint, and error around arbitrary content.
// Renders: label -> hint -> error -> content (Section 508 compliant)

package gov.civui.components

import androidx.compose.foundation.isSystemInDarkTheme
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
import gov.civui.i18n.CivLocale
import gov.civui.tokens.CivTokens

/**
 * Accessible form group wrapper for government applications.
 *
 * Provides label, hint, and error rendering around arbitrary
 * content. Use this to wrap custom or third-party form controls
 * that need consistent CivUI labeling and error patterns.
 *
 * Usage:
 * ```kotlin
 * CivFormGroup(
 *     label = "Custom control",
 *     hint = "Select an option",
 *     error = errorMessage,
 *     required = true,
 * ) {
 *     // Your custom composable here
 * }
 * ```
 */
@Composable
fun CivFormGroup(
    label: String,
    modifier: Modifier = Modifier,
    hint: String? = null,
    error: String? = null,
    required: Boolean = false,
    content: @Composable () -> Unit,
) {
    val isDark = isSystemInDarkTheme()

    val labelColor = if (isDark) CivTokens.DarkColors.Base.darkest else CivTokens.Colors.Base.darkest
    val hintColor = if (isDark) CivTokens.DarkColors.Base.dark else CivTokens.Colors.Base.dark
    val errorColor = if (isDark) CivTokens.DarkColors.Error.default_ else CivTokens.Colors.Error.default_

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
        CivHint(text = hint, color = hintColor)

        // 3. Error
        CivError(text = error, color = errorColor)

        // 4. Content
        content()
    }
}

// MARK: - Preview

@Preview(showBackground = true, name = "CivFormGroup")
@Composable
private fun CivFormGroupPreview() {
    Column(modifier = Modifier.padding(16.dp)) {
        var value by remember { mutableStateOf("") }

        CivFormGroup(
            label = "Custom input",
            hint = "This wraps a custom composable",
            required = true,
        ) {
            CivTextInput(
                label = "",
                value = value,
                onValueChange = { value = it },
                placeholder = "Wrapped input",
            )
        }

        CivFormGroup(
            label = "With error",
            error = "Something went wrong",
        ) {
            CivTextInput(
                label = "",
                value = "",
                onValueChange = {},
            )
        }
    }
}
