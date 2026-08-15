# @captcha-pro/android

Captcha Pro 的 Android 原生 SDK，提供 Kotlin/Jetpack Compose 验证码组件。

## 模块

### captcha-sdk

核心 Android SDK，提供基于传统 View 的验证码组件。

```groovy
implementation 'com.captcha.pro:captcha-sdk:2.0.0'
```

### captcha-compose

Jetpack Compose 验证码组件。

```groovy
implementation 'com.captcha.pro:captcha-compose:2.0.0'
```

## 特性

- **滑动拼图验证码** - 拖动滑块完成拼图验证
- **点选文字验证码** - 按正确顺序点选文字
- **后端验证** - 服务端验证
- **Kotlin Coroutines** - 现代异步编程
- **Jetpack Compose** - 声明式 UI 组件
- **Material Design 3** - 现代 UI 组件

## 安装

在 `build.gradle` 中添加：

```groovy
repositories {
    mavenCentral()
}

dependencies {
    // Core SDK (View-based)
    implementation 'com.captcha.pro:captcha-sdk:2.0.0'

    // Or Compose version
    implementation 'com.captcha.pro:captcha-compose:2.0.0'
}
```

## 使用（Compose）

```kotlin
import com.captcha.pro.compose.SliderCaptcha
import com.captcha.pro.core.BackendVerifyOptions
import com.captcha.pro.core.CaptchaLocale

@Composable
fun CaptchaScreen() {
    // URL string mode — SDK does HTTP internally.
    // Or pass lambdas: BackendVerifyOptions(getCaptcha = { ... }, verify = { ... })
    val backendVerify = BackendVerifyOptions(
        getCaptchaUrl = "https://your-api.com/captcha/get",
        verifyUrl = "https://your-api.com/captcha/verify",
    )

    SliderCaptcha(
        backendVerify = backendVerify,
        locale = CaptchaLocale.ZH_CN,       // or CaptchaLocale.EN_US
        width = 300,
        height = 170,
        onSuccess = { println("Passed!") },
        onFail = { println("Failed") },
        onError = { e -> println("Error: $e") },
    )
}
```

`ClickCaptcha` 接受相同的参数；当后端返回 `clickCharImages` 时，在提示栏渲染字符图片，否则回退到 `clickTexts`。

## Popup（Facade）

```kotlin
import com.captcha.pro.CaptchaPro

// Presents a slider popup dialog; auto-dismisses on success.
CaptchaPro.showSlider(
    context = context,
    backendVerify = backendVerify,
    locale = CaptchaLocale.ZH_CN,
    onSuccess = { println("Passed!") },
    onFail = { println("Failed") },
)
```

## 后端配置

`BackendVerifyOptions` 接受 URL 字符串（SDK 内部执行 HTTP）或
suspend 函数——与 taro-vue 的 `string | function` 契约一致。

```kotlin
// URL string overload
BackendVerifyOptions(
    getCaptchaUrl = "https://your-api.com/captcha/get",
    verifyUrl = "https://your-api.com/captcha/verify",
    headers = mapOf("Authorization" to "Bearer xxx"),  // optional
    timeout = 10_000,                                  // optional, ms
)

// Lambda overload (custom transport)
BackendVerifyOptions(
    getCaptcha = { api.fetchCaptcha() },          // suspend () -> BackendCaptchaResponse
    verify = { data -> api.verify(data) },         // suspend (CaptchaData) -> BackendVerifyResponse
)
```

### 验证请求 `target`（多态）

- Slider → `[sliderX]`（数字数组）
- Click → `[{ x, y, text? }, ...]`（点数组）

### i18n

向任意组件传入 `locale = CaptchaLocale.ZH_CN` 或 `CaptchaLocale.EN_US`。状态文案
（成功 / 失败 / 提示 / 错误）通过 `LocaleMessages.get(locale, key)` 解析。

## 许可证

MIT

---

## 构建与验证指南（零基础也能跟着做）

> **先看这里：** `@captcha-pro/android` 是一个 **SDK 库**，不是能单独运行的 App。它本身没有界面让你直接「看到验证码」。它是给开发人员嵌进更大 Android 应用的一组零件。本指南教你怎么把这个库构建出来、怎么确认构建成功。想**亲眼看到验证码效果**，最快的方式是打开 **`examples/vue`**（在浏览器里跑），见根目录的 `README.md`。

### 1. 装软件

只需要装 **Android Studio**（它自带 Java、Android SDK、Gradle，不用你单独装）。

1. 打开官网 <https://developer.android.com/studio>，下载**最新稳定版**。
2. **macOS**：把 `Android Studio.app` 拖进 `/Applications`；**Windows**：双击 `.exe` 安装。
3. 打开一次 Android Studio，它会提示下载 **Android SDK**，等它下完（要联网，首次几分钟）。
4. Android Studio 会自带 JDK，所以**不用单独装 Java**。

### 2. 打开项目

1. Android Studio 里选 **File → Open…**（或欢迎页的「Open an existing Project」）。
2. 选 `packages/android` 这个目录（里面包含 `build.gradle.kts` 那个）。**不要**选整个仓库根目录。
3. 等 **Gradle Sync** 完成。看底部状态栏，首次要联网，可能要几分钟。

### 3. 构建

**方式 A——用鼠标（推荐非开发人员）：**
顶部菜单 **Build → Make Project**，等下方 Build 输出出现 `BUILD SUCCESSFUL`。

**方式 B——命令行：**
在 Android Studio 底部的 **Terminal** 里输入：

```bash
./gradlew :captcha-sdk:assembleDebug :captcha-compose:assembleDebug
```

**Windows** 请用 `gradlew.bat`：

```bat
gradlew.bat :captcha-sdk:assembleDebug :captcha-compose:assembleDebug
```

如果提示没有 `gradlew`，先输 `gradle wrapper --gradle-version 8.7` 生成（前提是你全局装了 gradle）；也可以直接用 `gradle :captcha-sdk:assembleDebug --no-daemon`。

### 4. 怎么算成功

输出里出现 `BUILD SUCCESSFUL` 就是成功。产物（`.aar` / `.jar`）在：

- `captcha-sdk/build/outputs/`
- `captcha-compose/build/outputs/`

### 5. 怎么看验证码效果

这是库不是 App，没界面。想看效果最快去 **`examples/vue`**（浏览器里跑），见根目录 `README.md`。

### 6. 常见报错

- `Failed to find Build Tools revision 34.0.0` → 打开 **Android Studio → SDK Manager**（带向下箭头的方块图标），切到 **SDK Tools** 标签，勾上 **Show Package Details**，在 **Android SDK Build-Tools** 下勾选 **34.0.0** 安装。
- **Gradle sync 失败 / 连接超时** → 网络问题。本仓库已配置阿里云镜像，海外网络可能需要在 **File → Settings → Appearance & Behavior → System Settings → HTTP Proxy** 里设代理。
