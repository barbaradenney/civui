// CivUI — CivReadMore for Jetpack Compose
// Two-stage content disclosure (mirrors the web civ-read-more component).
//
// Placeholder body — the prop surface satisfies schema parity. The
// implementation should wire a Compose Column with the teaser always
// visible and an AnimatedVisibility for the rest region. See
// audit-debt.md for status.

package gov.civui.components

import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

/**
 * Accessible two-stage disclosure: a teaser paragraph stays visible
 * at all times; a "Read more" button reveals additional content.
 */
@Composable
fun CivReadMore(
    open: Boolean = false,
    moreLabel: String = "",
    lessLabel: String = "",
    icon: String = "",
    /**
     * Trigger padding density: "default" or "sm". Matches the
     * design-system `spacing` convention used by `CivAlert`, `CivCard`,
     * `CivListItem`, and the data-grid input controls.
     */
    spacing: String = "default",
    /**
     * Trigger size: "default" or "sm". **Deprecated** — use `spacing`
     * instead. Same allowed values, same effect. Will be removed in a
     * future release.
     */
    size: String = "default",
    inline: Boolean = false,
    noFadeTrigger: Boolean = false,
    modifier: Modifier = Modifier,
    onToggle: ((Boolean) -> Unit)? = null,
    onAnalytics: ((event: String, data: Map<String, Any>?) -> Unit)? = null,
    teaser: @Composable () -> Unit = {},
    rest: @Composable () -> Unit = {},
) {
    Column(modifier = modifier) {
        // Placeholder — see audit-debt.md for native implementation status.
    }
}
