// CivUI — CivAddress for Jetpack Compose
// Structured address input with street, city, state, and ZIP fields.
// Renders: legend -> hint -> error -> address fields (Section 508 compliant)

package gov.civui.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.border
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
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
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.error
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import gov.civui.i18n.CivLocale
import gov.civui.tokens.CivTokens

/**
 * Structured address value data class (parallels web AddressValue).
 */
data class AddressValue(
    val street1: String = "",
    val street2: String = "",
    val city: String = "",
    val state: String = "",
    val zip: String = "",
)

/**
 * US states and territories for the state dropdown.
 */
private val US_STATES = listOf(
    CivSelectOption("AL", "Alabama"), CivSelectOption("AK", "Alaska"),
    CivSelectOption("AZ", "Arizona"), CivSelectOption("AR", "Arkansas"),
    CivSelectOption("CA", "California"), CivSelectOption("CO", "Colorado"),
    CivSelectOption("CT", "Connecticut"), CivSelectOption("DE", "Delaware"),
    CivSelectOption("DC", "District of Columbia"),
    CivSelectOption("FL", "Florida"), CivSelectOption("GA", "Georgia"),
    CivSelectOption("HI", "Hawaii"), CivSelectOption("ID", "Idaho"),
    CivSelectOption("IL", "Illinois"), CivSelectOption("IN", "Indiana"),
    CivSelectOption("IA", "Iowa"), CivSelectOption("KS", "Kansas"),
    CivSelectOption("KY", "Kentucky"), CivSelectOption("LA", "Louisiana"),
    CivSelectOption("ME", "Maine"), CivSelectOption("MD", "Maryland"),
    CivSelectOption("MA", "Massachusetts"), CivSelectOption("MI", "Michigan"),
    CivSelectOption("MN", "Minnesota"), CivSelectOption("MS", "Mississippi"),
    CivSelectOption("MO", "Missouri"), CivSelectOption("MT", "Montana"),
    CivSelectOption("NE", "Nebraska"), CivSelectOption("NV", "Nevada"),
    CivSelectOption("NH", "New Hampshire"), CivSelectOption("NJ", "New Jersey"),
    CivSelectOption("NM", "New Mexico"), CivSelectOption("NY", "New York"),
    CivSelectOption("NC", "North Carolina"), CivSelectOption("ND", "North Dakota"),
    CivSelectOption("OH", "Ohio"), CivSelectOption("OK", "Oklahoma"),
    CivSelectOption("OR", "Oregon"), CivSelectOption("PA", "Pennsylvania"),
    CivSelectOption("RI", "Rhode Island"), CivSelectOption("SC", "South Carolina"),
    CivSelectOption("SD", "South Dakota"), CivSelectOption("TN", "Tennessee"),
    CivSelectOption("TX", "Texas"), CivSelectOption("UT", "Utah"),
    CivSelectOption("VT", "Vermont"), CivSelectOption("VA", "Virginia"),
    CivSelectOption("WA", "Washington"), CivSelectOption("WV", "West Virginia"),
    CivSelectOption("WI", "Wisconsin"), CivSelectOption("WY", "Wyoming"),
    CivSelectOption("AS", "American Samoa"), CivSelectOption("GU", "Guam"),
    CivSelectOption("MP", "Northern Mariana Islands"),
    CivSelectOption("PR", "Puerto Rico"), CivSelectOption("VI", "U.S. Virgin Islands"),
)

