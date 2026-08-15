# @captcha-pro/android

Android native SDK for Captcha Pro, providing Kotlin/Jetpack Compose captcha components.

**[简体中文](./README_CN.md)**

## Modules

### captcha-sdk

Core Android SDK with traditional View-based captcha components.

```groovy
implementation 'com.captcha.pro:captcha-sdk:2.0.0'
```

### captcha-compose

Jetpack Compose captcha components.

```groovy
implementation 'com.captcha.pro:captcha-compose:2.0.0'
```

## Features

- **Slider Captcha** - Drag slider to complete puzzle verification
- **Click Captcha** - Click characters in correct order
- **Backend Verification** - Server-side validation
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
    implementation 'com.captcha.pro:captcha-sdk:2.0.0'

    // Or Compose version
    implementation 'com.captcha.pro:captcha-compose:2.0.0'
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

---

## Build & Verify Guide (No Coding Experience Needed)

> **Read this first:** `@captcha-pro/android` is an **SDK library**. It has no screen you can tap to "see a captcha". It is a box of parts that developers embed inside a bigger Android app. This guide shows you how to build the library itself and confirm the build succeeded. To actually *see* a captcha working in your browser (fastest, no install), open the **`examples/vue`** folder — see the root `README.md`.

### 1. Install the software

You only need **Android Studio** (it bundles Java, the Android SDK, and Gradle — you do not install them separately).

1. Go to <https://developer.android.com/studio> and download the **latest stable** version for your OS.
2. **macOS:** drag `Android Studio.app` into `/Applications`. **Windows:** run the `.exe` installer.
3. Open Android Studio once. It will ask to download the **Android SDK** — let it finish (needs internet; first time can take several minutes).
4. Android Studio installs its own JDK, so you do **not** need to install Java yourself.

### 2. Open the project

1. In Android Studio choose **File → Open…** (or "Open an existing Project" on the welcome screen).
2. Select the `packages/android` folder (the one containing `build.gradle.kts`). Do **not** select the whole repo root.
3. Wait for **Gradle Sync** to finish. Watch the status bar at the bottom; the first sync needs internet and can take a few minutes.

### 3. Build

**Way A — with the mouse (recommended for non-developers):**
Top menu **Build → Make Project**. Wait for the **Build** tab at the bottom to print `BUILD SUCCESSFUL`.

**Way B — command line:**
Open the **Terminal** tab inside Android Studio (bottom of the window) and run:

```bash
./gradlew :captcha-sdk:assembleDebug :captcha-compose:assembleDebug
```

On **Windows** use `gradlew.bat` instead:

```bat
gradlew.bat :captcha-sdk:assembleDebug :captcha-compose:assembleDebug
```

If it complains there is no `gradlew`, generate it first with `gradle wrapper --gradle-version 8.7` (only if you have a global `gradle` installed). As a fallback you can also call gradle directly: `gradle :captcha-sdk:assembleDebug --no-daemon`.

### 4. How to know it worked

You see `BUILD SUCCESSFUL` in the output. The build artifacts (`.aar` / `.jar` files) appear under:

- `captcha-sdk/build/outputs/`
- `captcha-compose/build/outputs/`

### 5. How to actually see a captcha

This package is a library — no UI to open. The quickest way to see a captcha in action is the **`examples/vue`** example, which runs in a browser. See the root `README.md`.

### 6. Common errors

- `Failed to find Build Tools revision 34.0.0` → open **Android Studio → SDK Manager** (the cube icon with a downward arrow), switch to the **SDK Tools** tab, check **Show Package Details**, and install **34.0.0** under **Android SDK Build-Tools**.
- **Gradle sync failed / connection timed out** → network problem. This repo already configures Aliyun mirrors; if you are outside China you may need to set an HTTP proxy under **File → Settings → Appearance & Behavior → System Settings → HTTP Proxy**.