# CaptchaPro

iOS native SDK for Captcha Pro, providing Swift captcha components for UIKit and SwiftUI.

**[简体中文](./README_CN.md)**

## Installation

### Swift Package Manager

Add to your `Package.swift`:

```swift
dependencies: [
    .package(url: "https://github.com/saqqdy/captcha-pro.git", from: "2.0.0")
]
```

Or in Xcode:
1. File → Add Packages...
2. Enter: `https://github.com/saqqdy/captcha-pro.git`

### CocoaPods

```ruby
pod 'CaptchaPro', '~> 2.0.0'
```

## Features

- **Slider Captcha** - Drag slider to complete puzzle verification
- **Click Captcha** - Click characters in correct order
- **Backend Verification** - Server-side validation
- **SwiftUI Support** - Native SwiftUI views
- **UIKit Support** - Traditional UIView components
- **iOS 12+** - Modern iOS support

## Usage (SwiftUI)

```swift
import CaptchaPro

struct CaptchaView: View {
    // URL string mode — SDK does HTTP internally.
    // Or pass closures: .function(...) endpoints
    let backendVerify = BackendVerifyOptions(
        getCaptchaUrl: "https://your-api.com/captcha/get",
        verifyUrl: "https://your-api.com/captcha/verify"
    )

    var body: some View {
        SliderCaptcha(
            backendVerify: backendVerify,
            locale: .zhCN,                       // or .enUS
            width: 300,
            height: 170,
            onSuccess: { _ in print("Passed!") },
            onFail: { print("Failed") },
            onError: { print("Error: \($0)") }
        )
    }
}
```

`ClickCaptcha` takes the same params; when the backend returns `clickCharImages` it renders char images in the prompt bar, otherwise falls back to `clickTexts`.

## Popup (SwiftUI)

```swift
PopupCaptcha(
    type: .slider,
    backendVerify: backendVerify,
    locale: .zhCN,
    autoClose: true,
    onSuccess: { _ in print("Passed!") },
    onClose: { print("Closed") }
).show()
```

## Usage (UIKit)

```swift
import CaptchaPro

class ViewController: UIViewController {
    override func viewDidLoad() {
        super.viewDidLoad()

        let popup = PopupCaptchaView()
        popup.backendVerify = BackendVerifyOptions(
            getCaptchaUrl: "https://your-api.com/captcha/get",
            verifyUrl: "https://your-api.com/captcha/verify"
        )
        popup.locale = .zhCN
        popup.show(in: view)
    }
}
```

## Backend Configuration

`BackendVerifyOptions` accepts either a URL string (SDK performs HTTP internally) or a
closure — matching the taro-vue `string | function` contract.

```swift
// URL string overload
BackendVerifyOptions(
    getCaptchaUrl: "https://your-api.com/captcha/get",
    verifyUrl: "https://your-api.com/captcha/verify",
    headers: ["Authorization": "Bearer xxx"],   // optional
    timeout: 10                                  // optional, seconds
)

// Closure overload (custom transport)
BackendVerifyOptions(
    getCaptcha: { try await api.fetchCaptcha() },          // () async throws -> BackendCaptchaResponse
    verify: { data in try await api.verify(data: data) }    // (CaptchaData) async throws -> BackendVerifyResponse
)
```

### Verify request `target` (polymorphic)

- Slider → `[sliderX]` (number array)
- Click → `[{ x, y, text? }, ...]` (point array)

### i18n

Pass `locale: .zhCN` or `.enUS` to any component. Status strings resolve via
`LocaleMessages.get(locale, key:)`.

## Components

### SliderCaptcha (SwiftUI)

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| backendVerify | BackendVerifyOptions | - | **Required**, backend API config |
| width | Int | 300 | Container width |
| height | Int | 170 | Container height |
| sliderWidth | Int | 42 | Slider piece width |
| sliderHeight | Int | 42 | Slider piece height |
| showRefresh | Bool | true | Show refresh button |
| locale | CaptchaLocale | .zhCN | Language |
| onSuccess | (VerifyResult?) -> Void | { _ in } | Success callback |
| onFail | () -> Void | {} | Fail callback |
| onRefresh | () -> Void | {} | Refresh callback |
| onError | (Error) -> Void | {} | Error callback |

### ClickCaptcha (SwiftUI)

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| backendVerify | BackendVerifyOptions | - | **Required**, backend API config |
| width | Int | 300 | Container width |
| height | Int | 170 | Container height |
| count | Int | 3 | Number of click targets |
| showRefresh | Bool | true | Show refresh button |
| locale | CaptchaLocale | .zhCN | Language |
| onSuccess | (VerifyResult?) -> Void | { _ in } | Success callback |
| onFail | () -> Void | {} | Fail callback |
| onRefresh | () -> Void | {} | Refresh callback |
| onError | (Error) -> Void | {} | Error callback |

## License

MIT

---

## Build & Verify Guide (No Coding Experience Needed)

> **Read this first:** `CaptchaPro` (iOS) is an **SDK library**, not a stand-alone app. It has no screen you can tap to "see a captcha". It is a box of parts that developers embed inside a bigger iOS app. This guide shows you how to build the library itself and confirm the build succeeded. To actually *see* a captcha working (fastest, no Xcode needed), open the **`examples/vue`** folder — see the root `README.md`.
>
> **Important:** iOS development only works on a **Mac**. You cannot build this on Windows or Linux.

### 1. Install the software

1. Open the **Mac App Store**, search for **Xcode**, and install it (it is large, ~10 GB+, give it time).
2. Open Xcode once and accept the license agreement when prompted.

That's it — Xcode includes everything (Swift toolchain, iOS SDK).

### 2. Open the project

- **Easiest:** in Finder, double-click `packages/ios/Package.swift`. It opens in Xcode.
- Or in Xcode: **File → Open…** and select the `packages/ios` folder.

### 3. Build

**In Xcode (recommended):**
1. At the top of the window, pick the scheme **CaptchaPro**.
2. Menu **Product → Build** (shortcut ⌘B).
3. Wait for the progress bar at the top to finish.

**Command line (advanced):**
Open the macOS **Terminal** and run:

```bash
cd packages/ios
xcodebuild -scheme CaptchaPro -destination 'generic/platform=iOS' -derivedDataPath .build build
```

You should see `** BUILD SUCCEEDED **`.

> **Do not use `swift build`.** It compiles for macOS by default and will fail with `no such module 'UIKit'`. The iOS SDK requires `xcodebuild` with an iOS destination, as shown above.

### 4. How to know it worked

The output says `** BUILD SUCCEEDED **` (Xcode) or `BUILD SUCCEEDED` (command line).

### 5. How to actually see a captcha

This package is a library — no UI to open. The quickest way to see a captcha is the **`examples/vue`** example (browser). See the root `README.md`.

### 6. Common errors

- `no such module 'UIKit'` → you ran `swift build`. Use the `xcodebuild` command from step 3 instead.
- **Code-signing error** → in Xcode, select the scheme and enable **Automatically manage signing**, or sign in with your Apple ID under **Xcode → Settings → Accounts**. Building for the simulator needs no signing.