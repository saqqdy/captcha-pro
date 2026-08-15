package com.captcha.pro.compose

import android.graphics.Bitmap
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.scaleIn
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectTapGestures
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
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.drawscope.drawIntoCanvas
import androidx.compose.ui.graphics.nativeCanvas
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.unit.dp
import com.captcha.pro.core.BackendVerifyOptions
import com.captcha.pro.core.CaptchaGenerator
import com.captcha.pro.core.CaptchaLocale
import com.captcha.pro.core.CaptchaOptions
import com.captcha.pro.core.CaptchaPoint
import com.captcha.pro.core.CaptchaType
import com.captcha.pro.core.LocaleMessages
import com.captcha.pro.core.VerifyResult
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/**
 * Click point data
 */
data class ClickPoint(
    val x: Float,
    val y: Float,
    val text: String?,
    val index: Int
)

/**
 * Click captcha composable — backend verification only.
 */
@Composable
fun ClickCaptcha(
    modifier: Modifier = Modifier,
    width: Int = 300,
    height: Int = 170,
    count: Int = 3,
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
    var clickTexts by remember { mutableStateOf<List<String>>(emptyList()) }
    var clickCharImages by remember { mutableStateOf<List<String>>(emptyList()) }
    var charBitmaps by remember { mutableStateOf<List<Bitmap>>(emptyList()) }
    var clickPoints by remember { mutableStateOf<List<ClickPoint>>(emptyList()) }
    var status by remember { mutableStateOf<String?>(null) }
    var loading by remember { mutableStateOf(true) }
    var errorMsg by remember { mutableStateOf<String?>(null) }

    val gradientColors = listOf(Color(0xFF667EEA), Color(0xFF764BA2))

    val targetCount = when {
        clickCharImages.isNotEmpty() -> clickCharImages.size
        clickTexts.isNotEmpty() -> clickTexts.size
        else -> count
    }

    fun refresh() {
        scope.launch {
            loading = true
            errorMsg = null
            clickPoints = emptyList()
            try {
                val result = generator.generate(
                    CaptchaOptions(
                        type = CaptchaType.CLICK,
                        width = width,
                        height = height,
                        clickCount = count,
                        backendVerify = backendVerify,
                        locale = locale
                    )
                )
                bgBitmap = result.bgBitmap
                clickTexts = result.clickTexts ?: emptyList()
                clickCharImages = result.clickCharImages ?: emptyList()
                status = null
                loading = false
                onRefresh()

                // Load char images off the main thread when present.
                charBitmaps = if (clickCharImages.isNotEmpty()) {
                    withContext(Dispatchers.IO) {
                        clickCharImages.mapNotNull { src -> runCatching { generator.loadImage(src) }.getOrNull() }
                    }
                } else emptyList()
            } catch (e: Exception) {
                loading = false
                errorMsg = LocaleMessages.get(locale, "error_network")
                onError(e)
            }
        }
    }

    fun handleClick(offsetX: Float, offsetY: Float) {
        if (status != null || loading) return
        if (clickPoints.size >= targetCount) return

        val newClickPoints = clickPoints + ClickPoint(offsetX, offsetY, null, clickPoints.size)
        clickPoints = newClickPoints

        if (newClickPoints.size == targetCount) {
            val points = newClickPoints.map { CaptchaPoint(it.x, it.y) }
            val data = generator.getCaptchaData(type = CaptchaType.CLICK, targetPoints = points)
            val options = CaptchaOptions(type = CaptchaType.CLICK, backendVerify = backendVerify, locale = locale)
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
                Canvas(
                    modifier = Modifier
                        .matchParentSize()
                        .pointerInput(Unit) {
                            detectTapGestures { offset ->
                                handleClick(offset.x, offset.y)
                            }
                        }
                ) {
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

            // Click point indicators
            clickPoints.forEach { point ->
                Box(
                    modifier = Modifier
                        .offset(x = (point.x - 12).dp, y = (point.y - 12).dp)
                        .size(24.dp)
                        .background(Color(0xFF1991FA), CircleShape)
                        .border(3.dp, Color.White, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "${point.index + 1}",
                        color = Color.White,
                        style = MaterialTheme.typography.caption
                    )
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
                                LocaleMessages.get(locale, "click_success")
                            else LocaleMessages.get(locale, "click_fail"),
                            color = if (s == "success") Color(0xFF389E0D) else Color(0xFFCF1322)
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Prompt bar
        Surface(
            modifier = Modifier.fillMaxWidth(),
            color = Color(0xFFF7F9FA),
            shape = RoundedCornerShape(16.dp),
            border = BorderStroke(1.dp, Color(0xFFE8E8E8))
        ) {
            Row(
                modifier = Modifier.padding(horizontal = 12.dp, vertical = 10.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = LocaleMessages.get(locale, "click_prompt"),
                        color = Color(0xFF666666),
                        style = MaterialTheme.typography.body2
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    if (charBitmaps.isNotEmpty()) {
                        charBitmaps.forEachIndexed { i, bitmap ->
                            Box(
                                modifier = Modifier
                                    .padding(start = 6.dp)
                                    .size(28.dp)
                                    .shadow(2.dp, RoundedCornerShape(8.dp))
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(Brush.linearGradient(gradientColors)),
                                contentAlignment = Alignment.Center
                            ) {
                                Image(
                                    bitmap = bitmap.asImageBitmap(),
                                    contentDescription = "char${i + 1}",
                                    modifier = Modifier.fillMaxSize().padding(4.dp)
                                )
                            }
                        }
                    } else {
                        clickTexts.forEach { char ->
                            Box(
                                modifier = Modifier
                                    .padding(start = 6.dp)
                                    .size(28.dp)
                                    .shadow(2.dp, RoundedCornerShape(8.dp))
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(Brush.linearGradient(gradientColors)),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    char,
                                    color = Color.White,
                                    style = MaterialTheme.typography.body1
                                )
                            }
                        }
                    }
                }
                Text(
                    text = "${clickPoints.size}/$targetCount",
                    style = MaterialTheme.typography.body2,
                    color = Color(0xFF1991FA)
                )
            }
        }
    }
}
