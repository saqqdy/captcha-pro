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
import androidx.compose.ui.unit.dp
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
                .shadow(8.dp, RoundedCornerShape(16.dp))
                .clip(RoundedCornerShape(16.dp))
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

            // Refresh button
            if (showRefresh && !loading) {
                Box(
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(8.dp)
                        .size(28.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(Color.White.copy(alpha = 0.9f))
                        .clickable { refresh() },
                    contentAlignment = Alignment.Center
                ) {
                    Text("⟳", color = Color(0xFF666666))
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
                        .background(Color.White.copy(alpha = 0.75f)),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Box(
                            modifier = Modifier
                                .size(32.dp)
                                .clip(CircleShape)
                                .background(
                                    if (s == "success") Color(0xFF52C41A).copy(alpha = 0.85f)
                                    else Color(0xFFFF4D4F).copy(alpha = 0.85f)
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = if (s == "success") "✓" else "✕",
                                color = Color.White,
                                style = MaterialTheme.typography.h6
                            )
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = if (s == "success")
                                LocaleMessages.get(locale, "slider_success")
                            else LocaleMessages.get(locale, "slider_fail"),
                            color = if (s == "success") Color(0xFF389E0D) else Color(0xFFCF1322)
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
                .height(42.dp)
                .clip(RoundedCornerShape(8.dp))
                .background(Color(0xFFF7F9FA))
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
                color = Color(0xFF999999),
                modifier = Modifier.align(Alignment.Center)
            )

            // Thumb
            Surface(
                modifier = Modifier
                    .offset(x = currentX.dp, y = 2.dp)
                    .width(42.dp)
                    .height(42.dp),
                color = Color.White,
                shape = RoundedCornerShape(8.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFE1E4E8))
            ) {
                Text(
                    "→",
                    color = Color(0xFF1991FA),
                    modifier = Modifier.fillMaxSize().wrapContentSize(Alignment.Center)
                )
            }
        }
    }
}
