// CivUI — CivConditional for Jetpack Compose
// Simple show/hide wrapper with AnimatedVisibility for smooth transitions.
// The parent manages visibility logic.

package gov.civui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp

/**
 * Conditional visibility container for government applications.
 *
 * Shows or hides its content based on a boolean flag. Uses
 * [AnimatedVisibility] for smooth expand/collapse transitions.
 * On native platforms the parent owns the visibility state directly.
 *
 * Usage:
 * ```kotlin
 * var hasMailingAddress by remember { mutableStateOf(false) }
 *
 * CivToggle(
 *     label = "Different mailing address?",
 *     checked = hasMailingAddress,
 *     onCheckedChange = { hasMailingAddress = it },
 * )
 *
 * CivConditional(visible = hasMailingAddress) {
 *     CivTextInput(
 *         label = "Mailing address",
 *         value = mailingAddress,
 *         onValueChange = { mailingAddress = it },
 *     )
 * }
 * ```
 */
@Composable
fun CivConditional(
    visible: Boolean,
    `when`: String = "",
    equals: String = "",
    notEquals: String = "",
    includes: String = "",
    hasValue: Boolean = false,
    pattern: String = "",
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit,
) {
    AnimatedVisibility(
        visible = visible,
        modifier = modifier,
        enter = fadeIn() + expandVertically(),
        exit = fadeOut() + shrinkVertically(),
    ) {
        content()
    }
}

// MARK: - Preview

@Preview(showBackground = true, name = "CivConditional")
@Composable
private fun CivConditionalPreview() {
    Column(modifier = Modifier.padding(16.dp)) {
        var showMore by remember { mutableStateOf(false) }
        var address by remember { mutableStateOf("") }

        CivToggle(
            label = "Different mailing address?",
            checked = showMore,
            onCheckedChange = { showMore = it },
        )

        CivConditional(visible = showMore) {
            CivTextInput(
                label = "Mailing address",
                value = address,
                onValueChange = { address = it },
                required = true,
            )
        }
    }
}
