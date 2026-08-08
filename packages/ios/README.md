# CaptchaPro

iOS native SDK for Captcha Pro, providing Swift captcha components for UIKit and SwiftUI.

**[简体中文](./README_CN.md)**

## Installation

### Swift Package Manager

Add to your `Package.swift`:

```swift
dependencies: [
    .package(url: "https://github.com/saqqdy/captcha-pro.git", from: "1.1.0")
]
```

Or in Xcode:
1. File → Add Packages...
2. Enter: `https://github.com/saqqdy/captcha-pro.git`

### CocoaPods

```ruby
pod 'CaptchaPro', '~> 1.1.0'
```

## Features

- **Slider Captcha** - Drag slider to complete puzzle verification
- **Click Captcha** - Click characters in correct order
- **Backend Verification** - Server-side validation with AES encryption
- **SwiftUI Support** - Native SwiftUI views
- **UIKit Support** - Traditional UIView components
- **iOS 13+** - Modern iOS support

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
            onSuccess: { print("Passed!") },
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
    onSuccess: { print("Passed!") },
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
| onSuccess | () -> Void | {} | Success callback |
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
| onSuccess | () -> Void | {} | Success callback |
| onFail | () -> Void | {} | Fail callback |
| onRefresh | () -> Void | {} | Refresh callback |
| onError | (Error) -> Void | {} | Error callback |

## License

MIT