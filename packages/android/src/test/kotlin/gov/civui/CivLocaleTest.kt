package gov.civui

import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Test
import gov.civui.i18n.CivLocale

class CivLocaleTest {
    @After
    fun tearDown() {
        CivLocale.reset()
    }

    @Test
    fun defaultStringLookup() {
        assertEquals("(required)", CivLocale.t("required"))
    }

    @Test
    fun overrideString() {
        CivLocale.setStrings(mapOf("required" to "(obligatorio)"))
        assertEquals("(obligatorio)", CivLocale.t("required"))
    }

    @Test
    fun resetRestoresDefaults() {
        CivLocale.setStrings(mapOf("required" to "xxx"))
        CivLocale.reset()
        assertEquals("(required)", CivLocale.t("required"))
    }

    @Test
    fun unknownKeyReturnsKey() {
        assertEquals("unknown_key", CivLocale.t("unknown_key"))
    }

    @Test
    fun multipleOverrides() {
        CivLocale.setStrings(mapOf(
            "required" to "(requerido)",
            "selectEmpty" to "- Seleccionar -",
        ))
        assertEquals("(requerido)", CivLocale.t("required"))
        assertEquals("- Seleccionar -", CivLocale.t("selectEmpty"))
    }

    @Test
    fun overrideDoesNotAffectOtherKeys() {
        CivLocale.setStrings(mapOf("required" to "(obligatorio)"))
        assertEquals("- Select -", CivLocale.t("selectEmpty"))
    }

    @Test
    fun templateSubstitution() {
        val result = CivLocale.t("fieldRequired", "label" to "Email")
        assertEquals("Email is required", result)
    }
}
