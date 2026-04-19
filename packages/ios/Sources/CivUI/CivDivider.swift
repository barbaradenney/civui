// CivUI — CivDivider for SwiftUI
// Horizontal rule for visually separating content.

import SwiftUI

public struct CivDivider: View {
    public var spacing: String
    @Environment(\.colorScheme) private var colorScheme

    public init(spacing: String = "default") {
        self.spacing = spacing
    }

    private var verticalPadding: CGFloat {
        spacing == "sm" ? CivTokens.Spacing._2 : CivTokens.Spacing._4
    }

    public var body: some View {
        Divider()
            .foregroundColor(colorScheme == .dark ? CivTokens.DarkColors.Base.lighter : CivTokens.Colors.Base.lighter)
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
            CivDivider(spacing: "sm")
            Text("Tight")
        }.padding()
    }
}
#endif
