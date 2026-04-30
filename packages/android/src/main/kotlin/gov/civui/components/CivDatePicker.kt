// CivUI — CivDatePicker for Jetpack Compose
// Accessible date picker using Material 3 DatePickerDialog.
// Renders: label -> hint -> error -> text field with calendar button (Section 508 compliant)

package gov.civui.components

import androidx.compose.foundation.border
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material3.DatePicker
import androidx.compose.material3.DatePickerDialog
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.SelectableDates
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TextField
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.material3.rememberDatePickerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.error
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import gov.civui.i18n.CivLocale
import gov.civui.tokens.CivTokens
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter
import java.time.format.DateTimeParseException

/**
 * Accessible date picker for government applications.
 *
 * Uses Material 3 DatePickerDialog with a text input for manual entry.
 * Value is in ISO format (YYYY-MM-DD). Supports min/max date constraints.
 *
 * Usage:
 * ```kotlin
 * var date by remember { mutableStateOf("") }
 * CivDatePicker(
 *     label = "Appointment date",
 *     value = date,
 *     onValueChange = { date = it },
 *     hint = "For example: 03/15/2026",
 * )
 * ```
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CivDatePicker(
    label: String,
    value: String,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier,
    hint: String? = null,
    error: String? = null,
    min: String? = null,
    max: String? = null,
    required: Boolean = false,
    disabled: Boolean = false,
    readonly: Boolean = false,
    placeholder: String = "MM/DD/YYYY",
    name: String = "",
    formState: CivFormState? = null,
    locale: String = "",
    weekStartsOn: Int = 0,
    disabledDates: String = "",
    clearLabel: String = "",
    chooseDateLabel: String = "",
    selectedDateLabel: String = "",
    dialogLabel: String = "",
    previousMonthLabel: String = "",
    nextMonthLabel: String = "",
    dialogOpenedMessage: String = "",
    dateSelectedMessage: String = "",
    todayLabel: String = "",
    todayButtonLabel: String = "",
    hideTodayButton: Boolean = false,
    invalidFormatMessage: String = "",
    dateRangeMessage: String = "",
    minDateMessage: String = "",
    maxDateMessage: String = "",
    onChange: ((String) -> Unit)? = null,
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

    var showDialog by remember { mutableStateOf(false) }
    var inputText by remember(value) {
        mutableStateOf(
            if (value.isNotEmpty()) {
                try {
                    val date = LocalDate.parse(value, DateTimeFormatter.ISO_LOCAL_DATE)
                    date.format(DateTimeFormatter.ofPattern("MM/dd/yyyy"))
                } catch (_: DateTimeParseException) {
                    value
                }
            } else ""
        )
    }

    // Parse min/max to epoch millis for Material DatePicker
    val minMillis = min?.let { parseIsoToEpochMillis(it) }
    val maxMillis = max?.let { parseIsoToEpochMillis(it) }

    // Parse current value to epoch millis for initial selection
    val initialMillis = if (value.isNotEmpty()) parseIsoToEpochMillis(value) else null

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

        // 4. Input with calendar button
        Row(
            verticalAlignment = Alignment.CenterVertically,
        ) {
            TextField(
                value = inputText,
                onValueChange = { newText ->
                    inputText = newText
                    // Try to parse the input text as a date
                    val parsed = tryParseDisplayDate(newText)
                    if (parsed != null) {
                        onValueChange(parsed)
                        onChange?.invoke(parsed)
                        onAnalytics?.invoke("change", mapOf("field" to label, "value" to parsed))
                    }
                },
                modifier = Modifier
                    .weight(1f)
                    .border(
                        width = if (effectiveError != null) CivTokens.Border.Width._2 else CivTokens.Border.Width.default_,
                        color = if (effectiveError != null) errorColor else borderColor,
                        shape = RoundedCornerShape(
                            topStart = CivTokens.Border.Radius.default_,
                            bottomStart = CivTokens.Border.Radius.default_,
                            topEnd = CivTokens.Border.Radius.none,
                            bottomEnd = CivTokens.Border.Radius.none,
                        ),
                    )
                    .alpha(if (disabled) 0.5f else 1f)
                    .semantics {
                        contentDescription = buildString {
                            append(label)
                            if (required) append(", required")
                            if (hint != null) append(". $hint")
                            if (effectiveError != null) append(". Error: $effectiveError")
                        }
                        if (effectiveError != null) {
                            error(effectiveError)
                        }
                    },
                enabled = !disabled && !readonly,
                placeholder = { Text(text = placeholder, color = hintColor) },
                textStyle = TextStyle(
                    fontSize = CivTokens.Typography.FontSize.base,
                ),
                singleLine = true,
                shape = RoundedCornerShape(
                    topStart = CivTokens.Border.Radius.default_,
                    bottomStart = CivTokens.Border.Radius.default_,
                    topEnd = CivTokens.Border.Radius.none,
                    bottomEnd = CivTokens.Border.Radius.none,
                ),
                colors = TextFieldDefaults.colors(
                    focusedContainerColor = backgroundColor,
                    unfocusedContainerColor = backgroundColor,
                    disabledContainerColor = backgroundColor,
                    focusedIndicatorColor = Color.Transparent,
                    unfocusedIndicatorColor = Color.Transparent,
                    disabledIndicatorColor = Color.Transparent,
                ),
            )

            IconButton(
                onClick = { showDialog = true },
                enabled = !disabled && !readonly,
                modifier = Modifier
                    .border(
                        width = CivTokens.Border.Width.default_,
                        color = borderColor,
                        shape = RoundedCornerShape(
                            topStart = CivTokens.Border.Radius.none,
                            bottomStart = CivTokens.Border.Radius.none,
                            topEnd = CivTokens.Border.Radius.default_,
                            bottomEnd = CivTokens.Border.Radius.default_,
                        ),
                    )
                    .size(56.dp)
                    .alpha(if (disabled) 0.5f else 1f),
            ) {
                Icon(
                    imageVector = Icons.Default.DateRange,
                    contentDescription = CivLocale.t("datePickerChooseDateLabel"),
                )
            }
        }
    }

    // Date picker dialog
    if (showDialog) {
        val selectableDates = remember(minMillis, maxMillis) {
            object : SelectableDates {
                override fun isSelectableDate(utcTimeMillis: Long): Boolean {
                    if (minMillis != null && utcTimeMillis < minMillis) return false
                    if (maxMillis != null && utcTimeMillis > maxMillis) return false
                    return true
                }
            }
        }

        val datePickerState = rememberDatePickerState(
            initialSelectedDateMillis = initialMillis,
            selectableDates = selectableDates,
        )

        DatePickerDialog(
            onDismissRequest = { showDialog = false },
            confirmButton = {
                TextButton(
                    onClick = {
                        datePickerState.selectedDateMillis?.let { millis ->
                            val date = Instant.ofEpochMilli(millis)
                                .atZone(ZoneOffset.UTC)
                                .toLocalDate()
                            val iso = date.format(DateTimeFormatter.ISO_LOCAL_DATE)
                            onValueChange(iso)
                            onChange?.invoke(iso)
                            onAnalytics?.invoke("change", mapOf("field" to label, "value" to iso))
                            inputText = date.format(DateTimeFormatter.ofPattern("MM/dd/yyyy"))
                        }
                        showDialog = false
                    },
                ) {
                    Text("OK")
                }
            },
            dismissButton = {
                TextButton(onClick = { showDialog = false }) {
                    Text("Cancel")
                }
            },
        ) {
            DatePicker(state = datePickerState)
        }
    }
}

/**
 * Parse an ISO date string (YYYY-MM-DD) to epoch milliseconds (UTC).
 */
