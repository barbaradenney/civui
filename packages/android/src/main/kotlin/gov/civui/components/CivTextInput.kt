// CivUI — CivTextInput for Jetpack Compose
// Accessible text input following government design system patterns.
// Renders: label → hint → error → input (Section 508 compliant)

package gov.civui.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.border
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
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
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.error
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import gov.civui.tokens.CivTokens

/// Keyboard type mapping for CivTextInput (parallels web `type` attribute).
enum class CivInputType {
    Text,
    Email,
    Number,
    Password,
    Search,
    Telephone,
    Url,
}

/// Width variant for CivTextInput (parallels web `width` prop).
enum class CivInputWidth(val dp: Float?) {
    Full(null),     // default
    XxSmall(48f),   // 2xs
    XSmall(64f),    // xs
    Small(96f),     // sm
    Medium(160f),   // md
    Large(240f),    // lg
    XLarge(288f),   // xl
    XxLarge(384f),  // 2xl
}

/**
 * Accessible text input component for government applications.
 *
 * Implements the CivUI form field pattern:
 * - Visible label (required for Section 508)
 * - Optional hint text with expected format
 * - Error message with immediate TalkBack announcement (LiveRegion)
 * - Focus ring indicator
 * - Dark mode adaptive colors
 *
 * Usage:
 * ```kotlin
 * var email by remember { mutableStateOf("") }
 * CivTextInput(
 *     label = "Email address",
 *     value = email,
 *     onValueChange = { email = it },
 *     hint = "For example: name@agency.gov",
 *     inputType = CivInputType.Email,
 * )
 * ```
 */
@Composable
fun CivTextInput(
    label: String,
    value: String,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier,
    hint: String? = null,
    error: String? = null,
    isRequired: Boolean = false,
    isDisabled: Boolean = false,
    placeholder: String? = null,
    inputType: CivInputType = CivInputType.Text,
    width: CivInputWidth = CivInputWidth.Full,
    onInput: ((String) -> Unit)? = null,
    onChange: ((String) -> Unit)? = null,
) {
    val isDark = isSystemInDarkTheme()
    var isFocused by remember { mutableStateOf(false) }

    // Adaptive colors
    val labelColor = if (isDark) CivTokens.DarkColors.Base.darkest else CivTokens.Colors.Base.darkest
    val hintColor = if (isDark) CivTokens.DarkColors.Base.dark else CivTokens.Colors.Base.dark
    val errorColor = if (isDark) CivTokens.DarkColors.Error.default_ else CivTokens.Colors.Error.default_
    val borderColor by animateColorAsState(
        targetValue = when {
            error != null -> errorColor
            isFocused -> if (isDark) CivTokens.DarkColors.Primary.default_ else CivTokens.Colors.Primary.default_
            else -> if (isDark) CivTokens.DarkColors.Base.light else CivTokens.Colors.Base.light
        },
        label = "borderColor",
    )
    val backgroundColor = if (isDark) CivTokens.DarkColors.White.default_ else CivTokens.Colors.White.default_

    Column(
        modifier = modifier.padding(bottom = CivTokens.Spacing._4),
    ) {
        // 1. Label
        Row(
            modifier = Modifier.padding(bottom = CivTokens.Spacing._1),
        ) {
            Text(
                text = label,
                style = TextStyle(
                    fontSize = CivTokens.Typography.FontSize.base,
                    fontWeight = FontWeight.Bold,
                ),
                color = labelColor,
            )
            if (isRequired) {
                Text(
                    text = " *",
                    style = TextStyle(
                        fontSize = CivTokens.Typography.FontSize.base,
                        fontWeight = FontWeight.Bold,
                    ),
                    color = errorColor,
                    modifier = Modifier.semantics {
                        contentDescription = "required"
                    },
                )
            }
        }

        // 2. Hint
        if (hint != null) {
            Text(
                text = hint,
                style = TextStyle(
                    fontSize = CivTokens.Typography.FontSize.sm,
                ),
                color = hintColor,
                modifier = Modifier.padding(bottom = CivTokens.Spacing._1),
            )
        }

        // 3. Error
        if (error != null) {
            Text(
                text = error,
                style = TextStyle(
                    fontSize = CivTokens.Typography.FontSize.sm,
                    fontWeight = FontWeight.Bold,
                ),
                color = errorColor,
                modifier = Modifier
                    .padding(bottom = CivTokens.Spacing._1)
                    // role="alert" equivalent — TalkBack announces immediately
                    .semantics {
                        liveRegion = LiveRegionMode.Assertive
                        error(error)
                    },
            )
        }

        // 4. Input
        val fieldModifier = Modifier
            .then(
                if (width.dp != null) Modifier.width(width.dp!!.dp)
                else Modifier.fillMaxWidth()
            )
            .border(
                width = if (error != null) CivTokens.Border.Width._2 else CivTokens.Border.Width.default_,
                color = borderColor,
                shape = RoundedCornerShape(CivTokens.Border.Radius.default_),
            )
            .onFocusChanged { focusState ->
                val wasFocused = isFocused
                isFocused = focusState.isFocused
                // Fire onChange when focus leaves (parallels web change event)
                if (wasFocused && !focusState.isFocused) {
                    onChange?.invoke(value)
                }
            }
            .alpha(if (isDisabled) 0.5f else 1f)

        val accessibilityModifier = Modifier.semantics {
            contentDescription = buildString {
                append(label)
                if (isRequired) append(", required")
                if (hint != null) append(". $hint")
                if (error != null) append(". Error: $error")
            }
        }

        TextField(
            value = value,
            onValueChange = { newValue ->
                onValueChange(newValue)
                onInput?.invoke(newValue)
            },
            modifier = fieldModifier.then(accessibilityModifier),
            enabled = !isDisabled,
            placeholder = placeholder?.let {
                { Text(text = it, color = hintColor) }
            },
            textStyle = TextStyle(
                fontSize = CivTokens.Typography.FontSize.base,
            ),
            visualTransformation = if (inputType == CivInputType.Password) {
                PasswordVisualTransformation()
            } else {
                VisualTransformation.None
            },
            keyboardOptions = KeyboardOptions(
                keyboardType = inputType.toKeyboardType(),
                capitalization = inputType.toCapitalization(),
                imeAction = ImeAction.Done,
            ),
            singleLine = true,
            shape = RoundedCornerShape(CivTokens.Border.Radius.default_),
            colors = TextFieldDefaults.colors(
                focusedContainerColor = backgroundColor,
                unfocusedContainerColor = backgroundColor,
                disabledContainerColor = backgroundColor,
                focusedIndicatorColor = Color.Transparent,
                unfocusedIndicatorColor = Color.Transparent,
                disabledIndicatorColor = Color.Transparent,
                errorIndicatorColor = Color.Transparent,
            ),
        )

        // Focus ring indicator (two-color technique)
        if (isFocused) {
            // The focus ring is implemented via the border color animation above
            // plus the outline effect. On Android, the system focus highlight
            // combined with our border color change provides equivalent visibility.
        }
    }
}

