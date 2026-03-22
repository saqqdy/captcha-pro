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
import com.captcha.pro.core.*

/**
 * Click captcha view
 */
class ClickCaptchaView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {

    private val generator = CaptchaGenerator()

    private var bgBitmap: Bitmap? = null
    private var targetPoints: List<CaptchaPoint> = emptyList()
    private var clickTexts: List<String> = emptyList()
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
    var precision: Float = 25f

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

        // Click overlay view
        clickOverlayView = ClickOverlayView(context)
        addView(clickOverlayView, LayoutParams(captchaWidth, captchaHeight))

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

        // Prompt bar
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
        val result = generator.generate(CaptchaOptions(
            type = CaptchaType.CLICK,
            width = captchaWidth,
            height = captchaHeight,
            clickCount = clickCount
        ))

        bgBitmap = result.bgBitmap
        targetPoints = result.targetPoints
        clickTexts = result.clickTexts ?: emptyList()
        clickPoints.clear()

        bgView.setImageBitmap(bgBitmap)
        clickOverlayView.clear()
        statusView.visibility = View.GONE

        // Update prompt bar
        updatePromptBar()

        callback?.onRefresh()
    }

    private fun updatePromptBar() {
        promptBar.removeAllViews()

        // Add prompt text
        promptBar.addView(TextView(context).apply {
            text = "请依次点击："
            textSize = 14f
            setTextColor(Color.parseColor("#333333"))
        })

        // Add character items
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

    private fun handleClick(x: Float, y: Float) {
        if (clickPoints.size >= clickTexts.size) return

        clickPoints.add(CaptchaPoint(x, y))
        clickOverlayView.addClickPoint(x, y, clickPoints.size)

        callback?.onClick(CaptchaPoint(x, y), clickPoints.size)

        if (clickPoints.size >= clickTexts.size) {
            postDelayed({ verify() }, 100)
        }
    }

    private fun verify() {
        var success = true

        for (i in targetPoints.indices) {
            val target = targetPoints[i]
            val clicked = clickPoints[i]
            val distance = Math.sqrt(
                Math.pow((clicked.x - target.x).toDouble(), 2.0) +
                Math.pow((clicked.y - target.y).toDouble(), 2.0)
            ).toFloat()

            if (distance > precision) {
                success = false
                break
            }
        }

        if (success) {
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

    /**
     * Get captcha data
     */
    fun getData(): Map<String, Any> {
        return mapOf(
            "type" to "click",
            "targetPoints" to targetPoints,
            "clickPoints" to clickPoints,
            "clickTexts" to clickTexts
        )
    }
}

/**
 * Click overlay view for drawing click markers
 */
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

            // Draw circle
            canvas.drawCircle(x, y, 14f, circlePaint)

            // Draw border
            canvas.drawCircle(x, y, 14f, borderPaint)

            // Draw number
            canvas.drawText(index.toString(), x, y + 4, textPaint)
        }
    }
}
