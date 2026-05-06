// CivUI — CivSupportResources for SwiftUI
// Crisis and support contact links for sensitive forms.

import SwiftUI

/// Support resources callout for sensitive forms.
///
/// Renders an aside with a heading and slotted action links for
/// crisis hotlines, emails, etc. Mirrors the web `civ-support-resources` component.
public struct CivSupportResources<Content: View>: View {
    /// Heading text.
    public var heading: String
    /// Semantic heading level (2–6).
    public var headingLevel: Int
    /// Visual tone: "default" or "crisis".
    public var tone: String
    /// Slotted content (action links).
    public var content: () -> Content

    public init(
        heading: String = "",
        headingLevel: Int = 3,
        tone: String = "default",
        @ViewBuilder content: @escaping () -> Content = { EmptyView() }
    ) {
        self.heading = heading
        self.headingLevel = headingLevel
        self.tone = tone
        self.content = content
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(heading).bold()
            content()
        }
        .accessibilityElement(children: .contain)
        .accessibilityLabel(heading)
    }
}
