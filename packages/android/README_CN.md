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
