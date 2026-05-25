// CivUI — CivImage for SwiftUI
// Responsive image with art-direction + format fallbacks. Mirrors civ-image.
//
// Placeholder body — see .claude/rules/audit-debt.md → "Native platform implementation pass".

import SwiftUI

public struct CivImage: View {
    /// Image source URL.
    public var src: String

    /// WebP source (preferred when supported).
    public var webpSrc: String

    /// AVIF source (preferred over WebP when supported).
    public var avifSrc: String

    /// Required accessible alt text. Empty string marks decorative.
    public var alt: String

    /// Intrinsic width (px) for CLS-safe layout.
    public var width: Int

    /// Intrinsic height (px) for CLS-safe layout.
    public var height: Int

    /// Aspect ratio. Empty string defers to width/height.
    public var ratio: String

    /// Object-fit. `cover` | `contain` | `fill` | `none` | `scale-down`.
    public var fit: String

    /// Browser loading hint. `lazy` | `eager`.
    public var loading: String

    /// Browser decoding hint. `sync` | `async` | `auto`.
    public var decoding: String

    /// Fetch priority hint. `high` | `low` | `auto`.
    public var fetchPriority: String

    /// CORS mode. `anonymous` | `use-credentials` | `''`.
    public var crossOrigin: String

    /// Referrer policy.
    public var referrerPolicy: String

    /// Variant. `content` (default flow) | `thumbnail` (decorative dimension).
    public var variant: String

    /// Thumbnail-size ladder when `variant` is `thumbnail`. Component-specific
    /// (NOT the `size` from LegendHeadingMixin) — `civ-image` does not extend
    /// the heading mixin, so this is its own enum.
    public var size: String

    /// Apply rounded corners (thumbnail variant only).
    public var rounded: Bool

    public init(
        src: String = "",
        webpSrc: String = "",
        avifSrc: String = "",
        alt: String = "",
        width: Int = 0,
        height: Int = 0,
        ratio: String = "",
        fit: String = "cover",
        loading: String = "lazy",
        decoding: String = "async",
        fetchPriority: String = "auto",
        crossOrigin: String = "",
        referrerPolicy: String = "",
        variant: String = "content",
        size: String = "",
        rounded: Bool = false
    ) {
        self.src = src
        self.webpSrc = webpSrc
        self.avifSrc = avifSrc
        self.alt = alt
        self.width = width
        self.height = height
        self.ratio = ratio
        self.fit = fit
        self.loading = loading
        self.decoding = decoding
        self.fetchPriority = fetchPriority
        self.crossOrigin = crossOrigin
        self.referrerPolicy = referrerPolicy
        self.variant = variant
        self.size = size
        self.rounded = rounded
    }

    public var body: some View {
        EmptyView()
    }
}
