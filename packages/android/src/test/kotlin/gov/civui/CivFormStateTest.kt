package gov.civui

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import gov.civui.components.CivFormState

class CivFormStateTest {
    private lateinit var formState: CivFormState

    @Before
    fun setUp() {
        formState = CivFormState()
    }

    // MARK: - Registration and Form Data

    @Test
    fun registerAndGetFormData() {
        var nameValue = "Jane Doe"
        var emailValue = "jane@example.gov"

        formState.register(CivFormState.CivFieldRegistration(
            name = "name",
            getValue = { nameValue },
            setValue = { nameValue = it },
            isRequired = false,
            getError = { "" },
            setError = { },
        ))

        formState.register(CivFormState.CivFieldRegistration(
            name = "email",
            getValue = { emailValue },
            setValue = { emailValue = it },
            isRequired = false,
            getError = { "" },
            setError = { },
        ))

        val data = formState.getFormData()
        assertEquals("Jane Doe", data["name"])
        assertEquals("jane@example.gov", data["email"])
        assertEquals(2, data.size)
    }

    // MARK: - Required Validation

    @Test
    fun validateRequiredField() {
        var nameValue = ""
        var nameError = ""

        formState.register(CivFormState.CivFieldRegistration(
            name = "name",
            getValue = { nameValue },
            setValue = { nameValue = it },
            isRequired = true,
            getError = { nameError },
            setError = { nameError = it },
        ))

        val isValid = formState.validate()
        assertFalse(isValid)
        assertEquals(1, formState.errors.size)
        assertEquals("name", formState.errors.first().fieldName)
        assertTrue(nameError.contains("required"))

        // Fill in the field and re-validate
        nameValue = "Jane Doe"
        val isValidNow = formState.validate()
        assertTrue(isValidNow)
        assertTrue(formState.errors.isEmpty())
    }

    // MARK: - Custom Validation

    @Test
    fun validateCustomValidator() {
        var emailValue = "not-an-email"
        var emailError = ""

        formState.register(CivFormState.CivFieldRegistration(
            name = "email",
            getValue = { emailValue },
            setValue = { emailValue = it },
            isRequired = false,
            getError = { emailError },
            setError = { emailError = it },
            validate = {
                if (!emailValue.contains("@")) "Enter a valid email address" else null
            },
        ))

        val isValid = formState.validate()
        assertFalse(isValid)
        assertEquals(1, formState.errors.size)
        assertEquals("Enter a valid email address", emailError)

        // Fix the value and re-validate
        emailValue = "jane@example.gov"
        val isValidNow = formState.validate()
        assertTrue(isValidNow)
        assertTrue(formState.errors.isEmpty())
    }

    // MARK: - Reset

    @Test
    fun reset() {
        var nameValue = "Jane Doe"
        var nameError = "Some error"

        formState.register(CivFormState.CivFieldRegistration(
            name = "name",
            getValue = { nameValue },
            setValue = { nameValue = it },
            isRequired = false,
            getError = { nameError },
            setError = { nameError = it },
        ))

        formState.reset()

        assertEquals("", nameValue)
        assertEquals("", nameError)
        assertTrue(formState.errors.isEmpty())
    }

    // MARK: - Clear Errors

    @Test
    fun clearErrors() {
        var nameValue = ""
        var nameError = ""

        formState.register(CivFormState.CivFieldRegistration(
            name = "name",
            getValue = { nameValue },
            setValue = { nameValue = it },
            isRequired = true,
            getError = { nameError },
            setError = { nameError = it },
        ))

        // Trigger validation to create errors
        formState.validate()
        assertFalse(formState.errors.isEmpty())
        assertFalse(nameError.isEmpty())

        // Clear errors — values should remain
        formState.clearErrors()
        assertTrue(formState.errors.isEmpty())
        assertEquals("", nameError)
        assertEquals("", nameValue) // value was never set, still empty
    }

    // MARK: - PII Exclusion

    @Test
    fun piiExcludedFromFormData() {
        var nameValue = "Jane Doe"
        var ssnValue = "123-45-6789"

        formState.register(CivFormState.CivFieldRegistration(
            name = "name",
            getValue = { nameValue },
            setValue = { nameValue = it },
            isRequired = false,
            getError = { "" },
            setError = { },
            isPii = false,
        ))

        formState.register(CivFormState.CivFieldRegistration(
            name = "ssn",
            getValue = { ssnValue },
            setValue = { ssnValue = it },
            isRequired = false,
            getError = { "" },
            setError = { },
            isPii = true,
        ))

        val data = formState.getFormData()
        assertEquals("Jane Doe", data["name"])
        assertNull(data["ssn"])
        assertEquals(1, data.size)
    }

    // MARK: - Unregister

    @Test
    fun unregisterRemovesField() {
        var nameValue = "Jane"

        formState.register(CivFormState.CivFieldRegistration(
            name = "name",
            getValue = { nameValue },
            setValue = { nameValue = it },
            isRequired = false,
            getError = { "" },
            setError = { },
        ))

        formState.unregister("name")

        val data = formState.getFormData()
        assertNull(data["name"])
        assertTrue(data.isEmpty())
    }
}
