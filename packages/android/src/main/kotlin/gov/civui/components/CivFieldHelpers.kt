// CivUI — Shared form field helper composables
// Renders label, hint, and error rows with consistent styling and accessibility.

package gov.civui.components

import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import gov.civui.tokens.CivTokens

/**
 * Renders a form field label with optional required indicator.
 * Parallels web `renderLabel()`.
 */
@Composable
internal fun CivLabel(
    label: String,
    required: Boolean,
    labelColor: Color,
    errorColor: Color,
) {
    Row(
        modifier = Modifier.padding(bottom = CivTokens.Spacing._1),
    ) {
        Text(
            text = label,
            style = TextStyle(
                fontSize = CivTokens.Typography.FontSize.base,
                fontWeight = FontWeight.Bold,
            ),
            color = labelColor,
        )
        if (required) {
            Text(
                text = " *",
                style = TextStyle(
                    fontSize = CivTokens.Typography.FontSize.base,
                    fontWeight = FontWeight.Bold,
                ),
                color = errorColor,
                modifier = Modifier.semantics {
                    contentDescription = "required"
                },
            )
        }
    }
}

/**
 * Renders hint text below the label.
 * Parallels web `renderHint()`.
 */
@Composable
internal fun CivHint(
    text: String?,
    color: Color,
) {
    if (text != null) {
        Text(
            text = text,
            style = TextStyle(
                fontSize = CivTokens.Typography.FontSize.sm,
            ),
            color = color,
            modifier = Modifier.padding(bottom = CivTokens.Spacing._1),
        )
    }
}

/**
 * Renders an error message with TalkBack live region announcement.
 * Parallels web `renderError()` with `role="alert"`.
 */
@Composable
internal fun CivError(
    text: String?,
    color: Color,
) {
    if (text != null) {
        Text(
            text = text,
            style = TextStyle(
                fontSize = CivTokens.Typography.FontSize.sm,
                fontWeight = FontWeight.Bold,
            ),
            color = color,
            modifier = Modifier
                .padding(bottom = CivTokens.Spacing._1)
                .semantics {
                    liveRegion = LiveRegionMode.Assertive
                    error(text)
                },
        )
    }
}
