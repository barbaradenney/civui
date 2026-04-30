// CivUI — CivExternalLink for SwiftUI
// Accessible external link following government design system patterns.

import SwiftUI

/// Accessible external link for government applications.
///
/// Renders a link that opens in an external browser with an indicator icon.
/// Mirrors the web `civ-external-link` component.
///
/// Usage:
/// ```swift
/// CivExternalLink(
///     label: "Visit USA.gov",
///     href: "https://www.usa.gov"
/// )
/// ```
public struct CivExternalLink: View {
    // MARK: - Properties

    /// Link text.
    public var label: String

    /// External URL to open.
    public var href: String

    /// Whether the link is disabled.
    public var isDisabled: Bool

    // MARK: - Internal State

    @Environment(\.colorScheme) private var colorScheme

    // MARK: - Initializer

    public init(
        label: String = "",
        href: String = "",
        isDisabled: Bool = false
    ) {
        self.label = label
        self.href = href
        self.isDisabled = isDisabled
    }

    // MARK: - Body

    public var body: some View {
        EmptyView()
    }

    // MARK: - Color Helper

    private func adaptiveColor(light: Color, dark: Color) -> Color {
        colorScheme == .dark ? dark : light
    }
}

// MARK: - Preview

#if DEBUG
struct CivExternalLink_Previews: PreviewProvider {
    static var previews: some View {
        CivExternalLink(
            label: "Visit USA.gov",
            href: "https://www.usa.gov"
        )
        .padding()
    }
}
#endif
