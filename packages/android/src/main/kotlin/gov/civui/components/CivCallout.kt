// CivUI — CivCallout for Jetpack Compose
// Presentational callout chrome (mirrors the web civ-callout component).
//
// Placeholder body — the prop surface satisfies schema parity. The
// implementation should render a leading accent rule + padded
// container, sized by the active semantic palette. See audit-debt.md.

package gov.civui.components

import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

/**
 * Presentational primitive that frames content with a leading accent
 * border. Five semantic variants map to the design-system palette:
 * "default" (primary), "info", "warning", "error", "success".
 */
@Composable
fun CivCallout(
    variant: String = "default",
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit = {},
) {
    Column(modifier = modifier) {
        // Placeholder — see audit-debt.md for native implementation status.
    }
}
