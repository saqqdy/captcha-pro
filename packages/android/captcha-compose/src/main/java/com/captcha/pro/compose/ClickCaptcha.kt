package com.captcha.pro.compose

import androidx.compose.foundation.Canvas
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
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.drawIntoCanvas
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.unit.dp
import com.captcha.pro.core.CaptchaGenerator
import com.captcha.pro.core.CaptchaOptions
import com.captcha.pro.core.CaptchaType
import kotlin.math.sqrt

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
 * Click captcha composable
 */
@Composable
fun ClickCaptcha(
    modifier: Modifier = Modifier,
    width: Int = 300,
    height: Int = 170,
    count: Int = 3,
    precision: Float = 20f,
    showRefresh: Boolean = true,
    onSuccess: () -> Unit = {},
    onFail: () -> Unit = {},
    onRefresh: () -> Unit = {},
) {
    val generator = remember { CaptchaGenerator() }

    var bgBitmap by remember { mutableStateOf<Bitmap?>(null) }
    var targetPoints by remember { mutableStateOf<List<com.captcha.pro.core.CaptchaPoint>>(emptyList()) }
    var clickTexts by remember { mutableStateOf<List<String>>(emptyList()) }
    var clickPoints by remember { mutableStateOf<List<ClickPoint>>(emptyList()) }
    var status by remember { mutableStateOf<String?>(null) }

    fun refresh() {
        val result = generator.generate(
            CaptchaOptions(
                type = CaptchaType.CLICK,
                width = width,
                height = height,
                clickCount = count
            )
        )
        bgBitmap = result.bgBitmap
        targetPoints = result.targetPoints
        clickTexts = result.clickTexts
        clickPoints = emptyList()
        status = null
        onRefresh()
    }

    fun verify(offsetX: Float, offsetY: Float) {
        if (status != null) return

        val currentTargetIndex = clickPoints.size
        if (currentTargetIndex >= count) return

        val target = targetPoints.getOrNull(currentTargetIndex) ?: return
        val distance = sqrt((offsetX - target.x) * (offsetX - target.x) + (offsetY - target.y) * (offsetY - target.y))

        if (distance <= precision) {
            // Correct click
            val newClickPoints = clickPoints + ClickPoint(offsetX, offsetY, target.text, currentTargetIndex)
            clickPoints = newClickPoints

            if (newClickPoints.size == count) {
                // All points clicked correctly
                status = "success"
                onSuccess()
            }
        } else {
            // Wrong click
            status = "fail"
            onFail()
            kotlinx.coroutines.GlobalScope.launch {
                kotlinx.coroutines.delay(1000)
                refresh()
            }
        }
    }

    LaunchedEffect(Unit) {
        refresh()
    }

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
                                verify(offset.x, offset.y)
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
            if (showRefresh) {
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
                        text = if (s == "success") "验证成功" else "验证失败",
                        color = Color.White,
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
                Text(
                    text = "请依次点击: ${clickTexts.joinToString(" ")}",
                    style = MaterialTheme.typography.body2
                )
                Text(
                    text = "${clickPoints.size}/$count",
                    style = MaterialTheme.typography.body2,
                    color = Color(0xFF1890FF)
                )
            }
        }
    }
}
