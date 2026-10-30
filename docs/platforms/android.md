# Android Platform Integration Guide

This guide details how to use captcha-pro in Android projects.

## Installation

Add the following to `build.gradle`:

```gradle
dependencies {
    implementation 'com.captcha.pro:captcha-sdk:2.3.0'
}
```

---

## Basic Usage

### XML Layout

```xml
<com.captcha.pro.SliderCaptchaView
    android:id="@+id/captchaView"
    android:layout_width="300dp"
    android:layout_height="170dp"
    app:precision="5"
    app:showRefresh="true" />
```

### Kotlin Code

```kotlin
class MainActivity : AppCompatActivity() {
    private lateinit var captchaView: SliderCaptchaView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        captchaView = findViewById(R.id.captchaView)

        captchaView.setOnSuccessListener {
            Log.d("Captcha", "Passed!")
        }

        captchaView.setOnFailListener {
            Log.d("Captcha", "Failed!")
        }
    }
}
```

---

## Jetpack Compose

```gradle
dependencies {
    implementation 'com.captcha.pro:captcha-compose:2.3.0'
}
```

```kotlin
@Composable
fun CaptchaScreen() {
    SliderCaptcha(
        width = 300.dp,
        height = 170.dp,
        precision = 5f,
        onSuccess = {
            Log.d("Captcha", "Passed!")
        }
    )
}
```

---

## Backend Verification

```kotlin
val captchaView = SliderCaptchaView(context).apply {
    verifyMode = VerifyMode.BACKEND
    backendVerify = BackendVerifyOptions(
        getCaptcha = "https://your-domain.com/api/captcha",
        verify = "https://your-domain.com/api/captcha/verify"
    )
}
```

---

## 🔗 Related Links

- [API Reference](../api/README.md)
- [Backend Integration Guide](../guides/backend-integration.md)
