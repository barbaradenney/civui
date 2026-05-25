// CivUI — CivTextInput for Jetpack Compose
// Accessible text input following government design system patterns.
// Renders: label -> hint -> error -> input (Section 508 compliant)
// Supports input masking (ssn, phone-us, zip, zip4, ein, currency)

package gov.civui.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.border
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.ui.Alignment
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
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
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.error
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.OffsetMapping
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.TransformedText
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import gov.civui.i18n.CivLocale
import gov.civui.tokens.CivTokens

/// Keyboard type mapping for CivTextInput (parallels web `type` attribute).
enum class CivInputType {
    Text,
    Email,
    Number,
    Password,
    Search,
    Telephone,
    Url,
}

/// Width variant for CivTextInput (parallels web `width` prop).
enum class CivInputWidth(val dp: Float?) {
    Full(null),     // default
    XxSmall(48f),   // 2xs
    XSmall(64f),    // xs
    Small(96f),     // sm
    Medium(160f),   // md
    Large(240f),    // lg
    XLarge(288f),   // xl
    XxLarge(384f),  // 2xl
}

/// Input mask presets (parallels web `mask` prop).
enum class CivInputMask(
    val pattern: String,
    val hintKey: String,
    val errorKey: String,
    val keyboardType: KeyboardType,
    val isPii: Boolean,
) {
    SSN(
        pattern = "###-##-####",
        hintKey = "maskSsnHint",
        errorKey = "maskSsnError",
        keyboardType = KeyboardType.Number,
        isPii = true,
    ),
    PhoneUs(
        pattern = "(###) ###-####",
        hintKey = "maskPhoneUsHint",
        errorKey = "maskPhoneUsError",
        keyboardType = KeyboardType.Phone,
        isPii = false,
    ),
    Zip(
        pattern = "#####",
        hintKey = "maskZipHint",
        errorKey = "maskZipError",
        keyboardType = KeyboardType.Number,
        isPii = false,
    ),
    Zip4(
        pattern = "#####-####",
        hintKey = "maskZip4Hint",
        errorKey = "maskZip4Error",
        keyboardType = KeyboardType.Number,
        isPii = false,
    ),
    Ein(
        pattern = "##-#######",
        hintKey = "maskEinHint",
        errorKey = "maskEinError",
        keyboardType = KeyboardType.Number,
        isPii = true,
    ),
    Currency(
        pattern = "", // variable length
        hintKey = "maskCurrencyHint",
        errorKey = "maskCurrencyError",
        keyboardType = KeyboardType.Decimal,
        isPii = false,
    );
}

/**
 * Accessible text input component for government applications.
 *
 * Implements the CivUI form field pattern:
 * - Visible label (required for Section 508)
 * - Optional hint text with expected format
 * - Error message with immediate TalkBack announcement (LiveRegion)
 * - Input masking (SSN, phone, ZIP, EIN, currency)
 * - Readonly mode
 * - Focus ring indicator
 * - Dark mode adaptive colors
 *
 * Usage:
 * ```kotlin
 * var ssn by remember { mutableStateOf("") }
 * CivTextInput(
 *     label = "Social Security number",
 *     value = ssn,
 *     onValueChange = { ssn = it },
 *     mask = CivInputMask.SSN,
 * )
 * ```
 */
