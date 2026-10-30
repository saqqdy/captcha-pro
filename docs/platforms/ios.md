# iOS Platform Integration Guide

This guide details how to use captcha-pro in iOS projects.

## Installation

### CocoaPods

Add the following to your `Podfile`:

```ruby
pod 'CaptchaPro', '~> 2.3.0'
```

Then run:

```bash
pod install
```

### Swift Package Manager

1. File → Add Packages
2. Enter the repository URL
3. Select version 2.2.0

---

## Basic Usage

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
            print("Passed!")
        }

        captchaView.onFail = {
            print("Failed!")
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
                    print("Passed!")
                    isSuccess = true
                },
                onFail: {
                    print("Failed!")
                }
            )

            if isSuccess {
                Text("Verified")
                    .foregroundColor(.green)
            }
        }
    }
}
```

---

## Backend Verification

```swift
let captchaView = SliderCaptchaView(frame: CGRect(x: 0, y: 0, width: 300, height: 170))
captchaView.verifyMode = .backend
captchaView.backendVerify = BackendVerifyOptions(
    getCaptcha: "https://your-domain.com/api/captcha",
    verify: "https://your-domain.com/api/captcha/verify"
)
```

---

## 🔗 Related Links

- [API Reference](../api/README.md)
- [Backend Integration Guide](../guides/backend-integration.md)
