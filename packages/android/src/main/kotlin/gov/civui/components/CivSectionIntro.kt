// CivUI — CivSectionIntro for Jetpack Compose
// Context panel displayed before a sensitive or complex form section.

package gov.civui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import gov.civui.tokens.CivTokens

enum class CivSectionIntroTone { Info, Sensitive, Neutral }

@Composable
fun CivSectionIntro(
    heading: String = "",
    headingLevel: Int = 3,
    tone: CivSectionIntroTone = CivSectionIntroTone.Info,
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit,
) {
    val isDark = isSystemInDarkTheme()
    val bg = when (tone) {
        CivSectionIntroTone.Sensitive ->
            if (isDark) CivTokens.DarkColors.Primary.lighter else CivTokens.Colors.Primary.lighter
        CivSectionIntroTone.Neutral ->
            if (isDark) CivTokens.DarkColors.Base.lighter else CivTokens.Colors.Base.lighter
        CivSectionIntroTone.Info ->
            if (isDark) CivTokens.DarkColors.Primary.lightest else CivTokens.Colors.Primary.lightest
    }

    val regionLabel = if (heading.isNotEmpty()) heading else "Section introduction"

    Column(
        verticalArrangement = Arrangement.spacedBy(CivTokens.Spacing._3),
        modifier = modifier
            .clip(RoundedCornerShape(CivTokens.Border.Radius.default_))
            .background(bg)
            .padding(CivTokens.Spacing._4)
            .semantics { contentDescription = regionLabel },
    ) {
        if (heading.isNotEmpty()) {
            Text(
                heading,
                fontSize = CivTokens.Typography.FontSize.lg,
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier.semantics { this.heading() },
            )
        }
        content()
    }
}

@Preview(showBackground = true)
@Composable
private fun CivSectionIntroPreview() {
    CivSectionIntro(
        heading = "About your service-connected trauma",
        tone = CivSectionIntroTone.Sensitive,
        modifier = Modifier.padding(16.dp),
    ) {
        Text("The next questions ask about events that may be difficult to remember.")
        Text("You can skip any question and come back to it later.")
    }
}
