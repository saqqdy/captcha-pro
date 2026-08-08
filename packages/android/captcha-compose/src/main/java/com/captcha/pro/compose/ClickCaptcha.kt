package com.captcha.pro.compose

import android.graphics.Bitmap
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.drawscope.drawIntoCanvas
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.captcha.pro.core.BackendVerifyOptions
import com.captcha.pro.core.CaptchaGenerator
import com.captcha.pro.core.CaptchaLocale
import com.captcha.pro.core.CaptchaOptions
import com.captcha.pro.core.CaptchaPoint
import com.captcha.pro.core.CaptchaType
import com.captcha.pro.core.LocaleMessages
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
    onSuccess: () -> Unit = {},
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
                        onSuccess()
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

    Column(
        modifier = modifier
            .padding(10.dp)
            .width((width + 20).dp)
            .height((height + 60).dp)
            .background(Color.White, RoundedCornerShape(8.dp))
    ) {
        // Captcha area
        Box(
            modifier = Modifier
                .width(width.dp)
                .height(height.dp)
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
            } ?: if (loading) {
                CircularProgressIndicator(
                    modifier = Modifier.align(Alignment.Center),
                    color = Color.Gray
                )
            } else if (errorMsg != null) {
                Text(
                    text = errorMsg!!,
                    color = Color.Gray,
                    modifier = Modifier.align(Alignment.Center)
                )
            }

            // Click point indicators
            clickPoints.forEach { point ->
                Box(
                    modifier = Modifier
                        .offset(x = (point.x - 12).dp, y = (point.y - 12).dp)
                        .size(24.dp)
                        .background(Color(0xFF1890FF).copy(alpha = 0.9f), CircleShape),
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
                IconButton(
                    onClick = { refresh() },
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(8.dp)
                ) {
                    Icon(
                        Icons.Default.Refresh,
                        contentDescription = "Refresh",
                        tint = Color.Gray
                    )
                }
            }

            // Status overlay
            status?.let { s ->
                Surface(
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .fillMaxWidth()
                        .height(28.dp),
                    color = if (s == "success") Color(0xFF52C41A) else Color(0xFFF5222D)
                ) {
                    Text(
                        text = if (s == "success")
                            LocaleMessages.get(locale, "click_success")
                        else LocaleMessages.get(locale, "click_fail"),
                        color = Color.White,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.wrapContentSize(Alignment.Center)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Info bar
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .height(40.dp),
            color = Color(0xFFF7F9FA),
            shape = RoundedCornerShape(4.dp)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 12.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                if (charBitmaps.isNotEmpty()) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = LocaleMessages.get(locale, "click_prompt"),
                            style = MaterialTheme.typography.body2
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        charBitmaps.forEachIndexed { i, bitmap ->
                            Image(
                                bitmap = bitmap.asImageBitmap(),
                                contentDescription = "char${i + 1}",
                                modifier = Modifier
                                    .size(28.dp)
                                    .padding(horizontal = 2.dp)
                            )
                        }
                    }
                } else {
                    Text(
                        text = LocaleMessages.get(locale, "click_prompt") +
                            clickTexts.joinToString(" "),
                        style = MaterialTheme.typography.body2
                    )
                }
                Text(
                    text = "${clickPoints.size}/$targetCount",
                    style = MaterialTheme.typography.body2,
                    color = Color(0xFF1890FF)
                )
            }
        }
    }
}
