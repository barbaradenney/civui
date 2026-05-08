// swift-tools-version: 5.9
// CivUI — Accessibility-first government design system for SwiftUI

import PackageDescription

let package = Package(
    name: "CivUI",
    platforms: [
        // iOS only — the components use UIKit-specific input types
        // (UIKeyboardType, UITextContentType) that don't exist on macOS.
        // The package previously claimed macOS support but `swift test`
        // on macOS failed every CI run because of those imports. If
        // macOS support is genuinely needed in the future, the right
        // fix is to wrap UIKit-specific property declarations in
        // `#if canImport(UIKit)` guards and provide AppKit equivalents.
        .iOS(.v16),
    ],
    products: [
        .library(
            name: "CivUI",
            targets: ["CivUI"]
        ),
    ],
    targets: [
        .target(
            name: "CivUI",
            path: "Sources/CivUI"
        ),
        .testTarget(
            name: "CivUITests",
            dependencies: ["CivUI"],
            path: "Tests/CivUITests"
        ),
    ]
)
