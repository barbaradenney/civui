// swift-tools-version: 5.9
// CivUI — Accessibility-first government design system for SwiftUI

import PackageDescription

let package = Package(
    name: "CivUI",
    platforms: [
        .iOS(.v16),
        .macOS(.v13),
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
