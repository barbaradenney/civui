// CivUI — CivProgressSteps for Jetpack Compose
// Accessible step indicator with completed, current, and upcoming states.
// TalkBack announces "Step X of Y: label, completed/current/upcoming".

package gov.civui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import gov.civui.tokens.CivTokens

/**
 * Accessible segmented progress indicator for government applications.
 *
 * Displays a row of segments — filled for completed, highlighted for current,
 * and empty for upcoming. Mirrors the web `civ-progress-steps` component.
 *
 * Usage:
 * ```kotlin
 * CivProgressSteps(
 *     steps = listOf("Personal info", "Address", "Review", "Submit"),
 *     current = 1,
 * )
 * ```
 */
@Composable
fun CivProgressSteps(
    steps: List<String>,
    current: Int,
    modifier: Modifier = Modifier,
    clickable: Boolean = false,
    errorSteps: String = "",
    onStepClick: ((Int) -> Unit)? = null,
) {
    val isDark = isSystemInDarkTheme()

    val primaryColor = if (isDark) CivTokens.DarkColors.Primary.default_ else CivTokens.Colors.Primary.default_
    val successColor = if (isDark) CivTokens.DarkColors.Success.default_ else CivTokens.Colors.Success.default_
    val whiteColor = if (isDark) CivTokens.DarkColors.White.default_ else CivTokens.Colors.White.default_
    val grayColor = if (isDark) CivTokens.DarkColors.Base.lighter else CivTokens.Colors.Base.lighter
    val grayTextColor = if (isDark) CivTokens.DarkColors.Base.dark else CivTokens.Colors.Base.dark
    val darkestColor = if (isDark) CivTokens.DarkColors.Base.darkest else CivTokens.Colors.Base.darkest
    val defaultColor = if (isDark) CivTokens.DarkColors.Base.default_ else CivTokens.Colors.Base.default_

    when (orientation) {
        CivProgressStepsOrientation.HORIZONTAL -> {
            Row(
                modifier = modifier.padding(bottom = CivTokens.Spacing._4),
                verticalAlignment = Alignment.Top,
            ) {
                steps.forEachIndexed { index, label ->
                    if (index > 0) {
                        // Connector line
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .padding(top = 14.dp) // center with circle
                                .height(2.dp)
                                .background(if (index <= current) successColor else grayColor),
                        )
                    }

                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier
                            .semantics {
                                contentDescription = stepAccessibilityText(index, steps.size, label, current)
                            },
                    ) {
                        StepCircle(
                            index = index,
                            current = current,
                            primaryColor = primaryColor,
                            successColor = successColor,
                            whiteColor = whiteColor,
                            grayColor = grayColor,
                            grayTextColor = grayTextColor,
                        )

                        Text(
                            text = label,
                            style = TextStyle(
                                fontSize = CivTokens.Typography.FontSize.xs,
                                fontWeight = if (index == current) FontWeight.Bold else FontWeight.Normal,
                            ),
                            color = when {
                                index < current -> darkestColor
                                index == current -> primaryColor
                                else -> defaultColor
                            },
                            textAlign = TextAlign.Center,
                            modifier = Modifier
                                .width(80.dp)
                                .padding(top = CivTokens.Spacing._1),
                        )
                    }
                }
            }
        }

        CivProgressStepsOrientation.VERTICAL -> {
            Column(
                modifier = modifier.padding(bottom = CivTokens.Spacing._4),
            ) {
                steps.forEachIndexed { index, label ->
                    if (index > 0) {
                        // Vertical connector
                        Box(
                            modifier = Modifier
                                .padding(start = 13.dp) // center with circle
                                .width(2.dp)
                                .height(20.dp)
                                .background(if (index <= current) successColor else grayColor),
                        )
                    }

                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(CivTokens.Spacing._3),
                        modifier = Modifier
                            .semantics {
                                contentDescription = stepAccessibilityText(index, steps.size, label, current)
                            },
                    ) {
                        StepCircle(
                            index = index,
                            current = current,
                            primaryColor = primaryColor,
                            successColor = successColor,
                            whiteColor = whiteColor,
                            grayColor = grayColor,
                            grayTextColor = grayTextColor,
                        )

                        Text(
                            text = label,
                            style = TextStyle(
                                fontSize = CivTokens.Typography.FontSize.base,
                                fontWeight = if (index == current) FontWeight.Bold else FontWeight.Normal,
                            ),
                            color = when {
                                index < current -> darkestColor
                                index == current -> primaryColor
                                else -> defaultColor
                            },
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun StepCircle(
    index: Int,
    current: Int,
    primaryColor: androidx.compose.ui.graphics.Color,
    successColor: androidx.compose.ui.graphics.Color,
    whiteColor: androidx.compose.ui.graphics.Color,
    grayColor: androidx.compose.ui.graphics.Color,
    grayTextColor: androidx.compose.ui.graphics.Color,
) {
    Box(
        contentAlignment = Alignment.Center,
        modifier = Modifier
            .size(28.dp)
            .clip(CircleShape)
            .background(
                when {
                    index < current -> successColor
                    index == current -> primaryColor
                    else -> grayColor
                },
            ),
    ) {
        if (index < current) {
            Icon(
                imageVector = Icons.Filled.Check,
                contentDescription = null,
                tint = whiteColor,
                modifier = Modifier.size(16.dp),
            )
        } else {
            Text(
                text = "${index + 1}",
                style = TextStyle(
                    fontSize = CivTokens.Typography.FontSize.sm,
                    fontWeight = FontWeight.Bold,
                ),
                color = if (index == current) whiteColor else grayTextColor,
            )
        }
    }
}

private fun stepAccessibilityText(index: Int, total: Int, label: String, current: Int): String {
    val status = when {
        index < current -> "completed"
        index == current -> "current"
        else -> "upcoming"
    }
    return "Step ${index + 1} of $total: $label, $status"
}

// MARK: - Preview

@Preview(showBackground = true, name = "CivProgressSteps Horizontal")
@Composable
private fun CivProgressStepsHorizontalPreview() {
    Column(modifier = Modifier.padding(16.dp)) {
        CivProgressSteps(
            steps = listOf("Personal info", "Address", "Review", "Submit"),
            current = 2,
            orientation = CivProgressStepsOrientation.HORIZONTAL,
        )
    }
}

@Preview(showBackground = true, name = "CivProgressSteps Vertical")
@Composable
private fun CivProgressStepsVerticalPreview() {
    Column(modifier = Modifier.padding(16.dp)) {
        CivProgressSteps(
            steps = listOf("Personal info", "Address", "Review", "Submit"),
            current = 1,
            orientation = CivProgressStepsOrientation.VERTICAL,
        )
    }
}
