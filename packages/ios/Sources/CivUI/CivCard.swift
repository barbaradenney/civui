// CivUI — CivCard for SwiftUI
// Structured container with optional header (heading + eyebrow), body, and footer.

import SwiftUI

public struct CivCard<Content: View, Footer: View>: View {
    public var heading: String
    public var eyebrow: String
    public var eyebrowVariant: CivTagVariant
    public var href: String?
    public var spacing: String
    @ViewBuilder public var content: () -> Content
    @ViewBuilder public var footer: () -> Footer
    @Environment(\.colorScheme) private var colorScheme

    public init(
        heading: String = "",
        eyebrow: String = "",
        eyebrowVariant: CivTagVariant = .gray,
        href: String? = nil,
        spacing: String = "default",
        @ViewBuilder content: @escaping () -> Content,
        @ViewBuilder footer: @escaping () -> Footer = { EmptyView() }
    ) {
        self.heading = heading
        self.eyebrow = eyebrow
        self.eyebrowVariant = eyebrowVariant
        self.href = href
        self.spacing = spacing
        self.content = content
        self.footer = footer
    }

    private var pad: CGFloat { spacing == "sm" ? CivTokens.Spacing._3 : CivTokens.Spacing._4 }
    private var borderColor: Color {
        colorScheme == .dark ? CivTokens.DarkColors.Base.lighter : CivTokens.Colors.Base.lighter
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Header
            if !heading.isEmpty || !eyebrow.isEmpty {
                VStack(alignment: .leading, spacing: CivTokens.Spacing._1) {
                    if !eyebrow.isEmpty {
                        CivTag(label: eyebrow, variant: eyebrowVariant, size: .sm)
                    }
                    if !heading.isEmpty {
                        Text(heading)
                            .font(.system(size: CivTokens.Typography.FontSize.lg, weight: CivTokens.Typography.FontWeight.bold))
                            .foregroundColor(colorScheme == .dark ? CivTokens.DarkColors.Base.darkest : CivTokens.Colors.Base.darkest)
                    }
                }
                .padding(.bottom, CivTokens.Spacing._3)
            }

            // Body
            content()

            // Footer
            let footerView = footer()
            if !(footerView is EmptyView) {
                VStack(alignment: .leading) {
                    Divider().foregroundColor(borderColor)
                    footerView
                }
                .padding(.top, CivTokens.Spacing._3)
            }
        }
        .padding(pad)
        .overlay(RoundedRectangle(cornerRadius: 0).stroke(borderColor, lineWidth: CivTokens.Border.Width.default_))
        .padding(.bottom, CivTokens.Spacing._4)
        .accessibilityElement(children: .contain)
    }
}

#if DEBUG
struct CivCard_Previews: PreviewProvider {
    static var previews: some View {
        ScrollView {
            VStack(alignment: .leading) {
                CivCard(heading: "Primary care", eyebrow: "Upcoming", eyebrowVariant: .blue) {
                    Text("Dr. Smith — Jan 15 at 2:30 PM")
                } footer: {
                    Button("Check in now") {}
                }

                CivCard(heading: "Compensation claim", eyebrow: "In progress", eyebrowVariant: .teal) {
                    Text("Filed: March 10, 2026")
                    Text("Step 3 of 5: Evidence gathering")
                } footer: {
                    Button("View details") {}
                }

                CivCard(heading: "Plain card") {
                    Text("No footer, no eyebrow")
                }
            }.padding()
        }
    }
}
#endif
