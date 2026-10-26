package com.captcha.pro.compose

import android.graphics.Bitmap
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.scaleIn
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectHorizontalDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.drawIntoCanvas
import androidx.compose.ui.graphics.nativeCanvas
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.ProgressBarRangeInfo
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.progressBarRangeInfo
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.setProgress
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.captcha.pro.core.BackendVerifyOptions
import com.captcha.pro.core.CaptchaGenerator
import com.captcha.pro.core.CaptchaLocale
import com.captcha.pro.core.CaptchaOptions
import com.captcha.pro.core.CaptchaType
import com.captcha.pro.core.LocaleMessages
import com.captcha.pro.core.VerifyResult
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

/**
 * Slider captcha composable — backend verification only.
 */
@Composable
fun SliderCaptcha(
    modifier: Modifier = Modifier,
    width: Int = 300,
    height: Int = 170,
    sliderWidth: Int = 42,
    sliderHeight: Int = 42,
    showRefresh: Boolean = true,
    backendVerify: BackendVerifyOptions,
    locale: CaptchaLocale = CaptchaLocale.ZH_CN,
    onSuccess: (VerifyResult?) -> Unit = {},
    onFail: () -> Unit = {},
    onRefresh: () -> Unit = {},
    onError: (Throwable) -> Unit = {},
) {
    val colors = CaptchaColorScheme.get()
    val generator = remember { CaptchaGenerator() }
    val scope = rememberCoroutineScope()

    var bgBitmap by remember { mutableStateOf<Bitmap?>(null) }
    var sliderBitmap by remember { mutableStateOf<Bitmap?>(null) }
    var sliderY by remember { mutableStateOf(0f) }
    var currentX by remember { mutableStateOf(0f) }
    var status by remember { mutableStateOf<String?>(null) }
    var loading by remember { mutableStateOf(true) }
    var errorMsg by remember { mutableStateOf<String?>(null) }

    val gradientColors = listOf(Color(0xFF667EEA), Color(0xFF764BA2))

    fun refresh() {
        scope.launch {
            loading = true
            errorMsg = null
            try {
                val result = generator.generate(
                    CaptchaOptions(
                        type = CaptchaType.SLIDER,
                        width = width,
                        height = height,
                        sliderWidth = sliderWidth,
                        sliderHeight = sliderHeight,
                        backendVerify = backendVerify,
                        locale = locale
                    )
                )
                bgBitmap = result.bgBitmap
                sliderBitmap = result.sliderBitmap
                sliderY = result.sliderY
                currentX = 0f
                status = null
                loading = false
                onRefresh()
            } catch (e: Exception) {
                loading = false
                errorMsg = LocaleMessages.get(locale, "error_network")
                onError(e)
            }
        }
    }

    fun verify() {
        val data = generator.getCaptchaData(type = CaptchaType.SLIDER, sliderX = currentX)
        val options = CaptchaOptions(type = CaptchaType.SLIDER, backendVerify = backendVerify, locale = locale)
        scope.launch {
            try {
                val response = generator.backendVerify(data, options)
                if (response.success) {
                    status = "success"
                    val verifiedAt = (response.data?.get("verifiedAt") as? Number)?.toLong()
                    onSuccess(VerifyResult(verifiedAt = verifiedAt))
                } else {
                    status = "fail"
                    onFail()
                    delay(800)
                    refresh()
                }
            } catch (e: Exception) {
                status = "fail"
                errorMsg = LocaleMessages.get(locale, "error_network")
                onError(e)
            }
        }
    }

    LaunchedEffect(Unit) { refresh() }

    Column(modifier = modifier.width(width.dp)) {
        // Captcha area
        Box(
            modifier = Modifier
                .width(width.dp)
                .height(height.dp)
                // 8, matching BorderRadius.circular(8) in slider_captcha.dart.
                .shadow(8.dp, RoundedCornerShape(8.dp))
                .clip(RoundedCornerShape(8.dp))
                .background(Brush.linearGradient(gradientColors))
        ) {
            // Background image
            bgBitmap?.let { bitmap ->
                Canvas(modifier = Modifier.matchParentSize()) {
                    drawIntoCanvas { canvas ->
                        canvas.nativeCanvas.drawBitmap(
                            bitmap,
                            null,
                            android.graphics.Rect(0, 0, size.width.toInt(), size.height.toInt()),
                            null
                        )
                    }
                }
            } ?: Text(
                text = errorMsg ?: LocaleMessages.get(locale, "loading"),
                color = Color.White,
                // 14, matching the loading Text in slider_captcha.dart.
                style = MaterialTheme.typography.body2,
                modifier = Modifier.align(Alignment.Center)
            )

            // Slider
            sliderBitmap?.let { bitmap ->
                if (!loading) {
                    Canvas(
                        modifier = Modifier
                            .offset(x = currentX.dp, y = sliderY.dp)
                            .width(sliderWidth.dp)
                            .height(sliderHeight.dp)
                    ) {
                        drawIntoCanvas { canvas ->
                            canvas.nativeCanvas.drawBitmap(bitmap, 0f, 0f, null)
                        }
                    }
                }
            }

            // Refresh button — 44dp hit area centered on 28dp visual (a11y: role=Button + label)
            if (showRefresh && !loading) {
                Box(
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        // Flutter's 44dp hit box is Positioned(top: 8, right: 8)
                        // (the 28dp visual is centred inside it).
                        .offset(x = (-8).dp, y = 8.dp)
                        .size(44.dp)
                        .semantics {
                            role = Role.Button
                            contentDescription = LocaleMessages.get(locale, "refresh")
                        }
                        .clickable { refresh() },
                    contentAlignment = Alignment.Center
                ) {
                    Box(
                        modifier = Modifier
                            .size(28.dp)
                            .clip(RoundedCornerShape(8.dp))
                            .background(colors.refreshBtnBg),
                        contentAlignment = Alignment.Center
                    ) {
                        // Material icon rather than the "⟳" glyph: the glyph
                        // renders well below its point size and its baseline
                        // sits off-centre in this fixed 28dp box. The label
                        // lives on the 44dp parent, so no description here.
                        Icon(
                            Icons.Filled.Refresh,
                            contentDescription = null,
                            modifier = Modifier.size(16.dp),
                            tint = colors.sliderHintText
                        )
                    }
                }
            }

            // Status overlay — centered, white@75%, animated fade-in + scale
            androidx.compose.animation.AnimatedVisibility(
                visible = status != null,
                enter = fadeIn(animationSpec = tween(200)) +
                    scaleIn(initialScale = 0.9f, animationSpec = tween(200)),
                exit = fadeOut(animationSpec = tween(200))
            ) {
                val s = status ?: ""
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .semantics { liveRegion = LiveRegionMode.Polite }
                        .background(colors.statusOverlayBg),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Box(
                            modifier = Modifier
                                .size(32.dp)
                                .clip(CircleShape)
                                .background(
                                    if (s == "success") colors.successIconBg
                                    else colors.failIconBg
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            // Material icons rather than the "✓"/"✕" glyphs.
                            Icon(
                                if (s == "success") Icons.Filled.Check else Icons.Filled.Close,
                                contentDescription = null,
                                modifier = Modifier.size(18.dp),
                                tint = Color.White
                            )
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = if (s == "success")
                                LocaleMessages.get(locale, "slider_success")
                            else LocaleMessages.get(locale, "slider_fail"),
                            // 13, matching the status Text in slider_captcha.dart.
                            fontSize = 13.sp,
                            color = if (s == "success") colors.successText else colors.failText
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(5.dp))

        // Slider bar
        Box(
            modifier = Modifier
                .width(width.dp)
                // barHeight = 40.0 in slider_captcha.dart (was 42).
                .height(40.dp)
                .clip(RoundedCornerShape(8.dp))
                .background(colors.sliderBarBg)
                .pointerInput(Unit) {
                    detectHorizontalDragGestures(
                        onDragEnd = { if (status == null) verify() }
                    ) { _, dragAmount ->
                        if (status == null) {
                            currentX = (currentX + dragAmount).coerceIn(0f, (width - sliderWidth).toFloat())
                        }
                    }
                }
        ) {
            // Hint text centered
            Text(
                text = LocaleMessages.get(locale, "slider_hint"),
                color = colors.sliderHintText,
                // 14, matching the hint Text in slider_captcha.dart.
                style = MaterialTheme.typography.body2,
                modifier = Modifier.align(Alignment.Center)
            )

            // Thumb
            Surface(
                modifier = Modifier
                    // Full-height thumb (Flutter: Positioned top:0 bottom:0),
                    // so no y offset and the bar's 40dp height.
                    .offset(x = currentX.dp)
                    .width(42.dp)
                    .height(40.dp)
                    .semantics {
                        contentDescription = LocaleMessages.get(locale, "slider_hint")
                        progressBarRangeInfo = ProgressBarRangeInfo(
                            current = currentX,
                            range = 0f..(width - sliderWidth).toFloat()
                        )
                        setProgress {
                            currentX = it.coerceIn(0f, (width - sliderWidth).toFloat())
                            true
                        }
                    },
                color = colors.sliderThumbBg,
                shape = RoundedCornerShape(8.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, colors.sliderThumbBorder)
            ) {
                // Material icon rather than the "→" glyph: the glyph renders
                // well below its point size and its baseline is hard to centre
                // in the thumb. Matches the 20dp triangle core/slider.ts draws.
                Icon(
                    Icons.Filled.PlayArrow,
                    contentDescription = null,
                    modifier = Modifier.size(20.dp),
                    tint = Color(0xFF1991FA)
                )
            }
        }
    }
}
