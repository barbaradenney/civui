// CivUI — CivAccordion for SwiftUI
// Group container for `civ-accordion-item` rows. Mirrors civ-accordion.
//
// Placeholder body — the prop surface satisfies schema parity. The
// SwiftUI implementation should host a VStack of DisclosureGroups, with
// `single` flipping at most one open at a time. See
// .claude/rules/audit-debt.md → "Native platform implementation pass".

import SwiftUI

public struct CivAccordion: View {
    /// When true, only one item may be open at a time.
    public var single: Bool

    /// Cascade disabled state to all child items.
    public var disabled: Bool

    /// Visual variant. `primary` | `secondary` | `tertiary` | `flush`.
    public var variant: String

    public init(
        single: Bool = false,
        disabled: Bool = false,
        variant: String = "tertiary"
    ) {
        self.single = single
        self.disabled = disabled
        self.variant = variant
    }

    public var body: some View {
        EmptyView()
    }
}
