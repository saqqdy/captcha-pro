package com.captcha.pro.core

import android.graphics.*
import kotlin.math.abs
import kotlin.math.sqrt
import kotlin.random.Random

/**
 * Captcha generator for Android
 */
class CaptchaGenerator {

    companion object {
        // Chinese vocabulary for click captcha
        private val CHINESE_WORDS = listOf(
            "一帆风顺", "二龙腾飞", "三阳开泰", "四季平安", "五福临门",
            "七星高照", "八方来财", "万事如意", "心想事成", "步步高升",
            "财源广进", "恭喜发财", "龙马精神", "马到成功", "金玉满堂",
            "花开富贵", "锦绣前程", "吉祥如意", "瑞气盈门", "紫气东来",
            "风调雨顺", "国泰民安", "繁荣昌盛", "万象更新", "春回大地",
            "阳光明媚", "奋发图强", "自强不息", "勇往直前", "坚持不懈",
            "厚德载物", "海纳百川", "宁静致远", "淡泊明志", "天道酬勤",
            "实事求是", "与时俱进", "开拓创新", "继往开来", "励精图治",
            "安居乐业", "幸福美满", "和谐共处", "德才兼备", "品学兼优",
            "诚实守信", "勤劳致富", "艰苦奋斗", "团结友爱", "尊老爱幼",
            "学无止境", "勤奋好学", "刻苦钻研", "博览群书", "学以致用",
            "融会贯通", "举一反三", "触类旁通", "温故知新", "循序渐进",
            "厚积薄发", "持之以恒", "孜孜不倦", "废寝忘食", "夜以继日",
            "春暖花开", "秋高气爽", "山清水秀", "鸟语花香", "绿树成荫",
            "风和日丽", "云淡风轻", "晴空万里", "皓月当空", "繁星闪烁",
            "科技创新", "人工智能", "云计算", "大数据", "物联网",
            "智慧城市", "数字经济", "智能制造", "绿色发展", "生态环保"
        )
    }

    /**
     * Generate captcha
     */
    fun generate(options: CaptchaOptions): CaptchaResult {
        return when (options.type) {
            CaptchaType.SLIDER -> generateSlider(options)
            CaptchaType.CLICK -> generateClick(options)
        }
    }

    /**
     * Generate slider captcha
     */
    private fun generateSlider(options: CaptchaOptions): CaptchaResult {
        // Create background bitmap
        val bgBitmap = Bitmap.createBitmap(
            options.width,
            options.height,
            Bitmap.Config.ARGB_8888
        )
        val bgCanvas = Canvas(bgBitmap)

        // Generate gradient background
        generateBackground(bgCanvas, options.width, options.height)

        // Random target position
        val targetX = Random.nextInt(
            options.sliderWidth + 20,
            options.width - options.sliderWidth - 20
        )
        val targetY = Random.nextInt(
            10,
            options.height - options.sliderHeight - 10
        )

        // Draw target hole (shadow area)
        val holePaint = Paint().apply {
            color = Color.parseColor("#4D000000") // 30% black
        }
        bgCanvas.drawRect(
            targetX.toFloat(),
            targetY.toFloat(),
            (targetX + options.sliderWidth).toFloat(),
            (targetY + options.sliderHeight).toFloat(),
            holePaint
        )

        // Draw target hole border
        val borderPaint = Paint().apply {
            color = Color.parseColor("#CCFFFFFF") // 80% white
            style = Paint.Style.STROKE
            strokeWidth = 2f
        }
        bgCanvas.drawRect(
            targetX.toFloat(),
            targetY.toFloat(),
            (targetX + options.sliderWidth).toFloat(),
            (targetY + options.sliderHeight).toFloat(),
            borderPaint
        )

        // Create slider bitmap
        val sliderBitmap = Bitmap.createBitmap(
            options.sliderWidth,
            options.sliderHeight,
            Bitmap.Config.ARGB_8888
        )
        val sliderCanvas = Canvas(sliderBitmap)

        // Draw slider background
        generateBackground(sliderCanvas, options.sliderWidth, options.sliderHeight)

        return CaptchaResult(
            bgBitmap = bgBitmap,
            sliderBitmap = sliderBitmap,
            targetPoints = listOf(CaptchaPoint(targetX.toFloat(), targetY.toFloat())),
            sliderY = targetY.toFloat()
        )
    }

