# captcha_pro

Captcha Pro 的 Flutter 插件包，提供由后端驱动的验证码组件（滑动 + 点选），内置 i18n。

## 安装

在 `pubspec.yaml` 中添加：

```yaml
dependencies:
  captcha_pro: ^2.0.0
```

---

## 构建与验证指南（零基础也能跟着做）

> **先看这里：** `captcha_pro` 是一个**插件包**，不是能单独运行的 App。它没有界面让你直接「看到验证码」，也没有 `lib/main.dart`。它是给开发人员通过 `flutter pub add captcha_pro` 加进更大 Flutter 应用的零件。本指南教你怎么验证这个包是否正常。想**亲眼看到验证码效果**（最快、不用装 Flutter），打开 **`examples/vue`**，见根目录 `README.md`。

### 1. 装软件

1. 安装 **Flutter SDK**。打开 <https://docs.flutter.dev/get-started/install>，选你的系统，下载 zip 解压，按页面说明把 `flutter/bin` 加进 PATH。
   - **macOS 快捷方式：** `brew install --cask flutter`。
2. 打开终端，输入：

   ```bash
   flutter doctor
   ```

   按提示补齐缺失项（比如 Android 工具链或 Xcode）。编辑器可选，**Android Studio** 或 **VS Code** 都行。

### 2. 验证

插件包用 analyzer 验证，不用 `flutter build`：

```bash
cd packages/flutter
flutter analyze
```

看到 `No issues found!` 就说明代码没问题、包是健康的。

> **这是正常的，不是错误：** 在这里跑 `flutter build apk` 会报 `Target file "lib/main.dart" not found`，因为这是插件包不是 App。用 `flutter analyze` 作为验证手段。

### 3. 怎么看验证码效果

没有可独立运行的 App。开发人员会在一个 Flutter 应用里 `flutter pub add captcha_pro` 后引用。非开发人员建议直接看 **`examples/vue`**（浏览器），见根目录 `README.md`。

### 4. 常见报错

- `flutter: command not found` → PATH 没配好，重做安装步骤，重启终端。
- `flutter analyze` 报错 → 把完整报错贴给开发人员，不要自己改 Dart 代码。

## 许可证

MIT
