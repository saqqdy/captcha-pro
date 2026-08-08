package com.captcha.pro.widget

import android.content.Context
import android.graphics.*
import android.util.AttributeSet
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
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

    private var bgBitmap: Bitmap? = null
    private var targetPoints: List<CaptchaPoint> = emptyList()
    private var clickTexts: List<String> = emptyList()
    private var clickCharImages: List<String> = emptyList()
    private var clickCharBitmaps: List<Bitmap> = emptyList()
    private var clickPoints: MutableList<CaptchaPoint> = mutableListOf()

    private val bgView: ImageView
    private val clickOverlayView: ClickOverlayView
    private val statusView: TextView
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
        bgView = ImageView(context).apply {
            scaleType = ImageView.ScaleType.FIT_XY
        }
        addView(bgView, LayoutParams(captchaWidth, captchaHeight))

        clickOverlayView = ClickOverlayView(context)
        addView(clickOverlayView, LayoutParams(captchaWidth, captchaHeight))

        refreshBtn = ImageView(context).apply {
            setImageResource(android.R.drawable.ic_menu_rotate)
            setPadding(8, 8, 8, 8)
            setBackgroundColor(Color.parseColor("#E6FFFFFF"))
            setOnClickListener { refresh() }
        }
        addView(refreshBtn, LayoutParams(40, 40).apply {
            gravity = Gravity.TOP or Gravity.END
            topMargin = 16
            marginEnd = 16
        })

        statusView = TextView(context).apply {
            textSize = 14f
            setTextColor(Color.WHITE)
            gravity = Gravity.CENTER
            visibility = View.GONE
        }
        addView(statusView, LayoutParams(LayoutParams.MATCH_PARENT, 40).apply {
            gravity = Gravity.BOTTOM
        })

        promptBar = LinearLayout(context).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
            setBackgroundColor(Color.parseColor("#F7F9FA"))
            setPadding(16, 8, 16, 8)
        }
        addView(promptBar, LayoutParams(captchaWidth, 40).apply {
            gravity = Gravity.BOTTOM
            topMargin = captchaHeight + 10
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
            statusView.visibility = View.GONE

            updatePromptBar()

            callback?.onRefresh()
        } catch (e: Exception) {
            showStatus(false, LocaleMessages.get(locale, "error_network"))
            callback?.onError(e)
        }
    }

    private fun updatePromptBar() {
        promptBar.removeAllViews()

        promptBar.addView(TextView(context).apply {
            text = LocaleMessages.get(locale, "click_prompt")
            textSize = 14f
            setTextColor(Color.parseColor("#333333"))
        })

        if (clickCharBitmaps.isNotEmpty()) {
            for (bmp in clickCharBitmaps) {
                promptBar.addView(ImageView(context).apply {
                    setImageBitmap(bmp)
                    scaleType = ImageView.ScaleType.FIT_CENTER
                    setBackgroundColor(Color.parseColor("#E6F0F8FF"))
                    setPadding(4, 4, 4, 4)
                }, LinearLayout.LayoutParams(28, 28).apply {
                    marginStart = 4
                })
            }
        } else {
            for (text in clickTexts) {
                promptBar.addView(TextView(context).apply {
                    this.text = text
                    textSize = 14f
                    setTextColor(Color.parseColor("#1991FA"))
                    gravity = Gravity.CENTER
                    setPadding(4, 4, 4, 4)
                    setBackgroundColor(Color.parseColor("#E6F0F8FF"))
                }, LinearLayout.LayoutParams(28, 28).apply {
                    marginStart = 4
                })
            }
        }
    }

    private fun promptCount(): Int = if (clickCharBitmaps.isNotEmpty()) clickCharBitmaps.size else clickTexts.size

    private fun handleClick(x: Float, y: Float) {
        if (clickPoints.size >= promptCount() || statusView.visibility == View.VISIBLE) return

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
                if (response.success) handleSuccess() else handleFail()
            } catch (e: Exception) {
                showStatus(false, LocaleMessages.get(locale, "error_network"))
                callback?.onError(e)
                callback?.onFail()
            }
        }
    }

    private fun handleSuccess() {
        statisticsData.successCount++
        showStatus(true, LocaleMessages.get(locale, "click_success"))
        callback?.onSuccess()
    }

    private fun handleFail() {
        statisticsData.failCount++
        showStatus(false, LocaleMessages.get(locale, "click_fail"))
        callback?.onFail()
        postDelayed({ refresh() }, 800)
    }

    private fun showStatus(success: Boolean, message: String? = null) {
        statusView.apply {
            text = message ?: if (success) LocaleMessages.get(locale, "click_success") else LocaleMessages.get(locale, "click_fail")
            setBackgroundColor(if (success) Color.parseColor("#E652C41A") else Color.parseColor("#E6F5222D"))
            visibility = View.VISIBLE
        }
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

    private val clickPoints = mutableListOf<Pair<Float, Float>>()
    private val clickIndices = mutableListOf<Int>()

    private val circlePaint = Paint().apply {
        color = Color.parseColor("#1991FA")
        style = Paint.Style.FILL
    }

    private val borderPaint = Paint().apply {
        color = Color.WHITE
        style = Paint.Style.STROKE
        strokeWidth = 2f
    }

    private val textPaint = Paint().apply {
        color = Color.WHITE
        textSize = 12f
        textAlign = Paint.Align.CENTER
        isFakeBoldText = true
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

        for (i in clickPoints.indices) {
            val (x, y) = clickPoints[i]
            val index = clickIndices[i]

            canvas.drawCircle(x, y, 14f, circlePaint)
            canvas.drawCircle(x, y, 14f, borderPaint)
            canvas.drawText(index.toString(), x, y + 4, textPaint)
        }
    }
}
