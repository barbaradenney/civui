// CivUI — CivPagination for SwiftUI
// USWDS-style page-list pagination. Mirrors civ-pagination.
//
// Placeholder body — the prop surface satisfies schema parity. See
// .claude/rules/audit-debt.md → "Native platform implementation pass".

import SwiftUI

public struct CivPagination: View {
    /// Total number of items across all pages.
    public var totalItems: Int

    /// Items shown per page.
    public var pageSize: Int

    /// Currently selected page (1-indexed).
    public var page: Int

    /// Comma-separated list of selectable page sizes (e.g. `10,25,50`).
    public var pageSizeOptions: String

    /// How many sibling pages to show on each side of the current page.
    public var siblingCount: Int

    /// Accessible label for the `<nav>` landmark.
    public var label: String

    /// Singular item label (e.g. `result`).
    public var itemName: String

    /// Plural form for non-`+s` plurals (e.g. `people` for `person`).
    /// Empty falls back to `itemName + "s"`.
    public var itemNamePlural: String

    public init(
        totalItems: Int = 0,
        pageSize: Int = 10,
        page: Int = 1,
        pageSizeOptions: String = "",
        siblingCount: Int = 1,
        label: String = "",
        itemName: String = "",
        itemNamePlural: String = ""
    ) {
        self.totalItems = totalItems
        self.pageSize = pageSize
        self.page = page
        self.pageSizeOptions = pageSizeOptions
        self.siblingCount = siblingCount
        self.label = label
        self.itemName = itemName
        self.itemNamePlural = itemNamePlural
    }

    public var body: some View {
        EmptyView()
    }
}
