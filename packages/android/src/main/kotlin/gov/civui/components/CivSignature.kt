// CivUI — CivSignature for Jetpack Compose
// Statement of truth with name input and certification checkbox.
// Renders: legend -> statement -> name field -> checkbox (Section 508 compliant)

package gov.civui.components

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Checkbox
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import gov.civui.tokens.CivTokens

data class SignatureValue(
    val name: String = "",
    val certified: Boolean = false,
) {
    val isComplete: Boolean get() = name.isNotBlank() && certified
}

@Composable
fun CivSignature(
    legend: String,
    value: SignatureValue,
    onValueChange: (SignatureValue) -> Unit,
    modifier: Modifier = Modifier,
    statement: String = "",
    hint: String = "",
    error: String = "",
    nameError: String = "",
    certifyError: String = "",
    required: Boolean = false,
    disabled: Boolean = false,
    card: Boolean = false,
    onChange: ((SignatureValue) -> Unit)? = null,
) {
    val isDark = isSystemInDarkTheme()
    val labelColor = if (isDark) CivTokens.DarkColors.Base.darkest else CivTokens.Colors.Base.darkest
    val hintColor = if (isDark) CivTokens.DarkColors.Base.dark else CivTokens.Colors.Base.dark
    val errorColor = if (isDark) CivTokens.DarkColors.Error.default_ else CivTokens.Colors.Error.default_

    Column(
        modifier = modifier
            .padding(bottom = CivTokens.Spacing._4)
            .alpha(if (disabled) 0.5f else 1f)
            .semantics { contentDescription = legend },
    ) {
        CivLabel(label = legend, required = required, labelColor = labelColor, errorColor = errorColor)
        CivHint(text = hint.ifEmpty { null }, color = hintColor)
        CivError(text = error.ifEmpty { null }, color = errorColor)

        if (statement.isNotEmpty()) {
            Text(statement, fontSize = CivTokens.Typography.FontSize.base, color = hintColor,
                modifier = Modifier.padding(bottom = CivTokens.Spacing._4))
        }

        // Name field
        Text("Your full name", fontWeight = FontWeight.SemiBold, fontSize = CivTokens.Typography.FontSize.sm,
            color = labelColor, modifier = Modifier.padding(bottom = CivTokens.Spacing._0_5))
        Text("Please type your first and last name", fontSize = CivTokens.Typography.FontSize.sm,
            color = hintColor, modifier = Modifier.padding(bottom = CivTokens.Spacing._1))
        CivError(text = nameError.ifEmpty { null }, color = errorColor)
        OutlinedTextField(value = value.name,
            onValueChange = { val v = value.copy(name = it); onValueChange(v); onChange?.invoke(v) },
            enabled = !disabled, singleLine = true,
            modifier = Modifier.fillMaxWidth().padding(bottom = CivTokens.Spacing._3))

        // Certification checkbox
        CivError(text = certifyError.ifEmpty { null }, color = errorColor)
        Row(verticalAlignment = Alignment.Top, modifier = Modifier.padding(bottom = CivTokens.Spacing._2)) {
            Checkbox(checked = value.certified,
                onCheckedChange = { val v = value.copy(certified = it); onValueChange(v); onChange?.invoke(v) },
                enabled = !disabled)
            Text("I certify the information above is correct and true to the best of my knowledge and belief",
                fontSize = CivTokens.Typography.FontSize.base, color = labelColor,
                modifier = Modifier.padding(start = CivTokens.Spacing._1, top = CivTokens.Spacing._2))
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun CivSignaturePreview() {
    Column(modifier = Modifier.padding(16.dp)) {
        var sig by remember { mutableStateOf(SignatureValue()) }
        CivSignature(legend = "Statement of truth", value = sig, onValueChange = { sig = it },
            statement = "I certify that the information I have provided is true and correct.", required = true)
    }
}
