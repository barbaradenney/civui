// CivUI — CivActionButton & CivButtonGroup for Jetpack Compose
// Compact action button for toolbars and inline controls.
// CivButtonGroup joins buttons into a connected toolbar.
// Mirrors web `civ-action-button` and `civ-button-group` (Section 508 compliant)

package gov.civui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import gov.civui.tokens.CivTokens

/**
 * Compact action button for toolbars, inline form controls, and secondary actions.
 *
 * Same variant system as [CivButton] but with smaller padding and font size.
 * Can be used standalone or grouped inside a [CivButtonGroup] to form a
 * connected toolbar.
 *
 * TalkBack announces the label, pressed state, and disabled state.
 *
 * Usage:
 * ```kotlin
 * CivActionButton(
 *     label = "Bold",
 *     pressed = true,
 *     onClick = { toggleBold() },
 * )
 * ```
 */
@Composable
fun CivActionButton(
    label: String,
    modifier: Modifier = Modifier,
    variant: String = "tertiary",
    spacing: String = "default",
    type: String = "button",
    iconStart: String = "",
    iconEnd: String = "",
    iconOnly: Boolean = false,
    danger: Boolean = false,
    disabled: Boolean = false,
    pressed: Boolean = false,
    // Marks this button as the current item in a navigation set
    // (e.g. active page in pagination). Web equivalent: aria-current="page".
    current: Boolean = false,
    href: String = "",
    onClick: (() -> Unit)? = null,
    onAnalytics: ((event: String, data: Map<String, Any>?) -> Unit)? = null,
) {
    val isDark = isSystemInDarkTheme()

    val primaryColor = if (isDark) CivTokens.DarkColors.Primary.default_ else CivTokens.Colors.Primary.default_
    val primaryDarker = if (isDark) CivTokens.DarkColors.Primary.darker else CivTokens.Colors.Primary.darker
    val primaryLightest = if (isDark) CivTokens.DarkColors.Primary.lightest else CivTokens.Colors.Primary.lightest
    val whiteColor = if (isDark) CivTokens.DarkColors.White.default_ else CivTokens.Colors.White.default_
    val errorColor = if (isDark) CivTokens.DarkColors.Error.default_ else CivTokens.Colors.Error.default_
    val baseDarkest = if (isDark) CivTokens.DarkColors.Base.darkest else CivTokens.Colors.Base.darkest
    val baseLightest = if (isDark) CivTokens.DarkColors.Base.lightest else CivTokens.Colors.Base.lightest

    val buttonModifier = modifier
        .alpha(if (disabled) 0.5f else 1f)
        .semantics {
            contentDescription = buildString {
                append(label)
                if (pressed) append(", pressed")
            }
            role = Role.Button
        }

    val handleClick: () -> Unit = {
        onAnalytics?.invoke("click", mapOf("label" to label, "variant" to variant, "danger" to danger))
        onClick?.invoke()
    }

    when {
        // Danger primary — filled red
        danger && variant == "primary" -> {
            Button(
                onClick = handleClick,
                enabled = !disabled,
                colors = ButtonDefaults.buttonColors(
                    containerColor = errorColor,
                    contentColor = whiteColor,
                ),
                modifier = buttonModifier,
            ) {
                Text(
                    text = label,
                    style = TextStyle(
                        fontSize = if (spacing == "sm") CivTokens.Typography.FontSize.xs else CivTokens.Typography.FontSize.sm,
                        fontWeight = FontWeight.SemiBold,
                    ),
                )
            }
        }
        // Danger secondary/tertiary — outlined/text with error color
        danger -> {
            if (variant == "secondary") {
                OutlinedButton(
                    onClick = handleClick,
                    enabled = !disabled,
                    border = BorderStroke(CivTokens.Border.Width.default_, errorColor),
                    colors = ButtonDefaults.outlinedButtonColors(
                        contentColor = errorColor,
                    ),
                    modifier = buttonModifier,
                ) {
                    Text(
                        text = label,
                        style = TextStyle(
                            fontSize = if (spacing == "sm") CivTokens.Typography.FontSize.xs else CivTokens.Typography.FontSize.sm,
                            fontWeight = FontWeight.SemiBold,
                        ),
                    )
                }
            } else {
                OutlinedButton(
                    onClick = handleClick,
                    enabled = !disabled,
                    border = BorderStroke(CivTokens.Border.Width.default_, errorColor),
                    colors = ButtonDefaults.outlinedButtonColors(
                        contentColor = errorColor,
                    ),
                    modifier = buttonModifier,
                ) {
                    Text(
                        text = label,
                        style = TextStyle(
                            fontSize = if (spacing == "sm") CivTokens.Typography.FontSize.xs else CivTokens.Typography.FontSize.sm,
                            fontWeight = FontWeight.SemiBold,
                        ),
                    )
                }
            }
        }
        // Primary — filled
        variant == "primary" -> {
            Button(
                onClick = handleClick,
                enabled = !disabled,
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (pressed) primaryDarker else primaryColor,
                    contentColor = whiteColor,
                ),
                modifier = buttonModifier,
            ) {
                Text(
                    text = label,
                    style = TextStyle(
                        fontSize = if (spacing == "sm") CivTokens.Typography.FontSize.xs else CivTokens.Typography.FontSize.sm,
                        fontWeight = FontWeight.SemiBold,
                    ),
                )
            }
        }
        // Secondary — outlined
        variant == "secondary" -> {
            OutlinedButton(
                onClick = handleClick,
                enabled = !disabled,
                border = BorderStroke(CivTokens.Border.Width.default_, primaryColor),
                colors = ButtonDefaults.outlinedButtonColors(
                    containerColor = if (pressed) primaryLightest else baseLightest,
                    contentColor = baseDarkest,
                ),
                modifier = buttonModifier,
            ) {
                Text(
                    text = label,
                    style = TextStyle(
                        fontSize = if (spacing == "sm") CivTokens.Typography.FontSize.xs else CivTokens.Typography.FontSize.sm,
                        fontWeight = FontWeight.SemiBold,
                    ),
                )
            }
        }
        // Tertiary (default) — outlined border
        else -> {
            OutlinedButton(
                onClick = handleClick,
                enabled = !disabled,
                border = BorderStroke(CivTokens.Border.Width.default_, primaryColor),
                colors = ButtonDefaults.outlinedButtonColors(
                    containerColor = if (pressed) primaryLightest else androidx.compose.ui.graphics.Color.Transparent,
                    contentColor = primaryColor,
                ),
                modifier = buttonModifier,
            ) {
                Text(
                    text = label,
                    style = TextStyle(
                        fontSize = if (spacing == "sm") CivTokens.Typography.FontSize.xs else CivTokens.Typography.FontSize.sm,
                        fontWeight = FontWeight.SemiBold,
                    ),
                )
            }
        }
    }
}

