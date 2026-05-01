// CivUI — CivDataField for Jetpack Compose
// Read-only label + value display for verified data.

package gov.civui.components

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Divider
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import gov.civui.tokens.CivTokens

@Composable
fun CivDataField(
    label: String,
    value: String = "",
    modifier: Modifier = Modifier,
    hint: String = "",
    values: String = "",
    editHref: String = "",
    editLabel: String = "",
    spacing: String = "default",
) {
    val isDark = isSystemInDarkTheme()
    val labelColor = if (isDark) CivTokens.DarkColors.Base.dark else CivTokens.Colors.Base.dark
    val valueColor = if (isDark) CivTokens.DarkColors.Base.darkest else CivTokens.Colors.Base.darkest
    val mutedColor = if (isDark) CivTokens.DarkColors.Base.default_ else CivTokens.Colors.Base.default_
    val dividerColor = if (isDark) CivTokens.DarkColors.Base.lighter else CivTokens.Colors.Base.lighter

    Column(
        modifier = modifier
            .padding(vertical = CivTokens.Spacing._2)
            .semantics { contentDescription = "$label: ${value.ifEmpty { "Not provided" }}" },
    ) {
        Text(label, fontSize = CivTokens.Typography.FontSize.sm, color = labelColor)
        if (value.isEmpty()) {
            Text("Not provided", fontSize = CivTokens.Typography.FontSize.base,
                fontStyle = FontStyle.Italic, color = mutedColor,
                modifier = Modifier.padding(top = CivTokens.Spacing._0_5))
        } else {
            Text(value, fontSize = CivTokens.Typography.FontSize.base,
                fontWeight = FontWeight.Medium, color = valueColor,
                modifier = Modifier.padding(top = CivTokens.Spacing._0_5))
        }
        if (hint.isNotEmpty()) {
            Text(hint, fontSize = CivTokens.Typography.FontSize.sm, color = labelColor,
                modifier = Modifier.padding(top = CivTokens.Spacing._0_5))
        }
        Divider(color = dividerColor, modifier = Modifier.padding(top = CivTokens.Spacing._2))
    }
}

@Preview(showBackground = true)
@Composable
private fun CivDataFieldPreview() {
    Column(modifier = Modifier.padding(16.dp)) {
        CivDataField(label = "Full name", value = "Jane Doe")
        CivDataField(label = "SSN", value = "●●●-●●-6789", hint = "Last 4 digits shown")
        CivDataField(label = "Phone number")
    }
}
