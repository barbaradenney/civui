// CivUI — CivForm for Jetpack Compose
// Form container with validation and accessible error summary.
// Renders: error summary -> content (Section 508 compliant)

package gov.civui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import gov.civui.i18n.CivLocale
import gov.civui.tokens.CivTokens

/**
 * Represents a form field validation error.
 */
data class CivFormFieldError(
    val fieldName: String,
    val message: String,
    val onFocus: (() -> Unit)? = null,
)

/**
 * Accessible form container for government applications.
 *
 * Provides validation coordination with an accessible error summary.
 * The error summary renders anchor-like links that can scroll to
 * and focus invalid fields. Validates required fields on submit.
 *
 * Usage:
 * ```kotlin
 * var errors by remember { mutableStateOf(listOf<CivFormFieldError>()) }
 *
 * CivForm(
 *     errors = errors,
 *     onSubmit = {
 *         val validationErrors = validate(...)
 *         errors = validationErrors
 *         if (validationErrors.isEmpty()) {
 *             // Submit form data
 *         }
 *     },
 * ) {
 *     CivTextInput(label = "Name", ...)
 *     // Submit button handled by the caller
 * }
 * ```
 */
@Composable
fun CivForm(
    errors: List<CivFormFieldError> = emptyList(),
    onSubmit: () -> Unit,
    modifier: Modifier = Modifier,
    state: CivFormState? = null,
    formLabel: String? = null,
    action: String = "",
    method: String = "POST",
    errorHeadingLevel: Int = 3,
    persist: String = "",
    prefill: Boolean = false,
    trackDirty: Boolean = false,
    prefillSrc: String = "",
    prefillHeaders: String = "",
    supportResourcesHeading: String = "",
    prefillData: Map<String, Any>? = null,
    onDirty: ((Boolean) -> Unit)? = null,
    onServerErrors: ((List<String>) -> Unit)? = null,
    onPrefillError: ((String) -> Unit)? = null,
    onPrefillApplied: ((Map<String, Any>) -> Unit)? = null,
    onInvalid: ((List<CivFormFieldError>) -> Unit)? = null,
    onAnalytics: ((event: String, data: Map<String, Any>?) -> Unit)? = null,
    content: @Composable (onSubmit: () -> Unit) -> Unit,
) {
    // Use state errors if state is provided and caller did not pass errors
    val effectiveErrors = if (state != null && errors.isEmpty()) state.errors else errors
    val isDark = isSystemInDarkTheme()

    val errorColor = if (isDark) CivTokens.DarkColors.Error.default_ else CivTokens.Colors.Error.default_
    val errorBg = if (isDark) CivTokens.DarkColors.Error.lighter else CivTokens.Colors.Error.lighter
    val errorBorderColor = if (isDark) CivTokens.DarkColors.Error.light else CivTokens.Colors.Error.light
    val labelColor = if (isDark) CivTokens.DarkColors.Base.darkest else CivTokens.Colors.Base.darkest

    Column(
        modifier = modifier
            .fillMaxWidth()
            .semantics {
                if (formLabel != null) {
                    contentDescription = formLabel
                }
            },
    ) {
        // Error summary (rendered above form content)
        if (effectiveErrors.isNotEmpty()) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .border(
                        width = CivTokens.Border.Width._2,
                        color = errorBorderColor,
                        shape = RoundedCornerShape(CivTokens.Border.Radius.default_),
                    )
                    .background(
                        color = errorBg,
                        shape = RoundedCornerShape(CivTokens.Border.Radius.default_),
                    )
                    .padding(CivTokens.Spacing._4)
                    .semantics {
                        liveRegion = LiveRegionMode.Assertive
                        contentDescription = if (effectiveErrors.size == 1) {
                            CivLocale.t("formErrorSingular")
                        } else {
                            CivLocale.t("formErrorPlural", "count" to effectiveErrors.size)
                        }
                    },
            ) {
                Text(
                    text = if (effectiveErrors.size == 1) {
                        CivLocale.t("formErrorSingular")
                    } else {
                        CivLocale.t("formErrorPlural", "count" to effectiveErrors.size)
                    },
                    style = TextStyle(
                        fontSize = CivTokens.Typography.FontSize.lg,
                        fontWeight = FontWeight.Bold,
                    ),
                    color = errorColor,
                    modifier = Modifier.padding(bottom = CivTokens.Spacing._2),
                )

                effectiveErrors.forEach { fieldError ->
                    Text(
                        text = fieldError.message,
                        style = TextStyle(
                            fontSize = CivTokens.Typography.FontSize.base,
                            textDecoration = TextDecoration.Underline,
                        ),
                        color = errorColor,
                        modifier = Modifier
                            .padding(bottom = CivTokens.Spacing._1)
                            .clickable {
                                fieldError.onFocus?.invoke()
                            }
                            .semantics {
                                contentDescription = "${fieldError.message}. Tap to go to field."
                            },
                    )
                }
            }
        }

        // Form content
        content {
            onAnalytics?.invoke("form-submit", mapOf("errorCount" to effectiveErrors.size))
            onSubmit()
        }
    }
}

// MARK: - Preview

@Preview(showBackground = true, name = "CivForm")
@Composable
private fun CivFormPreview() {
    Column(modifier = Modifier.padding(16.dp)) {
        var name by remember { mutableStateOf("") }
        var email by remember { mutableStateOf("") }
        var errors by remember { mutableStateOf(listOf<CivFormFieldError>()) }

        CivForm(
            errors = errors,
            onSubmit = {
                val newErrors = mutableListOf<CivFormFieldError>()
                if (name.isEmpty()) {
                    newErrors.add(CivFormFieldError("name", "Enter your full name"))
                }
                if (email.isEmpty()) {
                    newErrors.add(CivFormFieldError("email", "Enter your email address"))
                }
                errors = newErrors
            },
            formLabel = "Contact information form",
        ) { submitHandler ->
            CivTextInput(
                label = "Full name",
                value = name,
                onValueChange = { name = it },
                required = true,
                error = errors.find { it.fieldName == "name" }?.message ?: "",
            )

            CivTextInput(
                label = "Email address",
                value = email,
                onValueChange = { email = it },
                required = true,
                inputType = CivInputType.Email,
                error = errors.find { it.fieldName == "email" }?.message ?: "",
            )
        }
    }
}
