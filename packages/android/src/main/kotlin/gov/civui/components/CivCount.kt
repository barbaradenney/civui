// CivUI — CivCount for Jetpack Compose
// Numeric annotation with primary/secondary styles and notification overlay.

package gov.civui.components

import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

@Composable
fun CivCount(
    count: Int? = null,
    max: Int = 99,
    variant: String = "neutral",
    countStyle: String = "secondary",
    spacing: String = "default",
    overlay: Boolean = false,
    live: String = "off",
    modifier: Modifier = Modifier,
) {
    Column(modifier = modifier) {}
}
