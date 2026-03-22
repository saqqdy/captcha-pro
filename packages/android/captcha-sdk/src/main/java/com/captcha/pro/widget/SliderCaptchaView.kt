package com.captcha.pro.widget

import android.content.Context
import android.graphics.*
import android.util.AttributeSet
import android.view.MotionEvent
import android.view.View
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.content.ContextCompat
import com.captcha.pro.core.*

/**
 * Slider captcha view
 */
class SliderCaptchaView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {

    private val generator = CaptchaGenerator()

    private var bgBitmap: Bitmap? = null
    private var sliderBitmap: Bitmap? = null
    private var targetX: Float = 0f
    private var sliderY: Float = 0f
    private var currentX: Float = 0f

    private val bgView: ImageView
    private val sliderView: ImageView
    private val sliderBar: SliderBarView
    private val statusView: TextView
    private val refreshBtn: ImageView

    private var isDragging = false
    private var startX = 0f

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
    var precision: Int = 5

    var showRefresh: Boolean = true
        set(value) {
            field = value
            refreshBtn.visibility = if (value) View.VISIBLE else View.GONE
        }

    init {
        // Background view
        bgView = ImageView(context).apply {
            scaleType = ImageView.ScaleType.FIT_XY
        }
        addView(bgView, LayoutParams(captchaWidth, captchaHeight))

        // Slider view
        sliderView = ImageView(context).apply {
            scaleType = ImageView.ScaleType.FIT_XY
        }
        addView(sliderView, LayoutParams(sliderWidth, sliderHeight))

        // Refresh button
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

        // Status view
        statusView = TextView(context).apply {
            textSize = 14f
            setTextColor(Color.WHITE)
            gravity = Gravity.CENTER
            visibility = View.GONE
        }
        addView(statusView, LayoutParams(LayoutParams.MATCH_PARENT, 40).apply {
            gravity = Gravity.BOTTOM
        })

        // Slider bar
        sliderBar = SliderBarView(context)
        addView(sliderBar, LayoutParams(captchaWidth, 50).apply {
            gravity = Gravity.BOTTOM
            topMargin = captchaHeight + 10
        })

        sliderBar.onDragListener = { delta ->
            if (!isDragging) {
                currentX = (currentX + delta).coerceIn(0f, (captchaWidth - sliderWidth).toFloat())
                sliderView.translationX = currentX
                sliderBar.setProgress(currentX / (captchaWidth - sliderWidth))
                callback?.onDrag(delta)
            }
        }

        sliderBar.onDragEndListener = {
            verify()
        }
    }

    fun refresh() {
        val result = generator.generate(CaptchaOptions(
            type = CaptchaType.SLIDER,
            width = captchaWidth,
            height = captchaHeight,
            sliderWidth = sliderWidth,
            sliderHeight = sliderHeight
        ))

        bgBitmap = result.bgBitmap
        sliderBitmap = result.sliderBitmap
        targetX = result.targetPoints.first().x
        sliderY = result.sliderY
        currentX = 0f

        bgView.setImageBitmap(bgBitmap)
        sliderView.setImageBitmap(sliderBitmap)
        sliderView.translationX = 0f
        sliderView.translationY = sliderY

        statusView.visibility = View.GONE
        sliderBar.reset()

        callback?.onRefresh()
    }

    private fun verify() {
        val diff = Math.abs(currentX - targetX)

        if (diff <= precision) {
            showStatus(true)
            callback?.onSuccess()
        } else {
            showStatus(false)
            callback?.onFail()
            postDelayed({ refresh() }, 500)
        }
    }

    private fun showStatus(success: Boolean) {
        statusView.apply {
            text = if (success) "验证成功" else "验证失败"
            setBackgroundColor(if (success) Color.parseColor("#E652C41A") else Color.parseColor("#E6F5222D"))
            visibility = View.VISIBLE
        }
    }

    override fun onTouchEvent(event: MotionEvent): Boolean {
        return sliderBar.onTouchEvent(event)
    }

    override fun onInterceptTouchEvent(ev: MotionEvent): Boolean {
        return true
    }

    /**
     * Get captcha data
     */
    fun getData(): Map<String, Any> {
        return mapOf(
            "type" to "slider",
            "targetX" to targetX,
            "sliderY" to sliderY,
            "currentX" to currentX
        )
    }
}

/**
 * Slider bar view
 */
class SliderBarView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    private val trackPaint = Paint().apply {
        color = Color.parseColor("#F7F9FA")
        style = Paint.Style.FILL
    }

    private val progressPaint = Paint().apply {
        color = Color.parseColor("#1991FA")
        style = Paint.Style.FILL
        alpha = 50
    }

    private val thumbPaint = Paint().apply {
        color = Color.WHITE
        style = Paint.Style.FILL
    }

    private val thumbBorderPaint = Paint().apply {
        color = Color.parseColor("#E1E4E8")
        style = Paint.Style.STROKE
        strokeWidth = 2f
    }

    private val thumbWidth = 36f
    private var progress = 0f
    private var isDragging = false
    private var startX = 0f

    var onDragListener: ((Float) -> Unit)? = null
    var onDragEndListener: (() -> Unit)? = null

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)

        val width = width.toFloat()
        val height = height.toFloat()
        val thumbLeft = progress * (width - thumbWidth)
        val thumbCenterX = thumbLeft + thumbWidth / 2

        // Draw track
        canvas.drawRoundRect(0f, 0f, width, height, 4f, 4f, trackPaint)

        // Draw progress
        if (progress > 0) {
            canvas.drawRect(0f, 0f, thumbCenterX, height, progressPaint)
        }

        // Draw thumb
        val thumbTop = (height - thumbWidth) / 2
        val thumbRect = RectF(thumbLeft, thumbTop, thumbLeft + thumbWidth, thumbTop + thumbWidth)
        canvas.drawRoundRect(thumbRect, 4f, 4f, thumbPaint)
        canvas.drawRoundRect(thumbRect, 4f, 4f, thumbBorderPaint)

        // Draw arrow
        val arrowPaint = Paint().apply {
            color = Color.parseColor("#1991FA")
            textSize = 16f
            textAlign = Paint.Align.CENTER
        }
        canvas.drawText("→", thumbCenterX, height / 2 + 6, arrowPaint)
    }

    override fun onTouchEvent(event: MotionEvent): Boolean {
        when (event.action) {
            MotionEvent.ACTION_DOWN -> {
                isDragging = true
                startX = event.x - progress * (width - thumbWidth)
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
