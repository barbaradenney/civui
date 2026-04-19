// CivUI — CivCard for SwiftUI
// Bordered container for grouping related content.

import SwiftUI

public struct CivCard<Content: View>: View {
    public var spacing: String
    @ViewBuilder public var content: () -> Content
    @Environment(\.colorScheme) private var colorScheme

    public init(spacing: String = "default", @ViewBuilder content: @escaping () -> Content) {
        self.spacing = spacing
        self.content = content
    }

    private var padding: CGFloat {
        spacing == "sm" ? CivTokens.Spacing._3 : CivTokens.Spacing._4
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: CivTokens.Spacing._2) {
            content()
        }
        .padding(padding)
        .overlay(
            RoundedRectangle(cornerRadius: 0)
                .stroke(colorScheme == .dark ? CivTokens.DarkColors.Base.lighter : CivTokens.Colors.Base.lighter,
                        lineWidth: CivTokens.Border.Width.default_)
        )
        .padding(.bottom, CivTokens.Spacing._4)
    }
}

#if DEBUG
struct CivCard_Previews: PreviewProvider {
    static var previews: some View {
        VStack(alignment: .leading) {
            CivCard { Text("Default card content") }
            CivCard(spacing: "sm") { Text("Small card content") }
        }.padding()
    }
}
#endif
