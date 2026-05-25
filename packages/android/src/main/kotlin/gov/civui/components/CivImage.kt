// CivUI — CivImage for Jetpack Compose
// Responsive image with art-direction + format fallbacks. Mirrors civ-image.
//
// Placeholder body — see .claude/rules/audit-debt.md → "Native platform implementation pass".

package gov.civui.components

import androidx.compose.foundation.layout.Box
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

@Composable
fun CivImage(
    src: String = "",
    webpSrc: String = "",
    avifSrc: String = "",
    alt: String = "",
    width: Int = 0,
    height: Int = 0,
    ratio: String = "",
    fit: String = "cover",
    loading: String = "lazy",
    decoding: String = "async",
    fetchPriority: String = "auto",
    crossOrigin: String = "",
    referrerPolicy: String = "",
    variant: String = "content",
    rounded: Boolean = false,
    modifier: Modifier = Modifier,
) {
    Box(modifier = modifier) {
        // Placeholder — see audit-debt.md for native implementation status.
    }
}
