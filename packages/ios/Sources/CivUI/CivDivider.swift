// CivUI — CivDivider for SwiftUI
// Horizontal rule for visually separating content.

import SwiftUI

public struct CivDivider: View {
    public var spacing: String
    public var variant: String
    @Environment(\.colorScheme) private var colorScheme

    public init(spacing: String = "default", variant: String = "default") {
        self.spacing = spacing
        self.variant = variant
    }

    private var verticalPadding: CGFloat {
        spacing == "sm" ? CivTokens.Spacing._2 : CivTokens.Spacing._4
    }

    private var dividerColor: Color {
        let isDark = colorScheme == .dark
        if variant == "primary" {
            return isDark ? CivTokens.DarkColors.Base.light : CivTokens.Colors.Base.light
        }
        return isDark ? CivTokens.DarkColors.Base.lighter : CivTokens.Colors.Base.lighter
    }

    public var body: some View {
        Rectangle()
            .fill(dividerColor)
            .frame(height: variant == "primary" ? 2 : 1)
            .padding(.vertical, verticalPadding)
    }
}

#if DEBUG
struct CivDivider_Previews: PreviewProvider {
    static var previews: some View {
        VStack {
            Text("Above")
            CivDivider()
            Text("Below")
            CivDivider(variant: "primary")
            Text("Primary")
            CivDivider(spacing: "sm")
            Text("Tight")
        }.padding()
    }
}
#endif
