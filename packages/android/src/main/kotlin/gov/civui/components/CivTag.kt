// CivUI — CivTag for Jetpack Compose
// Small colored status pill for labels, categories, and metadata.
// Mirrors the web `civ-tag` component.

package gov.civui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import gov.civui.tokens.CivTokens

@Composable
fun CivTag(
    label: String,
    variant: String = "gray",
    size: String = "default",
    tagStyle: String = "secondary",
    spacing: String = "default",
    iconStart: String = "",
    modifier: Modifier = Modifier,
) {
    val isDark = isSystemInDarkTheme()
    val textSize = if (size == "sm") CivTokens.Typography.FontSize.sm else CivTokens.Typography.FontSize.base

    val fg = when (variant) {
        "blue" -> if (isDark) CivTokens.DarkColors.Primary.dark else CivTokens.Colors.Primary.dark
        "teal" -> if (isDark) CivTokens.DarkColors.Info.dark else CivTokens.Colors.Info.dark
        "red" -> if (isDark) CivTokens.DarkColors.Error.dark else CivTokens.Colors.Error.dark
        "green" -> if (isDark) CivTokens.DarkColors.Success.dark else CivTokens.Colors.Success.dark
        "yellow" -> if (isDark) CivTokens.DarkColors.Warning.dark else CivTokens.Colors.Warning.dark
        "orange" -> if (isDark) CivTokens.DarkColors.Base.darkest else CivTokens.Colors.Base.darkest
        "purple" -> Color(0xFF54278F)
        else -> if (isDark) CivTokens.DarkColors.Base.darker else CivTokens.Colors.Base.darker
    }

    val bg = when (variant) {
        "blue" -> if (isDark) CivTokens.DarkColors.Primary.lightest else CivTokens.Colors.Primary.lightest
        "teal" -> if (isDark) CivTokens.DarkColors.Info.lighter else CivTokens.Colors.Info.lighter
        "red" -> if (isDark) CivTokens.DarkColors.Error.lighter else CivTokens.Colors.Error.lighter
        "green" -> if (isDark) CivTokens.DarkColors.Success.lighter else CivTokens.Colors.Success.lighter
        "yellow" -> if (isDark) CivTokens.DarkColors.Warning.lighter else CivTokens.Colors.Warning.lighter
        "orange" -> if (isDark) CivTokens.DarkColors.Base.lighter else CivTokens.Colors.Base.lighter
        "purple" -> Color(0xFFEDE3F3)
        else -> if (isDark) CivTokens.DarkColors.Base.lightest else CivTokens.Colors.Base.lightest
    }

    Text(
        text = label,
        fontSize = textSize,
        fontWeight = FontWeight.Normal,
        color = fg,
        modifier = modifier
            .background(bg)
            .padding(horizontal = CivTokens.Spacing._2, vertical = CivTokens.Spacing._0_5)
            .semantics { contentDescription = label },
    )
}

@Preview(showBackground = true)
@Composable
private fun CivTagPreview() {
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.padding(16.dp)) {
        CivTag("Blue", "blue")
        CivTag("Teal", "teal")
        CivTag("Red", "red")
        CivTag("Green", "green")
        CivTag("Gray")
    }
}
