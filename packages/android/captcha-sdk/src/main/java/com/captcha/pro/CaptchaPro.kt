package com.captcha.pro

import android.content.Context
import com.captcha.pro.core.*
import com.captcha.pro.widget.*

/**
 * Captcha Pro - Android SDK
 *
 * A comprehensive captcha verification library for Android
 * supporting slider and click captcha types.
 *
 * Usage:
 * ```kotlin
 * // Show slider captcha dialog
 * CaptchaPro.showSlider(context) {
 *     // Verification success
 * }
 *
 * // Show click captcha dialog
 * CaptchaPro.showClick(context) {
 *     // Verification success
 * }
 *
 * // Use as embedded view
 * val sliderView = CaptchaPro.createSliderView(context)
 * container.addView(sliderView)
 * ```
 */
object CaptchaPro {

    /**
     * Create slider captcha view
     */
    @JvmStatic
    @JvmOverloads
    fun createSliderView(
        context: Context,
        width: Int = 300,
        height: Int = 170,
        showRefresh: Boolean = true,
        callback: SliderCaptchaCallback? = null
    ): SliderCaptchaView {
        return SliderCaptchaView(context).apply {
            this.captchaWidth = width
            this.captchaHeight = height
            this.showRefresh = showRefresh
            this.callback = callback
        }
    }

    /**
     * Create click captcha view
     */
    @JvmStatic
    @JvmOverloads
    fun createClickView(
        context: Context,
        width: Int = 300,
        height: Int = 170,
        clickCount: Int = 3,
        showRefresh: Boolean = true,
        callback: ClickCaptchaCallback? = null
    ): ClickCaptchaView {
        return ClickCaptchaView(context).apply {
            this.captchaWidth = width
            this.captchaHeight = height
            this.clickCount = clickCount
            this.showRefresh = showRefresh
            this.callback = callback
        }
    }

    /**
     * Show slider captcha dialog
     */
    @JvmStatic
    @JvmOverloads
    fun showSlider(
        context: Context,
        width: Int = 300,
        height: Int = 170,
        showRefresh: Boolean = true,
        onSuccess: () -> Unit = {},
        onFail: () -> Unit = {},
        onRefresh: () -> Unit = {}
    ): CaptchaDialog {
        return CaptchaDialog.showSlider(
            context,
            width,
            height,
            onSuccess,
            onFail,
            onRefresh
        )
    }

    /**
     * Show click captcha dialog
     */
    @JvmStatic
    @JvmOverloads
    fun showClick(
        context: Context,
        width: Int = 300,
        height: Int = 170,
        clickCount: Int = 3,
        showRefresh: Boolean = true,
        onSuccess: () -> Unit = {},
        onFail: () -> Unit = {},
        onRefresh: () -> Unit = {}
    ): CaptchaDialog {
        val dialog = CaptchaDialog(context, CaptchaType.CLICK, width, height, showRefresh)
        (dialog.findViewById<View>(com.captcha.pro.R.id.captcha_click_view) as? ClickCaptchaView)?.let {
            it.clickCount = clickCount
        }
        dialog.setCallback(object : CaptchaCallback {
            override fun onSuccess() = onSuccess()
            override fun onFail() = onFail()
            override fun onRefresh() = onRefresh()
        })
        dialog.show()
        return dialog
    }

    /**
     * Generate captcha data
     */
    @JvmStatic
    @JvmOverloads
    fun generate(
        type: CaptchaType = CaptchaType.SLIDER,
        width: Int = 300,
        height: Int = 170,
        sliderWidth: Int = 42,
        sliderHeight: Int = 42,
        clickCount: Int = 3
    ): CaptchaResult {
        val options = CaptchaOptions(
            type = type,
            width = width,
            height = height,
            sliderWidth = sliderWidth,
            sliderHeight = sliderHeight,
            clickCount = clickCount
        )
        return CaptchaGenerator().generate(options)
    }
}
