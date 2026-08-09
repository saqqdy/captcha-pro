# 原生（Flutter / Android / iOS）

captcha-pro 为移动平台提供原生 SDK。

## Flutter

`captcha_pro` 提供 Dart widgets。

```yaml
# pubspec.yaml
dependencies:
  captcha_pro: ^2.0.0
```

```dart
import 'package:captcha_pro/captcha_pro.dart';

SliderCaptcha(
  width: 300,
  height: 170,
  onSuccess: () => print('验证通过!'),
)
```

## Android

提供两种风格：

```groovy
# build.gradle — 传统 View 体系
implementation 'com.captcha.pro:captcha-sdk:2.0.0'

# build.gradle — Jetpack Compose
implementation 'com.captcha.pro:captcha-compose:2.0.0'
```

| 包名 | 描述 |
|------|------|
| `captcha-sdk` | 原生 Kotlin SDK（View 体系） |
| `captcha-compose` | Jetpack Compose |

## iOS

`CaptchaPro` 是支持 UIKit 与 SwiftUI 的 Swift SDK。

```ruby
# Podfile
pod 'CaptchaPro', '~> 2.0.0'
```

```swift
import CaptchaPro
```

::: tip
原生 SDK 默认运行于后端模式。请将它们指向你的[后端](/zh/backend/)服务以生成与校验图片。
:::
