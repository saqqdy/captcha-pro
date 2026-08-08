# captcha_pro

Flutter package for Captcha Pro, providing cross-platform captcha widgets.

**[简体中文](./README_CN.md)**

## Installation

Add to your `pubspec.yaml`:

```yaml
dependencies:
  captcha_pro: ^1.1.0
```

## Features

- **Slider Captcha** - Drag slider to complete puzzle verification
- **Click Captcha** - Click characters in correct order
- **Backend Verification** - Server-side validation
- **Cross-platform** - iOS, Android, Web support
- **Null Safety** - Full null safety support

## Usage

### Basic Slider Captcha

```dart
import 'package:captcha_pro/captcha_pro.dart';

class CaptchaScreen extends StatelessWidget {
  final backendConfig = BackendConfig(
    getCaptcha: 'https://your-api.com/captcha/get',
    verify: 'https://your-api.com/captcha/verify',
  );

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: SliderCaptcha(
          backend: backendConfig,
          width: 300,
          height: 170,
          onSuccess: () => print('Passed!'),
          onFail: () => print('Failed'),
        ),
      ),
    );
  }
}
```

### Click Captcha

```dart
ClickCaptcha(
  backend: backendConfig,
  width: 300,
  height: 170,
  onSuccess: () => print('Passed!'),
)
```

### Popup Captcha

```dart
final popupController = PopupCaptchaController();

PopupCaptcha(
  controller: popupController,
  type: CaptchaType.slider,
  backend: backendConfig,
  onSuccess: () => print('Passed!'),
);

// Show popup
popupController.show();
```

## Backend Configuration

```dart
class BackendConfig {
  final String getCaptcha;     // Required: URL to fetch captcha
  final String verify;         // Required: URL to verify captcha
  final Map<String, String>? headers;  // Optional: Custom headers
  final int timeout;           // Optional: Timeout in ms (default: 10000)
}
```

## Components

### SliderCaptcha

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| backend | BackendConfig | - | **Required**, backend API config |
| width | double | 300 | Container width |
| height | double | 170 | Container height |
| sliderWidth | double | 42 | Slider piece width |
| sliderHeight | double | 42 | Slider piece height |
| showRefresh | bool | true | Show refresh button |
| locale | String | 'zh-CN' | Language |
| onSuccess | VoidCallback? | - | Success callback |
| onFail | VoidCallback? | - | Fail callback |

### ClickCaptcha

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| backend | BackendConfig | - | **Required**, backend API config |
| width | double | 300 | Container width |
| height | double | 170 | Container height |
| showRefresh | bool | true | Show refresh button |

## License

MIT