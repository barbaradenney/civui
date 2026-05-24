// CivUI — CivImagePreview for SwiftUI
// Displays an uploaded image at a readable size with optional caption.

import SwiftUI

public struct CivImagePreview: View {
    public var src: String
    public var webpSrc: String
    public var avifSrc: String
    public var alt: String
    public var filename: String
    public var fileSize: String
    public var size: String
    public var width: Int?
    public var height: Int?
    public var ratio: String

    public init(
        src: String = "",
        webpSrc: String = "",
        avifSrc: String = "",
        alt: String = "",
        filename: String = "",
        fileSize: String = "",
        size: String = "md",
        width: Int? = nil,
        height: Int? = nil,
        ratio: String = "auto"
    ) {
        self.src = src
        self.webpSrc = webpSrc
        self.avifSrc = avifSrc
        self.alt = alt
        self.filename = filename
        self.fileSize = fileSize
        self.size = size
        self.width = width
        self.height = height
        self.ratio = ratio
    }

    public var body: some View {
        EmptyView() // TODO: Implement
    }
}
