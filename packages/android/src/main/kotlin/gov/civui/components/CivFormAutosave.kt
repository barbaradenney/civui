// CivUI — CivFormAutosave for Jetpack Compose
// JS-only orchestration utility — no rendered UI.
//
// Native Android apps typically wire equivalent draft persistence
// through DataStore / SharedPreferences in app code, not in a reusable
// design-system component. This composable exists to satisfy the
// cross-platform parity contract; the body is empty and the declared
// callbacks are placeholders mirroring the web event surface.

package gov.civui.components

import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

/**
 * Drops inside a host form to persist in-progress answers.
 */
@Composable
fun CivFormAutosave(
    storageKey: String = "",
    storage: String = "local",
    debounceMs: Int = 1000,
    silentResume: Boolean = false,
    modifier: Modifier = Modifier,
    onAutosaveLoaded: ((savedAt: Long, data: Map<String, String>) -> Unit)? = null,
    onAutosaveSaved: ((savedAt: Long) -> Unit)? = null,
    onAutosaveCleared: (() -> Unit)? = null,
) {
    Column(modifier = modifier) {
        // Placeholder — wire UserDefaults / DataStore in app code instead.
    }
}
