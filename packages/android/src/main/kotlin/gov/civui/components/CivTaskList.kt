// CivUI — CivTaskList for Jetpack Compose
// Task list hub for multi-chapter form navigation.
// Renders: task groups with status-tagged tasks (Section 508 compliant)

package gov.civui.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Divider
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import gov.civui.tokens.CivTokens
import androidx.compose.foundation.background
import androidx.compose.foundation.shape.RoundedCornerShape

/**
 * Container for task groups in a multi-chapter form hub.
 */
@Composable
fun CivTaskList(
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit,
) {
    Column(modifier = modifier) {
        content()
    }
}

/**
 * A labeled group of tasks within a task list.
 */
@Composable
fun CivTaskGroup(
    heading: String,
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit,
) {
    val isDark = isSystemInDarkTheme()
    val labelColor = if (isDark) CivTokens.DarkColors.Base.darkest else CivTokens.Colors.Base.darkest

    Column(modifier = modifier.padding(bottom = CivTokens.Spacing._6)) {
        if (heading.isNotEmpty()) {
            Text(
                text = heading,
                fontSize = CivTokens.Typography.FontSize.lg,
                fontWeight = FontWeight.SemiBold,
                color = labelColor,
                modifier = Modifier.padding(bottom = CivTokens.Spacing._3),
            )
        }
        Column { content() }
    }
}

/**
 * An individual task with label, status tag, and optional hint.
 */
@Composable
fun CivTask(
    label: String,
    status: String = "not-started",
    modifier: Modifier = Modifier,
    hint: String = "",
    href: String = "",
    prefilled: Boolean = false,
    onClick: (() -> Unit)? = null,
) {
    val isDark = isSystemInDarkTheme()
    val isNavigable = onClick != null && status != "cannot-start"

    val primaryColor = if (isDark) CivTokens.DarkColors.Primary.default_ else CivTokens.Colors.Primary.default_
    val textColor = if (isDark) CivTokens.DarkColors.Base.darkest else CivTokens.Colors.Base.darkest
    val mutedColor = if (isDark) CivTokens.DarkColors.Base.default_ else CivTokens.Colors.Base.default_
    val hintColor = if (isDark) CivTokens.DarkColors.Base.dark else CivTokens.Colors.Base.dark
    val dividerColor = if (isDark) CivTokens.DarkColors.Base.lighter else CivTokens.Colors.Base.lighter

    val statusLabel = when (status) {
        "not-started" -> "Not started"
        "in-progress" -> "In progress"
        "complete" -> "Complete"
        "cannot-start" -> "Cannot start yet"
        "error" -> "There is a problem"
        else -> status
    }

    Column(
        modifier = modifier
            .fillMaxWidth()
            .semantics { contentDescription = "$label, $statusLabel" },
    ) {
        Divider(color = dividerColor)

        Row(
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.Top,
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = CivTokens.Spacing._3)
                .then(
                    if (isNavigable) Modifier.clickable { onClick?.invoke() }
                    else Modifier
                ),
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = label,
                    fontSize = CivTokens.Typography.FontSize.base,
                    fontWeight = FontWeight.Medium,
                    color = if (isNavigable) primaryColor
                           else if (status == "cannot-start") mutedColor
                           else textColor,
                )
                if (hint.isNotEmpty()) {
                    Text(
                        text = hint,
                        fontSize = CivTokens.Typography.FontSize.sm,
                        color = hintColor,
                        modifier = Modifier.padding(top = CivTokens.Spacing._0_5),
                    )
                }
            }

            // Status tag
            when (status) {
                "not-started" -> StatusTag("Not started",
                    bg = if (isDark) CivTokens.DarkColors.Primary.lightest else CivTokens.Colors.Primary.lightest,
                    fg = if (isDark) CivTokens.DarkColors.Primary.dark else CivTokens.Colors.Primary.dark)
                "in-progress" -> StatusTag("In progress",
                    bg = if (isDark) CivTokens.DarkColors.Info.lighter else CivTokens.Colors.Info.lighter,
                    fg = if (isDark) CivTokens.DarkColors.Info.dark else CivTokens.Colors.Info.dark)
                "complete" -> Text("Complete",
                    fontSize = CivTokens.Typography.FontSize.sm,
                    color = textColor)
                "cannot-start" -> Text("Cannot start yet",
                    fontSize = CivTokens.Typography.FontSize.sm,
                    color = mutedColor)
                "error" -> StatusTag("There is a problem",
                    bg = if (isDark) CivTokens.DarkColors.Error.lighter else CivTokens.Colors.Error.lighter,
                    fg = if (isDark) CivTokens.DarkColors.Error.dark else CivTokens.Colors.Error.dark)
            }
        }
    }
}

@Composable
private fun StatusTag(text: String, bg: Color, fg: Color) {
    Text(
        text = text,
        fontSize = CivTokens.Typography.FontSize.xs,
        fontWeight = FontWeight.Bold,
        color = fg,
        modifier = Modifier
            .background(bg, RoundedCornerShape(CivTokens.Border.Radius.default_))
            .padding(horizontal = CivTokens.Spacing._2, vertical = CivTokens.Spacing._0_5),
    )
}

@Preview(showBackground = true, name = "CivTaskList")
@Composable
private fun CivTaskListPreview() {
    Column(modifier = Modifier.padding(16.dp)) {
        Text("Apply for disability compensation",
            fontSize = CivTokens.Typography.FontSize._2xl,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(bottom = 16.dp))

        CivTaskList {
            CivTaskGroup(heading = "Prepare") {
                CivTask("Check eligibility", status = "complete", onClick = {})
            }
            CivTaskGroup(heading = "Application") {
                CivTask("Personal info", status = "complete", onClick = {})
                CivTask("Contact info", status = "in-progress", hint = "Phone needed", onClick = {})
                CivTask("Service history", status = "not-started", onClick = {})
            }
            CivTaskGroup(heading = "Submit") {
                CivTask("Review", status = "cannot-start", hint = "Complete all sections")
            }
        }
    }
}
