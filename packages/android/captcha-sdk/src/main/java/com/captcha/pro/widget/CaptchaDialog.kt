
package com.captcha.pro.widget
import com.captcha.pro.core.CaptchaColors
import com.captcha.pro.R

import android.app.Dialog
import android.content.Context
import android.graphics.Color
import android.graphics.Rect
import android.graphics.drawable.ColorDrawable
import android.graphics.drawable.GradientDrawable
import android.view.Gravity
import android.view.TouchDelegate
import android.view.View
import android.view.WindowManager
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.view.AccessibilityDelegateCompat
import androidx.core.view.ViewCompat
import androidx.core.view.accessibility.AccessibilityNodeInfoCompat
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
            setBackgroundDrawable(ColorDrawable(CaptchaColors.getPopupMask(context)))
        }
    }

    private fun createContentView(): View {
        val density = context.resources.displayMetrics.density
        fun dp(v: Int) = (v * density).toInt()

        val cardDrawable = GradientDrawable().apply {
            setColor(CaptchaColors.getPopupCard(context))
            cornerRadius = 24f * density
        }

        val card = LinearLayout(context).apply {
            orientation = LinearLayout.VERTICAL
            background = cardDrawable
            elevation = 8f * density
            // Same as the captcha card: let its shadow spill outside.
            clipChildren = false
            // No card padding: popup_captcha.dart pads the header (16x12) and
            // the body (12) separately, so cardWidth == captchaWidth + 24.
            isClickable = true
        }

        // a11y: give the dialog an accessible name + role via delegate
        val dialogTitle = if (title.isNotEmpty()) title else LocaleMessages.get(locale, "popup_title")
        card.contentDescription = dialogTitle
        ViewCompat.setAccessibilityDelegate(card, object : AccessibilityDelegateCompat() {
            override fun onInitializeAccessibilityNodeInfo(
                host: View,
                info: AccessibilityNodeInfoCompat
            ) {
                super.onInitializeAccessibilityNodeInfo(host, info)
                info.contentDescription = dialogTitle
            }
        })

        card.addView(createHeader())
        // Flutter's header carries Border(bottom: BorderSide(popupSeparator)).
        card.addView(View(context).apply {
            setBackgroundColor(CaptchaColors.getPopupSeparator(context))
        }, LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, dp(1)))

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

        // Padding(all: cardPadding) around the body in popup_captcha.dart.
        card.addView(captchaView, LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.WRAP_CONTENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        ).apply { setMargins(dp(12), dp(12), dp(12), dp(12)) })

        return FrameLayout(context).apply {
            setOnClickListener { if (maskClosable) dismiss() }
            clipChildren = false
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

        var closeBtn: ImageView? = null
        return LinearLayout(context).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            // EdgeInsets.symmetric(horizontal: 16, vertical: 12) in
            // popup_captcha.dart's header.
            setPadding(dp(16), dp(12), dp(16), dp(12))

            addView(TextView(context).apply {
                text = displayTitle
                textSize = 16f
                setTextColor(CaptchaColors.getPopupTitle(context))
            }, LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f))

            if (showClose) {
                closeBtn = ImageView(context).apply {
                    // Vector drawable rather than the "×" glyph: the glyph
                    // renders well below its point size and its baseline sits
                    // off-centre in this fixed box. 4dp padding leaves a 16dp
                    // glyph — the Icon(size: 16) popup_captcha.dart draws
                    // inside its 24dp button.
                    setImageResource(R.drawable.ic_captcha_close)
                    scaleType = ImageView.ScaleType.FIT_CENTER
                    setPadding(dp(4), dp(4), dp(4), dp(4))
                    setColorFilter(CaptchaColors.getPopupClose(context))
                    // a11y: label the close button for TalkBack
                    contentDescription = LocaleMessages.get(locale, "popup_close")
                    setOnClickListener { dismiss() }
                }
                addView(closeBtn, LinearLayout.LayoutParams(dp(24), dp(24)))
            }
        }.also { header ->
            // a11y: the visual button is 24dp (as in Flutter), so expand its
            // touch target to 48dp the way the captcha refresh button does.
            val btn = closeBtn
            if (btn != null) {
                btn.post {
                    val pad = (dp(48) - dp(24)) / 2
                    val rect = Rect()
                    btn.getHitRect(rect)
                    rect.inset(-pad, -pad)
                    header.touchDelegate = TouchDelegate(rect, btn)
                }
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
