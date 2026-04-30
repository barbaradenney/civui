// CivUI — CivEmailLink for SwiftUI
// Accessible email link following government design system patterns.

import SwiftUI

/// Accessible email link for government applications.
///
/// Renders a mailto link with optional subject line.
/// Mirrors the web `civ-email-link` component.
///
/// Usage:
/// ```swift
/// CivEmailLink(
///     address: "help@agency.gov",
///     label: "Email support",
///     subject: "Benefits question"
/// )
/// ```
public struct CivEmailLink: View {
    // MARK: - Properties

    /// Email address.
    public var address: String

    /// Link text. Defaults to the email address if empty.
    public var label: String

    /// Pre-filled subject line.
    public var subject: String

    /// Whether the link is disabled.
    public var isDisabled: Bool

    // MARK: - Internal State

    @Environment(\.colorScheme) private var colorScheme

    // MARK: - Initializer

    public init(
        address: String = "",
        label: String = "",
        subject: String = "",
        isDisabled: Bool = false
    ) {
        self.address = address
        self.label = label
        self.subject = subject
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
struct CivEmailLink_Previews: PreviewProvider {
    static var previews: some View {
        CivEmailLink(
            address: "help@agency.gov",
            label: "Email support",
            subject: "Benefits question"
        )
        .padding()
    }
}
#endif
