// CivUI — CivProgressPercent for Jetpack Compose
// Percentage-based progress indicator with optional status text.
// Renders: status/percent labels -> filled track bar (Section 508 compliant)

package gov.civui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.progressBarRangeInfo
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import gov.civui.tokens.CivTokens

/**
 * Accessible percentage-based progress bar for government applications.
 *
 * Shows a horizontal filled bar with optional percentage label and status text.
 * Mirrors the web `civ-progress-percent` component.
 *
 * TalkBack announces the progress value and label.
 *
 * Usage:
 * ```kotlin
 * CivProgressPercent(
 *     value = 45f,
 *     label = "Application progress",
 *     status = "3 of 8 sections complete",
 * )
 * ```
 */
@Composable
fun CivProgressPercent(
    value: Float,
    modifier: Modifier = Modifier,
    label: String = "Progress",
    status: String = "",
    hidePercent: Boolean = true,
) {
    val isDark = isSystemInDarkTheme()
    val clamped = value.coerceIn(0f, 100f)
    val isComplete = clamped >= 100f

    val textColor = if (isDark) CivTokens.DarkColors.Base.dark else CivTokens.Colors.Base.dark
    val boldColor = if (isDark) CivTokens.DarkColors.Base.darkest else CivTokens.Colors.Base.darkest
    val trackColor = if (isDark) CivTokens.DarkColors.Base.lighter else CivTokens.Colors.Base.lighter
    val fillColor = if (isComplete) {
        if (isDark) CivTokens.DarkColors.Success.default_ else CivTokens.Colors.Success.default_
    } else {
        if (isDark) CivTokens.DarkColors.Primary.default_ else CivTokens.Colors.Primary.default_
    }

    Column(
        modifier = modifier
            .padding(bottom = CivTokens.Spacing._4)
            .semantics {
                contentDescription = "$label, ${clamped.toInt()} percent"
                progressBarRangeInfo = androidx.compose.ui.semantics.ProgressBarRangeInfo(
                    current = clamped / 100f,
                    range = 0f..1f,
                )
            },
    ) {
        // Status and percentage row
        Row(
            horizontalArrangement = Arrangement.SpaceBetween,
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = CivTokens.Spacing._1),
        ) {
            if (status.isNotEmpty()) {
                Text(
                    text = status,
                    fontSize = CivTokens.Typography.FontSize.sm,
                    color = textColor,
                )
            }

            if (hidePercent) {
                Text(
                    text = "${clamped.toInt()}%",
                    fontSize = CivTokens.Typography.FontSize.sm,
                    fontWeight = FontWeight.Bold,
                    color = boldColor,
                )
            }
        }

        // Track
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(8.dp)
                .clip(RoundedCornerShape(4.dp))
                .background(trackColor),
        ) {
            // Fill
            Box(
                modifier = Modifier
                    .fillMaxWidth(fraction = clamped / 100f)
                    .height(8.dp)
                    .clip(RoundedCornerShape(4.dp))
                    .background(fillColor),
            )
        }
    }
}

// MARK: - Preview

@Preview(showBackground = true, name = "CivProgressPercent")
@Composable
private fun CivProgressPercentPreview() {
    Column(modifier = Modifier.padding(16.dp)) {
        CivProgressPercent(
            value = 45f,
            label = "Application progress",
            status = "3 of 8 sections complete",
        )

        CivProgressPercent(
            value = 100f,
            status = "All sections complete",
        )

        CivProgressPercent(
            value = 0f,
            status = "Not started",
        )

        CivProgressPercent(
            value = 75f,
            hidePercent = false,
        )
    }
}
