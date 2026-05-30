// CivUI — CivIcon for Jetpack Compose
// Renders Material Symbols icons using the android mappings from icon-library.ts.
// Uses Material 3 Icon composable for consistent rendering and TalkBack support.

package gov.civui.components

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowDownward
import androidx.compose.material.icons.filled.ArrowUpward
import androidx.compose.material.icons.filled.CalendarToday
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.ChevronLeft
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.DragHandle
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Error
import androidx.compose.material.icons.filled.ExpandLess
import androidx.compose.material.icons.filled.ExpandMore
import androidx.compose.material.icons.filled.FilterList
import androidx.compose.material.icons.filled.FileDownload
import androidx.compose.material.icons.filled.FileUpload
import androidx.compose.material.icons.filled.Help
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Mail
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.MoreHoriz
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.filled.OpenInNew
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Print
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.StarBorder
import androidx.compose.material.icons.filled.Undo
import androidx.compose.material.icons.filled.UnfoldMore
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import gov.civui.tokens.CivTokens

/**
 * Maps CivUI icon names (from icon-library.ts) to Material Icons vectors.
 * Keys match the `android` field in the web icon definitions.
 */
private val iconMap: Map<String, ImageVector> = mapOf(
    // Navigation
    "chevron_right" to Icons.Filled.ChevronRight,
    "chevron_left" to Icons.Filled.ChevronLeft,
    "expand_more" to Icons.Filled.ExpandMore,
    "expand_less" to Icons.Filled.ExpandLess,
    "arrow_forward" to Icons.AutoMirrored.Filled.ArrowForward,
    "arrow_back" to Icons.AutoMirrored.Filled.ArrowBack,
    "arrow_upward" to Icons.Filled.ArrowUpward,
    "arrow_downward" to Icons.Filled.ArrowDownward,
    "undo" to Icons.Filled.Undo,
    "open_in_new" to Icons.Filled.OpenInNew,

    // Actions
    "close" to Icons.Filled.Close,
    "add" to Icons.Filled.Add,
    "remove" to Icons.Filled.Remove,
    "menu" to Icons.Filled.Menu,
    "more_vert" to Icons.Filled.MoreVert,
    "more_horiz" to Icons.Filled.MoreHoriz,
    "search" to Icons.Filled.Search,
    "edit" to Icons.Filled.Edit,

    // Status
    "check" to Icons.Filled.Check,
    "check_circle" to Icons.Filled.CheckCircle,
    "error" to Icons.Filled.Error,
    "warning" to Icons.Filled.Warning,
    "info" to Icons.Filled.Info,
    "help" to Icons.Filled.Help,

    // Form
    "calendar_today" to Icons.Filled.CalendarToday,
    "location_on" to Icons.Filled.LocationOn,
    "unfold_more" to Icons.Filled.UnfoldMore,

    // Media
    "upload" to Icons.Filled.FileUpload,
    "download" to Icons.Filled.FileDownload,
    "filter_list" to Icons.Filled.FilterList,
    "content_copy" to Icons.Filled.ContentCopy,
    "delete" to Icons.Filled.Delete,

    // UI Chrome
    "drag_handle" to Icons.Filled.DragHandle,
    "lock" to Icons.Filled.Lock,
    "home" to Icons.Filled.Home,
    "settings" to Icons.Filled.Settings,
    "star_border" to Icons.Filled.StarBorder,
    "star" to Icons.Filled.Star,
    "print" to Icons.Filled.Print,
    "person" to Icons.Filled.Person,
    "mail" to Icons.Filled.Mail,
)

/**
 * Maps CivUI icon names (kebab-case, from web) to their Android material name.
 * Allows using either `"check-circle"` or `"check_circle"`.
 */
private val civNameToAndroid: Map<String, String> = mapOf(
    "chevron-right" to "chevron_right",
    "chevron-left" to "chevron_left",
    "chevron-down" to "expand_more",
    "chevron-up" to "expand_less",
    "arrow-right" to "arrow_forward",
    "arrow-left" to "arrow_back",
    "arrow-up" to "arrow_upward",
    "arrow-down" to "arrow_downward",
    "arrow-back" to "undo",
    "external-link" to "open_in_new",
    "close" to "close",
    "plus" to "add",
    "minus" to "remove",
    "menu" to "menu",
    "more-vertical" to "more_vert",
    "more-horizontal" to "more_horiz",
    "search" to "search",
    "edit" to "edit",
    "check" to "check",
    "check-circle" to "check_circle",
    "error" to "error",
    "warning" to "warning",
    "info" to "info",
    "help" to "help",
    "required-indicator" to "emergency",
    "sort-asc" to "arrow_upward",
    "sort-desc" to "arrow_downward",
    "sort-none" to "unfold_more",
    "calendar" to "calendar_today",
    "location" to "location_on",
    "upload" to "upload",
    "download" to "download",
    "filter" to "filter_list",
    "copy" to "content_copy",
    "trash" to "delete",
    "grip" to "drag_handle",
    "loading" to "progress_activity",
    "lock" to "lock",
    "home" to "home",
    "settings" to "settings",
    "star" to "star_border",
    "star-filled" to "star",
    "print" to "print",
    "user" to "person",
    "mail" to "mail",
)

/**
 * Resolves a CivUI icon name (kebab-case or Android underscore name)
 * to a Material Icons ImageVector.
 *
 * @return The ImageVector, or null if the icon name is not recognized.
 */
fun resolveIcon(name: String): ImageVector? {
    // Try direct Android name lookup first
    iconMap[name]?.let { return it }
    // Try CivUI kebab-case name
    val androidName = civNameToAndroid[name] ?: return null
    return iconMap[androidName]
}

/**
 * Accessible icon component for government applications.
 *
 * Renders a Material Symbol icon by CivUI name or Android name.
 * Supports decorative mode (no TalkBack announcement) and
 * informative mode (with content description).
 *
 * Usage:
 * ```kotlin
 * // Decorative icon (announced as part of surrounding text)
 * CivIcon(name = "check-circle")
 *
 * // Informative icon (TalkBack announces the label)
 * CivIcon(name = "warning", contentDescription = "Warning")
 *
 * // With custom color and size
 * CivIcon(
 *     name = "error",
 *     contentDescription = "Error",
 *     tint = CivTokens.Colors.Error.default_,
 *     size = 32.dp,
 * )
 * ```
 */
@Composable
fun CivIcon(
    name: String,
    modifier: Modifier = Modifier,
    contentDescription: String? = null,
    tint: Color = Color.Unspecified,
    size: Dp = 24.dp,
) {
    val isDark = isSystemInDarkTheme()
    val defaultTint = if (isDark) CivTokens.DarkColors.Base.darkest else CivTokens.Colors.Base.darkest

    val imageVector = resolveIcon(name) ?: return

    val effectiveTint = if (tint == Color.Unspecified) defaultTint else tint

    Icon(
        imageVector = imageVector,
        contentDescription = contentDescription,
        modifier = modifier.then(
            Modifier.padding(0.dp) // placeholder for size control
        ),
        tint = effectiveTint,
    )
}
