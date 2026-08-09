# Native (Flutter / Android / iOS)

captcha-pro ships native SDKs for mobile platforms.

## Flutter

`captcha_pro` provides Dart widgets.

```yaml
# pubspec.yaml
dependencies:
  captcha_pro: ^1.1.0
```

```dart
import 'package:captcha_pro/captcha_pro.dart';

SliderCaptcha(
  width: 300,
  height: 170,
  onSuccess: () => print('Passed!'),
)
```

## Android

Two flavors are available:

```groovy
// build.gradle — traditional View system
implementation 'com.captcha.pro:captcha-sdk:1.1.0'

// build.gradle — Jetpack Compose
implementation 'com.captcha.pro:captcha-compose:1.1.0'
```

| Package | Description |
|---------|-------------|
| `captcha-sdk` | Native Kotlin SDK (View system) |
| `captcha-compose` | Jetpack Compose |

## iOS

`CaptchaPro` is a Swift SDK supporting both UIKit and SwiftUI.

```ruby
# Podfile
pod 'CaptchaPro', '~> 1.1.0'
```

```swift
import CaptchaPro
```

::: tip
Native SDKs run verification in backend mode by default. Point them at your [backend](/backend/) server for image generation and verification.
:::
