# Flutter Platform Integration Guide

This guide details how to use captcha-pro in Flutter projects.

## Installation

Add the following to `pubspec.yaml`:

```yaml
dependencies:
  captcha_pro: ^2.2.0
```

Then run:

```bash
flutter pub get
```

---

## Basic Usage

### Slider Captcha

```dart
import 'package:captcha_pro/captcha_pro.dart';

class MyWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return SliderCaptcha(
      width: 300,
      height: 170,
      precision: 5,
      showRefresh: true,
      onSuccess: () {
        print('Passed!');
      },
      onFail: () {
        print('Failed!');
      },
    );
  }
}
```

### Click Captcha

```dart
ClickCaptcha(
  width: 300,
  height: 170,
  count: 3,
  onSuccess: () {
    print('Passed!');
  },
)
```

---

## Backend Verification

```dart
SliderCaptcha(
  width: 300,
  height: 170,
  verifyMode: VerifyMode.backend,
  backendVerify: BackendVerifyOptions(
    getCaptcha: 'https://your-domain.com/api/captcha',
    verify: 'https://your-domain.com/api/captcha/verify',
    timeout: Duration(seconds: 10),
  ),
  onSuccess: () {
    print('Backend verification passed!');
  },
)
```

---

## 🔗 Related Links

- [API Reference](../api/README.md)
- [Options](../api/options.md)
- [Backend Integration Guide](../guides/backend-integration.md)
