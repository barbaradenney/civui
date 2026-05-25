// CivUI — CivNotice for SwiftUI
// Icon-prefixed emphasis text for highlighting a specific passage
// inside longer content. GOV.UK "warning text" pattern extended with
// semantic intents. Mirrors civ-notice.
//
// Placeholder body — the prop surface satisfies schema parity. The
// SwiftUI implementation should render an HStack of Image(systemName:)
// + VStack { Text(header).bold(); Text(bodyText) } using the SF Symbols
// mapping per intent. See .claude/rules/audit-debt.md →
// "Native platform implementation pass".

import SwiftUI

public struct CivNotice: View {
    /// Severity / color treatment. `info` | `warning` | `error` | `success` | `neutral`.
    public var intent: String

    /// `default` (large icon + bold lg text) or `sm` (inline-compact).
    public var spacing: String

    /// `primary` (filled icons) or `secondary` (outlined glyphs).
    public var emphasis: String

    /// Override the default icon for this intent (any icon name from the library).
    public var icon: String

    /// Optional bold heading rendered above the body.
    public var header: String

    /// Body text rendered below the header. Named `bodyText` on iOS
    /// because `body` collides with SwiftUI's required `View.body`
    /// computed property. The schema-parity alternatives map handles
    /// the rename.
    public var bodyText: String

    /// Optional visually-hidden screen-reader prefix (e.g. "Warning:").
    public var srPrefix: String

    public init(
        intent: String = "info",
        spacing: String = "default",
        emphasis: String = "primary",
        icon: String = "",
        header: String = "",
        bodyText: String = "",
        srPrefix: String = ""
    ) {
        self.intent = intent
        self.spacing = spacing
        self.emphasis = emphasis
        self.icon = icon
        self.header = header
        self.bodyText = bodyText
        self.srPrefix = srPrefix
    }

    public var body: some View {
        EmptyView()
    }
}
