// CivUI — CivRaceEthnicity for Jetpack Compose
// Accessible compound race and ethnicity input following OMB standards.
// Renders: legend -> hint -> error -> ethnicity radio group -> race checkbox group (Section 508 compliant)

package gov.civui.components

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
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
 * Structured race and ethnicity value following OMB categories.
 */
data class RaceEthnicityValue(
    val ethnicity: String = "",
    val race: List<String> = emptyList(),
)

private val ETHNICITY_OPTIONS = listOf(
    CivRadioOption(value = "hispanic", label = "Hispanic or Latino"),
    CivRadioOption(value = "not-hispanic", label = "Not Hispanic or Latino"),
    CivRadioOption(value = "prefer-not-to-answer", label = "Prefer not to answer"),
)

private val RACE_OPTIONS = listOf(
    CivCheckboxOption(value = "american-indian-alaska-native", label = "American Indian or Alaska Native"),
    CivCheckboxOption(value = "asian", label = "Asian"),
    CivCheckboxOption(value = "black-african-american", label = "Black or African American"),
    CivCheckboxOption(value = "native-hawaiian-pacific-islander", label = "Native Hawaiian or Other Pacific Islander"),
    CivCheckboxOption(value = "white", label = "White"),
    CivCheckboxOption(value = "prefer-not-to-answer", label = "Prefer not to answer"),
)

/**
 * Accessible compound race and ethnicity input for government applications.
 *
 * Collects ethnicity (single-select radio) and race (multi-select checkboxes)
 * following OMB (Office of Management and Budget) statistical categories.
 * Mirrors the web `civ-race-ethnicity` component.
 *
 * TalkBack announces the fieldset legend, sub-group labels, and errors.
 *
 * Usage:
 * ```kotlin
 * var value by remember { mutableStateOf(RaceEthnicityValue()) }
 * CivRaceEthnicity(
 *     legend = "Race and ethnicity",
 *     value = value,
 *     onValueChange = { value = it },
 * )
 * ```
 */
@Composable
fun CivRaceEthnicity(
    legend: String,
    value: RaceEthnicityValue,
    onValueChange: (RaceEthnicityValue) -> Unit,
    modifier: Modifier = Modifier,
    hint: String = "",
    error: String = "",
    ethnicityError: String = "",
    raceError: String = "",
    required: Boolean = false,
    disabled: Boolean = false,
    readonly: Boolean = false,
    onChange: ((RaceEthnicityValue) -> Unit)? = null,
    onAnalytics: ((event: String, data: Map<String, Any>?) -> Unit)? = null,
    name: String = "",
    formState: CivFormState? = null,
) {
    val isDark = isSystemInDarkTheme()

    // Form state registration
    var formError by remember { mutableStateOf("") }
    val effectiveError = error.ifEmpty { formError }

    if (formState != null && name.isNotEmpty()) {
        androidx.compose.runtime.DisposableEffect(name) {
            formState.register(CivFormState.CivFieldRegistration(
                name = name,
                getValue = { "${value.ethnicity}|${value.race.joinToString(",")}" },
                setValue = { },
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

    Column(
        modifier = modifier
            .padding(bottom = CivTokens.Spacing._4)
            .alpha(if (disabled) 0.5f else 1f)
            .semantics {
                contentDescription = buildString {
                    append(legend)
                    if (required) append(", required")
                    if (effectiveError.isNotEmpty()) append(". Error: $effectiveError")
                }
                if (effectiveError.isNotEmpty()) {
                    error(effectiveError)
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

        // 3. Error (fieldset-level)
        CivError(text = effectiveError.ifEmpty { null }, color = errorColor)

        // 4. Ethnicity (radio group)
        CivRadioGroup(
            legend = "Ethnicity",
            value = value.ethnicity,
            onValueChange = { newEthnicity ->
                val updated = value.copy(ethnicity = newEthnicity)
                onValueChange(updated)
                onChange?.invoke(updated)
                onAnalytics?.invoke("change", mapOf("field" to "ethnicity", "value" to newEthnicity))
            },
            options = ETHNICITY_OPTIONS,
            required = required,
            disabled = disabled || readonly,
            error = ethnicityError.ifEmpty { null },
        )

        // 5. Race (checkbox group)
        CivCheckboxGroup(
            legend = "Race",
            values = value.race,
            onValuesChange = { newRace ->
                val updated = value.copy(race = newRace)
                onValueChange(updated)
                onChange?.invoke(updated)
                onAnalytics?.invoke("change", mapOf("field" to "race", "values" to newRace))
            },
            options = RACE_OPTIONS,
            required = required,
            disabled = disabled || readonly,
            error = raceError.ifEmpty { null },
            hint = "Select all that apply",
        )
    }
}

// MARK: - Preview

@Preview(showBackground = true, name = "CivRaceEthnicity")
@Composable
private fun CivRaceEthnicityPreview() {
    Column(modifier = Modifier.padding(16.dp)) {
        var value by remember { mutableStateOf(RaceEthnicityValue()) }
        CivRaceEthnicity(
            legend = "Race and ethnicity",
            value = value,
            onValueChange = { value = it },
            hint = "This information is used for statistical purposes only",
            required = true,
        )

        var prefilled by remember {
            mutableStateOf(RaceEthnicityValue(
                ethnicity = "not-hispanic",
                race = listOf("white"),
            ))
        }
        CivRaceEthnicity(
            legend = "Prefilled",
            value = prefilled,
            onValueChange = { prefilled = it },
        )

        CivRaceEthnicity(
            legend = "With errors",
            value = RaceEthnicityValue(),
            onValueChange = {},
            ethnicityError = "Please select your ethnicity",
            raceError = "Please select at least one race",
            required = true,
        )

        CivRaceEthnicity(
            legend = "Disabled",
            value = RaceEthnicityValue(),
            onValueChange = {},
            disabled = true,
        )
    }
}
