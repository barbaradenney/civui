// CivUI — CivCard for Jetpack Compose
// Bordered container for grouping related content.

package gov.civui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import gov.civui.tokens.CivTokens

@Composable
fun CivCard(
    modifier: Modifier = Modifier,
    spacing: String = "default",
    content: @Composable () -> Unit,
) {
    val isDark = isSystemInDarkTheme()
    val borderColor = if (isDark) CivTokens.DarkColors.Base.lighter else CivTokens.Colors.Base.lighter
    val pad = if (spacing == "sm") CivTokens.Spacing._3 else CivTokens.Spacing._4

    Surface(
        border = BorderStroke(CivTokens.Border.Width.default_, borderColor),
        modifier = modifier.padding(bottom = CivTokens.Spacing._4),
    ) {
        Column(modifier = Modifier.padding(pad)) {
            content()
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun CivCardPreview() {
    Column(modifier = Modifier.padding(16.dp)) {
        CivCard { Text("Default card") }
        CivCard(spacing = "sm") { Text("Small card") }
    }
}
