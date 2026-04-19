// CivUI — CivPrefillNotice for SwiftUI
// Informational banner for prefilled form data.

import SwiftUI

public struct CivPrefillNotice: View {
    public var heading: String?
    public var body: String?
    public var profileHref: String?
    public var linkText: String?
    public var onLinkTap: (() -> Void)?

    @Environment(\.colorScheme) private var colorScheme

    public init(heading: String? = nil, body: String? = nil, profileHref: String? = nil, linkText: String? = nil, onLinkTap: (() -> Void)? = nil) {
        self.heading = heading
        self.body = body
        self.profileHref = profileHref
        self.linkText = linkText
        self.onLinkTap = onLinkTap
    }

    public var body_: some View { // workaround: 'body' conflicts with View protocol
        EmptyView()
    }

    public var view: some View {
        VStack(alignment: .leading, spacing: CivTokens.Spacing._2) {
            Text(heading ?? "We\u{2019}ve prefilled some of your information")
                .font(.system(size: CivTokens.Typography.FontSize.base, weight: CivTokens.Typography.FontWeight.bold))
                .foregroundColor(.white)
                .padding(CivTokens.Spacing._3)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(colorScheme == .dark ? CivTokens.DarkColors.Info.dark : CivTokens.Colors.Info.dark)

            VStack(alignment: .leading, spacing: CivTokens.Spacing._1) {
                Text(self.body ?? "We pulled this information from your account. If any of this is wrong, you can correct it here.")
                    .font(.system(size: CivTokens.Typography.FontSize.base))
                if profileHref != nil || onLinkTap != nil {
                    Button(action: { onLinkTap?() }) {
                        Text(linkText ?? "Update your profile")
                            .foregroundColor(colorScheme == .dark ? CivTokens.DarkColors.Primary.default_ : CivTokens.Colors.Primary.default_)
                    }
                }
            }
            .padding(CivTokens.Spacing._4)
            .background(colorScheme == .dark ? CivTokens.DarkColors.Info.lighter : CivTokens.Colors.Info.lighter)
        }
        .overlay(RoundedRectangle(cornerRadius: 0).stroke(colorScheme == .dark ? CivTokens.DarkColors.Info.dark : CivTokens.Colors.Info.dark, lineWidth: 2))
        .padding(.bottom, CivTokens.Spacing._6)
        .accessibilityElement(children: .contain)
    }
}

#if DEBUG
struct CivPrefillNotice_Previews: PreviewProvider {
    static var previews: some View {
        CivPrefillNotice(profileHref: "/profile").view.padding()
    }
}
#endif
