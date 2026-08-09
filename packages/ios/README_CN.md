# CaptchaPro

Captcha Pro 的 iOS 原生 SDK，提供适用于 UIKit 和 SwiftUI 的 Swift 验证码组件。

## 安装

### Swift Package Manager

在 `Package.swift` 中添加：

```swift
dependencies: [
    .package(url: "https://github.com/saqqdy/captcha-pro.git", from: "2.0.0")
]
```

或在 Xcode 中：
1. File → Add Packages...
2. 输入：`https://github.com/saqqdy/captcha-pro.git`

### CocoaPods

```ruby
pod 'CaptchaPro', '~> 2.0.0'
```

## 特性

- **滑动拼图验证码** - 拖动滑块完成拼图验证
- **点选文字验证码** - 按正确顺序点选文字
- **后端验证** - 服务端验证
- **SwiftUI 支持** - 原生 SwiftUI 视图
- **UIKit 支持** - 传统 UIView 组件
- **iOS 12+** - 现代版 iOS 支持

## 使用（SwiftUI）

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

`ClickCaptcha` 接受相同的参数；当后端返回 `clickCharImages` 时，在提示栏渲染字符图片，否则回退到 `clickTexts`。

## Popup（SwiftUI）

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

## 使用（UIKit）

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

## 后端配置

`BackendVerifyOptions` 接受 URL 字符串（SDK 内部执行 HTTP）或
闭包——与 taro-vue 的 `string | function` 契约一致。

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

### 验证请求 `target`（多态）

- Slider → `[sliderX]`（数字数组）
- Click → `[{ x, y, text? }, ...]`（点数组）

### i18n

向任意组件传入 `locale: .zhCN` 或 `.enUS`。状态文案通过
`LocaleMessages.get(locale, key:)` 解析。

## 组件

### SliderCaptcha（SwiftUI）

| Parameter | Type | Default | 描述 |
|-----------|------|---------|-------------|
| backendVerify | BackendVerifyOptions | - | **必填**，后端 API 配置 |
| width | Int | 300 | 容器宽度 |
| height | Int | 170 | 容器高度 |
| sliderWidth | Int | 42 | 滑块拼图宽度 |
| sliderHeight | Int | 42 | 滑块拼图高度 |
| showRefresh | Bool | true | 显示刷新按钮 |
| locale | CaptchaLocale | .zhCN | 语言 |
| onSuccess | (VerifyResult?) -> Void | { _ in } | 成功回调 |
| onFail | () -> Void | {} | 失败回调 |
| onRefresh | () -> Void | {} | 刷新回调 |
| onError | (Error) -> Void | {} | 错误回调 |

### ClickCaptcha（SwiftUI）

| Parameter | Type | Default | 描述 |
|-----------|------|---------|-------------|
| backendVerify | BackendVerifyOptions | - | **必填**，后端 API 配置 |
| width | Int | 300 | 容器宽度 |
| height | Int | 170 | 容器高度 |
| count | Int | 3 | 点击目标数量 |
| showRefresh | Bool | true | 显示刷新按钮 |
| locale | CaptchaLocale | .zhCN | 语言 |
| onSuccess | (VerifyResult?) -> Void | { _ in } | 成功回调 |
| onFail | () -> Void | {} | 失败回调 |
| onRefresh | () -> Void | {} | 刷新回调 |
| onError | (Error) -> Void | {} | 错误回调 |

## 许可证

MIT
