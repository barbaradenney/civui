// CivUI — CivItemizedTotal for SwiftUI
// Display-only ledger surface with rows + summed total. Mirrors
// civ-itemized-total.
//
// Placeholder body — the prop surface satisfies schema parity. The
// SwiftUI implementation should use a VStack of CivItemizedItem rows
// with a top-bordered footer row formatted via
// `.formatted(.currency(code:))`. See
// .claude/rules/audit-debt.md → "Native platform implementation pass".

import SwiftUI

public struct CivItemizedTotal: View {
    /// Optional heading above the list.
    public var heading: String

    /// Label for the total row.
    public var totalLabel: String

    /// Override the auto-summed total amount.
    public var totalAmount: Double

    /// ISO 4217 currency code (e.g. `USD`).
    public var currency: String

    /// BCP 47 locale (e.g. `en-US`). Empty inherits the system locale.
    public var locale: String

    /// Optional intent tint for the total row.
    public var totalIntent: String

    public init(
        heading: String = "",
        totalLabel: String = "Total",
        totalAmount: Double = 0,
        currency: String = "USD",
        locale: String = "",
        totalIntent: String = ""
    ) {
        self.heading = heading
        self.totalLabel = totalLabel
        self.totalAmount = totalAmount
        self.currency = currency
        self.locale = locale
        self.totalIntent = totalIntent
    }

    public var body: some View {
        EmptyView()
    }
}