/**
 * Groups action buttons into a connected toolbar.
 *
 * Joins adjacent action buttons visually. Supports horizontal (default)
 * and vertical orientations.
 *
 * TalkBack treats the group as a toolbar container.
 *
 * Usage:
 * ```kotlin
 * CivButtonGroup {
 *     CivActionButton(label = "Bold")
 *     CivActionButton(label = "Italic")
 *     CivActionButton(label = "Underline")
 * }
 * ```
 */
@Composable
fun CivButtonGroup(
    modifier: Modifier = Modifier,
    orientation: String = "horizontal",
    content: @Composable () -> Unit,
) {
    if (orientation == "vertical") {
        Column(
            modifier = modifier.semantics {
                contentDescription = "Toolbar"
            },
        ) {
            content()
        }
    } else {
        Row(
            modifier = modifier.semantics {
                contentDescription = "Toolbar"
            },
        ) {
            content()
        }
    }
}

// MARK: - Preview

@Preview(showBackground = true, name = "CivActionButton")
@Composable
private fun CivActionButtonPreview() {
    Column(modifier = Modifier.padding(16.dp)) {
        // Standalone variants
        CivActionButton(label = "Primary", variant = "primary")
        CivActionButton(label = "Secondary", variant = "secondary")
        CivActionButton(label = "Tertiary", variant = "tertiary")

        // Pressed
        CivActionButton(label = "Pressed", variant = "tertiary", pressed = true)

        // Danger
        CivActionButton(label = "Delete", variant = "primary", danger = true)
        CivActionButton(label = "Remove", variant = "tertiary", danger = true)

        // Disabled
        CivActionButton(label = "Disabled", disabled = true)

        // Horizontal toolbar
        CivButtonGroup {
            CivActionButton(label = "Bold")
            CivActionButton(label = "Italic")
            CivActionButton(label = "Underline")
        }

        // Vertical toolbar
        CivButtonGroup(orientation = "vertical") {
            CivActionButton(label = "Option 1", variant = "primary")
            CivActionButton(label = "Option 2", variant = "primary", pressed = true)
            CivActionButton(label = "Option 3", variant = "primary")
        }
    }
}
