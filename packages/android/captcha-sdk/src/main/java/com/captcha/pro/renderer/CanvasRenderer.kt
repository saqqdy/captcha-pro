package com.captcha.pro.renderer

import android.graphics.*

/**
 * Renderer interface for captcha drawing
 */
interface CaptchaRenderer {
    fun render(canvas: Canvas, data: RenderData)
}

/**
 * Render data for drawing
 */
data class RenderData(
    val bgBitmap: Bitmap? = null,
    val sliderBitmap: Bitmap? = null,
    val sliderX: Float = 0f,
    val sliderY: Float = 0f,
    val targetX: Float = 0f,
    val targetY: Float = 0f,
    val sliderWidth: Float = 42f,
    val sliderHeight: Float = 42f
)

/**
 * Canvas renderer for slider captcha
 */
class SliderCanvasRenderer : CaptchaRenderer {

    private val holePaint = Paint().apply {
        color = Color.parseColor("#4D000000")
    }

    private val borderPaint = Paint().apply {
        color = Color.parseColor("#CCFFFFFF")
        style = Paint.Style.STROKE
        strokeWidth = 2f
    }

    override fun render(canvas: Canvas, data: RenderData) {
        // Draw background
        data.bgBitmap?.let {
            canvas.drawBitmap(it, 0f, 0f, null)
        }

        // Draw target hole
        canvas.drawRect(
            data.targetX,
            data.targetY,
            data.targetX + data.sliderWidth,
            data.targetY + data.sliderHeight,
            holePaint
        )

        // Draw target hole border
        canvas.drawRect(
            data.targetX,
            data.targetY,
            data.targetX + data.sliderWidth,
            data.targetY + data.sliderHeight,
            borderPaint
        )

        // Draw slider
        data.sliderBitmap?.let {
            canvas.drawBitmap(it, data.sliderX, data.sliderY, null)
        }
    }
}

/**
 * Shape drawer for drawing various shapes
 */
class ShapeDrawer(private val canvas: Canvas) {

    private val paint = Paint()

    /**
     * Draw rounded rectangle
     */
    fun drawRoundedRect(
        left: Float,
        top: Float,
        right: Float,
        bottom: Float,
        radius: Float,
        fillColor: Int? = null,
        strokeColor: Int? = null,
        strokeWidth: Float = 2f
    ) {
        val rect = RectF(left, top, right, bottom)
        val path = Path().apply {
            addRoundRect(rect, radius, radius, Path.Direction.CW)
        }

        fillColor?.let {
            paint.style = Paint.Style.FILL
            paint.color = it
            canvas.drawPath(path, paint)
        }

        strokeColor?.let {
            paint.style = Paint.Style.STROKE
            paint.color = it
            paint.strokeWidth = strokeWidth
            canvas.drawPath(path, paint)
        }
    }

    /**
     * Draw circle
     */
    fun drawCircle(
        centerX: Float,
        centerY: Float,
        radius: Float,
        fillColor: Int? = null,
        strokeColor: Int? = null,
        strokeWidth: Float = 2f
    ) {
        fillColor?.let {
            paint.style = Paint.Style.FILL
            paint.color = it
            canvas.drawCircle(centerX, centerY, radius, paint)
        }

        strokeColor?.let {
            paint.style = Paint.Style.STROKE
            paint.color = it
            paint.strokeWidth = strokeWidth
            canvas.drawCircle(centerX, centerY, radius, paint)
        }
    }

    /**
     * Draw text
     */
    fun drawText(
        text: String,
        x: Float,
        y: Float,
        fontSize: Float,
        color: Int,
        align: Paint.Align = Paint.Align.CENTER
    ) {
        paint.apply {
            this.color = color
            textSize = fontSize
            textAlign = align
            isFakeBoldText = true
        }
        canvas.drawText(text, x, y, paint)
    }

    /**
     * Draw rotated text
     */
    fun drawRotatedText(
        text: String,
        x: Float,
        y: Float,
        fontSize: Float,
        color: Int,
        rotation: Float
    ) {
        canvas.save()
        canvas.translate(x, y)
        canvas.rotate(rotation)
        drawText(text, 0f, fontSize / 3, fontSize, color)
        canvas.restore()
    }
}