private fun parseIsoToEpochMillis(iso: String): Long? {
    return try {
        val date = LocalDate.parse(iso, DateTimeFormatter.ISO_LOCAL_DATE)
        date.atStartOfDay(ZoneOffset.UTC).toInstant().toEpochMilli()
    } catch (_: DateTimeParseException) {
        null
    }
}

/**
 * Try to parse a display date (MM/DD/YYYY) to ISO format (YYYY-MM-DD).
 */
private fun tryParseDisplayDate(text: String): String? {
    return try {
        val date = LocalDate.parse(text, DateTimeFormatter.ofPattern("MM/dd/yyyy"))
        date.format(DateTimeFormatter.ISO_LOCAL_DATE)
    } catch (_: DateTimeParseException) {
        null
    }
}

// MARK: - Preview

@Preview(showBackground = true, name = "CivDatePicker")
@Composable
private fun CivDatePickerPreview() {
    Column(modifier = Modifier.padding(16.dp)) {
        var date by remember { mutableStateOf("") }
        CivDatePicker(
            label = "Appointment date",
            value = date,
            onValueChange = { date = it },
            hint = "For example: 03/15/2026",
            required = true,
        )

        var bounded by remember { mutableStateOf("") }
        CivDatePicker(
            label = "Date of service",
            value = bounded,
            onValueChange = { bounded = it },
            min = "2024-01-01",
            max = "2026-12-31",
        )

        CivDatePicker(
            label = "Disabled date",
            value = "",
            onValueChange = {},
            disabled = true,
        )
    }
}
