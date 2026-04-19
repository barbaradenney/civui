// CivUI — CivDirectDeposit for Jetpack Compose
// Compound financial input for bank account information.
// Renders: legend -> account type radios -> routing + account fields (Section 508 compliant)

package gov.civui.components

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.RadioButton
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
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import gov.civui.tokens.CivTokens

data class DirectDepositValue(
    val accountType: String = "",
    val routingNumber: String = "",
    val accountNumber: String = "",
)

@Composable
fun CivDirectDeposit(
    legend: String,
    value: DirectDepositValue,
    onValueChange: (DirectDepositValue) -> Unit,
    modifier: Modifier = Modifier,
    hint: String = "",
    error: String = "",
    routingError: String = "",
    accountError: String = "",
    typeError: String = "",
    required: Boolean = false,
    disabled: Boolean = false,
    onChange: ((DirectDepositValue) -> Unit)? = null,
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

        // Account type
        Text("Account type", fontWeight = FontWeight.SemiBold, fontSize = CivTokens.Typography.FontSize.sm,
            color = labelColor, modifier = Modifier.padding(bottom = CivTokens.Spacing._1))
        CivError(text = typeError.ifEmpty { null }, color = errorColor)

        Row(modifier = Modifier.padding(bottom = CivTokens.Spacing._3)) {
            Row(verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.selectable(selected = value.accountType == "checking",
                    onClick = { if (!disabled) { val v = value.copy(accountType = "checking"); onValueChange(v); onChange?.invoke(v) } })
                    .padding(end = CivTokens.Spacing._4)) {
                RadioButton(selected = value.accountType == "checking", onClick = null, enabled = !disabled)
                Text("Checking", modifier = Modifier.padding(start = CivTokens.Spacing._1))
            }
            Row(verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.selectable(selected = value.accountType == "savings",
                    onClick = { if (!disabled) { val v = value.copy(accountType = "savings"); onValueChange(v); onChange?.invoke(v) } })) {
                RadioButton(selected = value.accountType == "savings", onClick = null, enabled = !disabled)
                Text("Savings", modifier = Modifier.padding(start = CivTokens.Spacing._1))
            }
        }

        // Routing number
        Text("Bank routing number", fontWeight = FontWeight.SemiBold, fontSize = CivTokens.Typography.FontSize.sm,
            color = labelColor, modifier = Modifier.padding(bottom = CivTokens.Spacing._0_5))
        Text("The 9-digit number on the bottom left of a check", fontSize = CivTokens.Typography.FontSize.sm,
            color = hintColor, modifier = Modifier.padding(bottom = CivTokens.Spacing._1))
        CivError(text = routingError.ifEmpty { null }, color = errorColor)
        OutlinedTextField(value = value.routingNumber,
            onValueChange = { if (it.length <= 9) { val v = value.copy(routingNumber = it); onValueChange(v); onChange?.invoke(v) } },
            enabled = !disabled, singleLine = true,
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
            modifier = Modifier.width(200.dp).padding(bottom = CivTokens.Spacing._3))

        // Account number
        Text("Bank account number", fontWeight = FontWeight.SemiBold, fontSize = CivTokens.Typography.FontSize.sm,
            color = labelColor, modifier = Modifier.padding(bottom = CivTokens.Spacing._0_5))
        Text("The account number on the bottom of a check", fontSize = CivTokens.Typography.FontSize.sm,
            color = hintColor, modifier = Modifier.padding(bottom = CivTokens.Spacing._1))
        CivError(text = accountError.ifEmpty { null }, color = errorColor)
        OutlinedTextField(value = value.accountNumber,
            onValueChange = { val v = value.copy(accountNumber = it); onValueChange(v); onChange?.invoke(v) },
            enabled = !disabled, singleLine = true,
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
            modifier = Modifier.fillMaxWidth())
    }
}

@Preview(showBackground = true)
@Composable
private fun CivDirectDepositPreview() {
    Column(modifier = Modifier.padding(16.dp)) {
        var deposit by remember { mutableStateOf(DirectDepositValue()) }
        CivDirectDeposit(legend = "Direct deposit", value = deposit, onValueChange = { deposit = it }, required = true)
    }
}
