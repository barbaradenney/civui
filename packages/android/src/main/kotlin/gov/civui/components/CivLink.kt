// CivUI — CivLink for Jetpack Compose
// Accessible link component with variant styles.
// Variants: primary (button-styled), secondary (with caret), tertiary (plain), back (with chevron)

package gov.civui.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import gov.civui.tokens.CivTokens

/**
 * Accessible link for government applications.
 *
 * Always renders as a tappable link (never a button). Supports four
 * variants and an optional danger modifier for destructive actions.
 * All variants render underlined text for accessibility compliance.
 *
 * Usage:
 * ```kotlin
 * CivLink(label = "View details", href = "/claims/123", variant = "secondary")
 * CivLink(label = "Go back", variant = "back", onTap = { navigateBack() })
 * CivLink(label = "Remove file", variant = "tertiary", danger = true)
 * ```
 */
@Composable
fun CivLink(
    label: String,
    modifier: Modifier = Modifier,
    href: String = "",
    variant: String = "tertiary",
    danger: Boolean = false,
    disabled: Boolean = false,
    iconStart: String = "",
    iconEnd: String = "",
    onTap: (() -> Unit)? = null,
    onAnalytics: ((event: String, data: Map<String, Any>?) -> Unit)? = null,
) {
    val isDark = isSystemInDarkTheme()
    val uriHandler = LocalUriHandler.current

    val primaryColor = if (isDark) CivTokens.DarkColors.Primary.default_ else CivTokens.Colors.Primary.default_
    val whiteColor = if (isDark) CivTokens.DarkColors.White.default_ else CivTokens.Colors.White.default_
    val errorColor = if (isDark) CivTokens.DarkColors.Error.default_ else CivTokens.Colors.Error.default_

    val textColor = when {
        danger -> errorColor
        variant == "primary" -> whiteColor
        else -> primaryColor
    }

    val bgColor = when {
        variant == "primary" && danger -> errorColor
        variant == "primary" -> primaryColor
        else -> null
    }

    val fontSize = if (variant == "back") CivTokens.Typography.FontSize.sm else CivTokens.Typography.FontSize.base
    val fontWeight = if (variant == "primary") FontWeight.SemiBold else FontWeight.Normal

    val handleClick: () -> Unit = {
        if (!disabled) {
            onAnalytics?.invoke("click", mapOf("variant" to variant, "danger" to danger))
            if (href.isNotEmpty()) {
                uriHandler.openUri(href)
            }
            onTap?.invoke()
        }
    }

    Row(
        modifier = modifier
            .alpha(if (disabled) 0.5f else 1f)
            .then(
                if (bgColor != null) {
                    Modifier
                        .clip(RoundedCornerShape(CivTokens.Border.Radius.default_))
                        .drawBehind { drawRect(bgColor) }
                        .padding(horizontal = CivTokens.Spacing._6, vertical = CivTokens.Spacing._2_5)
                } else {
                    Modifier.padding(vertical = CivTokens.Spacing._1)
                }
            )
            .clickable(
                enabled = !disabled,
                role = Role.Button,
                onClick = handleClick,
            )
            .semantics {
                contentDescription = label
                role = Role.Button // TalkBack link role
            },
        verticalAlignment = Alignment.CenterVertically,
    ) {
        if (variant == "back") {
            Icon(
                imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                contentDescription = null,
                tint = textColor,
                modifier = Modifier.padding(end = CivTokens.Spacing._0_5),
            )
        }

        Text(
            text = label,
            style = TextStyle(
                fontSize = fontSize,
                fontWeight = fontWeight,
                textDecoration = TextDecoration.Underline,
            ),
            color = textColor,
        )

        if (variant == "secondary") {
            Icon(
                imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                contentDescription = null,
                tint = textColor,
                modifier = Modifier.padding(start = CivTokens.Spacing._0_5),
            )
        }
    }
}

// MARK: - Preview

@Preview(showBackground = true, name = "CivLink")
@Composable
private fun CivLinkPreview() {
    Column(modifier = Modifier.padding(16.dp)) {
        CivLink(label = "Primary link", href = "#", variant = "primary")
        CivLink(label = "Secondary link", href = "#", variant = "secondary")
        CivLink(label = "Tertiary link", href = "#", variant = "tertiary")
        CivLink(label = "Go back", variant = "back")
        CivLink(label = "Delete file", variant = "tertiary", danger = true)
        CivLink(label = "Disabled link", href = "#", variant = "secondary", disabled = true)
    }
}
