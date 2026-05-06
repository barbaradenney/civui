// CivUI — CivSupportResources for Jetpack Compose
// Crisis and support contact links for sensitive forms.

package gov.civui.components

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

/**
 * Support resources callout for sensitive forms.
 *
 * Renders a heading with slotted action links for crisis hotlines,
 * emails, etc. Mirrors the web `civ-support-resources` component.
 */
@Composable
fun CivSupportResources(
    heading: String = "",
    headingLevel: Int = 3,
    tone: String = "default",
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit = {},
) {
    Column(modifier = modifier) {
        if (heading.isNotEmpty()) {
            Text(text = heading, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(8.dp))
        }
        content()
    }
}
