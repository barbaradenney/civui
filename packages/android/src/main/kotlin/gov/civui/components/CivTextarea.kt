// CivUI — CivTextarea for Jetpack Compose
// Accessible multi-line text input with optional word/character count.
// Renders: label -> hint -> error -> textarea -> count (Section 508 compliant)

package gov.civui.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.border
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
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
import kotlinx.coroutines.delay
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.graphics.Color
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
 * Accessible multi-line text area for government applications.
 *
 * Supports:
 * - Character count with maxlength
 * - Word count with maxwords
 * - Readonly mode
 * - TalkBack-announced count updates
 *
 * Usage:
 * ```kotlin
 * var notes by remember { mutableStateOf("") }
 * CivTextarea(
 *     label = "Additional comments",
 *     value = notes,
 *     onValueChange = { notes = it },
 *     hint = "Describe your situation in detail",
 *     maxwords = 200,
 * )
 * ```
 */
@Composable
fun CivTextarea(
    label: String,
    value: String,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier,
    hint: String = "",
    error: String = "",
    required: Boolean = false,
    disabled: Boolean = false,
    readonly: Boolean = false,
    placeholder: String = "",
    rows: Int = 5,
    maxlength: Int? = null,
    maxwords: Int? = null,
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
    val mutedColor = if (isDark) CivTokens.DarkColors.Base.default_ else CivTokens.Colors.Base.default_
    val borderColor by animateColorAsState(
        targetValue = when {
            error.isNotEmpty() -> errorColor
            isFocused -> if (isDark) CivTokens.DarkColors.Primary.default_ else CivTokens.Colors.Primary.default_
            else -> if (isDark) CivTokens.DarkColors.Base.light else CivTokens.Colors.Base.light
        },
        label = "borderColor",
    )
    val backgroundColor = if (isDark) CivTokens.DarkColors.White.default_ else CivTokens.Colors.White.default_
    val readonlyBackground = if (isDark) CivTokens.DarkColors.Base.lightest else CivTokens.Colors.Base.lightest

    // Word count
    val wordCount by remember(value) {
        derivedStateOf {
            if (value.isBlank()) 0
            else value.trim().split(Regex("\\s+")).count { it.isNotEmpty() }
        }
    }

    // Character count
    val charCount = value.length

    // Show word count only when maxwords is set and maxlength is not
    val showWordCount = maxwords != null && maxwords > 0 && (maxlength == null || maxlength <= 0)
    val showCharCount = maxlength != null && maxlength > 0

    // Word count error
    val wordCountError = if (showWordCount && maxwords != null && wordCount > maxwords) {
        "${wordCount - maxwords} words over limit"
    } else null

    val effectiveError = error.ifEmpty { formError.ifEmpty { wordCountError ?: "" } }

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
        CivHint(
            text = hint.ifEmpty { null },
            color = hintColor,
        )

        // 3. Error
        CivError(
            text = effectiveError.ifEmpty { null },
            color = errorColor,
        )

        // 4. Textarea
        // Approximate height: rows * line height (24dp per row)
        val minHeight = (rows * 24).dp

        val fieldModifier = Modifier
            .fillMaxWidth()
            .heightIn(min = minHeight)
            .civFocusRing(isFocused)
            .border(
                width = if (effectiveError.isNotEmpty()) CivTokens.Border.Width._2 else CivTokens.Border.Width.default_,
                color = borderColor,
                shape = RoundedCornerShape(CivTokens.Border.Radius.default_),
            )
            .onFocusChanged { focusState ->
                val wasFocused = isFocused
                isFocused = focusState.isFocused
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
                if (hint.isNotEmpty()) append(". $hint")
                if (effectiveError.isNotEmpty()) append(". Error: $effectiveError")
                if (readonly) append(", read only")
            }
            if (effectiveError.isNotEmpty()) {
                error(effectiveError)
            }
        }

        TextField(
            value = value,
            onValueChange = { newValue ->
                val filtered = if (maxlength != null && maxlength > 0) {
                    newValue.take(maxlength)
                } else {
                    newValue
                }
                onValueChange(filtered)
                onInput?.invoke(filtered)
            },
            modifier = fieldModifier.then(accessibilityModifier),
            enabled = !disabled,
            readOnly = readonly,
            placeholder = if (placeholder.isNotEmpty()) {
                { Text(text = placeholder, color = hintColor) }
            } else null,
            textStyle = TextStyle(
                fontSize = CivTokens.Typography.FontSize.base,
            ),
            singleLine = false,
            minLines = rows,
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

        // 5. Character count (debounced SR announcement)
        if (showCharCount && maxlength != null) {
            val remaining = maxlength - charCount
            val isOver = remaining < 0
            var debouncedCharAnnouncement by remember { mutableStateOf("") }

            LaunchedEffect(remaining) {
                delay(1000)
                debouncedCharAnnouncement = CivLocale.t("inputCharsRemaining", "count" to remaining)
            }

            Text(
                text = CivLocale.t("inputCharsRemaining", "count" to remaining),
                style = TextStyle(
                    fontSize = CivTokens.Typography.FontSize.sm,
                    fontWeight = if (isOver) FontWeight.Bold else FontWeight.Normal,
                ),
                color = if (isOver) errorColor else mutedColor,
                modifier = Modifier
                    .padding(top = CivTokens.Spacing._0_5)
                    .semantics {
                        liveRegion = LiveRegionMode.Polite
                        contentDescription = debouncedCharAnnouncement
                    },
            )
        }

        // 6. Word count (debounced SR announcement)
        if (showWordCount && maxwords != null) {
            val remaining = maxwords - wordCount
            val isOver = remaining < 0
            var debouncedWordAnnouncement by remember { mutableStateOf("") }

            LaunchedEffect(remaining) {
                delay(1000)
                debouncedWordAnnouncement = CivLocale.t("textareaWordsRemaining", "count" to remaining)
            }

            Text(
                text = CivLocale.t("textareaWordsRemaining", "count" to remaining),
                style = TextStyle(
                    fontSize = CivTokens.Typography.FontSize.sm,
                    fontWeight = if (isOver) FontWeight.Bold else FontWeight.Normal,
                ),
                color = if (isOver) errorColor else mutedColor,
                modifier = Modifier
                    .padding(top = CivTokens.Spacing._0_5)
                    .semantics {
                        liveRegion = LiveRegionMode.Polite
                        contentDescription = debouncedWordAnnouncement
                    },
            )
        }
    }
}

// MARK: - Preview

@Preview(showBackground = true, name = "CivTextarea")
@Composable
private fun CivTextareaPreview() {
    Column(modifier = Modifier.padding(16.dp)) {
        var notes by remember { mutableStateOf("") }
        CivTextarea(
            label = "Additional comments",
            value = notes,
            onValueChange = { notes = it },
            hint = "Describe your situation in detail",
            required = true,
            maxwords = 200,
        )

        var bio by remember { mutableStateOf("") }
        CivTextarea(
            label = "Biography",
            value = bio,
            onValueChange = { bio = it },
            maxlength = 500,
            rows = 3,
        )

        CivTextarea(
            label = "Previous response",
            value = "This content cannot be modified.",
            onValueChange = {},
            readonly = true,
        )
    }
}
