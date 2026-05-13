// CivUI — CivRepeater for Jetpack Compose
// "Add another" repeater for repeating form sections.
// Renders: legend -> hint -> error -> repeatable content rows (Section 508 compliant)

package gov.civui.components

import androidx.compose.foundation.border
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
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
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.error
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import gov.civui.tokens.CivTokens

/**
 * Accessible "add another" repeater for government applications.
 *
 * Renders a fieldset that contains repeatable form sections. Users can
 * add and remove rows dynamically. Mirrors the web `civ-repeater` component.
 *
 * The [content] composable lambda receives the current row index, allowing
 * the caller to render indexed form fields for each row.
 *
 * TalkBack announces row additions and removals. Each row is rendered
 * as a semantics group with an aria-label like "dependent 1".
 *
 * Usage:
 * ```kotlin
 * var rowCount by remember { mutableStateOf(1) }
 * val names = remember { mutableStateListOf("") }
 *
 * CivRepeater(
 *     legend = "Dependents",
 *     itemLabel = "dependent",
 *     rowCount = rowCount,
 *     onAdd = {
 *         names.add("")
 *         rowCount++
 *     },
 *     onRemove = { index ->
 *         names.removeAt(index)
 *         rowCount--
 *     },
 * ) { index ->
 *     CivTextInput(
 *         label = "First name",
 *         value = names[index],
 *         onValueChange = { names[index] = it },
 *     )
 * }
 * ```
 */
@Composable
fun CivRepeater(
    legend: String,
    rowCount: Int,
    modifier: Modifier = Modifier,
    name: String = "",
    itemLabel: String = "item",
    hint: String = "",
    error: String = "",
    required: Boolean = false,
    disabled: Boolean = false,
    min: Int = 1,
    max: Int = 0,
    mode: String = "inline",
    headingLevel: Int = 2,
    size: String = "sm",
    formStepsSensitive: Boolean = false,
    formStepsShowPause: Boolean = false,
    // Route mode props — only meaningful when mode == "route". The host
    // owns `rows` and renders the Add / Edit form on its own NavHost
    // destinations; the repeater shows summary cards and triggers
    // navigation via the host-provided href patterns.
    rows: List<Any> = emptyList(),
    addHref: String = "",
    editHrefPattern: String = "",
    idField: String = "id",
    summaryFields: String = "",
    onAdd: ((Int) -> Unit)? = null,
    onRemove: ((Int) -> Unit)? = null,
    onWizardOpen: ((Int) -> Unit)? = null,
    onWizardClose: (() -> Unit)? = null,
    onAnalytics: ((String, Map<String, Any>?) -> Unit)? = null,
    content: @Composable (index: Int) -> Unit,
) {
    val isDark = isSystemInDarkTheme()

    val labelColor = if (isDark) CivTokens.DarkColors.Base.darkest else CivTokens.Colors.Base.darkest
    val hintColor = if (isDark) CivTokens.DarkColors.Base.dark else CivTokens.Colors.Base.dark
    val errorColor = if (isDark) CivTokens.DarkColors.Error.default_ else CivTokens.Colors.Error.default_
    val primaryColor = if (isDark) CivTokens.DarkColors.Primary.default_ else CivTokens.Colors.Primary.default_
    val borderColor = if (isDark) CivTokens.DarkColors.Base.lighter else CivTokens.Colors.Base.lighter
    val dangerColor = if (isDark) CivTokens.DarkColors.Error.default_ else CivTokens.Colors.Error.default_

    val canAdd = max == 0 || rowCount < max
    val canRemove = rowCount > min

    Column(
        modifier = modifier
            .padding(bottom = CivTokens.Spacing._4)
            .alpha(if (disabled) 0.5f else 1f)
            .semantics {
                contentDescription = buildString {
                    append(legend)
                    if (required) append(", required")
                    append(". $rowCount ${if (rowCount == 1) itemLabel else "${itemLabel}s"}")
                    if (error.isNotEmpty()) append(". Error: $error")
                }
                if (error.isNotEmpty()) {
                    error(error)
                }
            },
    ) {
        // 1. Legend
        CivLabel(
            label = legend,
            required = required,
            labelColor = labelColor,
            errorColor = errorColor,
        )

        // 2. Hint
        CivHint(text = hint.ifEmpty { null }, color = hintColor)

        // 3. Error
        CivError(text = error.ifEmpty { null }, color = errorColor)

        // 4. Repeatable rows
        for (index in 0 until rowCount) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = CivTokens.Spacing._4)
                    .border(
                        width = CivTokens.Border.Width.default_,
                        color = borderColor,
                        shape = RoundedCornerShape(CivTokens.Border.Radius.default_),
                    )
                    .padding(CivTokens.Spacing._4)
                    .semantics {
                        contentDescription = "$itemLabel ${index + 1}"
                    },
            ) {
                // Row heading
                Text(
                    text = "$itemLabel ${index + 1}",
                    style = TextStyle(
                        fontSize = CivTokens.Typography.FontSize.base,
                        fontWeight = FontWeight.SemiBold,
                    ),
                    color = labelColor,
                    modifier = Modifier.padding(bottom = CivTokens.Spacing._2),
                )

                // Row content
                content(index)

                // Remove button (shown when row count exceeds min)
                if (canRemove) {
                    OutlinedButton(
                        onClick = { onRemove?.invoke(index) },
                        enabled = !disabled,
                        border = androidx.compose.foundation.BorderStroke(
                            CivTokens.Border.Width.default_,
                            dangerColor,
                        ),
                        colors = ButtonDefaults.outlinedButtonColors(
                            contentColor = dangerColor,
                        ),
                        modifier = Modifier
                            .padding(top = CivTokens.Spacing._2)
                            .semantics {
                                contentDescription = "Remove $itemLabel ${index + 1}"
                            },
                    ) {
                        Text(
                            text = "Remove",
                            style = TextStyle(
                                fontSize = CivTokens.Typography.FontSize.sm,
                                fontWeight = FontWeight.SemiBold,
                            ),
                        )
                    }
                }
            }
        }

        // 5. Add button
        if (canAdd) {
            Button(
                onClick = { onAdd?.invoke(rowCount) },
                enabled = !disabled,
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (isDark) CivTokens.DarkColors.Base.lighter else CivTokens.Colors.Base.lightest,
                    contentColor = primaryColor,
                ),
                modifier = Modifier
                    .padding(top = CivTokens.Spacing._3)
                    .semantics {
                        contentDescription = "Add another $itemLabel"
                    },
            ) {
                Text(
                    text = "Add another $itemLabel",
                    style = TextStyle(
                        fontSize = CivTokens.Typography.FontSize.base,
                        fontWeight = FontWeight.SemiBold,
                    ),
                )
            }
        }
    }
}

