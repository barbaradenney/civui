// CivUI — CivTag for SwiftUI
// Small colored status pill for labels, categories, and metadata.
// Mirrors the web `civ-tag` component.

import SwiftUI

/// Tag color variant matching the web `TagVariant` type.
public enum CivTagVariant: String {
    case blue, teal, red, green, yellow, orange, purple, gray
}

/// Tag size matching the web `TagSize` type.
public enum CivTagSize: String {
    case `default`, sm
}

/// Accessible colored status pill for government applications.
///
/// Usage:
/// ```swift
/// CivTag(label: "In progress", variant: .teal)
/// ```
public struct CivTag: View {
    public let label: String
    public var variant: CivTagVariant
    public var size: CivTagSize

    @Environment(\.colorScheme) private var colorScheme

    public init(label: String, variant: CivTagVariant = .gray, size: CivTagSize = .default) {
        self.label = label
        self.variant = variant
        self.size = size
    }

    private var fontSize: CGFloat {
        size == .sm ? CivTokens.Typography.FontSize.sm : CivTokens.Typography.FontSize.base
    }

    public var body: some View {
        Text(label)
            .font(.system(size: fontSize,
                          weight: CivTokens.Typography.FontWeight.regular))
            .foregroundColor(foregroundColor)
            .padding(.horizontal, CivTokens.Spacing._2)
            .padding(.vertical, CivTokens.Spacing._0_5)
            .background(backgroundColor)
            .accessibilityLabel(label)
    }

    private var foregroundColor: Color {
        let isDark = colorScheme == .dark
        switch variant {
        case .blue: return isDark ? CivTokens.DarkColors.Primary.dark : CivTokens.Colors.Primary.dark
        case .teal: return isDark ? CivTokens.DarkColors.Info.dark : CivTokens.Colors.Info.dark
        case .red: return isDark ? CivTokens.DarkColors.Error.dark : CivTokens.Colors.Error.dark
        case .green: return isDark ? CivTokens.DarkColors.Success.dark : CivTokens.Colors.Success.dark
        case .yellow: return isDark ? CivTokens.DarkColors.Warning.dark : CivTokens.Colors.Warning.dark
        case .orange: return isDark ? CivTokens.DarkColors.Base.darkest : CivTokens.Colors.Base.darkest
        case .purple: return Color(red: 0.33, green: 0.15, blue: 0.56)
        case .gray: return isDark ? CivTokens.DarkColors.Base.darker : CivTokens.Colors.Base.darker
        }
    }

    private var backgroundColor: Color {
        let isDark = colorScheme == .dark
        switch variant {
        case .blue: return isDark ? CivTokens.DarkColors.Primary.lightest : CivTokens.Colors.Primary.lightest
        case .teal: return isDark ? CivTokens.DarkColors.Info.lighter : CivTokens.Colors.Info.lighter
        case .red: return isDark ? CivTokens.DarkColors.Error.lighter : CivTokens.Colors.Error.lighter
        case .green: return isDark ? CivTokens.DarkColors.Success.lighter : CivTokens.Colors.Success.lighter
        case .yellow: return isDark ? CivTokens.DarkColors.Warning.lighter : CivTokens.Colors.Warning.lighter
        case .orange: return isDark ? CivTokens.DarkColors.Base.lighter : CivTokens.Colors.Base.lighter
        case .purple: return Color(red: 0.93, green: 0.89, blue: 0.95)
        case .gray: return isDark ? CivTokens.DarkColors.Base.lightest : CivTokens.Colors.Base.lightest
        }
    }
}

#if DEBUG
struct CivTag_Previews: PreviewProvider {
    static var previews: some View {
        HStack(spacing: 8) {
            CivTag(label: "Blue", variant: .blue)
            CivTag(label: "Teal", variant: .teal)
            CivTag(label: "Red", variant: .red)
            CivTag(label: "Green", variant: .green)
            CivTag(label: "Yellow", variant: .yellow)
            CivTag(label: "Gray", variant: .gray)
        }.padding()
    }
}
#endif
