// CivUI — CivDataGrid for SwiftUI
// Sortable / selectable / responsive admin data table. Mirrors civ-data-grid.
//
// Placeholder body — the prop surface satisfies schema parity. The
// SwiftUI implementation should use a Table when iOS 16+ is supported,
// otherwise a custom LazyVGrid with role-aware cells. See
// .claude/rules/audit-debt.md → "Native platform implementation pass".

import SwiftUI

public struct CivDataGrid: View {
    /// Caption text describing the table.
    public var caption: String

    /// Visually hide the caption (still read by assistive tech).
    public var captionHidden: Bool

    /// Currently sorted column key.
    public var sortBy: String

    /// Current sort direction. `asc` | `desc` | `none`.
    public var sortDirection: String

    /// Allow holding shift to combine sorts across multiple columns.
    public var multiSort: Bool

    /// Responsive mode below the table's reflow breakpoint. `stacked` | `scroll`.
    public var responsive: String

    /// Make the header sticky inside a scroll container.
    public var stickyHeader: Bool

    /// Row selection mode. `none` | `single` | `multiple`.
    public var selectable: String

    /// Whether the grid is in a loading state (renders skeleton).
    public var loading: Bool

    /// Error message rendered in the empty state when loading failed.
    public var errorMessage: String

    /// Message rendered when the grid has no rows.
    public var emptyMessage: String

    /// Alternate-row background.
    public var striped: Bool

    /// Cell-border treatment.
    public var bordered: Bool

    /// Whether row hover / click affordances are rendered.
    public var interactive: Bool

    /// Column key used to group rows.
    public var groupBy: String

    /// Make the footer sticky inside a scroll container.
    public var stickyFooter: Bool

    /// Show per-group subtotal rows.
    public var showGroupSubtotals: Bool

    /// Cell density. `default` | `sm` | `xs`.
    public var spacing: String

    public init(
        caption: String = "",
        captionHidden: Bool = false,
        sortBy: String = "",
        sortDirection: String = "none",
        multiSort: Bool = false,
        responsive: String = "stacked",
        stickyHeader: Bool = false,
        selectable: String = "none",
        loading: Bool = false,
        errorMessage: String = "",
        emptyMessage: String = "",
        striped: Bool = false,
        bordered: Bool = false,
        interactive: Bool = false,
        groupBy: String = "",
        stickyFooter: Bool = false,
        showGroupSubtotals: Bool = false,
        spacing: String = "default"
    ) {
        self.caption = caption
        self.captionHidden = captionHidden
        self.sortBy = sortBy
        self.sortDirection = sortDirection
        self.multiSort = multiSort
        self.responsive = responsive
        self.stickyHeader = stickyHeader
        self.selectable = selectable
        self.loading = loading
        self.errorMessage = errorMessage
        self.emptyMessage = emptyMessage
        self.striped = striped
        self.bordered = bordered
        self.interactive = interactive
        self.groupBy = groupBy
        self.stickyFooter = stickyFooter
        self.showGroupSubtotals = showGroupSubtotals
        self.spacing = spacing
    }

    public var body: some View {
        EmptyView()
    }
}