@Composable
fun CivTextInput(
    label: String,
    value: String,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier,
    hint: String? = null,
    error: String? = null,
    required: Boolean = false,
    disabled: Boolean = false,
    readonly: Boolean = false,
    placeholder: String? = null,
    inputType: CivInputType = CivInputType.Text,
    width: CivInputWidth = CivInputWidth.Full,
    spacing: String = "default",
    mask: CivInputMask? = null,
    maxLength: Int? = null,
    minLength: Int? = null,
    maskPattern: String = "",
    pattern: String = "",
    hideCharCount: Boolean = false,
    autocomplete: String = "",
    inputmode: String = "",
    prefix: String = "",
    suffix: String = "",
    clearable: Boolean = false,
    revealPassword: Boolean = false,
    iconStart: String = "",
    iconStartLabel: String = "",
    iconEnd: String = "",
    iconEndLabel: String = "",
    maskMode: String = "blur",
    validateType: String = "",
    decimals: Int = 2,
    min: Double? = null,
    max: Double? = null,
    allowNegative: Boolean = false,
    onInput: ((String) -> Unit)? = null,
    onChange: ((String) -> Unit)? = null,
    name: String = "",
    formState: CivFormState? = null,
    onAnalytics: ((event: String, data: Map<String, Any>?) -> Unit)? = null,
) {
    val isDark = isSystemInDarkTheme()
    var isFocused by remember { mutableStateOf(false) }

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
                isPii = mask?.isPii ?: false,
            ))
            onDispose { formState.unregister(name) }
        }
    }

    // Adaptive colors
    val labelColor = if (isDark) CivTokens.DarkColors.Base.darkest else CivTokens.Colors.Base.darkest
    val hintColor = if (isDark) CivTokens.DarkColors.Base.dark else CivTokens.Colors.Base.dark
    val errorColor = if (isDark) CivTokens.DarkColors.Error.default_ else CivTokens.Colors.Error.default_
    val borderColor by animateColorAsState(
        targetValue = when {
            effectiveError != null -> errorColor
            isFocused -> if (isDark) CivTokens.DarkColors.Primary.default_ else CivTokens.Colors.Primary.default_
            else -> if (isDark) CivTokens.DarkColors.Base.light else CivTokens.Colors.Base.light
        },
        label = "borderColor",
    )
    val backgroundColor = if (isDark) CivTokens.DarkColors.White.default_ else CivTokens.Colors.White.default_
    val readonlyBackground = if (isDark) CivTokens.DarkColors.Base.lightest else CivTokens.Colors.Base.lightest

    // Effective hint: explicit hint > mask hint (i18n) > custom mask hint > nothing
    val effectiveHint = hint ?: mask?.let { CivLocale.t(it.hintKey) } ?: if (maskPattern.isNotEmpty()) "Format: $maskPattern" else null

    // Effective keyboard type from mask
    val effectiveKeyboardType = mask?.keyboardType ?: inputType.toKeyboardType()

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
        CivHint(text = effectiveHint, color = hintColor)

        // 3. Error
        CivError(text = effectiveError, color = errorColor)

        // 4. Input
        val isCurrency = mask == CivInputMask.Currency || maskPattern.startsWith("$")

        val fieldModifier = Modifier
            .then(
                if (width.dp != null) Modifier.width(width.dp!!.dp)
                else Modifier.fillMaxWidth()
            )
            .civFocusRing(isFocused)
            .border(
                width = if (effectiveError != null) CivTokens.Border.Width._2 else CivTokens.Border.Width.default_,
                color = borderColor,
                shape = RoundedCornerShape(CivTokens.Border.Radius.default_),
            )
            .onFocusChanged { focusState ->
                val wasFocused = isFocused
                isFocused = focusState.isFocused
                // Fire onChange when focus leaves (parallels web change event)
                if (wasFocused && !focusState.isFocused) {
                    onChange?.invoke(value)
                    onAnalytics?.invoke("blur", mapOf("field" to label, "value" to value))
                }
                if (!wasFocused && focusState.isFocused) {
                    onAnalytics?.invoke("focus", mapOf("field" to label))
                }
            }
            .alpha(if (disabled) 0.5f else 1f)

        val accessibilityModifier = Modifier.semantics {
            contentDescription = buildString {
                append(label)
                if (required) append(", required")
                if (effectiveHint != null) append(". $effectiveHint")
                if (effectiveError != null) append(". Error: $effectiveError")
                if (readonly) append(", read only")
            }
            if (effectiveError != null) {
                error(effectiveError)
            }
        }

        // Build visual transformation for mask
        val visualTransformation = when {
            inputType == CivInputType.Password -> PasswordVisualTransformation()
            mask != null && mask != CivInputMask.Currency -> MaskVisualTransformation(mask.pattern)
            maskPattern.isNotEmpty() -> MaskVisualTransformation(maskPattern)
            else -> VisualTransformation.None
        }

        // Filter input for masks (preset or custom pattern)
        val maskedOnValueChange: (String) -> Unit = if (mask != null) {
            { newValue: String ->
                val filtered = when (mask) {
                    CivInputMask.Currency -> {
                        // Allow digits and one decimal point, max 2 decimal places
                        var raw = newValue.replace(Regex("[^\\d.]"), "")
                        val parts = raw.split(".")
                        if (parts.size > 2) {
                            raw = parts[0] + "." + parts.subList(1, parts.size).joinToString("")
                        }
                        val finalParts = raw.split(".")
                        if (finalParts.size == 2 && finalParts[1].length > 2) {
                            finalParts[0] + "." + finalParts[1].substring(0, 2)
                        } else {
                            raw
                        }
                    }
                    else -> {
                        // Extract only characters that match mask slots
                        val digits = newValue.replace(Regex("[^\\d]"), "")
                        val maxRawLen = mask.pattern.count { it == '#' }
                        digits.take(maxRawLen)
                    }
                }
                val limited = if (maxLength != null) filtered.take(maxLength) else filtered
                onValueChange(limited)
                onInput?.invoke(limited)
            }
        } else if (maskPattern.isNotEmpty()) {
            { newValue: String ->
                // Custom mask pattern: # = digit, A = letter, * = any
                val filtered = buildString {
                    var rawIdx = 0
                    for (ch in maskPattern) {
                        if (rawIdx >= newValue.length) break
                        when (ch) {
                            '#' -> {
                                // Find next digit in input
                                while (rawIdx < newValue.length && !newValue[rawIdx].isDigit()) rawIdx++
                                if (rawIdx < newValue.length) {
                                    append(newValue[rawIdx])
                                    rawIdx++
                                }
                            }
                            'A' -> {
                                // Find next letter in input
                                while (rawIdx < newValue.length && !newValue[rawIdx].isLetter()) rawIdx++
                                if (rawIdx < newValue.length) {
                                    append(newValue[rawIdx])
                                    rawIdx++
                                }
                            }
                            '*' -> {
                                append(newValue[rawIdx])
                                rawIdx++
                            }
                            else -> {
                                // Literal — skip it, don't consume input
                            }
                        }
                    }
                }
                val limited = if (maxLength != null) filtered.take(maxLength) else filtered
                onValueChange(limited)
                onInput?.invoke(limited)
            }
        } else {
            { newValue: String ->
                val limited = if (maxLength != null) newValue.take(maxLength) else newValue
                onValueChange(limited)
                onInput?.invoke(limited)
            }
        }

        // Currency prefix row
        if (isCurrency) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = fieldModifier,
            ) {
                Text(
                    text = "$",
                    style = TextStyle(
                        fontSize = CivTokens.Typography.FontSize.base,
                        fontWeight = FontWeight.Bold,
                    ),
                    color = labelColor,
                    modifier = Modifier.padding(start = CivTokens.Spacing._3),
                )
                TextField(
                    value = value,
                    onValueChange = maskedOnValueChange,
                    modifier = Modifier.weight(1f).then(accessibilityModifier),
                    enabled = !disabled,
                    readOnly = readonly,
                    placeholder = placeholder?.let {
                        { Text(text = it, color = hintColor) }
                    },
                    textStyle = TextStyle(
                        fontSize = CivTokens.Typography.FontSize.base,
                    ),
                    visualTransformation = visualTransformation,
                    keyboardOptions = KeyboardOptions(
                        keyboardType = effectiveKeyboardType,
                        capitalization = if (mask != null) KeyboardCapitalization.None else inputType.toCapitalization(),
                        imeAction = ImeAction.Done,
                    ),
                    singleLine = true,
                    shape = RoundedCornerShape(CivTokens.Border.Radius.default_),
                    colors = TextFieldDefaults.colors(
                        focusedContainerColor = if (readonly) readonlyBackground else backgroundColor,
                        unfocusedContainerColor = if (readonly) readonlyBackground else backgroundColor,
                        disabledContainerColor = backgroundColor,
                        focusedIndicatorColor = Color.Transparent,
                        unfocusedIndicatorColor = Color.Transparent,
                        disabledIndicatorColor = Color.Transparent,
                        errorIndicatorColor = Color.Transparent,
                    ),
                )
            }
        } else {
            TextField(
                value = value,
                onValueChange = maskedOnValueChange,
                modifier = fieldModifier.then(accessibilityModifier),
                enabled = !disabled,
                readOnly = readonly,
                placeholder = placeholder?.let {
                    { Text(text = it, color = hintColor) }
                },
                textStyle = TextStyle(
                    fontSize = CivTokens.Typography.FontSize.base,
                ),
                visualTransformation = visualTransformation,
                keyboardOptions = KeyboardOptions(
                    keyboardType = effectiveKeyboardType,
                    capitalization = if (mask != null || maskPattern.isNotEmpty()) KeyboardCapitalization.None else inputType.toCapitalization(),
                    imeAction = ImeAction.Done,
                ),
                singleLine = true,
                shape = RoundedCornerShape(CivTokens.Border.Radius.default_),
                colors = TextFieldDefaults.colors(
                    focusedContainerColor = if (readonly) readonlyBackground else backgroundColor,
                    unfocusedContainerColor = if (readonly) readonlyBackground else backgroundColor,
                    disabledContainerColor = backgroundColor,
                    focusedIndicatorColor = Color.Transparent,
                    unfocusedIndicatorColor = Color.Transparent,
                    disabledIndicatorColor = Color.Transparent,
                    errorIndicatorColor = Color.Transparent,
                ),
            )
        }
    }
}

