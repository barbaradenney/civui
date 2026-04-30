// CivUI — CivActionLink for Jetpack Compose
// Unified action link for phone calls and email compose.
// Renders the correct protocol, icon, and formatted display text based on type.

package gov.civui.components

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview

/**
 * Unified action link for device actions (phone call, email compose).
 *
 * Usage:
 * ```kotlin
 * CivActionLink(type = "phone", number = "8005551234")
 * CivActionLink(type = "email", address = "help@va.gov", subject = "Question")
 * ```
 */
@Composable
fun CivActionLink(
    type: String = "phone",
    number: String = "",
    address: String = "",
    subject: String = "",
    label: String = "",
    disabled: Boolean = false,
    modifier: Modifier = Modifier,
) {
    // TODO: Implement with CivLink delegation
}

@Preview(showBackground = true, name = "CivActionLink")
@Composable
private fun CivActionLinkPreview() {
    CivActionLink(type = "phone", number = "8005551234")
}
