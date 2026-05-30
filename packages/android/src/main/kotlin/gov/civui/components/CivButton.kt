// CivUI — CivButton for Jetpack Compose
// Accessible button with emphasis styles. Renders as link when href is set.
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
 *     emphasis = "primary",
 *     onClick = { /* handle click */ },
 * )
 *
 * CivButton(
 *     label = "Learn more",
 *     emphasis = "tertiary",
 *     href = "https://www.usa.gov",
 * )
 * ```
 */
@Composable
fun CivButton(
    label: String,
    modifier: Modifier = Modifier,
    emphasis: String = "primary",
    danger: Boolean = false,
    type: String = "button",
    disabled: Boolean = false,
    iconStart: String = "",
    iconEnd: String = "",
    iconOnly: Boolean = false,
    href: String = "",
    loading: Boolean = false,
    loadingLabel: String = "Loading…",
    onClick: (() -> Unit)? = null,
    onAnalytics: ((event: String, data: Map<String, Any>?) -> Unit)? = null,
) {
    val isDark = isSystemInDarkTheme()

    val primaryColor = if (isDark) CivTokens.DarkColors.Primary.default_ else CivTokens.Colors.Primary.default_
    val whiteColor = if (isDark) CivTokens.DarkColors.White.default_ else CivTokens.Colors.White.default_
    val errorColor = if (isDark) CivTokens.DarkColors.Error.default_ else CivTokens.Colors.Error.default_

    // `loading` implies disabled so repeated taps don't fire concurrent
    // work. The effectiveDisabled cascade applies across all variants
    // below so each Material button respects both flags.
    val effectiveDisabled = disabled || loading

    val buttonModifier = modifier
        .alpha(if (effectiveDisabled) 0.5f else 1f)
        .semantics {
            // TalkBack hears the loading label instead of the static
            // button label while loading is in flight, matching the
            // web's aria-label swap.
            contentDescription = if (loading) loadingLabel else label
            role = Role.Button // Compose has no Role.Link; the href conditional was a no-op
        }

    val handleClick: () -> Unit = {
        // Guard against tap-while-loading at the handler level — the
        // enabled=!effectiveDisabled cascade below already blocks the
        // tap at the UI layer; this is belt-and-suspenders for any
        // path that calls handleClick programmatically.
        if (!loading) {
            onAnalytics?.invoke("click", mapOf("label" to label, "emphasis" to emphasis))
            onClick?.invoke()
        }
    }

    // Link mode — `loading` is ignored on links (matches the web's
    // `_isLoading = loading && !_isLink` rule). Use only `disabled`.
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
    when (emphasis) {
        "secondary" -> {
            OutlinedButton(
                onClick = handleClick,
                enabled = !effectiveDisabled,
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
                enabled = !effectiveDisabled,
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
                enabled = !effectiveDisabled,
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
                enabled = !effectiveDisabled,
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
            emphasis = "primary",
        )

        CivButton(
            label = "Save draft",
            emphasis = "secondary",
        )

        CivButton(
            label = "Cancel",
            emphasis = "tertiary",
        )

        CivButton(
            label = "Delete record",
            emphasis = "danger",
        )

        CivButton(
            label = "Disabled button",
            emphasis = "primary",
            disabled = true,
        )

        CivButton(
            label = "Visit USA.gov",
            emphasis = "tertiary",
            href = "https://www.usa.gov",
        )
    }
}
