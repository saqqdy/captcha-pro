
package com.captcha.pro.widget
import com.captcha.pro.core.CaptchaColors
import com.captcha.pro.R

import android.content.Context
import android.graphics.*
import android.graphics.drawable.GradientDrawable
import android.util.AttributeSet
import android.view.Gravity
import android.view.MotionEvent
import android.view.TouchDelegate
import android.view.View
import android.view.ViewOutlineProvider
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.view.ViewCompat
import com.captcha.pro.core.*
import kotlinx.coroutines.*

/**
 * Click Captcha View - Backend verification only
 */
class ClickCaptchaView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {

    private val generator = CaptchaGenerator()
    private val statisticsData = StatisticsData()
    private val density = resources.displayMetrics.density
    private fun dp(v: Int) = (v * density).toInt()

    private var bgBitmap: Bitmap? = null
    private var targetPoints: List<CaptchaPoint> = emptyList()
    private var clickTexts: List<String> = emptyList()
    private var clickCharImages: List<String> = emptyList()
    private var clickCharBitmaps: List<Bitmap> = emptyList()
    private var clickPoints: MutableList<CaptchaPoint> = mutableListOf()

    private val bgView: ImageView
    private val clickOverlayView: ClickOverlayView
    private val loadingView: TextView
    private val statusOverlay: StatusOverlayView
    private val refreshBtn: ImageView
    private val promptBar: LinearLayout

    var callback: ClickCaptchaCallback? = null

    var captchaWidth: Int = 300
        set(value) {
            field = value
            refresh()
        }

    var captchaHeight: Int = 170
        set(value) {
            field = value
            refresh()
        }

    var clickCount: Int = 3

    var showRefresh: Boolean = true
        set(value) {
            field = value
            refreshBtn.visibility = if (value) View.VISIBLE else View.GONE
        }

    /** Backend verification configuration - Required */
    lateinit var backendVerify: BackendVerifyOptions

    var locale: CaptchaLocale = CaptchaLocale.ZH_CN

    private var currentJob: Job? = null

