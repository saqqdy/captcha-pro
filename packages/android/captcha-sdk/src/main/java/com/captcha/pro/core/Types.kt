package com.captcha.pro.core

import android.graphics.Bitmap

/**
 * Locale support
 */
enum class CaptchaLocale(val code: String) {
    ZH_CN("zh-CN"),
    EN_US("en-US");

    companion object {
        fun fromCode(code: String): CaptchaLocale = values().find { it.code == code } ?: ZH_CN
    }
}

/**
 * Locale messages
 */
object LocaleMessages {
    private val messages = mapOf(
        CaptchaLocale.ZH_CN to mapOf(
            "loading" to "加载中...",
            "slider_slide" to "请拖动滑块完成验证",
            "slider_hint" to "→ 按住滑块，拖动完成验证",
            "slider_success" to "验证成功",
            "slider_fail" to "验证失败",
            "click_prompt" to "请依次点击：",
            "click_success" to "验证成功",
            "click_fail" to "验证失败",
            "popup_title" to "请完成安全验证",
            "popup_close" to "关闭",
            "refresh" to "刷新",
            "error_network" to "网络错误",
            "error_expired" to "验证码已过期",
            "error_invalid" to "验证失败",
            "error_not_found" to "验证码不存在"
        ),
        CaptchaLocale.EN_US to mapOf(
            "loading" to "Loading...",
            "slider_slide" to "Please slide to verify",
            "slider_hint" to "→ Hold and drag the slider to verify",
            "slider_success" to "Verification successful",
            "slider_fail" to "Verification failed",
            "click_prompt" to "Please click in order: ",
            "click_success" to "Verification successful",
            "click_fail" to "Verification failed",
            "popup_title" to "Please complete security verification",
            "popup_close" to "Close",
            "refresh" to "Refresh",
            "error_network" to "Network error",
            "error_expired" to "Captcha expired",
            "error_invalid" to "Verification failed",
            "error_not_found" to "Captcha not found"
        )
    )

    fun get(locale: CaptchaLocale, key: String): String {
        return messages[locale]?.get(key) ?: messages[CaptchaLocale.ZH_CN]?.get(key) ?: key
    }
}

/**
 * Point representation
 */
data class CaptchaPoint(
    val x: Float,
    val y: Float,
    val text: String? = null
)

/**
 * Captcha type
 */
enum class CaptchaType {
    SLIDER,
    CLICK
}

/**
 * getCaptcha endpoint — URL string (SDK does HTTP) or suspend function.
 * Mirrors taro-vue BackendConfig.getCaptcha: string | function
 */
sealed interface GetCaptchaEndpoint {
    data class Url(val url: String) : GetCaptchaEndpoint
    class Fn(val fn: suspend () -> BackendCaptchaResponse) : GetCaptchaEndpoint
}

/**
 * verify endpoint — URL string (SDK does HTTP) or suspend function.
 * Mirrors taro-vue BackendConfig.verify: string | function
 */
sealed interface VerifyEndpoint {
    data class Url(val url: String) : VerifyEndpoint
    class Fn(val fn: suspend (CaptchaData) -> BackendVerifyResponse) : VerifyEndpoint
}

/**
 * Backend verify options - backend is required.
 * getCaptcha/verify accept either a URL string (SDK does HTTP internally)
 * or a suspend function. Convenience constructors preserve the legacy
 * lambda-only call site.
 */
data class BackendVerifyOptions(
    val getCaptcha: GetCaptchaEndpoint,
    val verify: VerifyEndpoint,
    val headers: Map<String, String>? = null,
    val timeout: Long = 10000
) {
    /** Lambda overload — matches taro-vue function config. */
    constructor(
        getCaptcha: suspend () -> BackendCaptchaResponse,
        verify: suspend (CaptchaData) -> BackendVerifyResponse,
        headers: Map<String, String>? = null,
        timeout: Long = 10000,
    ) : this(GetCaptchaEndpoint.Fn(getCaptcha), VerifyEndpoint.Fn(verify), headers, timeout)

    /** URL string overload — matches taro-vue string config. */
    constructor(
        getCaptchaUrl: String,
        verifyUrl: String,
        headers: Map<String, String>? = null,
        timeout: Long = 10000,
    ) : this(GetCaptchaEndpoint.Url(getCaptchaUrl), VerifyEndpoint.Url(verifyUrl), headers, timeout)
}

