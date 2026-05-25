// CivUI — CivToolbar for SwiftUI
// Above-grid toolbar container. Mirrors civ-toolbar.
//
// Placeholder body — the prop surface satisfies schema parity. See
// .claude/rules/audit-debt.md → "Native platform implementation pass".

import SwiftUI

public struct CivToolbar: View {
    /// Accessible label for the toolbar role.
    public var label: String

    public init(label: String = "") {
        self.label = label
    }

    public var body: some View {
        EmptyView()
    }
}
