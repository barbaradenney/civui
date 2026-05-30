// CivUI — CivBadge for Jetpack Compose
// Status badge with count, dot, and intent support.

package gov.civui.components

import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

@Composable
fun CivBadge(
    label: String = "",
    count: Int? = null,
    max: Int = 99,
    dot: Boolean = false,
    intent: String = "neutral",
    emphasis: String = "secondary",
    spacing: String = "default",
    overlay: Boolean = false,
    withIcon: Boolean = false,
    iconStart: String = "",
    iconEnd: String = "",
    modifier: Modifier = Modifier,
) {
    Column(modifier = modifier) {}
}