/**
 * Backend captcha response
 */
data class BackendCaptchaResponse(
    val data: CaptchaResponseData
)

data class CaptchaResponseData(
    val captchaId: String,
    val bgImage: String,
    val sliderImage: String? = null,
    val sliderY: Float? = null,
    val clickTexts: List<String>? = null,
    val clickCharImages: List<String>? = null,
    val width: Int? = null,
    val height: Int? = null,
    val timestamp: Long? = null
)

/**
 * Backend verify response
 */
data class BackendVerifyResponse(
    val success: Boolean,
    val message: String? = null,
    val data: Map<String, Any>? = null
)

/**
 * Captcha data for verification.
 * target is polymorphic: slider -> List<Float> ([sliderX]); click -> List<CaptchaPoint>.
 * Mirrors taro-vue BackendVerifyRequest.target: number[] | Point[]
 */
data class CaptchaData(
    val type: CaptchaType,
    val captchaId: String,
    val target: List<Any>,
    val timestamp: Long = System.currentTimeMillis()
)

/**
 * Captcha generation options - backend is required
 */
data class CaptchaOptions(
    val type: CaptchaType = CaptchaType.SLIDER,
    val width: Int = 300,
    val height: Int = 170,
    val sliderWidth: Int = 42,
    val sliderHeight: Int = 42,
    val clickCount: Int = 3,
    val backendVerify: BackendVerifyOptions,
    val locale: CaptchaLocale = CaptchaLocale.ZH_CN
)

/**
 * Captcha generation result
 */
data class CaptchaResult(
    val bgBitmap: Bitmap,
    val sliderBitmap: Bitmap? = null,
    val targetPoints: List<CaptchaPoint>,
    val sliderY: Float = 0f,
    val clickTexts: List<String>? = null,
    val clickCharImages: List<String>? = null,
    val captchaId: String,
    val timestamp: Long = System.currentTimeMillis()
)

/**
 * Verification result — payload for [CaptchaCallback.onSuccess].
 * Mirrors taro-vue onSuccess data: { verifiedAt: number | null }.
 */
data class VerifyResult(
    val verifiedAt: Long? = null
)

/**
 * Captcha statistics
 */
data class CaptchaStatistics(
    val totalAttempts: Int = 0,
    val successCount: Int = 0,
    val failCount: Int = 0,
    val successRate: Float = 0f,
    val avgVerifyTime: Long = 0,
    val avgDragDistance: Float = 0f,
    val avgDragTime: Long = 0,
    val avgClickCount: Float = 0f
)

/**
 * Internal statistics data
 */
internal data class StatisticsData(
    var totalAttempts: Int = 0,
    var successCount: Int = 0,
    var failCount: Int = 0,
    var totalVerifyTime: Long = 0,
    var totalDragDistance: Float = 0f,
    var totalDragTime: Long = 0,
    var totalClickCount: Int = 0
) {
    fun toStatistics(): CaptchaStatistics {
        val rate = if (totalAttempts > 0) (successCount.toFloat() / totalAttempts * 100) else 0f
        return CaptchaStatistics(
            totalAttempts = totalAttempts,
            successCount = successCount,
            failCount = failCount,
            successRate = rate,
            avgVerifyTime = if (totalAttempts > 0) totalVerifyTime / totalAttempts else 0,
            avgDragDistance = if (totalAttempts > 0) totalDragDistance / totalAttempts else 0f,
            avgDragTime = if (totalAttempts > 0) totalDragTime / totalAttempts else 0,
            avgClickCount = if (totalAttempts > 0) totalClickCount.toFloat() / totalAttempts else 0f
        )
    }
}

/**
 * Captcha callback interface
 */
interface CaptchaCallback {
    fun onSuccess(data: VerifyResult?)
    fun onFail()
    fun onRefresh()
    fun onError(error: Throwable) {}
}

/**
 * Slider captcha callback
 */
interface SliderCaptchaCallback : CaptchaCallback {
    fun onDrag(distance: Float)
}

/**
 * Click captcha callback
 */
interface ClickCaptchaCallback : CaptchaCallback {
    fun onClick(point: CaptchaPoint, index: Int)
}
