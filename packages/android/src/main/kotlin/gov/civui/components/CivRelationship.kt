// CivUI — CivRelationship for Jetpack Compose
// Compound relationship form with name, type, dates, and status fields.

package gov.civui.components

import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

@Composable
fun CivRelationship(
    legend: String = "",
    preset: String = "",
    options: String = "",
    showName: Boolean = true,
    hideName: Boolean = false,
    showDeceased: Boolean = false,
    deceasedAssumed: Boolean = false,
    showDivorceDate: Boolean = false,
    showAdoptionDate: Boolean = false,
    nameError: String = "",
    firstError: String = "",
    middleError: String = "",
    lastError: String = "",
    relationshipError: String = "",
    marriageDateError: String = "",
    divorceDateError: String = "",
    dateOfBirthError: String = "",
    adoptionDateError: String = "",
    dateOfDeathError: String = "",
    otherDescriptionError: String = "",
    name: String = "",
    value: String = "",
    onValueChange: (String) -> Unit = {},
    hint: String = "",
    error: String = "",
    required: Boolean = false,
    disabled: Boolean = false,
    readonly: Boolean = false,
    onInput: ((String) -> Unit)? = null,
    onChange: ((String) -> Unit)? = null,
    onAnalytics: ((String, Map<String, Any>?) -> Unit)? = null,
    modifier: Modifier = Modifier,
) {
    Column(modifier = modifier) {}
}