/**
 * Accessible structured address input for government applications.
 *
 * Renders a fieldset with individual labeled inputs for street address,
 * city, state (dropdown), and ZIP code. Mirrors the web `civ-address`
 * component.
 *
 * TalkBack announces the fieldset legend and individual field labels.
 * Per-field error messages are announced via live regions.
 *
 * Usage:
 * ```kotlin
 * var address by remember { mutableStateOf(AddressValue()) }
 * CivAddress(
 *     legend = "Mailing address",
 *     value = address,
 *     onValueChange = { address = it },
 *     required = true,
 * )
 * ```
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CivAddress(
    legend: String,
    value: AddressValue,
    onValueChange: (AddressValue) -> Unit,
    modifier: Modifier = Modifier,
    hint: String = "",
    error: String = "",
    streetError: String = "",
    cityError: String = "",
    stateError: String = "",
    zipError: String = "",
    required: Boolean = false,
    disabled: Boolean = false,
    readonly: Boolean = false,
    showStreet2: Boolean = true,
    showCountry: Boolean = false,
    showMilitary: Boolean = false,
    showStreet3: Boolean = false,
    validateAddress: ((AddressValue) -> String?)? = null,
    onChange: ((AddressValue) -> Unit)? = null,
    onInput: ((AddressValue) -> Unit)? = null,
    onReset: (() -> Unit)? = null,
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
                getValue = {
                    "${value.street1}|${value.city}|${value.state}|${value.zip}"
                },
                setValue = { /* Address is composite; reset handled via onValueChange */ },
                isRequired = required,
                getError = { formError },
                setError = { formError = it },
                validate = {
                    if (required) {
                        when {
                            value.street1.isEmpty() -> "Street address is required"
                            value.city.isEmpty() -> "City is required"
                            value.state.isEmpty() -> "State is required"
                            value.zip.isEmpty() -> "ZIP code is required"
                            else -> null
                        }
                    } else null
                },
            ))
            onDispose { formState.unregister(name) }
        }
    }

    val labelColor = if (isDark) CivTokens.DarkColors.Base.darkest else CivTokens.Colors.Base.darkest
    val hintColor = if (isDark) CivTokens.DarkColors.Base.dark else CivTokens.Colors.Base.dark
    val errorColor = if (isDark) CivTokens.DarkColors.Error.default_ else CivTokens.Colors.Error.default_
    val borderDefault = if (isDark) CivTokens.DarkColors.Base.light else CivTokens.Colors.Base.light
    val backgroundColor = if (isDark) CivTokens.DarkColors.White.default_ else CivTokens.Colors.White.default_
    val readonlyBackground = if (isDark) CivTokens.DarkColors.Base.lightest else CivTokens.Colors.Base.lightest

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

        // 4. Street address line 1
        AddressTextField(
            label = "Street address",
            value = value.street1,
            onValueChange = { new ->
                val updated = value.copy(street1 = new)
                onValueChange(updated)
            },
            onCommit = { onChange?.invoke(value) },
            error = streetError,
            required = required,
            disabled = disabled,
            readonly = readonly,
            labelColor = labelColor,
            hintColor = hintColor,
            errorColor = errorColor,
            borderDefault = borderDefault,
            backgroundColor = backgroundColor,
            readonlyBackground = readonlyBackground,
            onAnalytics = onAnalytics,
        )

        // 5. Street address line 2
        if (showStreet2) {
            AddressTextField(
                label = "Street address line 2",
                value = value.street2,
                onValueChange = { new ->
                    val updated = value.copy(street2 = new)
                    onValueChange(updated)
                },
                onCommit = { onChange?.invoke(value) },
                error = "",
                required = false,
                disabled = disabled,
                readonly = readonly,
                labelColor = labelColor,
                hintColor = hintColor,
                errorColor = errorColor,
                borderDefault = borderDefault,
                backgroundColor = backgroundColor,
                readonlyBackground = readonlyBackground,
                onAnalytics = onAnalytics,
            )
        }

        // 6. City, State, ZIP row
        Row(
            horizontalArrangement = Arrangement.spacedBy(CivTokens.Spacing._3),
            modifier = Modifier.fillMaxWidth(),
        ) {
            // City
            Column(modifier = Modifier.weight(1f)) {
                CivLabel(
                    label = "City",
                    required = required,
                    labelColor = labelColor,
                    errorColor = errorColor,
                )
                CivError(text = cityError.ifEmpty { null }, color = errorColor)

                val cityBorderColor by animateColorAsState(
                    targetValue = if (cityError.isNotEmpty()) errorColor else borderDefault,
                    label = "cityBorder",
                )

                TextField(
                    value = value.city,
                    onValueChange = { new ->
                        val updated = value.copy(city = new)
                        onValueChange(updated)
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(
                            width = if (cityError.isNotEmpty()) CivTokens.Border.Width._2 else CivTokens.Border.Width.default_,
                            color = cityBorderColor,
                            shape = RoundedCornerShape(CivTokens.Border.Radius.default_),
                        )
                        .semantics {
                            contentDescription = buildString {
                                append("City")
                                if (required) append(", required")
                                if (cityError.isNotEmpty()) append(". Error: $cityError")
                            }
                            if (cityError.isNotEmpty()) {
                                error(cityError)
                            }
                        },
                    enabled = !disabled,
                    readOnly = readonly,
                    singleLine = true,
                    textStyle = TextStyle(fontSize = CivTokens.Typography.FontSize.base),
                    shape = RoundedCornerShape(CivTokens.Border.Radius.default_),
                    colors = TextFieldDefaults.colors(
                        focusedContainerColor = if (readonly) readonlyBackground else backgroundColor,
                        unfocusedContainerColor = if (readonly) readonlyBackground else backgroundColor,
                        disabledContainerColor = backgroundColor,
                        focusedIndicatorColor = Color.Transparent,
                        unfocusedIndicatorColor = Color.Transparent,
                        disabledIndicatorColor = Color.Transparent,
                    ),
                )
            }

            // State dropdown
            Column(modifier = Modifier.weight(1f)) {
                CivLabel(
                    label = "State",
                    required = required,
                    labelColor = labelColor,
                    errorColor = errorColor,
                )
                CivError(text = stateError.ifEmpty { null }, color = errorColor)

                val stateBorderColor by animateColorAsState(
                    targetValue = if (stateError.isNotEmpty()) errorColor else borderDefault,
                    label = "stateBorder",
                )

                var stateExpanded by remember { mutableStateOf(false) }
                val selectedStateLabel = US_STATES.find { it.value == value.state }?.label ?: ""

                ExposedDropdownMenuBox(
                    expanded = stateExpanded,
                    onExpandedChange = { if (!disabled && !readonly) stateExpanded = it },
                ) {
                    TextField(
                        value = selectedStateLabel.ifEmpty { CivLocale.t("selectEmpty") },
                        onValueChange = {},
                        readOnly = true,
                        modifier = Modifier
                            .menuAnchor(MenuAnchorType.PrimaryNotEditable)
                            .fillMaxWidth()
                            .border(
                                width = if (stateError.isNotEmpty()) CivTokens.Border.Width._2 else CivTokens.Border.Width.default_,
                                color = stateBorderColor,
                                shape = RoundedCornerShape(CivTokens.Border.Radius.default_),
                            )
                            .semantics {
                                contentDescription = buildString {
                                    append("State")
                                    if (required) append(", required")
                                    if (selectedStateLabel.isNotEmpty()) append(", selected: $selectedStateLabel")
                                    if (stateError.isNotEmpty()) append(". Error: $stateError")
                                }
                                if (stateError.isNotEmpty()) {
                                    error(stateError)
                                }
                            },
                        enabled = !disabled && !readonly,
                        textStyle = TextStyle(
                            fontSize = CivTokens.Typography.FontSize.base,
                            color = if (selectedStateLabel.isEmpty()) hintColor else labelColor,
                        ),
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = stateExpanded) },
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

                    ExposedDropdownMenu(
                        expanded = stateExpanded,
                        onDismissRequest = { stateExpanded = false },
                    ) {
                        DropdownMenuItem(
                            text = {
                                Text(
                                    text = CivLocale.t("selectEmpty"),
                                    style = TextStyle(
                                        fontSize = CivTokens.Typography.FontSize.base,
                                        color = hintColor,
                                    ),
                                )
                            },
                            onClick = {
                                val updated = value.copy(state = "")
                                onValueChange(updated)
                                onChange?.invoke(updated)
                                onAnalytics?.invoke("change", mapOf("field" to "state", "value" to ""))
                                stateExpanded = false
                            },
                        )
                        US_STATES.forEach { option ->
                            DropdownMenuItem(
                                text = {
                                    Text(
                                        text = option.label,
                                        style = TextStyle(
                                            fontSize = CivTokens.Typography.FontSize.base,
                                            color = labelColor,
                                        ),
                                    )
                                },
                                onClick = {
                                    val updated = value.copy(state = option.value)
                                    onValueChange(updated)
                                    onChange?.invoke(updated)
                                    onAnalytics?.invoke("change", mapOf("field" to "state", "value" to option.value))
                                    stateExpanded = false
                                },
                            )
                        }
                    }
                }
            }

            // ZIP code
            Column(modifier = Modifier.weight(0.7f)) {
                CivLabel(
                    label = "ZIP code",
                    required = required,
                    labelColor = labelColor,
                    errorColor = errorColor,
                )
                CivError(text = zipError.ifEmpty { null }, color = errorColor)

                val zipBorderColor by animateColorAsState(
                    targetValue = if (zipError.isNotEmpty()) errorColor else borderDefault,
                    label = "zipBorder",
                )

                TextField(
                    value = value.zip,
                    onValueChange = { new ->
                        // Allow digits and dash only, max 10 chars
                        val filtered = new.replace(Regex("[^\\d-]"), "").take(10)
                        val updated = value.copy(zip = filtered)
                        onValueChange(updated)
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(
                            width = if (zipError.isNotEmpty()) CivTokens.Border.Width._2 else CivTokens.Border.Width.default_,
                            color = zipBorderColor,
                            shape = RoundedCornerShape(CivTokens.Border.Radius.default_),
                        )
                        .semantics {
                            contentDescription = buildString {
                                append("ZIP code")
                                if (required) append(", required")
                                if (zipError.isNotEmpty()) append(". Error: $zipError")
                            }
                            if (zipError.isNotEmpty()) {
                                error(zipError)
                            }
                        },
                    enabled = !disabled,
                    readOnly = readonly,
                    singleLine = true,
                    textStyle = TextStyle(fontSize = CivTokens.Typography.FontSize.base),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    shape = RoundedCornerShape(CivTokens.Border.Radius.default_),
                    colors = TextFieldDefaults.colors(
                        focusedContainerColor = if (readonly) readonlyBackground else backgroundColor,
                        unfocusedContainerColor = if (readonly) readonlyBackground else backgroundColor,
                        disabledContainerColor = backgroundColor,
                        focusedIndicatorColor = Color.Transparent,
                        unfocusedIndicatorColor = Color.Transparent,
                        disabledIndicatorColor = Color.Transparent,
                    ),
                )
            }
        }
    }
}

