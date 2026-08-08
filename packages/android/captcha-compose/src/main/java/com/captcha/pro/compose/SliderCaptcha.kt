package com.captcha.pro.compose

import android.graphics.Bitmap
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.drawIntoCanvas
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.captcha.pro.core.BackendVerifyOptions
import com.captcha.pro.core.CaptchaGenerator
import com.captcha.pro.core.CaptchaLocale
import com.captcha.pro.core.CaptchaOptions
import com.captcha.pro.core.CaptchaType
import com.captcha.pro.core.LocaleMessages
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
    onSuccess: () -> Unit = {},
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
                            LocaleMessages.get(locale, "slider_success")
                        else LocaleMessages.get(locale, "slider_fail"),
                        color = Color.White,
                        textAlign = TextAlign.Center,
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
                        onDragEnd = { if (status == null) verify() }
                    ) { _, dragAmount ->
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