    /**
     * Generate click captcha
     */
    private fun generateClick(options: CaptchaOptions): CaptchaResult {
        // Create background bitmap
        val bgBitmap = Bitmap.createBitmap(
            options.width,
            options.height,
            Bitmap.Config.ARGB_8888
        )
        val bgCanvas = Canvas(bgBitmap)

        // Generate gradient background
        generateBackground(bgCanvas, options.width, options.height)

        // Generate random text
        val randomWord = CHINESE_WORDS.random()
        var chars = if (randomWord.length >= options.clickCount) {
            randomWord.substring(0, options.clickCount)
        } else {
            var result = randomWord
            while (result.length < options.clickCount) {
                val extraWord = CHINESE_WORDS.random()
                result += extraWord.substring(0, minOf(options.clickCount - result.length, extraWord.length))
            }
            result
        }

        val clickTexts = chars.substring(0, options.clickCount).map { it.toString() }
        val targetPoints = mutableListOf<CaptchaPoint>()
        val decoyPoints = mutableListOf<CaptchaPoint>()

        // Generate decoy characters
        val decoyCount = Random.nextInt(1, 3)
        val usedChars = clickTexts.toMutableSet()
        val decoyTexts = mutableListOf<String>()

        for (i in 0 until decoyCount) {
            var decoyChar: String? = null
            var attempts = 0
            while (decoyChar == null && attempts < 50) {
                val word = CHINESE_WORDS.random()
                for (char in word) {
                    if (!usedChars.contains(char.toString())) {
                        decoyChar = char.toString()
                        usedChars.add(char.toString())
                        break
                    }
                }
                attempts++
            }
            decoyChar?.let { decoyTexts.add(it) }
        }

        val fontSize = 20f
        val padding = fontSize + 10

        // Generate target positions
        for (i in clickTexts.indices) {
            var x: Float
            var y: Float
            var attempts = 0
            do {
                x = Random.nextFloat() * (options.width - padding * 2) + padding
                y = Random.nextFloat() * (options.height - padding * 2) + padding
                attempts++
            } while (isOverlapping(x, y, fontSize, targetPoints) && attempts < 100)

            targetPoints.add(CaptchaPoint(x, y, clickTexts[i]))

            // Draw target character
            drawCharacter(bgCanvas, x, y, clickTexts[i], fontSize, Color.parseColor("#333333"))
        }

        // Generate and draw decoy characters
        for (i in decoyTexts.indices) {
            var x: Float
            var y: Float
            var attempts = 0
            do {
                x = Random.nextFloat() * (options.width - padding * 2) + padding
                y = Random.nextFloat() * (options.height - padding * 2) + padding
                attempts++
            } while (isOverlapping(x, y, fontSize, targetPoints) && attempts < 100)

            decoyPoints.add(CaptchaPoint(x, y, decoyTexts[i]))

            // Draw decoy character (slightly lighter)
            drawCharacter(bgCanvas, x, y, decoyTexts[i], fontSize, Color.parseColor("#555555"))
        }

        return CaptchaResult(
            bgBitmap = bgBitmap,
            targetPoints = targetPoints,
            clickTexts = clickTexts
        )
    }

    /**
     * Generate gradient background with decorative shapes
     */
    private fun generateBackground(canvas: Canvas, width: Int, height: Int) {
        // Generate gradient background
        val hue1 = Random.nextFloat() * 360
        val hue2 = (hue1 + Random.nextFloat() * 60) % 360

        val colors = intArrayOf(
            HSLToColor(hue1, 0.7f, 0.85f),
            HSLToColor(hue2, 0.7f, 0.75f)
        )

        val gradient = LinearGradient(
            0f, 0f, width.toFloat(), height.toFloat(),
            colors, null, Shader.TileMode.CLAMP
        )

        val paint = Paint().apply { shader = gradient }
        canvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), paint)

        // Add decorative shapes
        for (i in 0 until 8) {
            val shapeHue = (hue1 + Random.nextFloat() * 120) % 360
            val shapePaint = Paint().apply {
                color = HSLToColor(shapeHue, 0.6f, 0.6f, 0.15f)
            }

            val x = Random.nextFloat() * (width - 40)
            val y = Random.nextFloat() * (height - 40)
            val size = Random.nextFloat() * 40 + 40

            canvas.drawOval(x, y, x + size, y + size, shapePaint)
        }

        // Add small dots
        for (i in 0 until 30) {
            val dotHue = (hue1 + Random.nextFloat() * 180) % 360
            val dotPaint = Paint().apply {
                color = HSLToColor(dotHue, 0.5f, 0.5f, 0.3f)
            }

            canvas.drawCircle(
                Random.nextFloat() * width,
                Random.nextFloat() * height,
                Random.nextFloat() * 4 + 2,
                dotPaint
            )
        }

        // Add lines
        for (i in 0 until 5) {
            val lineHue = (hue1 + Random.nextFloat() * 180) % 360
            val linePaint = Paint().apply {
                color = HSLToColor(lineHue, 0.4f, 0.5f, 0.2f)
                strokeWidth = Random.nextFloat() * 2 + 1
            }

            canvas.drawLine(
                Random.nextFloat() * width,
                Random.nextFloat() * height,
                Random.nextFloat() * width,
                Random.nextFloat() * height,
                linePaint
            )
        }
    }

    /**
     * Draw a character with rotation
     */
    private fun drawCharacter(canvas: Canvas, x: Float, y: Float, text: String, fontSize: Float, color: Int) {
        val paint = Paint().apply {
            this.color = color
            this.textSize = fontSize
            textAlign = Paint.Align.CENTER
            isFakeBoldText = true
        }

        canvas.save()
        canvas.translate(x, y)
        canvas.rotate((Random.nextFloat() * 40 - 20))
        canvas.drawText(text, 0f, fontSize / 3, paint)
        canvas.restore()
    }

    /**
     * Check if position overlaps with existing points
     */
    private fun isOverlapping(x: Float, y: Float, size: Float, points: List<CaptchaPoint>): Boolean {
        for (point in points) {
            val distance = sqrt((x - point.x) * (x - point.x) + (y - point.y) * (y - point.y))
            if (distance < size * 1.5) return true
        }
        return false
    }

    /**
     * Convert HSL to Color
     */
    private fun HSLToColor(h: Float, s: Float, l: Float, a: Float = 1f): Int {
        val hsv = floatArrayOf(h, s, l)
        val argb = FloatArray(4)
        ColorUtils.HSLToColor(hsv, argb)
        argb[0] = a
        return Color.argb(
            (argb[0] * 255).toInt(),
            (argb[1] * 255).toInt(),
            (argb[2] * 255).toInt(),
            (argb[3] * 255).toInt()
        )
    }
}
