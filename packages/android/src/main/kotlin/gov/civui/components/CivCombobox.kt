// CivUI — CivCombobox for Jetpack Compose
// Accessible combobox (autocomplete) with text input and filterable dropdown.
// Renders: label -> hint -> error -> text field with dropdown (Section 508 compliant)

package gov.civui.components

import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import gov.civui.tokens.CivTokens

/**
 * Data class representing a combobox option (value/label pair).
 */
data class CivComboboxOption(
    val value: String,
    val label: String,
)

/**
 * Accessible combobox (autocomplete) for government applications.
 *
 * Provides a text input with a filterable dropdown list of options.
 * Implements accessible autocomplete pattern with TalkBack support.
 *
 * Usage:
 * ```kotlin
 * var state by remember { mutableStateOf("") }
 * CivCombobox(
 *     label = "Select your state",
 *     value = state,
 *     onValueChange = { state = it },
 *     options = listOf(
 *         CivComboboxOption("CA", "California"),
 *         CivComboboxOption("NY", "New York"),
 *     ),
 * )
 * ```
 */
@Composable
fun CivCombobox(
    label: String,
    value: String,
    onValueChange: (String) -> Unit,
    options: List<CivComboboxOption>,
    modifier: Modifier = Modifier,
    hint: String? = null,
    error: String? = null,
    required: Boolean = false,
    disabled: Boolean = false,
    placeholder: String? = null,
    noResultsText: String = "No results found",
) {
    val isDark = isSystemInDarkTheme()

    val labelColor = if (isDark) CivTokens.DarkColors.Base.darkest else CivTokens.Colors.Base.darkest
    val hintColor = if (isDark) CivTokens.DarkColors.Base.dark else CivTokens.Colors.Base.dark
    val errorColor = if (isDark) CivTokens.DarkColors.Error.default_ else CivTokens.Colors.Error.default_
    val backgroundColor = if (isDark) CivTokens.DarkColors.White.default_ else CivTokens.Colors.White.default_
    val borderColor = if (isDark) CivTokens.DarkColors.Base.light else CivTokens.Colors.Base.light
    val primaryColor = if (isDark) CivTokens.DarkColors.Primary.default_ else CivTokens.Colors.Primary.default_

    var expanded by remember { mutableStateOf(false) }
    var filterText by remember { mutableStateOf("") }
    var activeIndex by remember { mutableIntStateOf(-1) }
    var isFocused by remember { mutableStateOf(false) }

    // Determine display text: when focused show filter, otherwise show selected label
    val selectedOption = options.find { it.value == value }
    val displayValue = if (isFocused) filterText else (selectedOption?.label ?: filterText)

    // Filter options based on input text
    val filteredOptions = if (filterText.isEmpty()) {
        options
    } else {
        options.filter { it.label.contains(filterText, ignoreCase = true) }
    }

    Column(
        modifier = modifier.padding(bottom = CivTokens.Spacing._4),
    ) {
        // 1. Label
        CivLabel(
            label = label,
            required = required,
            labelColor = labelColor,
            errorColor = errorColor,
        )

        // 2. Hint
        CivHint(text = hint, color = hintColor)

        // 3. Error
        CivError(text = error, color = errorColor)

        // 4. Input with dropdown
        Column {
            TextField(
                value = displayValue,
                onValueChange = { newText ->
                    filterText = newText
                    expanded = true
                    activeIndex = -1
                    // Clear selected value when typing
                    onValueChange("")
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .border(
                        width = if (error != null) CivTokens.Border.Width._2 else CivTokens.Border.Width.default_,
                        color = if (error != null) errorColor else borderColor,
                        shape = RoundedCornerShape(CivTokens.Border.Radius.default_),
                    )
                    .onFocusChanged { focusState ->
                        isFocused = focusState.isFocused
                        if (focusState.isFocused && !disabled) {
                            expanded = true
                        }
                        if (!focusState.isFocused) {
                            expanded = false
                        }
                    }
                    .alpha(if (disabled) 0.5f else 1f)
                    .semantics {
                        contentDescription = buildString {
                            append(label)
                            if (required) append(", required")
                            if (hint != null) append(". $hint")
                            if (error != null) append(". Error: $error")
                            append(", combobox")
                        }
                    },
                enabled = !disabled,
                placeholder = placeholder?.let {
                    { Text(text = it, color = hintColor) }
                },
                textStyle = TextStyle(
                    fontSize = CivTokens.Typography.FontSize.base,
                ),
                singleLine = true,
                shape = RoundedCornerShape(CivTokens.Border.Radius.default_),
                colors = TextFieldDefaults.colors(
                    focusedContainerColor = backgroundColor,
                    unfocusedContainerColor = backgroundColor,
                    disabledContainerColor = backgroundColor,
                    focusedIndicatorColor = Color.Transparent,
                    unfocusedIndicatorColor = Color.Transparent,
                    disabledIndicatorColor = Color.Transparent,
                ),
            )

            DropdownMenu(
                expanded = expanded && filteredOptions.isNotEmpty(),
                onDismissRequest = { expanded = false },
                modifier = Modifier
                    .fillMaxWidth()
                    .heightIn(max = 240.dp),
            ) {
                LazyColumn(
                    modifier = Modifier.heightIn(max = 240.dp),
                ) {
                    itemsIndexed(filteredOptions) { index, option ->
                        Text(
                            text = option.label,
                            style = TextStyle(
                                fontSize = CivTokens.Typography.FontSize.base,
                                fontWeight = if (option.value == value) FontWeight.Bold else FontWeight.Normal,
                            ),
                            color = labelColor,
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable {
                                    onValueChange(option.value)
                                    filterText = option.label
                                    expanded = false
                                    activeIndex = -1
                                }
                                .padding(
                                    horizontal = CivTokens.Spacing._4,
                                    vertical = CivTokens.Spacing._3,
                                )
                                .semantics {
                                    contentDescription = option.label
                                },
                        )
                    }
                }
            }

            // No results message
            if (expanded && filteredOptions.isEmpty() && filterText.isNotEmpty()) {
                Text(
                    text = noResultsText,
                    style = TextStyle(
                        fontSize = CivTokens.Typography.FontSize.sm,
                    ),
                    color = hintColor,
                    modifier = Modifier
                        .padding(top = CivTokens.Spacing._2)
                        .semantics {
                            liveRegion = LiveRegionMode.Polite
                        },
                )
            }
        }
    }
}

// MARK: - Preview

@Preview(showBackground = true, name = "CivCombobox")
@Composable
private fun CivComboboxPreview() {
    Column(modifier = Modifier.padding(16.dp)) {
        var state by remember { mutableStateOf("") }
        CivCombobox(
            label = "State or territory",
            value = state,
            onValueChange = { state = it },
            options = listOf(
                CivComboboxOption("AL", "Alabama"),
                CivComboboxOption("AK", "Alaska"),
                CivComboboxOption("AZ", "Arizona"),
                CivComboboxOption("CA", "California"),
                CivComboboxOption("NY", "New York"),
            ),
            hint = "Start typing to filter",
            required = true,
        )

        CivCombobox(
            label = "Disabled combobox",
            value = "",
            onValueChange = {},
            options = emptyList(),
            disabled = true,
        )
    }
}
