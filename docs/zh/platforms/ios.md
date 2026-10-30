# iOS 平台集成指南

本指南详细说明如何在 iOS 项目中使用 captcha-pro。

## 安装

### CocoaPods

在 `Podfile` 中添加：

```ruby
pod 'CaptchaPro', '~> 2.2.0'
```

然后运行：

```bash
pod install
```

### Swift Package Manager

1. File → Add Packages
2. 输入仓库 URL
3. 选择版本 2.2.0

---

## 基础使用

### UIKit

```swift
import UIKit
import CaptchaPro

class ViewController: UIViewController {
    override func viewDidLoad() {
        super.viewDidLoad()

        let captchaView = SliderCaptchaView(frame: CGRect(x: 0, y: 0, width: 300, height: 170))
        captchaView.center = view.center
        captchaView.precision = 5
        captchaView.showRefresh = true

        captchaView.onSuccess = {
            print("验证通过!")
        }

        captchaView.onFail = {
            print("验证失败!")
        }

        view.addSubview(captchaView)
    }
}
```

---

## SwiftUI

```swift
import SwiftUI
import CaptchaPro

struct ContentView: View {
    @State private var isSuccess = false

    var body: some View {
        VStack(spacing: 20) {
            SliderCaptcha(
                width: 300,
                height: 170,
                precision: 5,
                showRefresh: true,
                onSuccess: {
                    print("验证通过!")
                    isSuccess = true
                },
                onFail: {
                    print("验证失败!")
                }
            )

            if isSuccess {
                Text("验证成功")
                    .foregroundColor(.green)
            }
        }
    }
}
```

---

## 后端验证

```swift
let captchaView = SliderCaptchaView(frame: CGRect(x: 0, y: 0, width: 300, height: 170))
captchaView.verifyMode = .backend
captchaView.backendVerify = BackendVerifyOptions(
    getCaptcha: "https://your-domain.com/api/captcha",
    verify: "https://your-domain.com/api/captcha/verify"
)
```

---

## 🔗 相关链接

- [API 参考手册](../api/)
- [后端集成指南](../guides/backend-integration.md)