# Captcha Pro · Flutter 示例

Flutter 示例 app，演示 `captcha_pro` 包的滑块 / 点选 / 弹窗三种验证码用法。

后端走在线服务（`server/node`），与 iOS 示例一致。

## 运行

### 1. 启动后端

```bash
cd server/node
pnpm install
pnpm dev   # 监听 http://localhost:3001
```

> 仓库根目录也可 `pnpm dev:server`。`.node-version` 为 18，用 fnm 时先 `fnm use 18`。

### 2. 生成平台目录（仅首次，或 `ios/`、`android/` 缺失时）

本仓库只提交 `lib/` 源码与 `pubspec.yaml`，平台工程不入库。若目录不存在：

```bash
cd examples/flutter
flutter create --platforms=ios,android --org com.captchapro .
flutter pub get
```

### 3. 运行示例

```bash
# 查看可用设备
flutter devices

# iOS 模拟器（推荐；iOS 模拟器共享宿主 loopback，localhost 可直接用）
flutter run -d "iPhone 16e"

# Android（需先接受 Android 许可：flutter doctor --android-licenses）
flutter run
```

`flutter run` 进入交互会话，常用快捷键：`r` 热重载、`R` 热重启、`q` 退出。

### 平台差异

| 平台 | 后端地址 |
| --- | --- |
| iOS 模拟器 | `http://localhost:3001`（共享宿主 loopback） |
| Android 模拟器 | `http://10.0.2.2:3001`（`10.0.2.2` 是宿主 loopback 别名） |
| 真机 | `http://<宿主局域网 IP>:3001` |

如需切换地址，改 [lib/main.dart](lib/main.dart) 顶部的 `_backend` 常量即可（它已按 `Platform.isAndroid` 自动选 `10.0.2.2`）。

后端默认只监听 `::1`，Android 模拟器与真机都连不上，启动时必须显式绑定到所有网卡：

```bash
HOST=0.0.0.0 pnpm dev:server
```

### 调试

```bash
# 单独跑分析 / 测试
flutter analyze
flutter test

# 只构建不运行
flutter build ios --simulator
flutter build apk --debug
```

> **Android 路径在本机可能不可用**，优先用 iOS 模拟器验证。两个已知卡点：
>
> 1. 模拟器起不来——`emulator -accel-check` 返回 `accel: 0`（无硬件加速），只能软件渲染，冷启动后长期停在 `emulator-5554 offline`。
> 2. Gradle 下载断流——`gradle-9.1.0-all.zip` 从 `services.gradle.org` 下不完（只留下 `.part`），`android/gradle/wrapper/gradle-wrapper.properties` 已改成阿里云镜像。
>
> 可行替代：用 USB 真机（`adb devices` 能看到即可），或从 Android Studio 启动 AVD。

## 功能

- **Slider** tab — 内嵌 `SliderCaptcha`
- **Click** tab — 内嵌 `ClickCaptcha`
- **Popup** tab — 两个按钮调 `PopupCaptcha.show` 弹出滑块 / 点选验证码

验证结果通过 SnackBar 反馈。Mock 后端生成的拼图 / 点选图由 `server/node` 离线生成，拖动滑块到缺口、或按提示顺序点击字符即可通过。