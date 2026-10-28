package com.captcha.pro.sample

import android.os.Bundle
import androidx.activity.compose.setContent
import androidx.appcompat.app.AppCompatActivity
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material.MaterialTheme
import androidx.compose.material.OutlinedButton
import androidx.compose.material.Scaffold
import androidx.compose.material.SnackbarHost
import androidx.compose.material.SnackbarHostState
import androidx.compose.material.Tab
import androidx.compose.material.TabRow
import androidx.compose.material.Text
import androidx.compose.material.TopAppBar
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.captcha.pro.compose.CaptchaDialog
import com.captcha.pro.compose.ClickCaptcha
import com.captcha.pro.compose.SliderCaptcha
import com.captcha.pro.core.BackendVerifyOptions
import com.captcha.pro.core.CaptchaLocale
import com.captcha.pro.core.CaptchaType
import kotlinx.coroutines.launch

/**
 * Compose counterpart of MainActivity — same two captchas against the same
 * demo backend, so the compose widgets can be eyeballed side by side with the
 * View implementation.
 *
 * Launched directly (it is not in the bottom-nav of the View sample):
 *   adb shell am start -n com.captcha.pro.sample/.ComposeActivity
 */
class ComposeActivity : AppCompatActivity() {

    private val backend = BackendVerifyOptions(
        getCaptchaUrl = "http://${BuildConfig.CAPTCHA_HOST}:3001/api/captcha",
        verifyUrl = "http://${BuildConfig.CAPTCHA_HOST}:3001/api/captcha/verify"
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            val snackbarHostState = remember { SnackbarHostState() }
            val scope = rememberCoroutineScope()
            fun snack(message: String) {
                scope.launch { snackbarHostState.showSnackbar(message) }
            }

            MaterialTheme {
                Scaffold(
                    snackbarHost = { SnackbarHost(snackbarHostState) },
                    topBar = {
                        TopAppBar(title = { Text("Captcha Pro · Compose 示例") })
                    }
                ) { padding ->
                    var tab by rememberSaveable { mutableIntStateOf(0) }
                    // Popup demo state: which captcha to show in the dialog.
                    var popupType by remember { mutableStateOf(CaptchaType.SLIDER) }
                    var showPopup by remember { mutableStateOf(false) }
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(padding),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        TabRow(selectedTabIndex = tab) {
                            listOf("Slider", "Click", "Popup").forEachIndexed { i, title ->
                                Tab(selected = tab == i, onClick = { tab = i }, text = { Text(title) })
                            }
                        }
                        Column(
                            modifier = Modifier.fillMaxSize(),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.Center
                        ) {
                            if (tab == 0) {
                                SliderCaptcha(
                                    backendVerify = backend,
                                    locale = CaptchaLocale.ZH_CN,
                                    onSuccess = { snack("✓ 验证成功") },
                                    onFail = { snack("✕ 验证失败") },
                                    onError = { snack("错误：${it.message}") }
                                )
                            } else if (tab == 1) {
                                ClickCaptcha(
                                    backendVerify = backend,
                                    locale = CaptchaLocale.ZH_CN,
                                    onSuccess = { snack("✓ 验证成功") },
                                    onFail = { snack("✕ 验证失败") },
                                    onError = { snack("错误：${it.message}") }
                                )
                            } else {
                                // Popup demo — mirrors MainActivity's dialog buttons.
                                OutlinedButton(onClick = {
                                    popupType = CaptchaType.SLIDER
                                    showPopup = true
                                }) { Text("弹出滑块弹窗") }
                                Spacer(modifier = Modifier.height(16.dp))
                                OutlinedButton(onClick = {
                                    popupType = CaptchaType.CLICK
                                    showPopup = true
                                }) { Text("弹点点选弹窗") }
                            }
                        }
                    }

                    if (showPopup) {
                        CaptchaDialog(
                            onDismissRequest = { showPopup = false },
                            type = popupType,
                            backendVerify = backend,
                            locale = CaptchaLocale.ZH_CN,
                            onSuccess = { snack("✓ 验证成功") },
                            onFail = { snack("✕ 验证失败") },
                            onError = { snack("错误：${it.message}") }
                        )
                    }
                }
            }
        }
    }
}
