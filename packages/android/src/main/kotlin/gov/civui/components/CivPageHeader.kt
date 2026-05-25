// CivUI — CivPageHeader for Jetpack Compose
// Structured page heading with tag, eyebrow, heading, and subheading areas.

package gov.civui.components

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextTransform
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import gov.civui.tokens.CivTokens

/**
 * Accessible page header for government applications.
 *
 * Renders a structured heading area with optional tag, eyebrow text,
 * main heading, and subheading. Follows the government design system
 * pattern for page titles.
 *
 * TalkBack announces the heading with proper heading semantics.
 *
 * Usage:
 * ```kotlin
 * CivPageHeader(heading = "Apply for disability compensation")
 *
 * CivPageHeader(
 *     heading = "Apply for disability compensation",
 *     eyebrow = "Benefits",
 *     subheading = "VA Form 21-526EZ",
 *     tag = "In progress",
 *     tagVariant = "teal",
 * )
 * ```
 */
/**
 * Page header with optional tag, eyebrow, heading, and subheading.
 *
 * @param rhythm Bottom margin to the content below: "default" (24dp) or "sm" (12dp).
 *   Named `rhythm` to match the web schema; controls margin between the header and the
 *   next sibling, not internal padding.
 * @param spacing Deprecated alias for `rhythm`. Kept for backward compat; will be removed
 *   in a future release. Setting this on web emits a dev-mode console warning.
 */
@Composable
fun CivPageHeader(
    heading: String,
    modifier: Modifier = Modifier,
    eyebrow: String = "",
    subheading: String = "",
    tag: String = "",
    tagVariant: String = "gray",
    tagStyle: String = "secondary",
    rhythm: String = "default",
    spacing: String = "default",
    iconStart: String = "",
    iconEnd: String = "",
) {
    val isDark = isSystemInDarkTheme()

    val headingColor = if (isDark) CivTokens.DarkColors.Base.darkest else CivTokens.Colors.Base.darkest
    val subtleColor = if (isDark) CivTokens.DarkColors.Base.dark else CivTokens.Colors.Base.dark

    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(bottom = CivTokens.Spacing._4),
    ) {
        // 1. Tag
        if (tag.isNotEmpty()) {
            CivTag(label = tag, variant = tagVariant, tagStyle = tagStyle)
            androidx.compose.foundation.layout.Spacer(
                modifier = Modifier.padding(bottom = CivTokens.Spacing._1)
            )
        }

        // 2. Eyebrow
        if (eyebrow.isNotEmpty()) {
            Text(
                text = eyebrow.uppercase(),
                style = TextStyle(
                    fontSize = CivTokens.Typography.FontSize.sm,
                    fontWeight = FontWeight.SemiBold,
                ),
                color = subtleColor,
                modifier = Modifier.padding(bottom = CivTokens.Spacing._0_5),
            )
        }

        // 3. Heading
        Text(
            text = heading,
            style = TextStyle(
                fontSize = CivTokens.Typography.FontSize._2xl,
                fontWeight = FontWeight.Bold,
            ),
            color = headingColor,
            modifier = Modifier.semantics { heading() },
        )

        // 4. Subheading
        if (subheading.isNotEmpty()) {
            Text(
                text = subheading,
                style = TextStyle(
                    fontSize = CivTokens.Typography.FontSize.base,
                ),
                color = subtleColor,
                modifier = Modifier.padding(top = CivTokens.Spacing._1),
            )
        }
    }
}

// MARK: - Preview

@Preview(showBackground = true, name = "CivPageHeader")
@Composable
private fun CivPageHeaderPreview() {
    Column(modifier = Modifier.padding(16.dp)) {
        CivPageHeader(heading = "Dashboard")

        CivPageHeader(
            heading = "Apply for disability compensation",
            eyebrow = "Benefits",
            subheading = "VA Form 21-526EZ",
        )

        CivPageHeader(
            heading = "Claim status",
            eyebrow = "Disability",
            tag = "In progress",
            tagVariant = "teal",
        )

        CivPageHeader(
            heading = "Urgent action needed",
            subheading = "Please upload your supporting documents",
            tag = "Action required",
            tagVariant = "gold",
            tagStyle = "primary",
        )
    }
}
