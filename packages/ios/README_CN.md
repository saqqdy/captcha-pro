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

---

## 构建与验证指南（零基础也能跟着做）

> **先看这里：** `CaptchaPro`（iOS）是一个 **SDK 库**，不是能单独运行的 App。它本身没有界面让你直接「看到验证码」。它是给开发人员嵌进更大 iOS 应用的一组零件。本指南教你怎么把这个库构建出来、怎么确认构建成功。想**亲眼看到验证码效果**（最快、不用装 Xcode），打开 **`examples/vue`**，见根目录 `README.md`。
>
> **重要：** iOS 开发只能在 **Mac** 上做，Windows / Linux 不行。

### 1. 装软件

1. 打开 **Mac App Store**，搜 **Xcode**，安装（约 10GB+，耐心等）。
2. 打开一次 Xcode，同意协议。

Xcode 自带所有东西（Swift 工具链、iOS SDK），不用再装别的。

### 2. 打开项目

- **最简单：** 在 Finder 里双击 `packages/ios/Package.swift`，会自动用 Xcode 打开。
- 或在 Xcode 里 **File → Open…** 选 `packages/ios` 文件夹。

### 3. 构建

**在 Xcode 里（推荐）：**
1. 窗口顶部选 scheme **CaptchaPro**。
2. 菜单 **Product → Build**（快捷键 ⌘B）。
3. 等顶部进度条走完。

**命令行（进阶）：**
打开 Mac **「终端」**，输入：

```bash
cd packages/ios
xcodebuild -scheme CaptchaPro -destination 'generic/platform=iOS' -derivedDataPath .build build
```

看到 `** BUILD SUCCEEDED **` 即成功。

> **不要用 `swift build`。** 它默认编 macOS，会报 `no such module 'UIKit'`。iOS SDK 必须用上面的 `xcodebuild` + iOS destination。

### 4. 怎么算成功

输出出现 `** BUILD SUCCEEDED **`（Xcode）或 `BUILD SUCCEEDED`（命令行）即成功。

### 5. 怎么看验证码效果

这是库不是 App，没界面。想看效果最快去 **`examples/vue`**（浏览器），见根目录 `README.md`。

### 6. 常见报错

- `no such module 'UIKit'` → 你用了 `swift build`。改用第 3 步的 `xcodebuild` 命令。
- **签名错误** → 在 Xcode 里勾选 **Automatically manage signing**，或在 **Xcode → Settings → Accounts** 登录 Apple 账号。编模拟器不需要签名。
