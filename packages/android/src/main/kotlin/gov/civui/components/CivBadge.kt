// CivUI — CivBadge for Jetpack Compose
// Status badge with count, dot, and variant support.

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
    variant: String = "neutral",
    badgeStyle: String = "default",
    spacing: String = "default",
    overlay: Boolean = false,
    modifier: Modifier = Modifier,
) {
    Column(modifier = modifier) {}
}
