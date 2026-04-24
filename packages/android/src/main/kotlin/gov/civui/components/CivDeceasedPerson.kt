// CivUI — CivDeceasedPerson for Jetpack Compose
// Compound field for collecting information about a person who has died.
// Used on VA burial (21P-530), SSA survivor benefit, and probate forms.
// Plain-language labels — "the person who died", not "decedent".

package gov.civui.components

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import gov.civui.tokens.CivTokens

/** Structured value matching the web `DeceasedPersonValue` interface. */
data class DeceasedPersonValue(
    val first: String = "",
    val middle: String = "",
    val last: String = "",
    val suffix: String = "",
    val dateOfBirth: String = "",
    val dateOfDeath: String = "",
    val relationship: String = "",
)

private val RELATIONSHIP_OPTIONS = listOf(
    "" to "- Select -",
    "spouse" to "Spouse",
    "parent" to "Parent",
    "child" to "Child",
    "sibling" to "Sibling",
    "other" to "Other",
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CivDeceasedPerson(
    value: DeceasedPersonValue,
    onChange: (DeceasedPersonValue) -> Unit,
    modifier: Modifier = Modifier,
    legend: String = "About the person who died",
    name: String = "deceased",
    hint: String = "",
    error: String = "",
    nameError: String = "",
    dateOfBirthError: String = "",
    dateOfDeathError: String = "",
    relationshipError: String = "",
    hideRelationship: Boolean = false,
    required: Boolean = false,
    disabled: Boolean = false,
    readonly: Boolean = false,
) {
    val isDark = isSystemInDarkTheme()
    val errorColor = if (isDark) CivTokens.DarkColors.Error.default_ else CivTokens.Colors.Error.default_
    val hintColor = if (isDark) CivTokens.DarkColors.Base.dark else CivTokens.Colors.Base.dark

    var relationshipExpanded by remember { mutableStateOf(false) }
    val relationshipLabel = RELATIONSHIP_OPTIONS.firstOrNull { it.first == value.relationship }?.second ?: ""

    Column(
        verticalArrangement = Arrangement.spacedBy(CivTokens.Spacing._4),
        modifier = modifier,
    ) {
        if (legend.isNotEmpty()) {
            Text(
                legend + (if (required) " (required)" else ""),
                fontSize = CivTokens.Typography.FontSize.lg,
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier.semantics { this.heading() },
            )
        }
        if (hint.isNotEmpty()) {
            Text(hint, fontSize = CivTokens.Typography.FontSize.sm, color = hintColor)
        }
        if (error.isNotEmpty()) {
            Text(
                error,
                fontSize = CivTokens.Typography.FontSize.sm,
                color = errorColor,
                modifier = Modifier.semantics { contentDescription = error },
            )
        }

        Column(verticalArrangement = Arrangement.spacedBy(CivTokens.Spacing._3)) {
            Text("Their name", fontWeight = FontWeight.Medium)
            TextField(
                value = value.first,
                onValueChange = { onChange(value.copy(first = it)) },
                label = { Text("First name") },
                enabled = !disabled,
                readOnly = readonly,
                modifier = Modifier.fillMaxWidth(),
            )
            TextField(
                value = value.middle,
                onValueChange = { onChange(value.copy(middle = it)) },
                label = { Text("Middle name") },
                enabled = !disabled,
                readOnly = readonly,
                modifier = Modifier.fillMaxWidth(),
            )
            TextField(
                value = value.last,
                onValueChange = { onChange(value.copy(last = it)) },
                label = { Text("Last name") },
                enabled = !disabled,
                readOnly = readonly,
                modifier = Modifier.fillMaxWidth(),
            )
            if (nameError.isNotEmpty()) {
                Text(nameError, fontSize = CivTokens.Typography.FontSize.sm, color = errorColor)
            }
        }

        Column(verticalArrangement = Arrangement.spacedBy(CivTokens.Spacing._2)) {
            Text("Date of birth")
            TextField(
                value = value.dateOfBirth,
                onValueChange = { onChange(value.copy(dateOfBirth = it)) },
                placeholder = { Text("YYYY-MM-DD") },
                enabled = !disabled,
                readOnly = readonly,
                modifier = Modifier.fillMaxWidth(),
            )
            if (dateOfBirthError.isNotEmpty()) {
                Text(dateOfBirthError, fontSize = CivTokens.Typography.FontSize.sm, color = errorColor)
            }
        }

        Column(verticalArrangement = Arrangement.spacedBy(CivTokens.Spacing._2)) {
            Text("Date of death" + (if (required) " (required)" else ""))
            TextField(
                value = value.dateOfDeath,
                onValueChange = { onChange(value.copy(dateOfDeath = it)) },
                placeholder = { Text("YYYY-MM-DD") },
                enabled = !disabled,
                readOnly = readonly,
                modifier = Modifier.fillMaxWidth(),
            )
            if (dateOfDeathError.isNotEmpty()) {
                Text(dateOfDeathError, fontSize = CivTokens.Typography.FontSize.sm, color = errorColor)
            }
        }

        if (!hideRelationship) {
            Column(verticalArrangement = Arrangement.spacedBy(CivTokens.Spacing._2)) {
                Text("Their relationship to you")
                ExposedDropdownMenuBox(
                    expanded = relationshipExpanded,
                    onExpandedChange = { if (!disabled) relationshipExpanded = it },
                ) {
                    TextField(
                        value = relationshipLabel,
                        onValueChange = {},
                        readOnly = true,
                        enabled = !disabled,
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = relationshipExpanded) },
                        modifier = Modifier.fillMaxWidth().menuAnchor(),
                    )
                    androidx.compose.material3.ExposedDropdownMenu(
                        expanded = relationshipExpanded,
                        onDismissRequest = { relationshipExpanded = false },
                    ) {
                        RELATIONSHIP_OPTIONS.forEach { (rValue, rLabel) ->
                            DropdownMenuItem(
                                text = { Text(rLabel) },
                                onClick = {
                                    onChange(value.copy(relationship = rValue))
                                    relationshipExpanded = false
                                },
                            )
                        }
                    }
                }
                if (relationshipError.isNotEmpty()) {
                    Text(relationshipError, fontSize = CivTokens.Typography.FontSize.sm, color = errorColor)
                }
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun CivDeceasedPersonPreview() {
    var person by remember { mutableStateOf(DeceasedPersonValue()) }
    CivDeceasedPerson(
        value = person,
        onChange = { person = it },
        legend = "About your spouse",
        required = true,
        modifier = Modifier.padding(16.dp),
    )
}
