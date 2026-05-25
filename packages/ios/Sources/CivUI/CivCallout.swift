// CivUI — CivCallout for SwiftUI
// Presentational callout chrome (mirrors the web civ-callout component).
//
// Placeholder body — the prop surface satisfies schema parity. The
// implementation should render a leading accent rule + padded
// container, sized by the active semantic palette. See audit-debt.md.

import SwiftUI

/// Presentational primitive that frames content with a leading accent
/// border. Five semantic variants map to the design-system palette.
public struct CivCallout: View {
    /// Accent border color: "default" (primary), "info", "warning",
    /// "error", or "success".
    public var intent: String

    public init(
        intent: String = "default"
    ) {
        self.intent = intent
    }

    public var body: some View {
        EmptyView()
    }
}
