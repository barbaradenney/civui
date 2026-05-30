// CivUI — CivIcon for SwiftUI
// Renders SF Symbols using the icon library mappings from @civui/core.
// Each icon name maps to an SF Symbol for native iOS rendering.

import SwiftUI

/// Icon name matching the web component's icon library.
/// Each case maps to an SF Symbol via the `ios` field in icon-library.ts.
public enum CivIconName: String, CaseIterable {
    // Navigation
    case chevronRight = "chevron-right"
    case chevronLeft = "chevron-left"
    case chevronDown = "chevron-down"
    case chevronUp = "chevron-up"
    case arrowRight = "arrow-right"
    case arrowLeft = "arrow-left"
    case arrowUp = "arrow-up"
    case arrowDown = "arrow-down"
    case arrowBack = "arrow-back"
    case externalLink = "external-link"

    // Actions
    case close
    case plus
    case minus
    case menu
    case moreVertical = "more-vertical"
    case moreHorizontal = "more-horizontal"
    case search
    case edit

    // Status / Feedback
    case check
    case checkCircle = "check-circle"
    case error
    case warning
    case info
    case help

    // Form / Input
    case requiredIndicator = "required-indicator"
    case sortAsc = "sort-asc"
    case sortDesc = "sort-desc"
    case sortNone = "sort-none"
    case calendar
    case location

    // Media / Content
    case upload
    case download
    case filter
    case copy
    case trash

    // UI Chrome
    case grip
    case loading
    case lock
    case home
    case settings
    case star
    case starFilled = "star-filled"
    case print
    case user
    case mail

    /// The SF Symbol name for this icon.
    public var sfSymbol: String {
        switch self {
        // Navigation
        case .chevronRight: return "chevron.right"
        case .chevronLeft: return "chevron.left"
        case .chevronDown: return "chevron.down"
        case .chevronUp: return "chevron.up"
        case .arrowRight: return "arrow.right"
        case .arrowLeft: return "arrow.left"
        case .arrowUp: return "arrow.up"
        case .arrowDown: return "arrow.down"
        case .arrowBack: return "arrow.uturn.backward"
        case .externalLink: return "arrow.up.right.square"

        // Actions
        case .close: return "xmark"
        case .plus: return "plus"
        case .minus: return "minus"
        case .menu: return "line.3.horizontal"
        case .moreVertical: return "ellipsis"
        case .moreHorizontal: return "ellipsis"
        case .search: return "magnifyingglass"
        case .edit: return "pencil"

        // Status
        case .check: return "checkmark"
        case .checkCircle: return "checkmark.circle"
        case .error: return "exclamationmark.circle"
        case .warning: return "exclamationmark.triangle"
        case .info: return "info.circle"
        case .help: return "questionmark.circle"

        // Form
        case .requiredIndicator: return "asterisk"
        case .sortAsc: return "chevron.up"
        case .sortDesc: return "chevron.down"
        case .sortNone: return "arrow.up.arrow.down"
        case .calendar: return "calendar"
        case .location: return "mappin.and.ellipse"

        // Media
        case .upload: return "arrow.up.doc"
        case .download: return "arrow.down.doc"
        case .filter: return "line.3.horizontal.decrease"
        case .copy: return "doc.on.doc"
        case .trash: return "trash"

        // UI Chrome
        case .grip: return "line.3.horizontal"
        case .loading: return "progress.indicator"
        case .lock: return "lock"
        case .home: return "house"
        case .settings: return "gearshape"
        case .star: return "star"
        case .starFilled: return "star.fill"
        case .print: return "printer"
        case .user: return "person"
        case .mail: return "envelope"
        }
    }

    /// Accessibility label for the icon.
    public var accessibilityLabel: String {
        switch self {
        case .chevronRight: return "Next"
        case .chevronLeft: return "Previous"
        case .chevronDown: return "Expand"
        case .chevronUp: return "Collapse"
        case .arrowRight: return "Right"
        case .arrowLeft: return "Left"
        case .arrowUp: return "Up"
        case .arrowDown: return "Down"
        case .arrowBack: return "Go back"
        case .externalLink: return "Opens in new tab"
        case .close: return "Close"
        case .plus: return "Add"
        case .minus: return "Remove"
        case .menu: return "Menu"
        case .moreVertical, .moreHorizontal: return "More options"
        case .search: return "Search"
        case .edit: return "Edit"
        case .check, .checkCircle: return "Success"
        case .error: return "Error"
        case .warning: return "Warning"
        case .info: return "Information"
        case .help: return "Help"
        case .requiredIndicator: return "Required"
        case .sortAsc: return "Sorted ascending"
        case .sortDesc: return "Sorted descending"
        case .sortNone: return "Unsorted"
        case .calendar: return "Calendar"
        case .location: return "Location"
        case .upload: return "Upload"
        case .download: return "Download"
        case .filter: return "Filter"
        case .copy: return "Copy"
        case .trash: return "Delete"
        case .grip: return "Drag handle"
        case .loading: return "Loading"
        case .lock: return "Locked"
        case .home: return "Home"
        case .settings: return "Settings"
        case .star: return "Favorite"
        case .starFilled: return "Favorited"
        case .print: return "Print"
        case .user: return "User account"
        case .mail: return "Email"
        }
    }
}

/// Accessible icon component using SF Symbols.
///
/// Maps CivUI icon names to their SF Symbol counterparts for native iOS rendering.
/// Supports decorative mode (hidden from VoiceOver) and custom sizing.
///
/// Usage:
/// ```swift
/// // Semantic icon (announced by VoiceOver)
/// CivIcon(.warning)
///
/// // Decorative icon (hidden from VoiceOver)
/// CivIcon(.chevronRight, decorative: true)
///
/// // Custom size and color
/// CivIcon(.checkCircle, size: 24)
///     .foregroundColor(CivTokens.Colors.Success.default_)
/// ```
public struct CivIcon: View {
    // MARK: - Properties

    /// The icon to display.
    public let name: CivIconName

    /// Icon size in points. Defaults to body text size.
    public var size: CGFloat

    /// Whether this icon is purely decorative (hidden from VoiceOver).
    public var decorative: Bool

    // MARK: - Initializer

    public init(
        _ name: CivIconName,
        size: CGFloat = CivTokens.Typography.FontSize.base,
        decorative: Bool = false
    ) {
        self.name = name
        self.size = size
        self.decorative = decorative
    }

    // MARK: - Body

    public var body: some View {
        Image(systemName: name.sfSymbol)
            .font(.system(size: size))
            .accessibilityLabel(decorative ? "" : name.accessibilityLabel)
            .accessibilityHidden(decorative)
    }
}

// MARK: - Preview

#if DEBUG
struct CivIcon_Previews: PreviewProvider {
    static var previews: some View {
        ScrollView {
            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible()),
                GridItem(.flexible()),
                GridItem(.flexible()),
            ], spacing: 16) {
                ForEach(CivIconName.allCases, id: \.self) { icon in
                    VStack(spacing: 4) {
                        CivIcon(icon, size: 24)
                        Text(icon.rawValue)
                            .font(.system(size: 10))
                            .lineLimit(1)
                    }
                    .frame(height: 60)
                }
            }
            .padding()
        }
        .previewDisplayName("Icon Gallery")
    }
}
#endif
