// CivUI — CivFormState for Jetpack Compose
// Manages form field registration, validation, reset, and error state.
// Enables declarative form validation patterns for government applications.

package gov.civui.components

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import gov.civui.i18n.CivLocale

/**
 * Form state manager for CivUI Compose forms.
 *
 * Coordinates field registration, validation, reset, and error
 * collection across form components. Fields register themselves
 * via [register] (typically in a DisposableEffect) and unregister
 * when removed from composition.
 *
 * Usage:
 * ```kotlin
 * val formState = remember { CivFormState() }
 *
 * CivForm(
 *     state = formState,
 *     onSubmit = {
 *         if (formState.validate()) {
 *             val data = formState.getFormData()
 *             // submit data
 *         }
 *     },
 * ) { submitHandler ->
 *     CivTextInput(
 *         label = "Full name",
 *         value = name,
 *         onValueChange = { name = it },
 *         required = true,
 *         formState = formState,
 *         name = "fullName",
 *     )
 * }
 * ```
 */
class CivFormState {
    var errors by mutableStateOf<List<CivFormFieldError>>(emptyList())
        private set

    private val fields = mutableMapOf<String, CivFieldRegistration>()

    /**
     * Registration data for a single form field.
     *
     * @param name Unique field name (used as key)
     * @param getValue Returns the current field value
     * @param setValue Sets the field value (for reset)
     * @param isRequired Whether the field is required
     * @param requiredMessage Custom "required" error message
     * @param getError Returns the current error string for this field
     * @param setError Sets the error string for this field
     * @param validate Optional custom validation function; returns error string or null
     * @param isPii If true, field value is excluded from getFormData()
     */
    data class CivFieldRegistration(
        val name: String,
        val getValue: () -> String,
        val setValue: (String) -> Unit,
        val isRequired: Boolean,
        val requiredMessage: String = "",
        val getError: () -> String,
        val setError: (String) -> Unit,
        val validate: (() -> String?)? = null,
        val isPii: Boolean = false,
    )

    /**
     * Register a field with this form state. Called from DisposableEffect.
     */
    fun register(reg: CivFieldRegistration) {
        fields[reg.name] = reg
    }

    /**
     * Unregister a field. Called from DisposableEffect onDispose.
     */
    fun unregister(name: String) {
        fields.remove(name)
    }

    /**
     * Validate all registered fields. Returns true if no errors.
     *
     * Checks required fields first, then runs custom validate functions.
     * Sets error messages on individual fields and populates [errors].
     */
    fun validate(): Boolean {
        clearErrors()
        val newErrors = mutableListOf<CivFormFieldError>()
        fields.values.sortedBy { it.name }.forEach { field ->
            // Check required
            if (field.isRequired && field.getValue().isEmpty()) {
                val msg = field.requiredMessage.ifEmpty {
                    CivLocale.t("fieldRequired", "label" to field.name)
                }
                newErrors.add(CivFormFieldError(field.name, msg))
                field.setError(msg)
                return@forEach
            }
            // Run custom validation on non-empty fields
            if (field.getValue().isNotEmpty()) {
                field.validate?.invoke()?.let { error ->
                    newErrors.add(CivFormFieldError(field.name, error))
                    field.setError(error)
                }
            }
        }
        errors = newErrors
        return errors.isEmpty()
    }

    /**
     * Reset all fields to empty and clear all errors.
     */
    fun reset() {
        errors = emptyList()
        fields.values.forEach {
            it.setValue("")
            it.setError("")
        }
    }

    /**
     * Clear all errors without resetting field values.
     */
    fun clearErrors() {
        errors = emptyList()
        fields.values.forEach { it.setError("") }
    }

    /**
     * Collect form data as a name-value map, excluding PII fields.
     */
    fun getFormData(): Map<String, String> {
        return fields.filter { !it.value.isPii }.mapValues { it.value.getValue() }
    }
}
