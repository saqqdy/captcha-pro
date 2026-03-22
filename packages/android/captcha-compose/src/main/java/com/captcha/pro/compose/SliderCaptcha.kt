package com.captcha.pro.compose

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.gestures.detectHorizontalDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.*
import androidx.compose.ui.graphics.drawscope.drawIntoCanvas
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.unit.dp
import com.captcha.pro.core.CaptchaGenerator
import com.captcha.pro.core.CaptchaOptions
import com.captcha.pro.core.CaptchaType

/**
 * Slider captcha composable
 */
@Composable
fun SliderCaptcha(
    modifier: Modifier = Modifier,
    width: Int = 300,
    height: Int = 170,
    sliderWidth: Int = 42,
    sliderHeight: Int = 42,
    precision: Int = 5,
    showRefresh: Boolean = true,
    onSuccess: () -> Unit = {},
    onFail: () -> Unit = {},
    onRefresh: () -> Unit = {},
) {
    val generator = remember { CaptchaGenerator() }

    var bgBitmap by remember { mutableStateOf<Bitmap?>(null) }
    var sliderBitmap by remember { mutableStateOf<Bitmap?>(null) }
    var targetX by remember { mutableStateOf(0f) }
    var sliderY by remember { mutableStateOf(0f) }
    var currentX by remember { mutableStateOf(0f) }
    var status by remember { mutableStateOf<String?>(null) }

    fun refresh() {
        val result = generator.generate(
            CaptchaOptions(
                type = CaptchaType.SLIDER,
                width = width,
                height = height,
                sliderWidth = sliderWidth,
                sliderHeight = sliderHeight
            )
        )
        bgBitmap = result.bgBitmap
        sliderBitmap = result.sliderBitmap
        targetX = result.targetPoints.first().x
        sliderY = result.sliderY
        currentX = 0f
        status = null
        onRefresh()
    }

    fun verify() {
        if (kotlin.math.abs(currentX - targetX) <= precision) {
            status = "success"
            onSuccess()
        } else {
            status = "fail"
            onFail()
            kotlinx.coroutines.GlobalScope.launch {
                kotlinx.coroutines.delay(500)
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
            }

            // Slider
            sliderBitmap?.let { bitmap ->
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

        // Slider bar
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(40.dp)
                .background(Color(0xFFF7F9FA), RoundedCornerShape(4.dp))
                .pointerInput(Unit) {
                    detectHorizontalDragGestures(
                        onDragEnd = { verify() }
                    ) { change, dragAmount ->
                        if (status == null) {
                            currentX = (currentX + dragAmount).coerceIn(0f, (width - sliderWidth).toFloat())
                        }
                    }
                }
        ) {
            Surface(
                modifier = Modifier
                    .offset(x = currentX.dp)
                    .width(36.dp)
                    .height(36.dp)
                    .padding(2.dp),
                color = Color.White,
                shape = RoundedCornerShape(4.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFE1E4E8))
            ) {
                Icon(
                    Icons.Default.ArrowForward,
                    contentDescription = null,
                    tint = MaterialTheme.colors.primary,
                    modifier = Modifier.padding(8.dp)
                )
            }
        }
    }
}
