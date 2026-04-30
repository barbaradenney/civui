// CivUI — CivCard for Jetpack Compose
// Structured container with optional header (heading + eyebrow), body, and footer.

package gov.civui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Divider
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import gov.civui.tokens.CivTokens

@Composable
fun CivCard(
    modifier: Modifier = Modifier,
    heading: String = "",
    eyebrow: String = "",
    eyebrowVariant: String = "gray",
    spacing: String = "default",
    color: String = "",
    cardStyle: String = "default",
    iconStart: String = "",
    iconEnd: String = "",
    content: @Composable () -> Unit,
    footer: (@Composable () -> Unit)? = null,
) {
    val isDark = isSystemInDarkTheme()
    val borderColor = if (isDark) CivTokens.DarkColors.Base.lighter else CivTokens.Colors.Base.lighter
    val textColor = if (isDark) CivTokens.DarkColors.Base.darkest else CivTokens.Colors.Base.darkest
    val pad = if (spacing == "sm") CivTokens.Spacing._3 else CivTokens.Spacing._4

    Surface(
        border = BorderStroke(CivTokens.Border.Width.default_, borderColor),
        modifier = modifier.padding(bottom = CivTokens.Spacing._4),
    ) {
        Column(modifier = Modifier.padding(pad)) {
            // Header
            if (heading.isNotEmpty() || eyebrow.isNotEmpty()) {
                Column(modifier = Modifier.padding(bottom = CivTokens.Spacing._3)) {
                    if (eyebrow.isNotEmpty()) {
                        CivTag(label = eyebrow, variant = eyebrowVariant, size = "sm")
                        Spacer(modifier = Modifier.height(CivTokens.Spacing._1))
                    }
                    if (heading.isNotEmpty()) {
                        Text(
                            heading,
                            fontSize = CivTokens.Typography.FontSize.lg,
                            fontWeight = FontWeight.Bold,
                            color = textColor,
                        )
                    }
                }
            }

            // Body
            content()

            // Footer
            if (footer != null) {
                Divider(color = borderColor, modifier = Modifier.padding(top = CivTokens.Spacing._3))
                Column(modifier = Modifier.padding(top = CivTokens.Spacing._3)) {
                    footer()
                }
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun CivCardPreview() {
    Column(modifier = Modifier.padding(16.dp)) {
        CivCard(heading = "Primary care", eyebrow = "Upcoming", eyebrowVariant = "blue",
            content = {
                Text("Dr. Smith — Jan 15 at 2:30 PM")
                Text("VA Medical Center, Building 2")
            },
            footer = {
                TextButton(onClick = {}) { Text("Check in now") }
            }
        )

        CivCard(heading = "Compensation claim", eyebrow = "In progress", eyebrowVariant = "teal",
            content = {
                Text("Filed: March 10, 2026")
                Text("Step 3 of 5: Evidence gathering")
            },
            footer = {
                TextButton(onClick = {}) { Text("View details") }
            }
        )

        CivCard(heading = "Plain card", content = { Text("No footer, no eyebrow") })
    }
}
