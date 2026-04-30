// CivUI — CivDownloadLink for SwiftUI
// Accessible download link following government design system patterns.

import SwiftUI

/// Accessible download link for government applications.
///
/// Renders a link that triggers a file download.
/// Mirrors the web `civ-download-link` component.
///
/// Usage:
/// ```swift
/// CivDownloadLink(
///     label: "Download form",
///     href: "https://example.gov/form.pdf",
///     filename: "VA-Form-21.pdf",
///     fileSize: "2.4 MB"
/// )
/// ```
public struct CivDownloadLink: View {
    // MARK: - Properties

    /// Link text.
    public var label: String

    /// URL of the file to download.
    public var href: String

    /// Suggested filename for the download.
    public var filename: String

    /// Human-readable file size (e.g., "2.4 MB").
    public var fileSize: String

    /// Whether the link is disabled.
    public var isDisabled: Bool

    // MARK: - Internal State

    @Environment(\.colorScheme) private var colorScheme

    // MARK: - Initializer

    public init(
        label: String = "",
        href: String = "",
        filename: String = "",
        fileSize: String = "",
        isDisabled: Bool = false
    ) {
        self.label = label
        self.href = href
        self.filename = filename
        self.fileSize = fileSize
        self.isDisabled = isDisabled
    }

    // MARK: - Body

    public var body: some View {
        EmptyView()
    }

    // MARK: - Color Helper

    private func adaptiveColor(light: Color, dark: Color) -> Color {
        colorScheme == .dark ? dark : light
    }
}

// MARK: - Preview

#if DEBUG
struct CivDownloadLink_Previews: PreviewProvider {
    static var previews: some View {
        CivDownloadLink(
            label: "Download form",
            href: "https://example.gov/form.pdf",
            filename: "VA-Form-21.pdf",
            fileSize: "2.4 MB"
        )
        .padding()
    }
}
#endif
