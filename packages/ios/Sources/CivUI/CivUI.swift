// CivUI — Accessibility-first government design system for SwiftUI
//
// This package provides native SwiftUI components that implement the CivUI
// design system. All components meet WCAG AA and Section 508 requirements.
//
// Design tokens are auto-generated from the shared W3C DTCG token files
// in @civui/tokens. See CivTokens.swift for the generated constants.
//
// Usage:
//   import CivUI
//
//   Text("Hello")
//       .font(.system(size: CivTokens.Typography.FontSize.base))
//       .foregroundColor(CivTokens.Colors.Primary.default_)

import SwiftUI

/// CivUI color scheme environment key for adaptive theming.
public struct CivColorSchemeKey: EnvironmentKey {
    public static let defaultValue: ColorScheme = .light
}

public extension EnvironmentValues {
    var civColorScheme: ColorScheme {
        get { self[CivColorSchemeKey.self] }
        set { self[CivColorSchemeKey.self] = newValue }
    }
}

/// Focus ring modifier matching the CivUI two-color focus technique (W3C C40).
public struct CivFocusRing: ViewModifier {
    let isFocused: Bool

    public func body(content: Content) -> some View {
        content
            .overlay(
                RoundedRectangle(cornerRadius: CivTokens.Border.Radius.default_)
                    .stroke(CivTokens.Focus.shadowColor, lineWidth: CivTokens.Focus.shadowSpread)
                    .padding(-CivTokens.Focus.outlineOffset)
                    .opacity(isFocused ? 1 : 0)
            )
            .overlay(
                RoundedRectangle(cornerRadius: CivTokens.Border.Radius.default_)
                    .stroke(CivTokens.Focus.outlineColor, lineWidth: CivTokens.Focus.outlineWidth)
                    .padding(-(CivTokens.Focus.outlineOffset + CivTokens.Focus.shadowSpread))
                    .opacity(isFocused ? 1 : 0)
            )
    }
}

public extension View {
    /// Applies the CivUI two-color focus ring (WCAG 2.2 SC 2.4.13 compliant).
    func civFocusRing(_ isFocused: Bool) -> some View {
        modifier(CivFocusRing(isFocused: isFocused))
    }
}
