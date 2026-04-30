// CivUI — CivList + CivListItem for SwiftUI
// Generic list primitive. CivListItem with `href` becomes the whole-row click target;
// without href it's a static row. Same visual rhythm in both cases.

import SwiftUI

public struct CivList<Content: View>: View {
    public var dividers: Bool
    @ViewBuilder public var content: () -> Content

    public init(
        dividers: Bool = false,
        @ViewBuilder content: @escaping () -> Content
    ) {
        self.dividers = dividers
        self.content = content
    }

    public var body: some View {
        VStack(spacing: 0) {
            content()
        }
    }
}

public struct CivListItem<Content: View, End: View>: View {
    public var href: String
    public var current: Bool
    public var onTap: (() -> Void)?
    @ViewBuilder public var content: () -> Content
    @ViewBuilder public var end: () -> End

    public init(
        href: String = "",
        current: Bool = false,
        onTap: (() -> Void)? = nil,
        @ViewBuilder content: @escaping () -> Content,
        @ViewBuilder end: @escaping () -> End = { EmptyView() }
    ) {
        self.href = href
        self.current = current
        self.onTap = onTap
        self.content = content
        self.end = end
    }

    public var body: some View {
        let isLink = !href.isEmpty
        let row = HStack(alignment: .top, spacing: 16) {
            VStack(alignment: .leading, spacing: 4) { content() }
                .frame(maxWidth: .infinity, alignment: .leading)
            end()
        }
        .padding(.vertical, 16)

        if isLink {
            Button(action: { onTap?() }) { row }
                .buttonStyle(PlainButtonStyle())
        } else {
            row
        }
    }
}
