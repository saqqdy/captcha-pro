package com.captcha.pro.compose

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.Icon
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.captcha.pro.core.BackendVerifyOptions
import com.captcha.pro.core.CaptchaLocale
import com.captcha.pro.core.CaptchaType
import com.captcha.pro.core.LocaleMessages
import com.captcha.pro.core.VerifyResult
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

/**
 * Popup captcha dialog — compose counterpart of widget.CaptchaDialog.
 *
 * Wraps [SliderCaptcha] / [ClickCaptcha] in a centered card over a full-screen
 * mask, with a title header + close button + separator, matching
 * popup_captcha.dart (card 24dp radius / 8dp elevation, header 16x12 padding,
 * 1px separator, body 12dp margin).
 */
@Composable
fun CaptchaDialog(
    onDismissRequest: () -> Unit,
    type: CaptchaType = CaptchaType.SLIDER,
    backendVerify: BackendVerifyOptions,
    locale: CaptchaLocale = CaptchaLocale.ZH_CN,
    title: String = "",
    width: Int = 300,
    height: Int = 170,
    count: Int = 3,
    showRefresh: Boolean = true,
    maskClosable: Boolean = true,
    showClose: Boolean = true,
    autoClose: Boolean = true,
    closeDelayMs: Long = 500,
    onSuccess: (VerifyResult?) -> Unit = {},
    onFail: () -> Unit = {},
    onRefresh: () -> Unit = {},
    onError: (Throwable) -> Unit = {},
) {
    val colors = CaptchaColorScheme.get()
    val scope = rememberCoroutineScope()
    val displayTitle = if (title.isNotEmpty()) title
        else LocaleMessages.get(locale, "popup_title")

    // autoClose mirrors CaptchaDialog: dismiss `closeDelay` after success.
    val wrappedOnSuccess: (VerifyResult?) -> Unit = { result ->
        onSuccess(result)
        if (autoClose) scope.launch {
            delay(closeDelayMs)
            onDismissRequest()
        }
    }

    Dialog(
        onDismissRequest = onDismissRequest,
        // Let the content fill the screen so the mask covers everything and the
        // card can centre — the platform default would clamp to wrap-content.
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(colors.popupMask)
                .clickable(
                    interactionSource = remember { MutableInteractionSource() },
                    indication = null
                ) { if (maskClosable) onDismissRequest() }
        ) {
            Column(
                modifier = Modifier
                    .align(Alignment.Center)
                    // SDK cardWidth = captchaWidth + 24 (body 12dp margin each
                    // side). Without this, usePlatformDefaultWidth=false lets the
                    // header's fillMaxWidth() stretch the card to screen width.
                    .width((width + 24).dp)
                    // 24dp radius + 8dp elevation, matching popup_captcha.dart's
                    // card (BorderRadius.circular(24) + boxShadow).
                    .shadow(8.dp, RoundedCornerShape(24.dp))
                    .clip(RoundedCornerShape(24.dp))
                    .background(colors.popupCard)
                    // Consume taps on the card so they don't fall through to the
                    // mask dismiss handler (mirrors CaptchaDialog's card
                    // isClickable = true). No indication: the card itself isn't a
                    // button. Children (captcha gestures, close button) still get
                    // the events first and consume what they handle.
                    .clickable(
                        interactionSource = remember { MutableInteractionSource() },
                        indication = null
                    ) {}
                    .semantics { contentDescription = displayTitle }
            ) {
                // Header — EdgeInsets.symmetric(horizontal: 16, vertical: 12).
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    androidx.compose.material.Text(
                        text = displayTitle,
                        color = colors.popupTitle,
                        // 16, matching the title Text in popup_captcha.dart.
                        fontSize = 16.sp
                    )
                    Spacer(modifier = Modifier.weight(1f))
                    if (showClose) {
                        // 24dp box with a 16dp glyph — matches captcha-sdk's
                        // closeBtn (24dp LayoutParams + 4dp padding → 16dp
                        // ic_captcha_close). SDK widens the hit target to 48dp
                        // via TouchDelegate (hit-only, no layout change); here the
                        // clickable stays at 24dp so the header height matches
                        // SDK's 12+24+12 = 48dp.
                        Box(
                            modifier = Modifier
                                .size(24.dp)
                                .clickable(
                                    interactionSource = remember { MutableInteractionSource() },
                                    indication = null
                                ) { onDismissRequest() }
                                .semantics {
                                    role = Role.Button
                                    contentDescription = LocaleMessages.get(locale, "popup_close")
                                },
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                Icons.Filled.Close,
                                contentDescription = null,
                                modifier = Modifier.size(16.dp),
                                tint = colors.popupClose
                            )
                        }
                    }
                }

                // 1px separator (Border(bottom: BorderSide(popupSeparator))).
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(1.dp)
                        .background(colors.popupSeparator)
                )

                // Body — Padding(all: 12) around the captcha in popup_captcha.dart.
                Box(modifier = Modifier.padding(12.dp)) {
                    if (type == CaptchaType.SLIDER) {
                        SliderCaptcha(
                            backendVerify = backendVerify,
                            locale = locale,
                            width = width,
                            height = height,
                            showRefresh = showRefresh,
                            onSuccess = wrappedOnSuccess,
                            onFail = onFail,
                            onRefresh = onRefresh,
                            onError = onError
                        )
                    } else {
                        ClickCaptcha(
                            backendVerify = backendVerify,
                            locale = locale,
                            width = width,
                            height = height,
                            count = count,
                            showRefresh = showRefresh,
                            onSuccess = wrappedOnSuccess,
                            onFail = onFail,
                            onRefresh = onRefresh,
                            onError = onError
                        )
                    }
                }
            }
        }
    }
}
