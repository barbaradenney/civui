// CivUI — CivSummary for Jetpack Compose
// Read-only summary/review page for displaying form data before submission.
// Renders: heading -> sections with key-value pairs and edit links (Section 508 compliant)

package gov.civui.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import gov.civui.tokens.CivTokens

/**
 * Summary section data class (parallels web SummarySection).
 *
 * @param heading Section heading (e.g., "Personal information").
 * @param editHref Optional href or step ID for the edit action.
 * @param items Key-value pairs to display.
 */
data class CivSummarySection(
    val heading: String,
    val editHref: String? = null,
    val items: List<CivSummaryItem>,
)

/**
 * Summary item data class (parallels web SummaryItem).
 *
 * @param label Label (e.g., "First name").
 * @param value Value to display. Null or empty renders as "Not provided".
 */
data class CivSummaryItem(
    val label: String,
    val value: String? = null,
)

/**
 * Accessible read-only summary page for government applications.
 *
 * Displays structured form data in sections with key-value pairs,
 * each section optionally having an edit link. Mirrors the web
 * `civ-summary` component.
 *
 * TalkBack announces the heading and section structure. Edit links
 * include section-specific labels for clear navigation.
 *
 * Usage:
 * ```kotlin
 * CivSummary(
 *     heading = "Review your information",
 *     sections = listOf(
 *         CivSummarySection(
 *             heading = "Personal information",
 *             editHref = "#step-1",
 *             items = listOf(
 *                 CivSummaryItem("First name", "Jane"),
 *                 CivSummaryItem("Last name", "Doe"),
 *             ),
 *         ),
 *     ),
 *     onEdit = { section, href -> navigateToEdit(href) },
 * )
 * ```
 */
@Composable
fun CivSummary(
    heading: String,
    sections: List<CivSummarySection>,
    modifier: Modifier = Modifier,
    onEdit: ((section: String, href: String) -> Unit)? = null,
    onAnalytics: ((event: String, data: Map<String, Any>?) -> Unit)? = null,
) {
    val isDark = isSystemInDarkTheme()

    val headingColor = if (isDark) CivTokens.DarkColors.Base.darkest else CivTokens.Colors.Base.darkest
    val sectionHeadingColor = if (isDark) CivTokens.DarkColors.Base.darkest else CivTokens.Colors.Base.darkest
    val labelColor = if (isDark) CivTokens.DarkColors.Base.dark else CivTokens.Colors.Base.dark
    val valueColor = if (isDark) CivTokens.DarkColors.Base.darkest else CivTokens.Colors.Base.darkest
    val mutedColor = if (isDark) CivTokens.DarkColors.Base.default_ else CivTokens.Colors.Base.default_
    val linkColor = if (isDark) CivTokens.DarkColors.Primary.default_ else CivTokens.Colors.Primary.default_
    val dividerColor = if (isDark) CivTokens.DarkColors.Base.lighter else CivTokens.Colors.Base.lighter

    Column(
        modifier = modifier
            .semantics {
                contentDescription = heading.ifEmpty { "Summary" }
            },
    ) {
        // Main heading
        if (heading.isNotEmpty()) {
            Text(
                text = heading,
                style = TextStyle(
                    fontSize = CivTokens.Typography.FontSize._2xl,
                    fontWeight = FontWeight.Bold,
                ),
                color = headingColor,
                modifier = Modifier.padding(bottom = CivTokens.Spacing._6),
            )
        }

        // Sections
        sections.forEach { section ->
            SummarySection(
                section = section,
                sectionHeadingColor = sectionHeadingColor,
                labelColor = labelColor,
                valueColor = valueColor,
                mutedColor = mutedColor,
                linkColor = linkColor,
                dividerColor = dividerColor,
                onEdit = onEdit,
                onAnalytics = onAnalytics,
            )
        }
    }
}

