package com.captcha.pro.widget

import android.content.Context
import android.graphics.*
import android.graphics.drawable.GradientDrawable
import android.util.AttributeSet
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.ViewOutlineProvider
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
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
    private val refreshBtn: TextView
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
        val gradientDrawable = GradientDrawable(
            GradientDrawable.Orientation.TL_BR,
            intArrayOf(Color.parseColor("#667eea"), Color.parseColor("#764ba2"))
        ).apply { cornerRadius = 16f * density }

        bgView = ImageView(context).apply {
            scaleType = ImageView.ScaleType.FIT_XY
            background = gradientDrawable
            outlineProvider = object : ViewOutlineProvider() {
                override fun getOutline(view: View, outline: Outline) {
                    outline.setRoundRect(0, 0, view.width, view.height, 16f * density)
                }
            }
            clipToOutline = true
            elevation = 8f * density
        }
        addView(bgView, LayoutParams(captchaWidth, captchaHeight))

        loadingView = TextView(context).apply {
            text = LocaleMessages.get(locale, "loading")
            textSize = 14f
            setTextColor(Color.WHITE)
            gravity = Gravity.CENTER
        }
        addView(loadingView, LayoutParams(captchaWidth, captchaHeight))

        clickOverlayView = ClickOverlayView(context)
        addView(clickOverlayView, LayoutParams(captchaWidth, captchaHeight))

        refreshBtn = TextView(context).apply {
            text = "⟳"
            textSize = 16f
            setTextColor(Color.parseColor("#666666"))
            gravity = Gravity.CENTER
            background = GradientDrawable().apply {
                setColor(Color.argb(230, 255, 255, 255))
                cornerRadius = 8f * density
            }
            setOnClickListener { refresh() }
        }
        addView(refreshBtn, LayoutParams(dp(28), dp(28)).apply {
            gravity = Gravity.TOP or Gravity.END
            topMargin = dp(8)
            marginEnd = dp(8)
        })

        statusOverlay = StatusOverlayView(context)
        addView(statusOverlay, LayoutParams(captchaWidth, captchaHeight))

        promptBar = LinearLayout(context).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            background = GradientDrawable().apply {
                setColor(Color.parseColor("#F7F9FA"))
                cornerRadius = 16f * density
                setStroke(dp(1), Color.parseColor("#E8E8E8"))
            }
            setPadding(dp(12), dp(10), dp(12), dp(10))
        }
        addView(promptBar, LayoutParams(captchaWidth, LayoutParams.WRAP_CONTENT).apply {
            topMargin = captchaHeight + dp(12)
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
            setTextColor(Color.parseColor("#666666"))
        }, LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT).apply {
            marginEnd = dp(8)
        })

        val charBg = GradientDrawable(
            GradientDrawable.Orientation.TL_BR,
            intArrayOf(Color.parseColor("#667eea"), Color.parseColor("#764ba2"))
        ).apply { cornerRadius = 8f * density }

        if (clickCharBitmaps.isNotEmpty()) {
            for (bmp in clickCharBitmaps) {
                promptBar.addView(ImageView(context).apply {
                    setImageBitmap(bmp)
                    scaleType = ImageView.ScaleType.FIT_CENTER
                    background = charBg
                    setPadding(dp(4), dp(4), dp(4), dp(4))
                    elevation = 2f * density
                }, LinearLayout.LayoutParams(dp(28), dp(28)).apply {
                    marginStart = dp(6)
                })
            }
        } else {
            for (text in clickTexts) {
                promptBar.addView(TextView(context).apply {
                    this.text = text
                    textSize = 16f
                    setTextColor(Color.WHITE)
                    gravity = Gravity.CENTER
                    background = charBg
                    elevation = 2f * density
                }, LinearLayout.LayoutParams(dp(28), dp(28)).apply {
                    marginStart = dp(6)
                })
            }
        }
    }

    private fun promptCount(): Int = if (clickCharBitmaps.isNotEmpty()) clickCharBitmaps.size else clickTexts.size

    private fun handleClick(x: Float, y: Float) {
        if (clickPoints.size >= promptCount() || statusOverlay.visibility == View.VISIBLE) return

        statisticsData.totalClickCount++
        clickPoints.add(CaptchaPoint(x, y))
        clickOverlayView.addClickPoint(x, y, clickPoints.size)

        callback?.onClick(CaptchaPoint(x, y), clickPoints.size)

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
        invalidate()
    }

    fun clear() {
        clickPoints.clear()
        clickIndices.clear()
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
