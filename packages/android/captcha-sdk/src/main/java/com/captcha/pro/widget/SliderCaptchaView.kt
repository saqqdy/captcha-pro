
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
import androidx.core.view.AccessibilityDelegateCompat
import androidx.core.view.ViewCompat
import androidx.core.view.accessibility.AccessibilityNodeInfoCompat
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
    private val refreshBtn: ImageView

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
        // bgView's cast shadow falls outside this view's bounds (Flutter's
        // BoxShadow doesn't affect layout either), so let children draw
        // outside — otherwise only the part over the slider bar survives.
        clipChildren = false

        val gradientDrawable = GradientDrawable(
            GradientDrawable.Orientation.TL_BR,
            intArrayOf(Color.parseColor("#667eea"), Color.parseColor("#764ba2"))
        // 8, matching BorderRadius.circular(8) on the captcha card in
        // slider_captcha.dart (and iOS captchaClipView's cornerRadius).
        ).apply { cornerRadius = 8f * density }

        bgView = ImageView(context).apply {
            scaleType = ImageView.ScaleType.FIT_XY
            background = gradientDrawable
            outlineProvider = object : ViewOutlineProvider() {
                override fun getOutline(view: View, outline: Outline) {
                    outline.setRoundRect(0, 0, view.width, view.height, 8f * density)
                }
            }
            clipToOutline = true
            elevation = 8f * density
        }
        // captchaWidth/Height are logical pixels, matching every other platform
        // (Flutter lays out `width` as logical px while still requesting the
        // same 300 from the backend). Scale by density for rendering only —
        // the drag/verify maths below stay in logical px.
        addView(bgView, LayoutParams(dp(captchaWidth), dp(captchaHeight)))

        /**
         * bgView sets elevation for its card shadow, and ViewGroup draws
         * children ordered by Z — so every sibling laid over the image needs a
         * HIGHER elevation or the background covers it regardless of add order
         * (this is what hid the puzzle piece, the status overlay and the
         * refresh button).
         */
        val overlayElevation = 9f * density

        loadingView = TextView(context).apply {
            text = LocaleMessages.get(locale, "loading")
            textSize = 14f
            setTextColor(Color.WHITE)
            gravity = Gravity.CENTER
            elevation = overlayElevation
        }
        addView(loadingView, LayoutParams(dp(captchaWidth), dp(captchaHeight)))

        sliderView = ImageView(context).apply {
            scaleType = ImageView.ScaleType.FIT_XY
            elevation = overlayElevation
        }
        addView(sliderView, LayoutParams(dp(sliderWidth), dp(sliderHeight)))

        refreshBtn = ImageView(context).apply {
            // Vector drawable rather than the "⟳" glyph: the glyph renders well
            // below its point size and its baseline sits off-centre in this
            // fixed 28dp box. Matches the core SVG (16dp).
            setImageResource(R.drawable.ic_captcha_refresh)
            scaleType = ImageView.ScaleType.FIT_CENTER
            // 28dp hit box with a 16dp glyph: 6dp padding each side.
            setPadding(dp(6), dp(6), dp(6), dp(6))
            setColorFilter(CaptchaColors.getSliderHintText(context))
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
            // Flutter's 28dp box is centred inside a 44dp Positioned(top: 8,
            // right: 8), so visually it sits 16 from each edge, not 8.
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

        sliderBar = SliderBarView(context).apply {
            hintText = LocaleMessages.get(locale, "slider_hint")
            // a11y: label slider thumb and expose current value/range to TalkBack
            contentDescription = LocaleMessages.get(locale, "slider_hint")
            // Hardware-accelerated ViewGroup draws by Z, not by add order, so a
            // zero-elevation bar is painted *under* bgView's shadow. Raise it
            // above the card the way the other overlays are; the bar paints
            // itself on a Canvas (no background drawable), so it casts no shadow
            // of its own — matching Flutter, where the bar is a later sibling in
            // the Column and therefore paints over the card's shadow.
            elevation = overlayElevation
        }
        // Bar height 40 with a 5 gap, matching slider_captcha.dart
        // (`barHeight = 40.0` + `SizedBox(height: 5)`).
        addView(sliderBar, LayoutParams(dp(captchaWidth), dp(40)).apply {
            gravity = Gravity.BOTTOM
            topMargin = dp(captchaHeight) + dp(5)
        })

        // a11y: expose slider role + current value/range so TalkBack announces progress
        ViewCompat.setAccessibilityDelegate(sliderBar, object : AccessibilityDelegateCompat() {
            override fun onInitializeAccessibilityNodeInfo(
                host: View,
                info: AccessibilityNodeInfoCompat
            ) {
                super.onInitializeAccessibilityNodeInfo(host, info)
                info.className = "android.widget.SeekBar"
                info.contentDescription = LocaleMessages.get(locale, "slider_hint")
                val max = (captchaWidth - sliderWidth).toFloat()
                info.rangeInfo = AccessibilityNodeInfoCompat.RangeInfoCompat(
                    AccessibilityNodeInfoCompat.RangeInfoCompat.RANGE_TYPE_FLOAT, 0f, max, currentX
                )
            }
        })

        // SliderBarView reports the absolute drag distance in px; convert to
        // logical px. It reports an absolute value on every move, so assign
        // (not +=) — accumulating it made the thumb outrun the finger and slam
        // into the end of the track.
        sliderBar.onDragListener = { distance ->
            if (!isDragging) {
                val target = (distance / density)
                    .coerceIn(0f, (captchaWidth - sliderWidth).toFloat())
                val delta = target - currentX
                currentX = target
                sliderView.translationX = currentX * density
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
            // sliderY comes from the backend in image coordinates (0..height).
            sliderView.translationY = sliderY * density
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
        color = CaptchaColors.getSliderBarBg(context)
        style = Paint.Style.FILL
        isAntiAlias = true
    }

    private val thumbPaint = Paint().apply {
        color = CaptchaColors.getSliderThumbBg(context)
        style = Paint.Style.FILL
        isAntiAlias = true
    }

    private val thumbBorderPaint = Paint().apply {
        color = CaptchaColors.getSliderThumbBorder(context)
        style = Paint.Style.STROKE
        // Border.all() defaults to a 1px border in slider_captcha.dart.
        strokeWidth = dp(1f)
        isAntiAlias = true
    }

    private val arrowPaint = Paint().apply {
        color = Color.parseColor("#1991FA")
        style = Paint.Style.FILL
        isAntiAlias = true
    }

    private val hintPaint = Paint().apply {
        color = CaptchaColors.getSliderHintText(context)
        // 14, matching the hint Text in slider_captcha.dart (was 12).
        textSize = dp(14f)
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

        // No progress fill: slider_captcha.dart's bar is just the track, the
        // centred hint and the thumb (iOS matches).
        canvas.drawRoundRect(0f, 0f, width, height, radius, radius, trackPaint)

        // Slider hint text (behind thumb)
        if (hintText.isNotEmpty()) {
            val fm = hintPaint.fontMetrics
            val textY = height / 2 - (fm.ascent + fm.descent) / 2
            canvas.drawText(hintText, width / 2f, textY, hintPaint)
        }

        // Thumb is a full-height 42x40 box (Flutter: Positioned top:0 bottom:0
        // with width: sliderWidth), so it fills the 40-high bar rather than
        // being a centred square.
        val thumbRect = RectF(thumbLeft, 0f, thumbLeft + thumbWidth, height)
        canvas.drawRoundRect(thumbRect, radius, radius, thumbPaint)
        canvas.drawRoundRect(thumbRect, radius, radius, thumbBorderPaint)

        // Triangle rather than the "→" glyph: the glyph renders well below its
        // point size and its baseline is hard to centre in the thumb. Matches
        // the 20dp triangle core/slider.ts draws. Optically centred — a right
        // triangle's centroid is 1/3 of its width from the flat edge, so the
        // flat edge sits 1/3 of the width left of centre.
        val arrowSize = dp(20f)
        val arrowHalf = arrowSize / 2
        val arrowLeft = thumbCenterX - arrowSize / 3
        val midY = height / 2f
        canvas.drawPath(Path().apply {
            moveTo(arrowLeft, midY - arrowHalf)
            lineTo(arrowLeft + arrowSize, midY)
            lineTo(arrowLeft, midY + arrowHalf)
            close()
        }, arrowPaint)
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
    private val iconView: ImageView
    private val textView: TextView

    init {
        setBackgroundColor(CaptchaColors.getStatusOverlayBg(context))
        visibility = View.GONE
        isClickable = false
        // Flutter puts this inside the card's ClipRRect(borderRadius: 8), so
        // the overlay is clipped to the card corners too.
        outlineProvider = object : ViewOutlineProvider() {
            override fun getOutline(view: View, outline: Outline) {
                outline.setRoundRect(0, 0, view.width, view.height, 8f * density)
            }
        }
        clipToOutline = true

        val content = LinearLayout(context).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
        }

        iconView = ImageView(context).apply {
            scaleType = ImageView.ScaleType.FIT_CENTER
            // 32dp circle with an 18dp glyph: 7dp padding each side.
            val pad = (7 * density).toInt()
            setPadding(pad, pad, pad, pad)
        }

        textView = TextView(context).apply {
            gravity = Gravity.CENTER
            // 13, matching the status Text in slider/click_captcha.dart.
            textSize = 13f
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
            setColor(if (success) CaptchaColors.getSuccessIconBg(context) else CaptchaColors.getFailIconBg(context))
        }
        iconView.apply {
            setImageResource(if (success) R.drawable.ic_captcha_check else R.drawable.ic_captcha_close)
            setColorFilter(Color.WHITE)
            background = iconBg
        }
        textView.apply {
            text = message
            setTextColor(if (success) CaptchaColors.getSuccessText(context) else CaptchaColors.getFailText(context))
        }
        visibility = View.VISIBLE
        alpha = 0f
        scaleX = 0.9f
        scaleY = 0.9f
        // a11y: announce success/fail message to TalkBack (native View API, API 16+)
        announceForAccessibility(message)
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
