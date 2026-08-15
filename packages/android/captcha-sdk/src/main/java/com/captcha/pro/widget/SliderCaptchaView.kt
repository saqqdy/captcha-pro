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
 * Slider Captcha View - Backend verification only
 */
class SliderCaptchaView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {

    private val generator = CaptchaGenerator()
    private val statisticsData = StatisticsData()
    private val density = resources.displayMetrics.density
    private fun dp(v: Int) = (v * density).toInt()

    private var bgBitmap: Bitmap? = null
    private var sliderBitmap: Bitmap? = null
    private var targetX: Float = 0f
    private var sliderY: Float = 0f
    private var currentX: Float = 0f

    private val bgView: ImageView
    private val sliderView: ImageView
    private val sliderBar: SliderBarView
    private val loadingView: TextView
    private val statusOverlay: StatusOverlayView
    private val refreshBtn: TextView

    private var isDragging = false
    private var startX = 0f
    private var dragStartTime: Long = 0

    var callback: SliderCaptchaCallback? = null

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

    var sliderWidth: Int = 42
    var sliderHeight: Int = 42

    var showRefresh: Boolean = true
        set(value) {
            field = value
            refreshBtn.visibility = if (value) View.VISIBLE else View.GONE
        }

    /** Backend verification configuration - Required */
    lateinit var backendVerify: BackendVerifyOptions

    var locale: CaptchaLocale = CaptchaLocale.ZH_CN
        set(value) {
            field = value
            sliderBar.hintText = LocaleMessages.get(value, "slider_hint")
        }

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

        sliderView = ImageView(context).apply {
            scaleType = ImageView.ScaleType.FIT_XY
        }
        addView(sliderView, LayoutParams(sliderWidth, sliderHeight))

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

        sliderBar = SliderBarView(context).apply {
            hintText = LocaleMessages.get(locale, "slider_hint")
        }
        addView(sliderBar, LayoutParams(captchaWidth, dp(42)).apply {
            gravity = Gravity.BOTTOM
            topMargin = captchaHeight + dp(10)
        })

        sliderBar.onDragListener = { delta ->
            if (!isDragging) {
                currentX = (currentX + delta).coerceIn(0f, (captchaWidth - sliderWidth).toFloat())
                sliderView.translationX = currentX
                sliderBar.setProgress(currentX / (captchaWidth - sliderWidth))
                callback?.onDrag(delta)
            }
        }

        sliderBar.onDragEndListener = { verify() }
        sliderBar.onDragStartListener = { dragStartTime = System.currentTimeMillis() }
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
        sliderView.visibility = View.INVISIBLE
        statusOverlay.hide()

        val options = CaptchaOptions(
            type = CaptchaType.SLIDER,
            width = captchaWidth,
            height = captchaHeight,
            sliderWidth = sliderWidth,
            sliderHeight = sliderHeight,
            backendVerify = backendVerify,
            locale = locale
        )

