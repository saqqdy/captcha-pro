# Flutter 平台集成指南

本指南详细说明如何在 Flutter 项目中使用 captcha-pro。

## 安装

在 `pubspec.yaml` 中添加：

```yaml
dependencies:
  captcha_pro: ^2.2.0
```

然后运行：

```bash
flutter pub get
```

---

## 基础使用

### 滑块验证码

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
        print('验证通过!');
      },
      onFail: () {
        print('验证失败!');
      },
    );
  }
}
```

### 点选验证码

```dart
ClickCaptcha(
  width: 300,
  height: 170,
  count: 3,
  onSuccess: () {
    print('验证通过!');
  },
)
```

---

## 后端验证

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
    print('后端验证通过!');
  },
)
```

---

## 🔗 相关链接

- [API 参考手册](../api/)
- [配置选项详解](../api/options.md)
- [后端集成指南](../guides/backend-integration.md)