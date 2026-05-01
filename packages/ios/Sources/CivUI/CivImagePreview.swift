// CivUI — CivImagePreview for SwiftUI
// Displays an uploaded image at a readable size with optional caption.

import SwiftUI

public struct CivImagePreview: View {
    public var src: String
    public var alt: String
    public var filename: String
    public var fileSize: String
    public var size: String

    public init(
        src: String = "",
        alt: String = "",
        filename: String = "",
        fileSize: String = "",
        size: String = "md"
    ) {
        self.src = src
        self.alt = alt
        self.filename = filename
        self.fileSize = fileSize
        self.size = size
    }

    public var body: some View {
        EmptyView() // TODO: Implement
    }
}
