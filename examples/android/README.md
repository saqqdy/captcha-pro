# Captcha Pro · Android 示例

原生 Android 示例 app，演示 `captcha-pro` Android SDK 的滑块 / 点选 / 弹窗三种验证码用法。

后端走在线服务（`server/node`），与 Flutter 示例一致；不依赖 Android 网络权限以外的任何配置。

## 运行

### 1. 启动后端

后端默认只监听 `localhost`，模拟器与真机都连不上，必须显式绑定到所有网卡：

```bash
HOST=0.0.0.0 pnpm dev:server   # 仓库根目录
```

> 也可 `cd server/node && pnpm install && HOST=0.0.0.0 pnpm dev`。
> `.node-version` 为 18，用 fnm 时先 `fnm use 18`。

验证服务可达（`<宿主局域网 IP>` 用 `ipconfig getifaddr en0` 查）：

```bash
curl http://<宿主局域网 IP>:3001/api/health   # 期望 {"status":"ok",...}
```

### 2. 构建并安装

后端地址在编译期注入，默认 `10.0.2.2`（模拟器专用别名，真机不可路由）：

```bash
cd examples/android

# 模拟器
./gradlew installDebug

# 真机 — Wi-Fi，填宿主的局域网 IP
./gradlew installDebug -PCAPTCHA_HOST=192.168.1.10

# 真机 — USB（不依赖 Wi-Fi，重启 adb 后需重设）
adb reverse tcp:3001 tcp:3001
./gradlew installDebug -PCAPTCHA_HOST=localhost
```

### 平台差异

| 目标 | 后端地址 |
| --- | --- |
| Android 模拟器 | `http://10.0.2.2:3001` |
| 真机（Wi-Fi） | `http://<宿主局域网 IP>:3001` |
| 真机（USB reverse） | `http://localhost:3001` |

## 已知卡点

- **MIUI 真机装不上 APK**：报 `INSTALL_FAILED_USER_RESTRICTED` 时，需开发者选项里开「USB 安装」；若仍失败，再关掉 Google 的安全验证：
  ```bash
  adb shell settings put global package_verifier_enable 0
  ```
- **Gradle 发行版下载慢**：wrapper 已指向阿里云镜像；`services.gradle.org` 与 `dl.google.com` 在本机网络不可达。
- **HTTP 明文**：demo 后端是明文 HTTP。Android 10 起默认禁用，故 `src/debug/AndroidManifest.xml` 里开了 `usesCleartextTraffic`（仅 debug，release 保持默认）。

## 版本基线

与 `examples/flutter/android` 保持一致：Gradle 9.1.0 / AGP 9.0.1 / Kotlin 2.3.20 / compileSdk 36 / minSdk 24 / Java 17。

仓库依赖统一走阿里云镜像（`settings.gradle.kts`）——Flutter 示例用的是 `google()`，本机网络下不可达。
