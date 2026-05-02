import SwiftUI

/// CivUI Filterable List
///
/// A filtering controller that coordinates filter controls with a list of items.
/// Handles search matching, named attribute filtering, AND composition, and
/// result count display.
public struct CivFilterableList<Content: View, Filters: View>: View {
    public var label: String = ""
    public var noResultsMessage: String = "No results found."
    public var resultCountHidden: Bool = false

    public var filters: Filters
    public var content: Content

    public init(
        label: String = "",
        noResultsMessage: String = "No results found.",
        resultCountHidden: Bool = false,
        @ViewBuilder filters: () -> Filters,
        @ViewBuilder content: () -> Content
    ) {
        self.label = label
        self.noResultsMessage = noResultsMessage
        self.resultCountHidden = resultCountHidden
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
