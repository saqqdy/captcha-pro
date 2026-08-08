package com.captcha.pro

import android.content.Context
import com.captcha.pro.core.*
import com.captcha.pro.widget.*
import kotlinx.coroutines.*

/**
 * Captcha Pro - Android SDK (Backend-only verification)
 *
 * A comprehensive captcha verification library for Android
 * supporting slider and click captcha types with backend verification.
 */
object CaptchaPro {

    @JvmStatic
    fun createSliderView(
        context: Context,
        backendVerify: BackendVerifyOptions,
        width: Int = 300,
        height: Int = 170,
        showRefresh: Boolean = true,
        locale: CaptchaLocale = CaptchaLocale.ZH_CN,
        callback: SliderCaptchaCallback? = null
    ): SliderCaptchaView {
        return SliderCaptchaView(context).apply {
            this.backendVerify = backendVerify
            this.captchaWidth = width
            this.captchaHeight = height
            this.showRefresh = showRefresh
            this.locale = locale
            this.callback = callback
        }
    }

    @JvmStatic
    fun createClickView(
        context: Context,
        backendVerify: BackendVerifyOptions,
        width: Int = 300,
        height: Int = 170,
        clickCount: Int = 3,
        showRefresh: Boolean = true,
        locale: CaptchaLocale = CaptchaLocale.ZH_CN,
        callback: ClickCaptchaCallback? = null
    ): ClickCaptchaView {
        return ClickCaptchaView(context).apply {
            this.backendVerify = backendVerify
            this.captchaWidth = width
            this.captchaHeight = height
            this.clickCount = clickCount
            this.showRefresh = showRefresh
            this.locale = locale
            this.callback = callback
        }
    }

    @JvmStatic
    fun showSlider(
        context: Context,
        backendVerify: BackendVerifyOptions,
        width: Int = 300,
        height: Int = 170,
        showRefresh: Boolean = true,
        locale: CaptchaLocale = CaptchaLocale.ZH_CN,
        onSuccess: (VerifyResult?) -> Unit = {},
        onFail: () -> Unit = {},
        onRefresh: () -> Unit = {}
    ): CaptchaDialog {
        return CaptchaDialog.showSlider(
            context = context,
            backendVerify = backendVerify,
            width = width,
            height = height,
            showRefresh = showRefresh,
            locale = locale,
            onSuccess = onSuccess,
            onFail = onFail,
            onRefresh = onRefresh
        )
    }

    @JvmStatic
    fun showClick(
        context: Context,
        backendVerify: BackendVerifyOptions,
        width: Int = 300,
        height: Int = 170,
        clickCount: Int = 3,
        showRefresh: Boolean = true,
        locale: CaptchaLocale = CaptchaLocale.ZH_CN,
        onSuccess: (VerifyResult?) -> Unit = {},
        onFail: () -> Unit = {},
        onRefresh: () -> Unit = {}
    ): CaptchaDialog {
        return CaptchaDialog.showClick(
            context = context,
            backendVerify = backendVerify,
            width = width,
            height = height,
            clickCount = clickCount,
            showRefresh = showRefresh,
            locale = locale,
            onSuccess = onSuccess,
            onFail = onFail,
            onRefresh = onRefresh
        )
    }

    @JvmStatic
    suspend fun generate(
        backendVerify: BackendVerifyOptions,
        type: CaptchaType = CaptchaType.SLIDER,
        width: Int = 300,
        height: Int = 170,
        sliderWidth: Int = 42,
        sliderHeight: Int = 42,
        clickCount: Int = 3,
        locale: CaptchaLocale = CaptchaLocale.ZH_CN
    ): CaptchaResult {
        val options = CaptchaOptions(
            type = type, width = width, height = height,
            sliderWidth = sliderWidth, sliderHeight = sliderHeight,
            clickCount = clickCount, backendVerify = backendVerify, locale = locale
        )
        return CaptchaGenerator().generate(options)
    }

    @JvmStatic
    fun getLocaleMessage(locale: CaptchaLocale, key: String): String {
        return LocaleMessages.get(locale, key)
    }

    const val VERSION = "1.0.0"
}
