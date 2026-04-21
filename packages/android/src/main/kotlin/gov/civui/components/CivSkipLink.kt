// CivUI — CivSkipLink for Jetpack Compose
// Accessible skip navigation link. Visually hidden but available to TalkBack.
// Allows screen reader users to bypass navigation and jump to main content.

package gov.civui.components

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp

/**
 * Accessible skip navigation link for government applications.
 *
 * Renders a visually hidden link that TalkBack users can activate
 * to skip navigation elements and jump directly to the main content.
 * The link is invisible but remains in the accessibility tree.
 *
 * Usage:
 * ```kotlin
 * CivSkipLink(
 *     label = "Skip to main content",
 *     onActivate = { scrollState.scrollTo(mainContentOffset) },
 * )
 * ```
 */
@Composable
fun CivSkipLink(
    modifier: Modifier = Modifier,
    label: String = "Skip to main content",
    onActivate: (() -> Unit)? = null,
) {
    TextButton(
        onClick = { onActivate?.invoke() },
        modifier = modifier
            .size(0.dp)
            .alpha(0f)
            .semantics {
                contentDescription = label
            },
    ) {
        Text(label)
    }
}

// MARK: - Preview

@Preview(showBackground = true, name = "CivSkipLink")
@Composable
private fun CivSkipLinkPreview() {
    Column {
        CivSkipLink()
        Text("Main content area")
    }
}