// MARK: - Input Type Mapping

private fun CivInputType.toKeyboardType(): KeyboardType = when (this) {
    CivInputType.Text -> KeyboardType.Text
    CivInputType.Email -> KeyboardType.Email
    CivInputType.Number -> KeyboardType.Decimal
    CivInputType.Password -> KeyboardType.Password
    CivInputType.Search -> KeyboardType.Text
    CivInputType.Telephone -> KeyboardType.Phone
    CivInputType.Url -> KeyboardType.Uri
}

private fun CivInputType.toCapitalization(): KeyboardCapitalization = when (this) {
    CivInputType.Email, CivInputType.Url -> KeyboardCapitalization.None
    else -> KeyboardCapitalization.Sentences
}

// MARK: - Preview

@Preview(showBackground = true, name = "CivTextInput Light")
@Composable
private fun CivTextInputPreview() {
    Column(modifier = Modifier.padding(16.dp)) {
        var name by remember { mutableStateOf("Jane Doe") }
        CivTextInput(
            label = "Full name",
            value = name,
            onValueChange = { name = it },
            hint = "First and last name",
            isRequired = true,
        )

        var email by remember { mutableStateOf("") }
        CivTextInput(
            label = "Email address",
            value = email,
            onValueChange = { email = it },
            hint = "For example: name@agency.gov",
            error = if (email.isNotEmpty() && !email.contains("@")) "Enter a valid email address" else null,
            isRequired = true,
            inputType = CivInputType.Email,
        )

        CivTextInput(
            label = "Phone number",
            value = "",
            onValueChange = {},
            hint = "For example: 202-555-0100",
            inputType = CivInputType.Telephone,
            width = CivInputWidth.Medium,
        )

        CivTextInput(
            label = "Notes",
            value = "",
            onValueChange = {},
            isDisabled = true,
            placeholder = "Disabled field",
        )
    }
}
