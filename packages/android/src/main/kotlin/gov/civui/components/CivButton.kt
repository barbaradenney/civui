// CivUI — CivButton for Jetpack Compose
// Accessible button with variant styles. Renders as link when href is set.
// Mirrors the web `civ-button` component (Section 508 compliant)

package gov.civui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.text.ClickableText
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import gov.civui.tokens.CivTokens

/**
 * Accessible button for government applications.
 *
 * Supports four variants: primary (filled), secondary (outlined), tertiary
 * (text-only), and danger (filled red). When `href` is set, renders as a
 * tappable link instead of a button.
 *
 * TalkBack announces the label and role. Disabled state reduces opacity
 * to 0.5 and prevents interaction.
 *
 * Usage:
 * ```kotlin
 * CivButton(
 *     label = "Submit application",
 *     variant = "primary",
 *     onClick = { /* handle click */ },
 * )
 *
 * CivButton(
 *     label = "Learn more",
 *     variant = "tertiary",
 *     href = "https://www.usa.gov",
 * )
 * ```
 */
@Composable
fun CivButton(
    label: String,
    modifier: Modifier = Modifier,
    variant: String = "primary",
    danger: Boolean = false,
    type: String = "button",
    disabled: Boolean = false,
    iconStart: String = "",
    iconEnd: String = "",
    href: String = "",
    onClick: (() -> Unit)? = null,
    onAnalytics: ((event: String, data: Map<String, Any>?) -> Unit)? = null,
) {
    val isDark = isSystemInDarkTheme()

    val primaryColor = if (isDark) CivTokens.DarkColors.Primary.default_ else CivTokens.Colors.Primary.default_
    val whiteColor = if (isDark) CivTokens.DarkColors.White.default_ else CivTokens.Colors.White.default_
    val errorColor = if (isDark) CivTokens.DarkColors.Error.default_ else CivTokens.Colors.Error.default_

    val buttonModifier = modifier
        .alpha(if (disabled) 0.5f else 1f)
        .semantics {
            contentDescription = label
            role = if (href.isNotEmpty()) Role.Button else Role.Button
        }

    val handleClick: () -> Unit = {
        onAnalytics?.invoke("click", mapOf("label" to label, "variant" to variant))
        onClick?.invoke()
    }

    // Link mode
    if (href.isNotEmpty()) {
        val uriHandler = LocalUriHandler.current
        TextButton(
            onClick = {
                if (!disabled) {
                    handleClick()
                    uriHandler.openUri(href)
                }
            },
            enabled = !disabled,
            modifier = buttonModifier,
        ) {
            Text(
                text = label,
                style = TextStyle(
                    fontSize = CivTokens.Typography.FontSize.base,
                    fontWeight = FontWeight.SemiBold,
                    textDecoration = TextDecoration.Underline,
                ),
                color = primaryColor,
            )
        }
        return
    }

    // Button mode
    when (variant) {
        "secondary" -> {
            OutlinedButton(
                onClick = handleClick,
                enabled = !disabled,
                border = BorderStroke(CivTokens.Border.Width._2, primaryColor),
                colors = ButtonDefaults.outlinedButtonColors(
                    contentColor = primaryColor,
                ),
                modifier = buttonModifier,
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
        "tertiary" -> {
            TextButton(
                onClick = handleClick,
                enabled = !disabled,
                colors = ButtonDefaults.textButtonColors(
                    contentColor = primaryColor,
                ),
                modifier = buttonModifier,
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
        "danger" -> {
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
                        fontSize = CivTokens.Typography.FontSize.base,
                        fontWeight = FontWeight.SemiBold,
                    ),
                )
            }
        }
        else -> {
            // "primary" — default filled button
            Button(
                onClick = handleClick,
                enabled = !disabled,
                colors = ButtonDefaults.buttonColors(
                    containerColor = primaryColor,
                    contentColor = whiteColor,
                ),
                modifier = buttonModifier,
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
}

// MARK: - Preview

@Preview(showBackground = true, name = "CivButton")
@Composable
private fun CivButtonPreview() {
    Column(modifier = Modifier.padding(16.dp)) {
        CivButton(
            label = "Submit application",
            variant = "primary",
        )

        CivButton(
            label = "Save draft",
            variant = "secondary",
        )

        CivButton(
            label = "Cancel",
            variant = "tertiary",
        )

        CivButton(
            label = "Delete record",
            variant = "danger",
        )

        CivButton(
            label = "Disabled button",
            variant = "primary",
            disabled = true,
        )

        CivButton(
            label = "Visit USA.gov",
            variant = "tertiary",
            href = "https://www.usa.gov",
        )
    }
}
