# @captcha-pro/android

Android native SDK for Captcha Pro, providing Kotlin/Jetpack Compose captcha components.

**[简体中文](./README_CN.md)**

## Modules

### captcha-sdk

Core Android SDK with traditional View-based captcha components.

```groovy
implementation 'com.captcha.pro:captcha-sdk:1.1.0'
```

### captcha-compose

Jetpack Compose captcha components.

```groovy
implementation 'com.captcha.pro:captcha-compose:1.1.0'
```

## Features

- **Slider Captcha** - Drag slider to complete puzzle verification
- **Click Captcha** - Click characters in correct order
- **Backend Verification** - Server-side validation with AES encryption
- **Kotlin Coroutines** - Modern async programming
- **Jetpack Compose** - Declarative UI components
- **Material Design 3** - Modern UI components

## Installation

Add to your `build.gradle`:

```groovy
repositories {
    mavenCentral()
}

dependencies {
    // Core SDK (View-based)
    implementation 'com.captcha.pro:captcha-sdk:1.1.0'

    // Or Compose version
    implementation 'com.captcha.pro:captcha-compose:1.1.0'
}
```

## Usage (Compose)

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

`ClickCaptcha` takes the same params; when the backend returns `clickCharImages` it renders char images in the prompt bar, otherwise falls back to `clickTexts`.

## Popup (facade)

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

## Backend Configuration

`BackendVerifyOptions` accepts either a URL string (SDK performs HTTP internally) or a
suspend function — matching the taro-vue `string | function` contract.

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

### Verify request `target` (polymorphic)

- Slider → `[sliderX]` (number array)
- Click → `[{ x, y, text? }, ...]` (point array)

### i18n

Pass `locale = CaptchaLocale.ZH_CN` or `CaptchaLocale.EN_US` to any component. Status strings
(success / fail / prompt / errors) resolve via `LocaleMessages.get(locale, key)`.

## License

MIT