# Android 平台集成指南

本指南详细说明如何在 Android 项目中使用 captcha-pro。

## 安装

在 `build.gradle` 中添加：

```gradle
dependencies {
    implementation 'com.captcha.pro:captcha-sdk:2.3.0'
}
```

---

## 基础使用

### XML 布局

```xml
<com.captcha.pro.SliderCaptchaView
    android:id="@+id/captchaView"
    android:layout_width="300dp"
    android:layout_height="170dp"
    app:precision="5"
    app:showRefresh="true" />
```

### Kotlin 代码

```kotlin
class MainActivity : AppCompatActivity() {
    private lateinit var captchaView: SliderCaptchaView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        captchaView = findViewById(R.id.captchaView)

        captchaView.setOnSuccessListener {
            Log.d("Captcha", "验证通过!")
        }

        captchaView.setOnFailListener {
            Log.d("Captcha", "验证失败!")
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
            Log.d("Captcha", "验证通过!")
        }
    )
}
```

---

## 后端验证

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

## 🔗 相关链接

- [API 参考手册](../api/)
- [后端集成指南](../guides/backend-integration.md)