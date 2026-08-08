package com.captcha.pro.widget

import android.content.Context
import android.view.MotionEvent
import android.view.View
import com.captcha.pro.core.CaptchaType
import com.captcha.pro.core.VerifyResult
import com.captcha.pro.core.CaptchaPoint
import kotlinx.coroutines.*
import java.util.*

/**
 * Risk assessment result
 */
data class RiskAssessmentResult(
    val score: Float,
    val isBot: Boolean,
    val reason: String? = null
)

/**
 * Behavior tracker for invisible captcha
 */
class BehaviorTracker {
    private var startTime: Long = 0
    private var interactionCount = 0
    private var mouseMoves = 0
    private var clicks = 0
    private var scrollEvents = 0
    private var keyPresses = 0
    private var lastInteractionTime: Long = 0
    private val interactionIntervals = mutableListOf<Long>()

    fun start() {
        startTime = System.currentTimeMillis()
        lastInteractionTime = startTime
    }

    fun recordMouseMove() {
        mouseMoves++
        recordInteraction()
    }

    fun recordClick() {
        clicks++
        recordInteraction()
    }

    fun recordScroll() {
        scrollEvents++
        recordInteraction()
    }

    fun recordKeyPress() {
        keyPresses++
        recordInteraction()
    }

    private fun recordInteraction() {
        interactionCount++
        val now = System.currentTimeMillis()
        val interval = now - lastInteractionTime
        if (interval > 0 && interval < 10000) {
            interactionIntervals.add(interval)
        }
        lastInteractionTime = now
    }

    fun getDuration(): Long = System.currentTimeMillis() - startTime

    fun getAverageInteractionInterval(): Float {
        return if (interactionIntervals.isEmpty()) 0f
        else interactionIntervals.average().toFloat()
    }

    fun toMap(): Map<String, Any> {
        return mapOf(
            "duration" to getDuration(),
            "interactionCount" to interactionCount,
            "mouseMoves" to mouseMoves,
            "clicks" to clicks,
            "scrollEvents" to scrollEvents,
            "keyPresses" to keyPresses,
            "avgInteractionInterval" to getAverageInteractionInterval()
        )
    }
}

/**
 * Invisible captcha - detects bots without user interaction
 */
class InvisibleCaptcha(
    private val context: Context,
    private val triggerView: View? = null,
    private val threshold: Float = 0.5f,
    private val challengeType: CaptchaType = CaptchaType.SLIDER,
    private val onChallenge: (() -> Unit)? = null,
    private val onSuccess: ((VerifyResult?) -> Unit)? = null,
    private val onFail: (() -> Unit)? = null
) {
    private val behaviorTracker = BehaviorTracker()
    private var isTracking = false
    private var deviceFingerprint: String = generateDeviceFingerprint()

    private var sliderCaptchaView: SliderCaptchaView? = null
    private var clickCaptchaView: ClickCaptchaView? = null

    init {
        setupTrigger()
    }

    private fun setupTrigger() {
        triggerView?.setOnTouchListener { _, event ->
            when (event.action) {
                MotionEvent.ACTION_DOWN -> behaviorTracker.recordClick()
                MotionEvent.ACTION_MOVE -> behaviorTracker.recordMouseMove()
            }
            false
        }
    }

    fun startTracking() {
        if (isTracking) return
        isTracking = true
        behaviorTracker.start()
    }

    fun trigger() {
        val riskScore = assessRisk()

        if (riskScore <= threshold) {
            onSuccess?.invoke(null)
        } else {
            onChallenge?.invoke()
            showChallenge()
        }
    }

    fun assessRisk(): Float {
        val behavior = behaviorTracker.toMap()
        var score = 0f

        val duration = behavior["duration"] as Long
        if (duration < 1000) {
            score += 0.3f
        }

        val mouseMoves = behavior["mouseMoves"] as Int
        if (mouseMoves < 5) {
            score += 0.2f
        }

        val avgInterval = behavior["avgInteractionInterval"] as Float
        if (avgInterval > 0 && avgInterval < 50) {
            score += 0.3f
        }

        val interactionCount = behavior["interactionCount"] as Int
        if (interactionCount == 0) {
            score += 0.4f
        }

        return score.coerceIn(0f, 1f)
    }

    fun getRiskAssessment(): RiskAssessmentResult {
        val score = assessRisk()
        return RiskAssessmentResult(
            score = score,
            isBot = score > threshold,
            reason = if (score > threshold) "High risk behavior detected" else null
        )
    }

    private fun showChallenge() {
        when (challengeType) {
            CaptchaType.SLIDER -> showSliderChallenge()
            CaptchaType.CLICK -> showClickChallenge()
        }
    }

    private fun showSliderChallenge() {
        sliderCaptchaView = SliderCaptchaView(context).apply {
            callback = object : SliderCaptchaCallback {
                override fun onSuccess(data: VerifyResult?) {
                    onSuccess?.invoke(data)
                    destroyChallengeViews()
                }
                override fun onFail() {
                    onFail?.invoke()
                }
                override fun onRefresh() {}
                override fun onDrag(distance: Float) {}
            }
        }
    }

    private fun showClickChallenge() {
        clickCaptchaView = ClickCaptchaView(context).apply {
            callback = object : ClickCaptchaCallback {
                override fun onSuccess(data: VerifyResult?) {
                    onSuccess?.invoke(data)
                    destroyChallengeViews()
                }
                override fun onFail() {
                    onFail?.invoke()
                }
                override fun onRefresh() {}
                override fun onClick(point: CaptchaPoint, index: Int) {}
            }
        }
    }

    private fun destroyChallengeViews() {
        sliderCaptchaView?.destroy()
        clickCaptchaView?.destroy()
        sliderCaptchaView = null
        clickCaptchaView = null
    }

    fun getBehaviorData(): Map<String, Any> = behaviorTracker.toMap()

    fun getDeviceFingerprint(): String = deviceFingerprint

    private fun generateDeviceFingerprint(): String {
        val sb = StringBuilder()
        sb.append(android.os.Build.BRAND)
        sb.append(android.os.Build.MODEL)
        sb.append(android.os.Build.VERSION.RELEASE)
        sb.append(context.resources.displayMetrics.density)
        sb.append(context.resources.displayMetrics.widthPixels)
        sb.append(context.resources.displayMetrics.heightPixels)
        return UUID.nameUUIDFromBytes(sb.toString().toByteArray()).toString()
    }

    fun destroy() {
        destroyChallengeViews()
    }
}