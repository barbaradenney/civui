// CivUI — CivPhoneLink for SwiftUI
// Accessible phone link following government design system patterns.

import SwiftUI

/// Accessible phone link for government applications.
///
/// Renders a tel: link that opens the phone dialer.
/// Mirrors the web `civ-phone-link` component.
///
/// Usage:
/// ```swift
/// CivPhoneLink(number: "1-800-827-1000", label: "Call the VA helpline")
/// ```
public struct CivPhoneLink: View {
    // MARK: - Properties

    /// Phone number (used for the tel: link).
    public var number: String

    /// Link text. Defaults to the phone number if empty.
    public var label: String

    /// Whether the link is disabled.
    public var isDisabled: Bool

    // MARK: - Internal State

    @Environment(\.colorScheme) private var colorScheme

    // MARK: - Initializer

    public init(
        number: String = "",
        label: String = "",
        isDisabled: Bool = false
    ) {
        self.number = number
        self.label = label
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
struct CivPhoneLink_Previews: PreviewProvider {
    static var previews: some View {
        CivPhoneLink(number: "1-800-827-1000", label: "Call the VA helpline")
            .padding()
    }
}
#endif
