// CivUI — CivLinkCard for Jetpack Compose
// Clickable card that navigates to a destination. The entire card is the tap target.
// Variants: primary (blue filled), secondary (blue border), tertiary (gray border), critical (gold)

package gov.civui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
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
 * Accessible link card for government applications.
 *
 * A tappable card that navigates to a destination. Renders a heading
 * and optional description inside a styled container. The entire card
 * is the tap target.
 *
 * Usage:
 * ```kotlin
 * CivLinkCard(
 *     href = "/benefits/disability",
 *     heading = "Disability compensation",
 *     description = "File a claim for a service-connected disability.",
 * )
 * ```
 */
@Composable
fun CivLinkCard(
    href: String,
    heading: String,
    modifier: Modifier = Modifier,
    description: String = "",
    variant: String = "primary",
    onTap: (() -> Unit)? = null,
    onAnalytics: ((event: String, data: Map<String, Any>?) -> Unit)? = null,
) {
    val isDark = isSystemInDarkTheme()
    val uriHandler = LocalUriHandler.current

    val primaryColor = if (isDark) CivTokens.DarkColors.Primary.default_ else CivTokens.Colors.Primary.default_
    val whiteColor = if (isDark) CivTokens.DarkColors.White.default_ else CivTokens.Colors.White.default_
    val textColor = if (isDark) CivTokens.DarkColors.Base.darkest else CivTokens.Colors.Base.darkest
    val subtleColor = if (isDark) CivTokens.DarkColors.Base.dark else CivTokens.Colors.Base.dark
    val borderLight = if (isDark) CivTokens.DarkColors.Base.light else CivTokens.Colors.Base.light

    val headingColor = when (variant) {
        "primary" -> whiteColor
        "critical" -> textColor
        else -> primaryColor
    }

    val descriptionColor = when (variant) {
        "primary" -> whiteColor.copy(alpha = 0.9f)
        "critical" -> textColor
        else -> subtleColor
    }

    val bgColor = when (variant) {
        "primary" -> primaryColor
        "critical" -> Color(0xFFFACE00) // #face00
        else -> whiteColor
    }

    val border: BorderStroke? = when (variant) {
        "secondary" -> BorderStroke(CivTokens.Border.Width._2, primaryColor)
        "tertiary" -> BorderStroke(CivTokens.Border.Width.default_, borderLight)
        else -> null
    }

    val handleClick: () -> Unit = {
        onAnalytics?.invoke("click", mapOf("heading" to heading, "variant" to variant))
        if (href.isNotEmpty()) {
            uriHandler.openUri(href)
        }
        onTap?.invoke()
    }

    Surface(
        color = bgColor,
        shape = RoundedCornerShape(CivTokens.Border.Radius.default_),
        border = border,
        modifier = modifier
            .fillMaxWidth()
            .clickable(
                role = Role.Button,
                onClick = handleClick,
            )
            .semantics {
                contentDescription = buildString {
                    append(heading)
                    if (description.isNotEmpty()) append(". $description")
                }
                role = Role.Button
            },
    ) {
        Column(
            modifier = Modifier.padding(CivTokens.Spacing._4),
        ) {
            Text(
                text = heading,
                style = TextStyle(
                    fontSize = CivTokens.Typography.FontSize.lg,
                    fontWeight = FontWeight.Bold,
                    textDecoration = TextDecoration.Underline,
                ),
                color = headingColor,
            )

            if (description.isNotEmpty()) {
                Text(
                    text = description,
                    style = TextStyle(
                        fontSize = CivTokens.Typography.FontSize.sm,
                    ),
                    color = descriptionColor,
                    modifier = Modifier.padding(top = CivTokens.Spacing._1),
                )
            }
        }
    }
}

// MARK: - Preview

@Preview(showBackground = true, name = "CivLinkCard")
@Composable
private fun CivLinkCardPreview() {
    Column(modifier = Modifier.padding(16.dp)) {
        CivLinkCard(
            href = "/benefits",
            heading = "Disability compensation",
            description = "File a claim for a service-connected disability.",
            variant = "primary",
        )

        CivLinkCard(
            href = "/healthcare",
            heading = "Health care benefits",
            description = "Apply for VA health care coverage.",
            variant = "secondary",
            modifier = Modifier.padding(top = CivTokens.Spacing._4),
        )

        CivLinkCard(
            href = "/education",
            heading = "Education benefits",
            description = "Apply for GI Bill and education benefits.",
            variant = "tertiary",
            modifier = Modifier.padding(top = CivTokens.Spacing._4),
        )

        CivLinkCard(
            href = "/action-needed",
            heading = "Action required",
            description = "You have documents that need your attention.",
            variant = "critical",
            modifier = Modifier.padding(top = CivTokens.Spacing._4),
        )
    }
}
