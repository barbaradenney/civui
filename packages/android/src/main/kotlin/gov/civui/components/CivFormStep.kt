// CivUI — CivFormStep for Jetpack Compose
// Multi-step wizard for navigating within a form chapter.

package gov.civui.components

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import gov.civui.tokens.CivTokens

@Composable
fun CivFormStep(
    current: Int,
    total: Int,
    onStepChange: (Int) -> Unit,
    modifier: Modifier = Modifier,
    progress: String = "minimal",
    headerSize: String = "secondary",
    stepTitle: String = "",
    headingLevel: Int = 2,
    navDisabled: Boolean = false,
    hideNav: Boolean = false,
    continueLabel: String = "Continue",
    completeLabel: String = "Save and continue",
    persist: Boolean = false,
    validate: Boolean = true,
    sensitive: Boolean = false,
    showPause: Boolean = false,
    pauseLabel: String = "",
    onPause: (() -> Unit)? = null,
    onComplete: (() -> Unit)? = null,
    content: @Composable (Int) -> Unit,
) {
    val isDark = isSystemInDarkTheme()
    val hintColor = if (isDark) CivTokens.DarkColors.Base.dark else CivTokens.Colors.Base.dark
    val primaryColor = if (isDark) CivTokens.DarkColors.Primary.default_ else CivTokens.Colors.Primary.default_
    val whiteColor = if (isDark) CivTokens.DarkColors.White.default_ else CivTokens.Colors.White.default_

    Column(modifier = modifier) {
        if (!hideNav && total > 1) {
            Text(
                "Step ${current + 1} of $total",
                fontSize = CivTokens.Typography.FontSize.sm,
                color = hintColor,
                modifier = Modifier
                    .padding(bottom = CivTokens.Spacing._3)
                    .semantics { contentDescription = "Step ${current + 1} of $total" },
            )
        }

        content(current)

        Row(
            horizontalArrangement = Arrangement.SpaceBetween,
            modifier = Modifier.fillMaxWidth().padding(top = CivTokens.Spacing._6),
        ) {
            if (current > 0) {
                OutlinedButton(onClick = { onStepChange(current - 1) }) {
                    Text("Back", fontWeight = FontWeight.SemiBold)
                }
            } else {
                Spacer(modifier = Modifier)
            }

            Button(
                onClick = {
                    if (current >= total - 1) onComplete?.invoke()
                    else onStepChange(current + 1)
                },
                colors = ButtonDefaults.buttonColors(containerColor = primaryColor, contentColor = whiteColor),
            ) {
                Text(if (current >= total - 1) completeLabel else continueLabel, fontWeight = FontWeight.SemiBold)
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun CivFormStepPreview() {
    var step by remember { mutableStateOf(0) }
    CivFormStep(current = step, total = 3, onStepChange = { step = it }, modifier = Modifier.padding(16.dp)) { i ->
        Text("Step ${i + 1} content", modifier = Modifier.padding(vertical = 32.dp))
    }
}
