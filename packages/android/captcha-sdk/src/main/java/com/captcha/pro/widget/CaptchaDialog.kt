package com.captcha.pro.widget

import android.app.Dialog
import android.content.Context
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.graphics.drawable.GradientDrawable
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView
import com.captcha.pro.core.BackendVerifyOptions
import com.captcha.pro.core.CaptchaCallback
import com.captcha.pro.core.CaptchaLocale
import com.captcha.pro.core.CaptchaType
import com.captcha.pro.core.LocaleMessages
import com.captcha.pro.core.VerifyResult

/**
 * Captcha dialog for popup verification
 */
class CaptchaDialog(
    context: Context,
    private val type: CaptchaType = CaptchaType.SLIDER,
    private val backendVerify: BackendVerifyOptions,
    private val locale: CaptchaLocale = CaptchaLocale.ZH_CN,
    private val title: String = "",
    private val width: Int = 300,
    private val height: Int = 170,
    private val showRefresh: Boolean = true,
    private val maskClosable: Boolean = true,
    private val showClose: Boolean = true,
    private val autoClose: Boolean = true,
    private val closeDelay: Long = 500
) : Dialog(context, android.R.style.Theme_Translucent_NoTitleBar) {

    private var captchaView: View? = null
    private var callback: CaptchaCallback? = null

    init {
        setContentView(createContentView())
        window?.apply {
            setLayout(
                WindowManager.LayoutParams.MATCH_PARENT,
                WindowManager.LayoutParams.MATCH_PARENT
            )
            setBackgroundDrawable(ColorDrawable(Color.argb(128, 0, 0, 0)))
        }
    }

    private fun createContentView(): View {
        val density = context.resources.displayMetrics.density
        fun dp(v: Int) = (v * density).toInt()

        val cardDrawable = GradientDrawable().apply {
            setColor(Color.WHITE)
            cornerRadius = 24f * density
        }

        val card = LinearLayout(context).apply {
            orientation = LinearLayout.VERTICAL
            background = cardDrawable
            elevation = 8f * density
            setPadding(dp(24), dp(24), dp(24), dp(24))
            isClickable = true
        }

        card.addView(createHeader())

        captchaView = when (type) {
            CaptchaType.SLIDER -> SliderCaptchaView(context).apply {
                this.backendVerify = this@CaptchaDialog.backendVerify
                this.locale = this@CaptchaDialog.locale
                captchaWidth = width
                captchaHeight = height
                showRefresh = this@CaptchaDialog.showRefresh
                callback = object : com.captcha.pro.core.SliderCaptchaCallback {
                    override fun onSuccess(data: VerifyResult?) {
                        this@CaptchaDialog.callback?.onSuccess(data)
                        if (autoClose) postDelayed({ dismiss() }, closeDelay)
                    }
                    override fun onFail() {
                        this@CaptchaDialog.callback?.onFail()
                    }
                    override fun onRefresh() {
                        this@CaptchaDialog.callback?.onRefresh()
                    }
                    override fun onError(error: Throwable) {
                        this@CaptchaDialog.callback?.onError(error)
                    }
                    override fun onDrag(distance: Float) {}
                }
            }
            CaptchaType.CLICK -> ClickCaptchaView(context).apply {
                this.backendVerify = this@CaptchaDialog.backendVerify
                this.locale = this@CaptchaDialog.locale
                captchaWidth = width
                captchaHeight = height
                showRefresh = this@CaptchaDialog.showRefresh
                callback = object : com.captcha.pro.core.ClickCaptchaCallback {
                    override fun onSuccess(data: VerifyResult?) {
                        this@CaptchaDialog.callback?.onSuccess(data)
                        if (autoClose) postDelayed({ dismiss() }, closeDelay)
                    }
                    override fun onFail() {
                        this@CaptchaDialog.callback?.onFail()
                    }
                    override fun onRefresh() {
                        this@CaptchaDialog.callback?.onRefresh()
                    }
                    override fun onError(error: Throwable) {
                        this@CaptchaDialog.callback?.onError(error)
                    }
                    override fun onClick(point: com.captcha.pro.core.CaptchaPoint, index: Int) {}
                }
            }
        }

        card.addView(captchaView)

        return FrameLayout(context).apply {
            setOnClickListener { if (maskClosable) dismiss() }
            val cardParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.WRAP_CONTENT,
                FrameLayout.LayoutParams.WRAP_CONTENT,
                Gravity.CENTER
            )
            addView(card, cardParams)
        }
    }

    private fun createHeader(): View {
        val density = context.resources.displayMetrics.density
        fun dp(v: Int) = (v * density).toInt()

        val displayTitle = if (title.isNotEmpty()) title else LocaleMessages.get(locale, "popup_title")

        return LinearLayout(context).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(0, 0, 0, dp(16))

            addView(TextView(context).apply {
                text = displayTitle
                textSize = 16f
                setTextColor(Color.parseColor("#333333"))
            }, LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f))

            if (showClose) {
                addView(TextView(context).apply {
                    text = "×"
                    textSize = 20f
                    setTextColor(Color.parseColor("#999999"))
                    setPadding(dp(12), 0, dp(12), 0)
                    setOnClickListener { dismiss() }
                })
            }
        }
    }

    fun setCallback(callback: CaptchaCallback) {
        this.callback = callback
    }

    fun refresh() {
        when (val view = captchaView) {
            is SliderCaptchaView -> view.refresh()
            is ClickCaptchaView -> view.refresh()
        }
    }

    companion object {
        /**
         * Show slider captcha dialog
         */
        fun showSlider(
            context: Context,
            backendVerify: BackendVerifyOptions,
            width: Int = 300,
            height: Int = 170,
            showRefresh: Boolean = true,
            locale: CaptchaLocale = CaptchaLocale.ZH_CN,
            title: String = "",
            maskClosable: Boolean = true,
            showClose: Boolean = true,
            autoClose: Boolean = true,
            closeDelay: Long = 500,
            onSuccess: (VerifyResult?) -> Unit = {},
            onFail: () -> Unit = {},
            onRefresh: () -> Unit = {},
            onError: (Throwable) -> Unit = {}
        ): CaptchaDialog {
            return CaptchaDialog(
                context, CaptchaType.SLIDER, backendVerify, locale, title,
                width, height, showRefresh, maskClosable, showClose, autoClose, closeDelay
            ).apply {
                setCallback(object : CaptchaCallback {
                    override fun onSuccess(data: VerifyResult?) = onSuccess(data)
                    override fun onFail() = onFail()
                    override fun onRefresh() = onRefresh()
                    override fun onError(error: Throwable) = onError(error)
                })
                show()
            }
        }

        /**
         * Show click captcha dialog
         */
        fun showClick(
            context: Context,
            backendVerify: BackendVerifyOptions,
            width: Int = 300,
            height: Int = 170,
            clickCount: Int = 3,
            showRefresh: Boolean = true,
            locale: CaptchaLocale = CaptchaLocale.ZH_CN,
            title: String = "",
            maskClosable: Boolean = true,
            showClose: Boolean = true,
            autoClose: Boolean = true,
            closeDelay: Long = 500,
            onSuccess: (VerifyResult?) -> Unit = {},
            onFail: () -> Unit = {},
            onRefresh: () -> Unit = {},
            onError: (Throwable) -> Unit = {}
        ): CaptchaDialog {
            return CaptchaDialog(
                context, CaptchaType.CLICK, backendVerify, locale, title,
                width, height, showRefresh, maskClosable, showClose, autoClose, closeDelay
            ).apply {
                (captchaView as? ClickCaptchaView)?.clickCount = clickCount
                setCallback(object : CaptchaCallback {
                    override fun onSuccess(data: VerifyResult?) = onSuccess(data)
                    override fun onFail() = onFail()
                    override fun onRefresh() = onRefresh()
                    override fun onError(error: Throwable) = onError(error)
                })
                show()
            }
        }
    }
}
