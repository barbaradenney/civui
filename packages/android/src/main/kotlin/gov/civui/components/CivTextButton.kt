// CivUI — CivTextButton for Jetpack Compose
// The small button primitive — a thin Compose element wrapping the
// shared text-btn visual idiom that confirm / toggle / disclosure /
// read-more all compose on web.
//
// Placeholder body — the prop surface satisfies schema parity. A real
// implementation should render the emphasis-tuned background /
// foreground (primary = filled brand, secondary = gray pill, tertiary
// = transparent text-link). See audit-debt.md for status.

package gov.civui.components

import androidx.compose.foundation.layout.Box
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

/** Visual emphasis level for the text-button family. */
enum class TextButtonEmphasis { PRIMARY, SECONDARY, TERTIARY }

/** Density variant. `SM` shrinks padding and font-size for dense prose. */
enum class TextButtonSpacing { DEFAULT, SM }

/**
 * Small inline click affordance.
 *
 * Use when you need the text-btn visual idiom but none of the state-
 * machine behaviors of [CivConfirmButton] (success receipt) or
 * [CivToggleButton] (pressed toggle). For page-level CTAs use
 * [CivButton]; for toolbar / row actions use [CivActionButton].
 */
@Composable
fun CivTextButton(
    label: String = "",
    emphasis: TextButtonEmphasis = TextButtonEmphasis.SECONDARY,
    spacing: TextButtonSpacing = TextButtonSpacing.DEFAULT,
    iconStart: String = "",
    iconEnd: String = "",
    type: String = "button",
    disabled: Boolean = false,
    modifier: Modifier = Modifier,
    onClick: (() -> Unit)? = null,
    onAnalytics: ((event: String, data: Map<String, Any>?) -> Unit)? = null,
) {
    Box(modifier = modifier) {
        // Placeholder — see audit-debt.md for native implementation status.
    }
}
