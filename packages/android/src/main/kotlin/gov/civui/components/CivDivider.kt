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

/**
 * Horizontal divider line.
 *
 * @param rhythm Vertical margin (top + bottom) around the line: "default" (16dp) or "sm" (8dp).
 *   Named `rhythm` to match the web schema; controls margin around the divider, not internal padding.
 * @param spacing Deprecated alias for `rhythm`. Kept for backward compat; will be removed in a future release.
 *   Setting this on web emits a dev-mode console warning.
 * @param emphasis Visual style: "default" (1dp, light) or "primary" (2dp, darker).
 */
@Composable
fun CivDivider(
    modifier: Modifier = Modifier,
    rhythm: String = "default",
    spacing: String = "default",
    emphasis: String = "default",
) {
    val isDark = isSystemInDarkTheme()
    val color = if (emphasis == "primary") {
        if (isDark) CivTokens.DarkColors.Base.light else CivTokens.Colors.Base.light
    } else {
        if (isDark) CivTokens.DarkColors.Base.lighter else CivTokens.Colors.Base.lighter
    }
    val thickness = if (emphasis == "primary") 2.dp else 1.dp
    val effectiveRhythm = if (rhythm != "default") rhythm else spacing
    val pad = if (effectiveRhythm == "sm") CivTokens.Spacing._2 else CivTokens.Spacing._4

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
        CivDivider(emphasis = "primary")
        Text("Primary")
        CivDivider(rhythm = "sm")
        Text("Tight")
    }
}
