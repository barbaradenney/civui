// CivUI — CivSegmentedControl for Jetpack Compose
// Accessible segmented control (button-style radio group) using Material 3.
// Renders: legend -> hint -> error -> segmented buttons (Section 508 compliant)

package gov.civui.components

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.SegmentedButton
import androidx.compose.material3.SegmentedButtonDefaults
import androidx.compose.material3.SingleChoiceSegmentedButtonRow
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.error
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import gov.civui.tokens.CivTokens

/**
 * Data class representing a segment option.
 */
data class CivSegmentOption(
    val value: String,
    val label: String,
    val disabled: Boolean = false,
)

/**
 * Accessible segmented control for government applications.
 *
 * Uses Material 3 SingleChoiceSegmentedButtonRow for a button-style
 * radio group. Only one segment can be selected at a time.
 *
 * Usage:
 * ```kotlin
 * var view by remember { mutableStateOf("list") }
 * CivSegmentedControl(
 *     legend = "View mode",
 *     value = view,
 *     onValueChange = { view = it },
 *     options = listOf(
 *         CivSegmentOption("list", "List"),
 *         CivSegmentOption("grid", "Grid"),
 *         CivSegmentOption("map", "Map"),
 *     ),
 * )
 * ```
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CivSegmentedControl(
    legend: String,
    value: String,
    onValueChange: (String) -> Unit,
    options: List<CivSegmentOption>,
    modifier: Modifier = Modifier,
    hint: String? = null,
    error: String? = null,
    required: Boolean = false,
    disabled: Boolean = false,
    onChange: ((String) -> Unit)? = null,
    onAnalytics: ((event: String, data: Map<String, Any>?) -> Unit)? = null,
) {
    val isDark = isSystemInDarkTheme()

    val labelColor = if (isDark) CivTokens.DarkColors.Base.darkest else CivTokens.Colors.Base.darkest
    val hintColor = if (isDark) CivTokens.DarkColors.Base.dark else CivTokens.Colors.Base.dark
    val errorColor = if (isDark) CivTokens.DarkColors.Error.default_ else CivTokens.Colors.Error.default_

    Column(
        modifier = modifier
            .padding(bottom = CivTokens.Spacing._4)
            .then(
                if (error != null) Modifier.semantics { error(error) } else Modifier
            ),
    ) {
        // 1. Legend
        CivLabel(
            label = legend,
            required = required,
            labelColor = labelColor,
            errorColor = errorColor,
        )

        // 2. Hint
        CivHint(text = hint, color = hintColor)

        // 3. Error
        CivError(text = error, color = errorColor)

        // 4. Segmented buttons
        SingleChoiceSegmentedButtonRow(
            modifier = Modifier
                .alpha(if (disabled) 0.5f else 1f)
                .semantics {
                    contentDescription = legend
                },
        ) {
            options.forEachIndexed { index, option ->
                SegmentedButton(
                    selected = value == option.value,
                    onClick = {
                        onValueChange(option.value)
                        onChange?.invoke(option.value)
                        onAnalytics?.invoke("change", mapOf("field" to legend, "value" to option.value))
                    },
                    enabled = !disabled && !option.disabled,
                    shape = SegmentedButtonDefaults.itemShape(
                        index = index,
                        count = options.size,
                    ),
                    modifier = Modifier.semantics {
                        contentDescription = buildString {
                            append(option.label)
                            if (value == option.value) append(", selected")
                        }
                    },
                ) {
                    Text(text = option.label)
                }
            }
        }
    }
}

// MARK: - Preview

@Preview(showBackground = true, name = "CivSegmentedControl")
@Composable
private fun CivSegmentedControlPreview() {
    Column(modifier = Modifier.padding(16.dp)) {
        var view by remember { mutableStateOf("list") }
        CivSegmentedControl(
            legend = "View mode",
            value = view,
            onValueChange = { view = it },
            options = listOf(
                CivSegmentOption("list", "List"),
                CivSegmentOption("grid", "Grid"),
                CivSegmentOption("map", "Map"),
            ),
        )

        var frequency by remember { mutableStateOf("monthly") }
        CivSegmentedControl(
            legend = "Payment frequency",
            value = frequency,
            onValueChange = { frequency = it },
            options = listOf(
                CivSegmentOption("weekly", "Weekly"),
                CivSegmentOption("monthly", "Monthly"),
                CivSegmentOption("yearly", "Yearly"),
            ),
            required = true,
            hint = "Select how often you want to be billed",
        )

        CivSegmentedControl(
            legend = "Disabled control",
            value = "a",
            onValueChange = {},
            options = listOf(
                CivSegmentOption("a", "Option A"),
                CivSegmentOption("b", "Option B"),
            ),
            disabled = true,
        )
    }
}
