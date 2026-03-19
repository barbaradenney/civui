// CivUI — CivCombobox for Jetpack Compose
// Accessible combobox (autocomplete) with text input and filterable dropdown.
// Renders: label -> hint -> error -> text field with dropdown (Section 508 compliant)

package gov.civui.components

import androidx.compose.foundation.background
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
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.key.Key
import androidx.compose.ui.input.key.KeyEventType
import androidx.compose.ui.input.key.key
import androidx.compose.ui.input.key.onKeyEvent
import androidx.compose.ui.input.key.type
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.error
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import gov.civui.i18n.CivLocale
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
    readonly: Boolean = false,
    placeholder: String? = null,
    noResultsText: String = CivLocale.t("comboboxNoResults"),
    name: String = "",
    formState: CivFormState? = null,
    onInput: ((String) -> Unit)? = null,
    onAnalytics: ((event: String, data: Map<String, Any>?) -> Unit)? = null,
) {
    val isDark = isSystemInDarkTheme()

    // Form state registration
    var formError by remember { mutableStateOf("") }
    val effectiveError = error ?: formError.ifEmpty { null }

    if (formState != null && name.isNotEmpty()) {
        androidx.compose.runtime.DisposableEffect(name) {
            formState.register(CivFormState.CivFieldRegistration(
                name = name,
                getValue = { value },
                setValue = { onValueChange(it) },
                isRequired = required,
                getError = { formError },
                setError = { formError = it },
            ))
            onDispose { formState.unregister(name) }
        }
    }

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

    // Results count announcement via LiveRegion
    var resultsAnnouncement by remember { mutableStateOf("") }
    LaunchedEffect(filteredOptions.size, filterText) {
        if (filterText.isNotEmpty()) {
            resultsAnnouncement = CivLocale.t("comboboxResultsAvailable", "count" to filteredOptions.size)
        }
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
        CivError(text = effectiveError, color = errorColor)

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
                    onInput?.invoke(newText)
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .border(
                        width = if (effectiveError != null) CivTokens.Border.Width._2 else CivTokens.Border.Width.default_,
                        color = if (effectiveError != null) errorColor else borderColor,
                        shape = RoundedCornerShape(CivTokens.Border.Radius.default_),
                    )
                    .onFocusChanged { focusState ->
                        isFocused = focusState.isFocused
                        if (focusState.isFocused && !disabled && !readonly) {
                            expanded = true
                            onAnalytics?.invoke("focus", mapOf("field" to label))
                        }
                        if (!focusState.isFocused) {
                            expanded = false
                            onAnalytics?.invoke("blur", mapOf("field" to label, "value" to value))
                        }
                    }
                    .onKeyEvent { keyEvent ->
                        if (keyEvent.type == KeyEventType.KeyDown) {
                            when (keyEvent.key) {
                                Key.DirectionDown -> {
                                    if (filteredOptions.isNotEmpty()) {
                                        activeIndex = (activeIndex + 1).coerceAtMost(filteredOptions.size - 1)
                                    }
                                    true
                                }
                                Key.DirectionUp -> {
                                    if (filteredOptions.isNotEmpty()) {
                                        activeIndex = (activeIndex - 1).coerceAtLeast(0)
                                    }
                                    true
                                }
                                Key.Enter -> {
                                    if (activeIndex in filteredOptions.indices) {
                                        val option = filteredOptions[activeIndex]
                                        onValueChange(option.value)
                                        filterText = option.label
                                        expanded = false
                                        activeIndex = -1
                                        onAnalytics?.invoke("change", mapOf("field" to label, "value" to option.value, "label" to option.label))
                                    }
                                    true
                                }
                                Key.Escape -> {
                                    expanded = false
                                    activeIndex = -1
                                    true
                                }
                                else -> false
                            }
                        } else false
                    }
                    .alpha(if (disabled) 0.5f else 1f)
                    .semantics {
                        contentDescription = buildString {
                            append(label)
                            if (required) append(", required")
                            if (hint != null) append(". $hint")
                            if (effectiveError != null) append(". Error: $effectiveError")
                            append(", combobox")
                        }
                        if (effectiveError != null) {
                            error(effectiveError)
                        }
                    },
                enabled = !disabled && !readonly,
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
                        val isActive = index == activeIndex
                        val highlightColor = if (isActive) {
                            if (isDark) CivTokens.DarkColors.Primary.lighter else CivTokens.Colors.Primary.lighter
                        } else Color.Transparent
                        Text(
                            text = option.label,
                            style = TextStyle(
                                fontSize = CivTokens.Typography.FontSize.base,
                                fontWeight = if (option.value == value) FontWeight.Bold else FontWeight.Normal,
                            ),
                            color = labelColor,
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(highlightColor)
                                .clickable {
                                    onValueChange(option.value)
                                    filterText = option.label
                                    expanded = false
                                    activeIndex = -1
                                    onAnalytics?.invoke("change", mapOf("field" to label, "value" to option.value, "label" to option.label))
                                }
                                .padding(
                                    horizontal = CivTokens.Spacing._4,
                                    vertical = CivTokens.Spacing._3,
                                )
                                .semantics {
                                    contentDescription = if (isActive) "${option.label}, highlighted" else option.label
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

            // Results count SR announcement (hidden, LiveRegion.Polite)
            if (resultsAnnouncement.isNotEmpty()) {
                Text(
                    text = resultsAnnouncement,
                    modifier = Modifier
                        .padding(0.dp)
                        .semantics {
                            liveRegion = LiveRegionMode.Polite
                            contentDescription = resultsAnnouncement
                        },
                    style = TextStyle(fontSize = CivTokens.Typography.FontSize.sm),
                    color = Color.Transparent,
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
