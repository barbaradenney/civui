// CivUI — CivList + CivListItem for Jetpack Compose
// Generic list primitive. CivListItem with `href` becomes the whole-row click target;
// without href it's a static row. Same visual rhythm in both cases.

package gov.civui.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Divider
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun CivList(
    modifier: Modifier = Modifier,
    dividers: Boolean = false,
    spacing: String = "default",
    content: @Composable () -> Unit,
) {
    Column(modifier = modifier.fillMaxWidth()) {
        content()
    }
}

@Composable
fun CivListItem(
    modifier: Modifier = Modifier,
    href: String = "",
    current: Boolean = false,
    heading: String = "",
    description: String = "",
    error: String = "",
    onTap: (() -> Unit)? = null,
    start: (@Composable () -> Unit)? = null,
    end: (@Composable () -> Unit)? = null,
    content: @Composable () -> Unit,
) {
    val isLink = href.isNotEmpty()
    val rowModifier = if (isLink && onTap != null) {
        modifier.fillMaxWidth().clickable { onTap() }
    } else {
        modifier.fillMaxWidth()
    }

    Row(
        modifier = rowModifier.padding(vertical = 16.dp),
        horizontalArrangement = Arrangement.spacedBy(16.dp),
        verticalAlignment = Alignment.Top,
    ) {
        Column(modifier = Modifier.weight(1f)) { content() }
        if (end != null) end()
    }
}
