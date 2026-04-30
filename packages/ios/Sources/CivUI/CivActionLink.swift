// CivUI — CivActionLink for SwiftUI
// Unified action link for phone calls and email compose.
// Renders the correct protocol, icon, and formatted display text based on type.

import SwiftUI

/// Action link type — determines protocol and icon.
public enum CivActionLinkType: String {
    case phone
    case email
}

/// Unified action link for device actions (phone call, email compose).
///
/// Usage:
/// ```swift
/// CivActionLink(type: .phone, number: "8005551234")
/// CivActionLink(type: .email, address: "help@va.gov", subject: "Question")
/// ```
public struct CivActionLink: View {
    public var type: CivActionLinkType
    public var number: String
    public var address: String
    public var subject: String
    public var label: String
    public var disabled: Bool

    public init(
        type: CivActionLinkType = .phone,
        number: String = "",
        address: String = "",
        subject: String = "",
        label: String = "",
        disabled: Bool = false
    ) {
        self.type = type
        self.number = number
        self.address = address
        self.subject = subject
        self.label = label
        self.disabled = disabled
    }

    public var body: some View {
        EmptyView() // TODO: Implement with CivLink delegation
    }
}

#if DEBUG
struct CivActionLink_Previews: PreviewProvider {
    static var previews: some View {
        VStack(alignment: .leading, spacing: 12) {
            CivActionLink(type: .phone, number: "8005551234")
            CivActionLink(type: .email, address: "help@va.gov")
        }
        .padding()
    }
}
#endif
