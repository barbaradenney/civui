// CivUI — CivDivider for SwiftUI
// Horizontal rule for visually separating content.

import SwiftUI

public struct CivDivider: View {
    /// Vertical margin (top + bottom) around the divider line.
    /// `default` (16pt) or `sm` (8pt). Named `rhythm` to match
    /// the web schema; the prop controls margin around the
    /// divider, not internal padding.
    public var rhythm: String
    /// Deprecated alias for `rhythm`. Kept for backward compat
    /// with consumers on the old API; will be removed in a
    /// future release. Setting this on web emits a dev-mode
    /// console warning.
    public var spacing: String
    public var emphasis: String
    @Environment(\.colorScheme) private var colorScheme

    public init(rhythm: String = "default", spacing: String = "default", emphasis: String = "default") {
        self.rhythm = rhythm
        self.spacing = spacing
        self.emphasis = emphasis
    }

    private var verticalPadding: CGFloat {
        let value = rhythm != "default" ? rhythm : spacing
        return value == "sm" ? CivTokens.Spacing._2 : CivTokens.Spacing._4
    }

    private var dividerColor: Color {
        let isDark = colorScheme == .dark
        if emphasis == "primary" {
            return isDark ? CivTokens.DarkColors.Base.light : CivTokens.Colors.Base.light
        }
        return isDark ? CivTokens.DarkColors.Base.lighter : CivTokens.Colors.Base.lighter
    }

    public var body: some View {
        Rectangle()
            .fill(dividerColor)
            .frame(height: emphasis == "primary" ? 2 : 1)
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
            CivDivider(emphasis: "primary")
            Text("Primary")
            CivDivider(rhythm: "sm")
            Text("Tight")
        }.padding()
    }
}
#endif