/**
 * Internal helper for address text fields (street1, street2).
 */
@Composable
private fun AddressTextField(
    label: String,
    value: String,
    onValueChange: (String) -> Unit,
    onCommit: () -> Unit,
    error: String,
    required: Boolean,
    disabled: Boolean,
    readonly: Boolean,
    labelColor: Color,
    hintColor: Color,
    errorColor: Color,
    borderDefault: Color,
    backgroundColor: Color,
    readonlyBackground: Color,
    onAnalytics: ((event: String, data: Map<String, Any>?) -> Unit)?,
) {
    Column(modifier = Modifier.padding(bottom = CivTokens.Spacing._3)) {
        CivLabel(
            label = label,
            required = required,
            labelColor = labelColor,
            errorColor = errorColor,
        )
        CivError(text = error.ifEmpty { null }, color = errorColor)

        val borderColor by animateColorAsState(
            targetValue = if (error.isNotEmpty()) errorColor else borderDefault,
            label = "addressFieldBorder",
        )

        TextField(
            value = value,
            onValueChange = onValueChange,
            modifier = Modifier
                .fillMaxWidth()
                .border(
                    width = if (error.isNotEmpty()) CivTokens.Border.Width._2 else CivTokens.Border.Width.default_,
                    color = borderColor,
                    shape = RoundedCornerShape(CivTokens.Border.Radius.default_),
                )
                .semantics {
                    contentDescription = buildString {
                        append(label)
                        if (required) append(", required")
                        if (error.isNotEmpty()) append(". Error: $error")
                    }
                    if (error.isNotEmpty()) {
                        error(error)
                    }
                },
            enabled = !disabled,
            readOnly = readonly,
            singleLine = true,
            textStyle = TextStyle(fontSize = CivTokens.Typography.FontSize.base),
            shape = RoundedCornerShape(CivTokens.Border.Radius.default_),
            colors = TextFieldDefaults.colors(
                focusedContainerColor = if (readonly) readonlyBackground else backgroundColor,
                unfocusedContainerColor = if (readonly) readonlyBackground else backgroundColor,
                disabledContainerColor = backgroundColor,
                focusedIndicatorColor = Color.Transparent,
                unfocusedIndicatorColor = Color.Transparent,
                disabledIndicatorColor = Color.Transparent,
            ),
        )
    }
}

// MARK: - Preview

@Preview(showBackground = true, name = "CivAddress")
@Composable
private fun CivAddressPreview() {
    Column(modifier = Modifier.padding(16.dp)) {
        var address by remember { mutableStateOf(AddressValue()) }
        CivAddress(
            legend = "Mailing address",
            value = address,
            onValueChange = { address = it },
            hint = "Enter your current mailing address",
            required = true,
        )

        var homeAddress by remember {
            mutableStateOf(AddressValue(
                street1 = "1600 Pennsylvania Ave NW",
                city = "Washington",
                state = "DC",
                zip = "20500",
            ))
        }
        CivAddress(
            legend = "Home address",
            value = homeAddress,
            onValueChange = { homeAddress = it },
            showStreet2 = false,
        )

        CivAddress(
            legend = "Disabled address",
            value = AddressValue(),
            onValueChange = {},
            disabled = true,
        )

        CivAddress(
            legend = "With errors",
            value = AddressValue(street1 = "123 Main St"),
            onValueChange = {},
            required = true,
            cityError = "City is required",
            stateError = "State is required",
            zipError = "ZIP code is required",
        )
    }
}
