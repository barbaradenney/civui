// CivUI — CivMemorableDate for Jetpack Compose
// Accessible memorable date input with three fields (month, day, year).
// Renders: legend -> hint -> error -> [month select, day input, year input] (Section 508 compliant)

package gov.civui.components

import androidx.compose.foundation.border
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.MenuAnchorType
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.error
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import gov.civui.i18n.CivLocale
import gov.civui.tokens.CivTokens
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.time.format.DateTimeParseException

/**
 * Data class for CivMemorableDate onChange callback, providing individual segments.
 */
data class CivMemorableDateValue(
    val value: String,
    val month: String,
    val day: String,
    val year: String,
)

private val MONTH_OPTIONS = listOf(
    "01" to "January",
    "02" to "February",
    "03" to "March",
    "04" to "April",
    "05" to "May",
    "06" to "June",
    "07" to "July",
    "08" to "August",
    "09" to "September",
    "10" to "October",
    "11" to "November",
    "12" to "December",
)

/**
 * Accessible memorable date input for government applications.
 *
 * Three separate fields for month (dropdown), day (text), and year (text).
 * Composes the value into ISO format (YYYY-MM-DD). Ideal for known dates
 * like date of birth or document dates.
 *
 * Usage:
 * ```kotlin
 * var dob by remember { mutableStateOf("") }
 * CivMemorableDate(
 *     legend = "Date of birth",
 *     value = dob,
 *     onValueChange = { dob = it },
 *     hint = "For example: January 15 1990",
 * )
 * ```
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CivMemorableDate(
    legend: String,
    value: String,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier,
    hint: String? = null,
    error: String? = null,
    required: Boolean = false,
    disabled: Boolean = false,
    readonly: Boolean = false,
    monthLabel: String = CivLocale.t("memorableDateMonthLabel"),
    dayLabel: String = CivLocale.t("memorableDateDayLabel"),
    yearLabel: String = CivLocale.t("memorableDateYearLabel"),
    name: String = "",
    formState: CivFormState? = null,
    onChange: ((CivMemorableDateValue) -> Unit)? = null,
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

    // Parse the ISO value into segments
    var month by remember(value) {
        mutableStateOf(
            if (value.length >= 7) value.substring(5, 7) else ""
        )
    }
    var day by remember(value) {
        mutableStateOf(
            if (value.length >= 10) value.substring(8, 10).trimStart('0') else ""
        )
    }
    var year by remember(value) {
        mutableStateOf(
            if (value.length >= 4) value.substring(0, 4) else ""
        )
    }

    var monthExpanded by remember { mutableStateOf(false) }
    var dateAnnouncement by remember { mutableStateOf("") }

    // Assemble and validate the date when any segment changes
    fun assembleAndNotify() {
        if (month.isNotEmpty() && day.isNotEmpty() && year.length == 4) {
            val paddedMonth = month.padStart(2, '0')
            val paddedDay = day.padStart(2, '0')
            val paddedYear = year.padStart(4, '0')
            val assembled = "$paddedYear-$paddedMonth-$paddedDay"
            // Validate it is a real date
            try {
                LocalDate.parse(assembled, DateTimeFormatter.ISO_LOCAL_DATE)
                onValueChange(assembled)
                val dateValue = CivMemorableDateValue(
                    value = assembled,
                    month = paddedMonth,
                    day = paddedDay,
                    year = paddedYear,
                )
                onChange?.invoke(dateValue)
                onAnalytics?.invoke("change", mapOf("field" to legend, "value" to assembled))
                // SR announcement for valid date
                val monthName = MONTH_OPTIONS.find { it.first == paddedMonth }?.second ?: paddedMonth
                dateAnnouncement = "Date entered: $monthName $paddedDay, $paddedYear"
            } catch (_: DateTimeParseException) {
                onValueChange("")
            }
        } else {
            onValueChange("")
        }
    }

    Column(
        modifier = modifier
            .padding(bottom = CivTokens.Spacing._4)
            .then(
                if (effectiveError != null) Modifier.semantics { error(effectiveError) } else Modifier
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
        CivError(text = effectiveError, color = errorColor)

        // 4. Date fields
        Row(
            horizontalArrangement = Arrangement.spacedBy(CivTokens.Spacing._4),
            verticalAlignment = Alignment.Top,
        ) {
            // Month select
            Column(modifier = Modifier.width(160.dp)) {
                Text(
                    text = monthLabel,
                    style = TextStyle(
                        fontSize = CivTokens.Typography.FontSize.sm,
                    ),
                    color = labelColor,
                    modifier = Modifier.padding(bottom = CivTokens.Spacing._1),
                )

                ExposedDropdownMenuBox(
                    expanded = monthExpanded,
                    onExpandedChange = { if (!disabled && !readonly) monthExpanded = it },
                ) {
                    TextField(
                        value = MONTH_OPTIONS.find { it.first == month }?.second ?: "",
                        onValueChange = {},
                        readOnly = true,
                        modifier = Modifier
                            .menuAnchor(MenuAnchorType.PrimaryNotEditable)
                            .fillMaxWidth()
                            .border(
                                width = CivTokens.Border.Width.default_,
                                color = borderColor,
                                shape = RoundedCornerShape(CivTokens.Border.Radius.default_),
                            )
                            .alpha(if (disabled) 0.5f else 1f)
                            .semantics {
                                contentDescription = "$monthLabel, $legend"
                            },
                        enabled = !disabled && !readonly,
                        placeholder = { Text(CivLocale.t("memorableDateMonthEmptyLabel"), color = hintColor) },
                        textStyle = TextStyle(fontSize = CivTokens.Typography.FontSize.base),
                        singleLine = true,
                        shape = RoundedCornerShape(CivTokens.Border.Radius.default_),
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = monthExpanded) },
                        colors = TextFieldDefaults.colors(
                            focusedContainerColor = backgroundColor,
                            unfocusedContainerColor = backgroundColor,
                            disabledContainerColor = backgroundColor,
                            focusedIndicatorColor = Color.Transparent,
                            unfocusedIndicatorColor = Color.Transparent,
                            disabledIndicatorColor = Color.Transparent,
                        ),
                    )

                    ExposedDropdownMenu(
                        expanded = monthExpanded,
                        onDismissRequest = { monthExpanded = false },
                    ) {
                        MONTH_OPTIONS.forEach { (value, label) ->
                            DropdownMenuItem(
                                text = { Text(label) },
                                onClick = {
                                    month = value
                                    monthExpanded = false
                                    assembleAndNotify()
                                },
                            )
                        }
                    }
                }
            }

            // Day input
            Column(modifier = Modifier.width(80.dp)) {
                Text(
                    text = dayLabel,
                    style = TextStyle(
                        fontSize = CivTokens.Typography.FontSize.sm,
                    ),
                    color = labelColor,
                    modifier = Modifier.padding(bottom = CivTokens.Spacing._1),
                )

                TextField(
                    value = day,
                    onValueChange = { newDay ->
                        val filtered = newDay.filter { it.isDigit() }.take(2)
                        day = filtered
                        assembleAndNotify()
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(
                            width = CivTokens.Border.Width.default_,
                            color = borderColor,
                            shape = RoundedCornerShape(CivTokens.Border.Radius.default_),
                        )
                        .alpha(if (disabled) 0.5f else 1f)
                        .semantics {
                            contentDescription = "$dayLabel, $legend"
                        },
                    enabled = !disabled && !readonly,
                    placeholder = { Text(CivLocale.t("memorableDateDayPlaceholder"), color = hintColor) },
                    textStyle = TextStyle(fontSize = CivTokens.Typography.FontSize.base),
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
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
            }

            // Year input
            Column(modifier = Modifier.width(96.dp)) {
                Text(
                    text = yearLabel,
                    style = TextStyle(
                        fontSize = CivTokens.Typography.FontSize.sm,
                    ),
                    color = labelColor,
                    modifier = Modifier.padding(bottom = CivTokens.Spacing._1),
                )

                TextField(
                    value = year,
                    onValueChange = { newYear ->
                        val filtered = newYear.filter { it.isDigit() }.take(4)
                        year = filtered
                        assembleAndNotify()
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(
                            width = CivTokens.Border.Width.default_,
                            color = borderColor,
                            shape = RoundedCornerShape(CivTokens.Border.Radius.default_),
                        )
                        .alpha(if (disabled) 0.5f else 1f)
                        .semantics {
                            contentDescription = "$yearLabel, $legend"
                        },
                    enabled = !disabled && !readonly,
                    placeholder = { Text(CivLocale.t("memorableDateYearPlaceholder"), color = hintColor) },
                    textStyle = TextStyle(fontSize = CivTokens.Typography.FontSize.base),
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
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
            }
        }

        // SR announcement when valid date is assembled
        if (dateAnnouncement.isNotEmpty()) {
            Text(
                text = dateAnnouncement,
                modifier = Modifier.semantics {
                    liveRegion = LiveRegionMode.Polite
                    contentDescription = dateAnnouncement
                },
                style = TextStyle(fontSize = CivTokens.Typography.FontSize.sm),
                color = Color.Transparent,
            )
        }
    }
}

// MARK: - Preview

@Preview(showBackground = true, name = "CivMemorableDate")
@Composable
private fun CivMemorableDatePreview() {
    Column(modifier = Modifier.padding(16.dp)) {
        var dob by remember { mutableStateOf("") }
        CivMemorableDate(
            legend = "Date of birth",
            value = dob,
            onValueChange = { dob = it },
            hint = "For example: January 15 1990",
            required = true,
        )

        var docDate by remember { mutableStateOf("2024-06-15") }
        CivMemorableDate(
            legend = "Document date",
            value = docDate,
            onValueChange = { docDate = it },
        )

        CivMemorableDate(
            legend = "Disabled date",
            value = "",
            onValueChange = {},
            disabled = true,
        )
    }
}
