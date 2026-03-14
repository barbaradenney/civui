// CivUI — Accessibility-first government design system for Jetpack Compose
//
// This package provides native Compose components that implement the CivUI
// design system. All components meet WCAG AA and Section 508 requirements.
//
// Design tokens are auto-generated from the shared W3C DTCG token files
// in @civui/tokens. See CivTokens.kt for the generated constants.
//
// Usage:
//   import gov.civui.tokens.CivTokens
//
//   Text(
//       text = "Hello",
//       fontSize = CivTokens.Typography.FontSize.base,
//       color = CivTokens.Colors.Primary.default_,
//   )

package gov.civui

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import gov.civui.tokens.CivTokens

/**
 * Returns the appropriate CivUI color for the current theme.
 *
 * @param light The light mode color from [CivTokens.Colors]
 * @param dark The dark mode color from [CivTokens.DarkColors]
 */
@Composable
fun civColor(light: Color, dark: Color): Color {
    return if (isSystemInDarkTheme()) dark else light
}