    init {
        // See SliderCaptchaView: bgView's shadow falls outside this view's
        // bounds, so children must be allowed to draw outside it.
        clipChildren = false

        val gradientDrawable = GradientDrawable(
            GradientDrawable.Orientation.TL_BR,
            intArrayOf(Color.parseColor("#667eea"), Color.parseColor("#764ba2"))
        // 8, matching BorderRadius.circular(8) on the captcha card in
        // click_captcha.dart (and iOS captchaClipView's cornerRadius).
        ).apply { cornerRadius = 8f * density }

        bgView = ImageView(context).apply {
            scaleType = ImageView.ScaleType.FIT_XY
            background = gradientDrawable
            // a11y: label the click interaction area for TalkBack
            contentDescription = LocaleMessages.get(locale, "click_prompt")
            outlineProvider = object : ViewOutlineProvider() {
                override fun getOutline(view: View, outline: Outline) {
                    outline.setRoundRect(0, 0, view.width, view.height, 8f * density)
                }
            }
            clipToOutline = true
            elevation = 8f * density
        }
        // captchaWidth/Height are logical pixels (see SliderCaptchaView): scale
        // by density for rendering only, so the click coordinates sent for
        // verification stay in the backend's 0..300 image space.
        addView(bgView, LayoutParams(dp(captchaWidth), dp(captchaHeight)))

        // See SliderCaptchaView: overlays need a higher elevation than bgView
        // or the image covers them regardless of add order.
        val overlayElevation = 9f * density

        loadingView = TextView(context).apply {
            text = LocaleMessages.get(locale, "loading")
            textSize = 14f
            setTextColor(Color.WHITE)
            gravity = Gravity.CENTER
            elevation = overlayElevation
        }
        addView(loadingView, LayoutParams(dp(captchaWidth), dp(captchaHeight)))

        clickOverlayView = ClickOverlayView(context)
        clickOverlayView.elevation = overlayElevation
        addView(clickOverlayView, LayoutParams(dp(captchaWidth), dp(captchaHeight)))

        refreshBtn = ImageView(context).apply {
            // Vector drawable rather than the "⟳" glyph: the glyph renders well
            // below its point size and its baseline sits off-centre in this
            // fixed 28dp box. Matches the core SVG (16dp).
            setImageResource(R.drawable.ic_captcha_refresh)
            scaleType = ImageView.ScaleType.FIT_CENTER
            // 28dp hit box with a 16dp glyph: 6dp padding each side.
            setPadding(dp(6), dp(6), dp(6), dp(6))
            setColorFilter(CaptchaColors.getPromptText(context))
            background = GradientDrawable().apply {
                setColor(CaptchaColors.getRefreshBtnBg(context))
                cornerRadius = 8f * density
            }
            // a11y: label refresh button for TalkBack
            contentDescription = LocaleMessages.get(locale, "refresh")
            setOnClickListener { refresh() }
            elevation = overlayElevation
        }
        addView(refreshBtn, LayoutParams(dp(28), dp(28)).apply {
            gravity = Gravity.TOP or Gravity.END
            // See SliderCaptchaView: Flutter centres the 28dp box inside a
            // 44dp Positioned(top: 8, right: 8) -> 16 from each edge.
            topMargin = dp(16)
            marginEnd = dp(16)
        })

        // a11y: expand refresh touch target to 48dp (visual 28dp unchanged, centered)
        refreshBtn.post {
            val parent = refreshBtn.parent as? View ?: return@post
            val pad = (dp(48) - dp(28)) / 2
            val rect = Rect()
            refreshBtn.getHitRect(rect)
            rect.inset(-pad, -pad)
            parent.touchDelegate = TouchDelegate(rect, refreshBtn)
        }

        statusOverlay = StatusOverlayView(context)
        statusOverlay.elevation = overlayElevation
        // a11y: announce status changes (success/fail) via polite live region
        ViewCompat.setAccessibilityLiveRegion(
            statusOverlay,
            ViewCompat.ACCESSIBILITY_LIVE_REGION_POLITE
        )
        addView(statusOverlay, LayoutParams(dp(captchaWidth), dp(captchaHeight)))

        promptBar = LinearLayout(context).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            // See SliderCaptchaView's sliderBar: raise above bgView's shadow,
            // and null out the outline so the bar itself casts none (Flutter's
            // prompt bar has no boxShadow).
            elevation = overlayElevation
            outlineProvider = null
            background = GradientDrawable().apply {
                setColor(CaptchaColors.getPromptBarBg(context))
                cornerRadius = 16f * density
                setStroke(dp(1), CaptchaColors.getPromptBarBorder(context))
            }
            setPadding(dp(12), dp(10), dp(12), dp(10))
        }
        addView(promptBar, LayoutParams(dp(captchaWidth), LayoutParams.WRAP_CONTENT).apply {
            topMargin = dp(captchaHeight) + dp(12)
        })
    }

    fun refresh() {
        if (!::backendVerify.isInitialized) {
            throw IllegalStateException("backendVerify is required")
        }
        currentJob?.cancel()
        currentJob = GlobalScope.launch(Dispatchers.Main) {
            refreshSuspend()
        }
    }

    private suspend fun refreshSuspend() {
        loadingView.text = LocaleMessages.get(locale, "loading")
        loadingView.visibility = View.VISIBLE
        bgView.setImageDrawable(null)
        clickOverlayView.clear()
        statusOverlay.hide()

        val options = CaptchaOptions(
            type = CaptchaType.CLICK,
            width = captchaWidth,
            height = captchaHeight,
            clickCount = clickCount,
            backendVerify = backendVerify,
            locale = locale
        )

        try {
            val result = generator.generate(options)

            bgBitmap = result.bgBitmap
            targetPoints = result.targetPoints
            clickTexts = result.clickTexts ?: emptyList()
            clickCharImages = result.clickCharImages ?: emptyList()
            clickCharBitmaps = clickCharImages.map { src ->
                withContext(Dispatchers.IO) { generator.loadImage(src) }
            }
            clickPoints.clear()

            bgView.setImageBitmap(bgBitmap)
            clickOverlayView.clear()
            loadingView.visibility = View.GONE

            updatePromptBar()

            callback?.onRefresh()
        } catch (e: Exception) {
            loadingView.text = LocaleMessages.get(locale, "error_network")
            loadingView.visibility = View.VISIBLE
            callback?.onError(e)
        }
    }

    private fun updatePromptBar() {
        promptBar.removeAllViews()

        promptBar.addView(TextView(context).apply {
            text = LocaleMessages.get(locale, "click_prompt")
            textSize = 14f
            setTextColor(CaptchaColors.getPromptText(context))
        }, LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT).apply {
            marginEnd = dp(8)
        })

        val charBg = GradientDrawable(
            GradientDrawable.Orientation.TL_BR,
            intArrayOf(Color.parseColor("#667eea"), Color.parseColor("#764ba2"))
        ).apply { cornerRadius = 8f * density }

        if (clickCharBitmaps.isNotEmpty()) {
            for ((i, bmp) in clickCharBitmaps.withIndex()) {
                promptBar.addView(ImageView(context).apply {
                    setImageBitmap(bmp)
                    scaleType = ImageView.ScaleType.FIT_CENTER
                    background = charBg
                    setPadding(dp(4), dp(4), dp(4), dp(4))
                    elevation = 2f * density
                }, cellParams(i))
            }
        } else {
            for ((i, text) in clickTexts.withIndex()) {
                promptBar.addView(TextView(context).apply {
                    this.text = text
                    textSize = 16f
                    setTextColor(Color.WHITE)
                    gravity = Gravity.CENTER
                    background = charBg
                    elevation = 2f * density
                }, cellParams(i))
            }
        }
    }

    /**
     * Flutter puts the 6 gap *between* cells (`if (i > 0) SizedBox(width: 6)`),
     * not before the first one — the 8 gap after the prompt text already
     * separates it.
     */
    private fun cellParams(index: Int) =
        LinearLayout.LayoutParams(dp(28), dp(28)).apply {
            if (index > 0) marginStart = dp(6)
        }

    private fun promptCount(): Int = if (clickCharBitmaps.isNotEmpty()) clickCharBitmaps.size else clickTexts.size

    /** x/y are raw touch px from [onTouchEvent]; the overlay draws in px too. */
    private fun handleClick(x: Float, y: Float) {
        if (clickPoints.size >= promptCount() || statusOverlay.visibility == View.VISIBLE) return

        statisticsData.totalClickCount++
        // Verification expects image coordinates (0..captchaWidth), so drop the
        // density the layout applied.
        val point = CaptchaPoint(x / density, y / density)
        clickPoints.add(point)
        clickOverlayView.addClickPoint(x, y, clickPoints.size)

        callback?.onClick(point, clickPoints.size)

        if (clickPoints.size >= promptCount()) {
            postDelayed({ verify() }, 100)
        }
    }

    private fun verify() {
        if (!::backendVerify.isInitialized) {
            throw IllegalStateException("backendVerify is required")
        }

        statisticsData.totalAttempts++

        val captchaData = generator.getCaptchaData(CaptchaType.CLICK, clickPoints)

        currentJob = GlobalScope.launch(Dispatchers.Main) {
            try {
                val options = CaptchaOptions(
                    type = CaptchaType.CLICK,
                    backendVerify = backendVerify,
                    locale = locale
                )
                val response = generator.backendVerify(captchaData, options)
                if (response.success) {
                    val verifiedAt = (response.data?.get("verifiedAt") as? Number)?.toLong()
                    handleSuccess(verifiedAt)
                } else handleFail()
            } catch (e: Exception) {
                statusOverlay.show(false, LocaleMessages.get(locale, "error_network"))
                callback?.onError(e)
                callback?.onFail()
            }
        }
    }

    private fun handleSuccess(verifiedAt: Long?) {
        statisticsData.successCount++
        statusOverlay.show(true, LocaleMessages.get(locale, "click_success"))
        callback?.onSuccess(VerifyResult(verifiedAt = verifiedAt))
    }

    private fun handleFail() {
        statisticsData.failCount++
        statusOverlay.show(false, LocaleMessages.get(locale, "click_fail"))
        callback?.onFail()
        postDelayed({ refresh() }, 800)
    }

    override fun onTouchEvent(event: MotionEvent): Boolean {
        when (event.action) {
            MotionEvent.ACTION_DOWN -> {
                handleClick(event.x, event.y)
                return true
            }
        }
        return super.onTouchEvent(event)
    }

    override fun onInterceptTouchEvent(ev: MotionEvent): Boolean {
        return true
    }

    fun getData(): CaptchaData {
        return generator.getCaptchaData(CaptchaType.CLICK, clickPoints)
    }

    fun getStatistics(): CaptchaStatistics = statisticsData.toStatistics()

    fun resetStatistics() {
        statisticsData.totalAttempts = 0
        statisticsData.successCount = 0
        statisticsData.failCount = 0
        statisticsData.totalVerifyTime = 0
        statisticsData.totalDragDistance = 0f
        statisticsData.totalDragTime = 0
        statisticsData.totalClickCount = 0
    }

    fun destroy() {
        currentJob?.cancel()
        bgBitmap?.recycle()
        bgBitmap = null
    }
}

