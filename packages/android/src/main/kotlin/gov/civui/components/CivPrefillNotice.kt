// CivUI — CivPrefillNotice for Jetpack Compose
// Informational banner for prefilled form data.

package gov.civui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
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
fun CivPrefillNotice(
    modifier: Modifier = Modifier,
    heading: String = "We\u2019ve prefilled some of your information",
    body: String = "We pulled this information from your account. If any of this is wrong, you can correct it here.",
    linkText: String = "Update your profile",
    showLink: Boolean = false,
    onLinkClick: (() -> Unit)? = null,
) {
    val isDark = isSystemInDarkTheme()
    val headerBg = if (isDark) CivTokens.DarkColors.Info.dark else CivTokens.Colors.Info.dark
    val contentBg = if (isDark) CivTokens.DarkColors.Info.lighter else CivTokens.Colors.Info.lighter
    val primaryColor = if (isDark) CivTokens.DarkColors.Primary.default_ else CivTokens.Colors.Primary.default_

    Surface(
        border = BorderStroke(2.dp, headerBg),
        modifier = modifier.fillMaxWidth().padding(bottom = CivTokens.Spacing._6),
    ) {
        Column {
            Text(
                heading,
                fontSize = CivTokens.Typography.FontSize.base,
                fontWeight = FontWeight.Bold,
                color = if (isDark) CivTokens.DarkColors.White.default_ else CivTokens.Colors.White.default_,
                modifier = Modifier.fillMaxWidth().background(headerBg).padding(CivTokens.Spacing._3),
            )
            Column(modifier = Modifier.background(contentBg).fillMaxWidth().padding(CivTokens.Spacing._4)) {
                Text(body, fontSize = CivTokens.Typography.FontSize.base)
                if (showLink || onLinkClick != null) {
                    TextButton(onClick = { onLinkClick?.invoke() }) {
                        Text(linkText, color = primaryColor)
                    }
                }
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun CivPrefillNoticePreview() {
    CivPrefillNotice(showLink = true, modifier = Modifier.padding(16.dp))
}