// MARK: - Mask Visual Transformation

/**
 * Applies a mask pattern to raw input for display.
 * `#` in the pattern represents a user-entered digit.
 * All other characters are literals inserted automatically.
 */
internal class MaskVisualTransformation(private val pattern: String) : VisualTransformation {
    override fun filter(text: AnnotatedString): TransformedText {
        val rawText = text.text
        val formatted = StringBuilder()
        var rawIndex = 0

        for (char in pattern) {
            if (rawIndex >= rawText.length) break
            if (char == '#' || char == 'A' || char == '*') {
                formatted.append(rawText[rawIndex])
                rawIndex++
            } else {
                formatted.append(char)
            }
        }

        val offsetMapping = object : OffsetMapping {
            override fun originalToTransformed(offset: Int): Int {
                var raw = 0
                var transformed = 0
                for (ch in pattern) {
                    if (raw >= offset) break
                    transformed++
                    if (ch == '#' || ch == 'A' || ch == '*') raw++
                }
                return transformed.coerceAtMost(formatted.length)
            }

            override fun transformedToOriginal(offset: Int): Int {
                var raw = 0
                var transformed = 0
                for (ch in pattern) {
                    if (transformed >= offset) break
                    transformed++
                    if (ch == '#' || ch == 'A' || ch == '*') raw++
                }
                return raw.coerceAtMost(rawText.length)
            }
        }

        return TransformedText(AnnotatedString(formatted.toString()), offsetMapping)
    }
}