class ClickOverlayView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    private val density = resources.displayMetrics.density
    private fun dp(v: Float) = v * density

    private val clickPoints = mutableListOf<Pair<Float, Float>>()
    private val clickIndices = mutableListOf<Int>()

    private val circlePaint = Paint().apply {
        color = Color.parseColor("#1991FA")
        style = Paint.Style.FILL
        isAntiAlias = true
    }

    private val borderPaint = Paint().apply {
        color = Color.WHITE
        style = Paint.Style.STROKE
        strokeWidth = dp(3f)
        isAntiAlias = true
    }

    private val textPaint = Paint().apply {
        color = Color.WHITE
        textSize = dp(12f)
        textAlign = Paint.Align.CENTER
        isFakeBoldText = true
        isAntiAlias = true
    }

    fun addClickPoint(x: Float, y: Float, index: Int) {
        clickPoints.add(Pair(x, y))
        clickIndices.add(index)
        // a11y: expose the latest marker index (Canvas-drawn markers -> single label)
        contentDescription = index.toString()
        invalidate()
    }

    fun clear() {
        clickPoints.clear()
        clickIndices.clear()
        contentDescription = null
        invalidate()
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)

        val radius = dp(12f)
        for (i in clickPoints.indices) {
            val (x, y) = clickPoints[i]
            val index = clickIndices[i]

            canvas.drawCircle(x, y, radius, circlePaint)
            canvas.drawCircle(x, y, radius, borderPaint)
            val fm = textPaint.fontMetrics
            canvas.drawText(index.toString(), x, y - (fm.ascent + fm.descent) / 2, textPaint)
        }
    }
}
