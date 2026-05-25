// CivUI — CivOnThisPage for SwiftUI
// In-page table of contents with scroll-position highlight. Mirrors
// civ-on-this-page.
//
// Placeholder body — the prop surface satisfies schema parity. See
// .claude/rules/audit-debt.md → "Native platform implementation pass".

import SwiftUI

public struct CivOnThisPage: View {
    /// Accessible label for the TOC.
    public var label: String

    public init(label: String = "") {
        self.label = label
    }

    public var body: some View {
        EmptyView()
    }
}
