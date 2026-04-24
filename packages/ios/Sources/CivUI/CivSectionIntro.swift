// CivUI — CivSectionIntro for SwiftUI
// Context panel displayed before a sensitive or complex form section.
// Sets expectations so users are not ambushed by difficult content.

import SwiftUI

public enum CivSectionIntroTone {
    case info
    case sensitive
    case neutral
}

public struct CivSectionIntro<Content: View>: View {
    public var heading: String
    public var headingLevel: Int
    public var tone: CivSectionIntroTone
    @ViewBuilder public var content: () -> Content

    @Environment(\.colorScheme) private var colorScheme

    public init(
        heading: String = "",
        headingLevel: Int = 3,
        tone: CivSectionIntroTone = .info,
        @ViewBuilder content: @escaping () -> Content
    ) {
        self.heading = heading
        self.headingLevel = headingLevel
        self.tone = tone
        self.content = content
    }

    private var backgroundColor: Color {
        switch tone {
        case .sensitive:
            return colorScheme == .dark
                ? CivTokens.DarkColors.Primary.lighter
                : CivTokens.Colors.Primary.lighter
        case .neutral:
            return colorScheme == .dark
                ? CivTokens.DarkColors.Base.lighter
                : CivTokens.Colors.Base.lighter
        case .info:
            return colorScheme == .dark
                ? CivTokens.DarkColors.Primary.lightest
                : CivTokens.Colors.Primary.lightest
        }
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: CivTokens.Spacing._3) {
            if !heading.isEmpty {
                Text(heading)
                    .font(.system(
                        size: CivTokens.Typography.FontSize.lg,
                        weight: CivTokens.Typography.FontWeight.semibold
                    ))
                    .accessibilityAddTraits(.isHeader)
            }
            content()
        }
        .padding(CivTokens.Spacing._4)
        .background(backgroundColor)
        .cornerRadius(CivTokens.Border.Radius.default_)
        .accessibilityElement(children: .contain)
        .accessibilityLabel(heading.isEmpty ? "Section introduction" : heading)
    }
}

#if DEBUG
struct CivSectionIntro_Previews: PreviewProvider {
    static var previews: some View {
        CivSectionIntro(
            heading: "About your service-connected trauma",
            tone: .sensitive
        ) {
            Text("The next questions ask about events that may be difficult to remember.")
            Text("You can skip any question and come back to it later.")
        }
        .padding()
    }
}
#endif
