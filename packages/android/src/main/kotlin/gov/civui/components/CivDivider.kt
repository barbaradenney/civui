// CivUI — CivDivider for Jetpack Compose
// Horizontal rule for visually separating content.

package gov.civui.components

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Divider
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import gov.civui.tokens.CivTokens

@Composable
fun CivDivider(
    modifier: Modifier = Modifier,
    spacing: String = "default",
    variant: String = "default",
) {
    val isDark = isSystemInDarkTheme()
    val color = if (variant == "primary") {
        if (isDark) CivTokens.DarkColors.Base.light else CivTokens.Colors.Base.light
    } else {
        if (isDark) CivTokens.DarkColors.Base.lighter else CivTokens.Colors.Base.lighter
    }
    val thickness = if (variant == "primary") 2.dp else 1.dp
    val pad = if (spacing == "sm") CivTokens.Spacing._2 else CivTokens.Spacing._4

    Divider(
        color = color,
        thickness = thickness,
        modifier = modifier.padding(vertical = pad),
    )
}

@Preview(showBackground = true)
@Composable
private fun CivDividerPreview() {
    Column(modifier = Modifier.padding(16.dp)) {
        Text("Above")
        CivDivider()
        Text("Below")
        CivDivider(variant = "primary")
        Text("Primary")
        CivDivider(spacing = "sm")
        Text("Tight")
    }
}
