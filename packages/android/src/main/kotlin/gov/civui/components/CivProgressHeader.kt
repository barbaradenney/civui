// CivUI — CivProgressHeader for Jetpack Compose
// Compact step counter: "Step X of Y: Title" with configurable size.

package gov.civui.components

import androidx.compose.foundation.layout.Column
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.withStyle

/**
 * Compact step counter header for multi-step forms.
 *
 * Displays "Step X of Y: Title" with configurable size and heading level.
 * Mirrors the web `civ-progress-header` component.
 */
@Composable
fun CivProgressHeader(
    current: Int = 0,
    total: Int = 0,
    stepTitle: String = "",
    size: String = "secondary",
    headingLevel: Int = 2,
    modifier: Modifier = Modifier,
) {
    if (total > 1) {
        val clamped = current.coerceIn(0, total - 1)
        Column(modifier = modifier) {
            Text(
                text = buildAnnotatedString {
                    withStyle(SpanStyle(fontWeight = FontWeight.Bold)) {
                        append("Step ${clamped + 1} of $total: ")
                    }
                    append(stepTitle)
                },
                modifier = Modifier.semantics { heading() },
            )
        }
    }
}