@Composable
private fun SummarySection(
    section: CivSummarySection,
    sectionHeadingColor: androidx.compose.ui.graphics.Color,
    labelColor: androidx.compose.ui.graphics.Color,
    valueColor: androidx.compose.ui.graphics.Color,
    mutedColor: androidx.compose.ui.graphics.Color,
    linkColor: androidx.compose.ui.graphics.Color,
    dividerColor: androidx.compose.ui.graphics.Color,
    onEdit: ((section: String, href: String) -> Unit)?,
    onAnalytics: ((event: String, data: Map<String, Any>?) -> Unit)?,
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(bottom = CivTokens.Spacing._6),
    ) {
        // Section header row: heading + edit link
        Row(
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = CivTokens.Spacing._3),
        ) {
            Text(
                text = section.heading,
                style = TextStyle(
                    fontSize = CivTokens.Typography.FontSize.lg,
                    fontWeight = FontWeight.SemiBold,
                ),
                color = sectionHeadingColor,
            )

            if (section.editHref != null && onEdit != null) {
                Text(
                    text = "Edit",
                    style = TextStyle(
                        fontSize = CivTokens.Typography.FontSize.base,
                        fontWeight = FontWeight.SemiBold,
                        textDecoration = TextDecoration.Underline,
                    ),
                    color = linkColor,
                    modifier = Modifier
                        .clickable {
                            onEdit(section.heading, section.editHref)
                            onAnalytics?.invoke("click", mapOf("section" to section.heading))
                        }
                        .semantics {
                            contentDescription = "Edit ${section.heading}"
                            role = Role.Button
                        },
                )
            }
        }

        // Key-value items
        section.items.forEach { item ->
            SummaryItem(
                item = item,
                labelColor = labelColor,
                valueColor = valueColor,
                mutedColor = mutedColor,
            )
        }

        // Divider
        HorizontalDivider(
            color = dividerColor,
            thickness = CivTokens.Border.Width.default_,
            modifier = Modifier.padding(top = CivTokens.Spacing._4),
        )
    }
}

@Composable
private fun SummaryItem(
    item: CivSummaryItem,
    labelColor: androidx.compose.ui.graphics.Color,
    valueColor: androidx.compose.ui.graphics.Color,
    mutedColor: androidx.compose.ui.graphics.Color,
) {
    val hasValue = !item.value.isNullOrEmpty()

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = CivTokens.Spacing._2)
            .semantics {
                contentDescription = if (hasValue) {
                    "${item.label}: ${item.value}"
                } else {
                    "${item.label}: Not provided"
                }
            },
    ) {
        // Label (dt equivalent)
        Text(
            text = item.label,
            style = TextStyle(
                fontSize = CivTokens.Typography.FontSize.base,
                fontWeight = FontWeight.Medium,
            ),
            color = labelColor,
            modifier = Modifier.weight(1f),
        )

        // Value (dd equivalent)
        if (hasValue) {
            Text(
                text = item.value!!,
                style = TextStyle(
                    fontSize = CivTokens.Typography.FontSize.base,
                ),
                color = valueColor,
                modifier = Modifier.weight(1.5f),
            )
        } else {
            Text(
                text = "Not provided",
                style = TextStyle(
                    fontSize = CivTokens.Typography.FontSize.base,
                    fontStyle = FontStyle.Italic,
                ),
                color = mutedColor,
                modifier = Modifier.weight(1.5f),
            )
        }
    }
}

// MARK: - Preview

@Preview(showBackground = true, name = "CivSummary")
@Composable
private fun CivSummaryPreview() {
    Column(modifier = Modifier.padding(16.dp)) {
        CivSummary(
            heading = "Review your information",
            sections = listOf(
                CivSummarySection(
                    heading = "Personal information",
                    editHref = "#step-1",
                    items = listOf(
                        CivSummaryItem("First name", "Jane"),
                        CivSummaryItem("Last name", "Doe"),
                        CivSummaryItem("Date of birth", "January 15, 1990"),
                        CivSummaryItem("Middle name"),
                    ),
                ),
                CivSummarySection(
                    heading = "Contact information",
                    editHref = "#step-2",
                    items = listOf(
                        CivSummaryItem("Email", "jane.doe@example.gov"),
                        CivSummaryItem("Phone", "(202) 555-0100"),
                        CivSummaryItem("Alternate phone"),
                    ),
                ),
                CivSummarySection(
                    heading = "Address",
                    editHref = "#step-3",
                    items = listOf(
                        CivSummaryItem("Street", "1600 Pennsylvania Ave NW"),
                        CivSummaryItem("City", "Washington"),
                        CivSummaryItem("State", "DC"),
                        CivSummaryItem("ZIP code", "20500"),
                    ),
                ),
            ),
            onEdit = { _, _ -> /* navigate */ },
        )
    }
}
