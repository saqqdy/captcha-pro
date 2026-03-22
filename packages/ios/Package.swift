// swift-tools-version: 5.9
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
    name: "CaptchaPro",
    platforms: [
        .iOS(.v12),
        .macOS(.v10_14)
    ],
    products: [
        .library(
            name: "CaptchaPro",
            targets: ["CaptchaPro"]),
    ],
    dependencies: [
        // Dependencies declare other packages that this package depends on.
    ],
    targets: [
        .target(
            name: "CaptchaPro",
            dependencies: [],
            path: "Sources"),
        .testTarget(
            name: "CaptchaProTests",
            dependencies: ["CaptchaPro"],
            path: "Tests"),
    ]
)