// MARK: - Preview

@Preview(showBackground = true, name = "CivRepeater")
@Composable
private fun CivRepeaterPreview() {
    Column(modifier = Modifier.padding(16.dp)) {
        var rowCount by remember { mutableStateOf(2) }
        val names = remember { mutableListOf("Jane", "John") }

        CivRepeater(
            legend = "Dependents",
            rowCount = rowCount,
            itemLabel = "dependent",
            hint = "Add all dependents you wish to claim",
            required = true,
            min = 1,
            max = 5,
            onAdd = {
                names.add("")
                rowCount++
            },
            onRemove = { index ->
                if (index < names.size) names.removeAt(index)
                rowCount--
            },
        ) { index ->
            // Placeholder content for preview
            Text(
                text = "Dependent ${index + 1}: ${names.getOrElse(index) { "" }}",
                style = TextStyle(fontSize = CivTokens.Typography.FontSize.base),
                modifier = Modifier.padding(bottom = CivTokens.Spacing._2),
            )
        }

        // Disabled repeater
        CivRepeater(
            legend = "Previous employers",
            rowCount = 1,
            itemLabel = "employer",
            disabled = true,
        ) {
            Text(
                text = "Employer fields here",
                style = TextStyle(fontSize = CivTokens.Typography.FontSize.base),
            )
        }

        // Repeater with error
        CivRepeater(
            legend = "References",
            rowCount = 0,
            itemLabel = "reference",
            error = "At least one reference is required",
            required = true,
            min = 1,
        ) { /* empty */ }
    }
}