        try {
            val result = generator.generate(options)

            bgBitmap = result.bgBitmap
            sliderBitmap = result.sliderBitmap
            targetX = result.targetPoints.first().x
            sliderY = result.sliderY
            currentX = 0f

            bgView.setImageBitmap(bgBitmap)
            sliderView.setImageBitmap(sliderBitmap)
            sliderView.translationX = 0f
            sliderView.translationY = sliderY
            sliderView.visibility = View.VISIBLE

            loadingView.visibility = View.GONE
            sliderBar.reset()

            callback?.onRefresh()
        } catch (e: Exception) {
            loadingView.text = LocaleMessages.get(locale, "error_network")
            loadingView.visibility = View.VISIBLE
            callback?.onError(e)
        }
    }

    private fun verify() {
        if (!::backendVerify.isInitialized) {
            throw IllegalStateException("backendVerify is required")
        }

        statisticsData.totalAttempts++
        val dragTime = System.currentTimeMillis() - dragStartTime
        statisticsData.totalDragTime += dragTime
        statisticsData.totalDragDistance += currentX

        val captchaData = generator.getCaptchaData(CaptchaType.SLIDER, sliderX = currentX)

        currentJob = GlobalScope.launch(Dispatchers.Main) {
            try {
                val options = CaptchaOptions(
                    type = CaptchaType.SLIDER,
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
        statusOverlay.show(true, LocaleMessages.get(locale, "slider_success"))
        callback?.onSuccess(VerifyResult(verifiedAt = verifiedAt))
    }

    private fun handleFail() {
        statisticsData.failCount++
        statusOverlay.show(false, LocaleMessages.get(locale, "slider_fail"))
        callback?.onFail()
        postDelayed({ refresh() }, 800)
    }

    override fun onTouchEvent(event: MotionEvent): Boolean {
        return sliderBar.onTouchEvent(event)
    }

    override fun onInterceptTouchEvent(ev: MotionEvent): Boolean {
        return true
    }

    fun getData(): CaptchaData {
        return generator.getCaptchaData(CaptchaType.SLIDER, sliderX = currentX)
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
        sliderBitmap?.recycle()
        bgBitmap = null
        sliderBitmap = null
    }
}

class SliderBarView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    private val density = resources.displayMetrics.density
    private fun dp(v: Float) = v * density

    private val trackPaint = Paint().apply {
        color = Color.parseColor("#F7F9FA")
        style = Paint.Style.FILL
        isAntiAlias = true
    }

    private val progressPaint = Paint().apply {
        color = Color.parseColor("#1991FA")
        style = Paint.Style.FILL
        alpha = 50
        isAntiAlias = true
    }

    private val thumbPaint = Paint().apply {
        color = Color.WHITE
        style = Paint.Style.FILL
        isAntiAlias = true
    }

    private val thumbBorderPaint = Paint().apply {
        color = Color.parseColor("#E1E4E8")
        style = Paint.Style.STROKE
        strokeWidth = dp(2f)
        isAntiAlias = true
    }

    private val arrowPaint = Paint().apply {
        color = Color.parseColor("#1991FA")
        textSize = dp(16f)
        textAlign = Paint.Align.CENTER
        isAntiAlias = true
    }

    private val hintPaint = Paint().apply {
        color = Color.parseColor("#999999")
        textSize = dp(12f)
        textAlign = Paint.Align.CENTER
        isAntiAlias = true
    }

    private val thumbWidth = dp(42f)
    private var progress = 0f
    private var isDragging = false
    private var startX = 0f

    var hintText: String = ""
    var onDragListener: ((Float) -> Unit)? = null
    var onDragEndListener: (() -> Unit)? = null
    var onDragStartListener: (() -> Unit)? = null

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)

        val width = width.toFloat()
        val height = height.toFloat()
        val radius = dp(8f)
        val thumbLeft = progress * (width - thumbWidth)
        val thumbCenterX = thumbLeft + thumbWidth / 2

        canvas.drawRoundRect(0f, 0f, width, height, radius, radius, trackPaint)

        if (progress > 0) {
            canvas.drawRect(0f, 0f, thumbCenterX, height, progressPaint)
        }

        // Slider hint text (behind thumb)
        if (hintText.isNotEmpty()) {
            val fm = hintPaint.fontMetrics
            val textY = height / 2 - (fm.ascent + fm.descent) / 2
            canvas.drawText(hintText, width / 2f, textY, hintPaint)
        }

        val thumbTop = (height - thumbWidth) / 2
        val thumbRect = RectF(thumbLeft, thumbTop, thumbLeft + thumbWidth, thumbTop + thumbWidth)
        canvas.drawRoundRect(thumbRect, radius, radius, thumbPaint)
        canvas.drawRoundRect(thumbRect, radius, radius, thumbBorderPaint)

        val arrowFm = arrowPaint.fontMetrics
        val arrowY = height / 2 - (arrowFm.ascent + arrowFm.descent) / 2
        canvas.drawText("→", thumbCenterX, arrowY, arrowPaint)
    }

    override fun onTouchEvent(event: MotionEvent): Boolean {
        when (event.action) {
            MotionEvent.ACTION_DOWN -> {
                isDragging = true
                startX = event.x - progress * (width - thumbWidth)
                onDragStartListener?.invoke()
                return true
            }
            MotionEvent.ACTION_MOVE -> {
                if (isDragging) {
                    val newProgress = (event.x - startX) / (width - thumbWidth)
                    progress = newProgress.coerceIn(0f, 1f)
                    invalidate()
                    onDragListener?.invoke((event.x - startX))
                }
                return true
            }
            MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                if (isDragging) {
                    isDragging = false
                    onDragEndListener?.invoke()
                }
                return true
            }
        }
        return super.onTouchEvent(event)
    }

    fun setProgress(progress: Float) {
        this.progress = progress.coerceIn(0f, 1f)
        invalidate()
    }

    fun reset() {
        progress = 0f
        isDragging = false
        invalidate()
    }
}

/**
 * Centered status overlay — white@75% background, 64dp circle icon, status text.
 * Fade-in 0.2s + scale 0.9→1 animation.
 */
class StatusOverlayView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {

    private val density = resources.displayMetrics.density
    private val iconView: TextView
    private val textView: TextView

    init {
        setBackgroundColor(Color.argb(191, 255, 255, 255))
        visibility = View.GONE
        isClickable = false

        val content = LinearLayout(context).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
        }

        iconView = TextView(context).apply {
            gravity = Gravity.CENTER
            textSize = 18f
            setTextColor(Color.WHITE)
        }

        textView = TextView(context).apply {
            gravity = Gravity.CENTER
            textSize = 14f
        }

        content.addView(iconView, LinearLayout.LayoutParams((32 * density).toInt(), (32 * density).toInt()).apply {
            bottomMargin = (8 * density).toInt()
        })
        content.addView(textView, LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT))

        addView(content, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
    }

    fun show(success: Boolean, message: String) {
        val iconBg = GradientDrawable().apply {
            shape = GradientDrawable.OVAL
            setColor(if (success) Color.argb(217, 82, 196, 26) else Color.argb(217, 255, 77, 79))
        }
        iconView.apply {
            text = if (success) "✓" else "✕"
            background = iconBg
        }
        textView.apply {
            text = message
            setTextColor(if (success) Color.parseColor("#389e0d") else Color.parseColor("#cf1322"))
        }
        visibility = View.VISIBLE
        alpha = 0f
        scaleX = 0.9f
        scaleY = 0.9f
        animate()
            .alpha(1f).scaleX(1f).scaleY(1f)
            .setDuration(200)
            .start()
    }

    fun hide() {
        animate().cancel()
        visibility = View.GONE
    }
}
