package com.captcha.pro.core

/**
 * Point representation
 */
data class CaptchaPoint(
    val x: Float,
    val y: Float,
    val text: String? = null
)

/**
 * Captcha generation options
 */
data class CaptchaOptions(
    val type: CaptchaType = CaptchaType.SLIDER,
    val width: Int = 300,
    val height: Int = 170,
    val sliderWidth: Int = 42,
    val sliderHeight: Int = 42,
    val precision: Int = 5,
    val clickCount: Int = 3
)

/**
 * Captcha type
 */
enum class CaptchaType {
    SLIDER,
    CLICK
}

/**
 * Captcha generation result
 */
data class CaptchaResult(
    val bgBitmap: android.graphics.Bitmap,
    val sliderBitmap: android.graphics.Bitmap? = null,
    val targetPoints: List<CaptchaPoint>,
    val sliderY: Float = 0f,
    val clickTexts: List<String>? = null
)

/**
 * Verification result
 */
data class VerifyResult(
    val success: Boolean,
    val message: String = ""
)

/**
 * Captcha callback interface
 */
interface CaptchaCallback {
    fun onSuccess()
    fun onFail()
    fun onRefresh()
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