// MARK: - Input Type Mapping

private fun CivInputType.toKeyboardType(): KeyboardType = when (this) {
    CivInputType.Text -> KeyboardType.Text
    CivInputType.Email -> KeyboardType.Email
    CivInputType.Number -> KeyboardType.Decimal
    CivInputType.Password -> KeyboardType.Password
    CivInputType.Search -> KeyboardType.Text
    CivInputType.Telephone -> KeyboardType.Phone
    CivInputType.Url -> KeyboardType.Uri
}

private fun CivInputType.toCapitalization(): KeyboardCapitalization = when (this) {
    CivInputType.Email, CivInputType.Url -> KeyboardCapitalization.None
    else -> KeyboardCapitalization.Sentences
}

// MARK: - Preview

@Preview(showBackground = true, name = "CivTextInput Light")
@Composable
private fun CivTextInputPreview() {
    Column(modifier = Modifier.padding(16.dp)) {
        var name by remember { mutableStateOf("Jane Doe") }
        CivTextInput(
            label = "Full name",
            value = name,
            onValueChange = { name = it },
            hint = "First and last name",
            required = true,
        )

        var ssn by remember { mutableStateOf("") }
        CivTextInput(
            label = "Social Security number",
            value = ssn,
            onValueChange = { ssn = it },
            mask = CivInputMask.SSN,
        )

        var phone by remember { mutableStateOf("") }
        CivTextInput(
            label = "Phone number",
            value = phone,
            onValueChange = { phone = it },
            mask = CivInputMask.PhoneUs,
            width = CivInputWidth.Medium,
        )

        CivTextInput(
            label = "Notes",
            value = "Read-only content",
            onValueChange = {},
            readonly = true,
        )

        CivTextInput(
            label = "Disabled field",
            value = "",
            onValueChange = {},
            disabled = true,
            placeholder = "Disabled field",
        )
    }
}
