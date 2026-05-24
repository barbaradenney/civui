// CivUI — CivAlert for Jetpack Compose
// Accessible notification banner with variant-colored header bar and content area.
// Renders: header bar (heading + dismiss) -> content area (Section 508 compliant)

package gov.civui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.error
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import gov.civui.tokens.CivTokens

/**
 * Accessible alert/notification banner for government applications.
 *
 * Displays a colored header bar with heading text and an optional dismiss
 * button, plus a content area below with body text. Mirrors the web
 * `civ-alert` component.
 *
 * The `variant` controls semantic meaning and header bar color (info, warning,
 * error, success). The `alertStyle` controls content area background intensity
 * (primary, secondary, tertiary).
 *
 * TalkBack announces the alert with its variant role. Error variants use
 * `role="alert"` semantics for assertive announcement.
 *
 * Usage:
 * ```kotlin
 * CivAlert(
 *     variant = "error",
 *     heading = "Form submission failed",
 *     label = "Please correct the errors below and try again.",
 *     dismissible = true,
 *     onDismiss = { /* handle dismiss */ },
 * )
 * ```
 */
@Composable
fun CivAlert(
    modifier: Modifier = Modifier,
    variant: String = "info",
    alertStyle: String = "secondary",
    heading: String = "",
    label: String = "",
    dismissible: Boolean = false,
    slim: Boolean = false,
    headingLevel: Int = 4,
    spacing: String = "default",
    // Parity-only parameters; the collapse/banner behaviors are
    // deferred per the native-stubs entry in .claude/rules/audit-debt.md
    // (modal/disclosure presentation has Compose-specific quirks that
    // need device verification).
    collapsible: Boolean = false,
    open: Boolean = false,
    fullWidth: Boolean = false,
    onDismiss: (() -> Unit)? = null,
    onAnalytics: ((event: String, data: Map<String, Any>?) -> Unit)? = null,
) {
    val isDark = isSystemInDarkTheme()
    var dismissed by remember { mutableStateOf(false) }
    if (dismissed) return

    // Header bar color based on variant
    val headerColor = when (variant) {
        "error" -> if (isDark) CivTokens.DarkColors.Error.default_ else CivTokens.Colors.Error.default_
        "warning" -> if (isDark) CivTokens.DarkColors.Warning.default_ else CivTokens.Colors.Warning.default_
        "success" -> if (isDark) CivTokens.DarkColors.Success.default_ else CivTokens.Colors.Success.default_
        else -> if (isDark) CivTokens.DarkColors.Info.default_ else CivTokens.Colors.Info.default_
    }

    // Content area background based on alertStyle
    val contentBg = when (alertStyle) {
        "primary" -> when (variant) {
            "error" -> if (isDark) CivTokens.DarkColors.Error.default_ else CivTokens.Colors.Error.default_
            "warning" -> if (isDark) CivTokens.DarkColors.Warning.default_ else CivTokens.Colors.Warning.default_
            "success" -> if (isDark) CivTokens.DarkColors.Success.default_ else CivTokens.Colors.Success.default_
            else -> if (isDark) CivTokens.DarkColors.Info.default_ else CivTokens.Colors.Info.default_
        }
        "tertiary" -> if (isDark) CivTokens.DarkColors.Base.lightest else CivTokens.Colors.White.default_
        else -> when (variant) {
            "error" -> if (isDark) CivTokens.DarkColors.Error.lighter else CivTokens.Colors.Error.lighter
            "warning" -> if (isDark) CivTokens.DarkColors.Warning.lighter else CivTokens.Colors.Warning.lighter
            "success" -> if (isDark) CivTokens.DarkColors.Success.lighter else CivTokens.Colors.Success.lighter
            else -> if (isDark) CivTokens.DarkColors.Info.lighter else CivTokens.Colors.Info.lighter
        }
    }

    // Text colors
    val headerTextColor = when (alertStyle) {
        "primary" -> if (isDark) CivTokens.DarkColors.Base.darkest else CivTokens.Colors.White.default_
        else -> if (isDark) CivTokens.DarkColors.Base.darkest else CivTokens.Colors.White.default_
    }
    val bodyTextColor = when (alertStyle) {
        "primary" -> if (isDark) CivTokens.DarkColors.Base.darkest else CivTokens.Colors.White.default_
        else -> if (isDark) CivTokens.DarkColors.Base.darkest else CivTokens.Colors.Base.darkest
    }

    val isError = variant == "error"

    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(bottom = CivTokens.Spacing._4)
            .semantics(mergeDescendants = true) {
                contentDescription = buildString {
                    append("$variant alert")
                    if (heading.isNotEmpty()) append(": $heading")
                    if (label.isNotEmpty()) append(". $label")
                }
                if (isError) {
                    liveRegion = LiveRegionMode.Assertive
                    error(label.ifEmpty { heading })
                } else {
                    liveRegion = LiveRegionMode.Polite
                }
            },
    ) {
        // Header bar (shown when not slim and heading is provided)
        if (!slim && heading.isNotEmpty()) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(headerColor)
                    .padding(
                        horizontal = CivTokens.Spacing._4,
                        vertical = CivTokens.Spacing._3,
                    ),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    text = heading,
                    style = TextStyle(
                        fontSize = CivTokens.Typography.FontSize.base,
                        fontWeight = FontWeight.Bold,
                    ),
                    color = headerTextColor,
                    modifier = Modifier.weight(1f),
                )
                if (dismissible) {
                    IconButton(
                        onClick = {
                            onAnalytics?.invoke("dismiss", mapOf("variant" to variant))
                            onDismiss?.invoke()
                            dismissed = true
                        },
                    ) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = "Dismiss alert",
                            tint = headerTextColor,
                        )
                    }
                }
            }
        }

        // Content area
        if (label.isNotEmpty()) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(contentBg)
                    .padding(
                        horizontal = CivTokens.Spacing._4,
                        vertical = if (slim) CivTokens.Spacing._3 else CivTokens.Spacing._4,
                    ),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    text = label,
                    style = TextStyle(
                        fontSize = if (slim) CivTokens.Typography.FontSize.sm else CivTokens.Typography.FontSize.base,
                    ),
                    color = bodyTextColor,
                    modifier = Modifier.weight(1f),
                )
                // Dismiss button in slim mode or when no heading
                if (dismissible && (slim || heading.isEmpty())) {
                    Spacer(modifier = Modifier.width(CivTokens.Spacing._2))
                    IconButton(
                        onClick = {
                            onAnalytics?.invoke("dismiss", mapOf("variant" to variant))
                            onDismiss?.invoke()
                            dismissed = true
                        },
                    ) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = "Dismiss alert",
                            tint = bodyTextColor,
                        )
                    }
                }
            }
        }
    }
}

// MARK: - Preview

@Preview(showBackground = true, name = "CivAlert")
@Composable
private fun CivAlertPreview() {
    Column(modifier = Modifier.padding(16.dp)) {
        CivAlert(
            variant = "info",
            heading = "Informational message",
            label = "This is an informational alert with additional details.",
        )

        CivAlert(
            variant = "error",
            heading = "Form submission failed",
            label = "Please correct the errors below and try again.",
            dismissible = true,
        )

        CivAlert(
            variant = "warning",
            alertStyle = "tertiary",
            heading = "Scheduled maintenance",
            label = "The system will be unavailable on Saturday from 2-4 AM EST.",
        )

        CivAlert(
            variant = "success",
            heading = "Application submitted",
            label = "Your application has been received. You will receive a confirmation email.",
            dismissible = true,
        )

        CivAlert(
            variant = "info",
            label = "This is a slim informational alert.",
            slim = true,
        )

        CivAlert(
            variant = "error",
            label = "This is a slim error alert with dismiss.",
            slim = true,
            dismissible = true,
        )
    }
}
