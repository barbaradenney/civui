// CivUI — CivFileList for SwiftUI
// Read-only display of uploaded files for review/confirmation pages.

import SwiftUI

public struct FileListItem {
    public var name: String
    public var size: Int
    public var url: String?
    public var type: String?

    public init(name: String, size: Int, url: String? = nil, type: String? = nil) {
        self.name = name
        self.size = size
        self.url = url
        self.type = type
    }
}

public struct CivFileList: View {
    public var files: [FileListItem]
    public var label: String

    public init(
        files: [FileListItem] = [],
        label: String = ""
    ) {
        self.files = files
        self.label = label
    }

    public var body: some View {
        EmptyView() // TODO: Implement
    }
}
