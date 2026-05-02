import SwiftUI

/// CivUI Filterable List
///
/// A filtering controller that coordinates filter controls with a list of items.
/// Handles search matching, named attribute filtering, AND composition, and
/// result count display.
public struct CivFilterableList<Content: View, Filters: View>: View {
    public var label: String = ""
    public var noResultsMessage: String = "No results found."
    public var announceDelay: Int = 300
    public var resultCountHidden: Bool = false
    public var filterAttribute: String = "data-filter"

    public var filters: Filters
    public var content: Content

    public init(
        label: String = "",
        noResultsMessage: String = "No results found.",
        announceDelay: Int = 300,
        resultCountHidden: Bool = false,
        filterAttribute: String = "data-filter",
        @ViewBuilder filters: () -> Filters,
        @ViewBuilder content: () -> Content
    ) {
        self.label = label
        self.noResultsMessage = noResultsMessage
        self.announceDelay = announceDelay
        self.resultCountHidden = resultCountHidden
        self.filterAttribute = filterAttribute
        self.filters = filters()
        self.content = content()
    }

    public var body: some View {
        // TODO: Implement CivFilterableList
        VStack(alignment: .leading) {
            filters
            content
        }
        .accessibilityLabel(label)
    }
}
