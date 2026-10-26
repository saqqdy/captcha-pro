package com.captcha.pro.sample

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.widget.FrameLayout
import android.widget.LinearLayout
import androidx.appcompat.app.AppCompatActivity
import com.captcha.pro.CaptchaPro
import com.captcha.pro.core.BackendVerifyOptions
import com.captcha.pro.core.CaptchaLocale
import com.captcha.pro.core.ClickCaptchaCallback
import com.captcha.pro.core.SliderCaptchaCallback
import com.captcha.pro.core.VerifyResult
import com.google.android.material.bottomnavigation.BottomNavigationView
import com.google.android.material.snackbar.Snackbar

/**
 * Native counterpart of examples/flutter/lib/main.dart: same three tabs
 * (Slider / Click / Popup), same section titles, same result messages shown in
 * a bottom snackbar.
 */
class MainActivity : AppCompatActivity() {

    companion object {
        /**
         * Demo backend (server/node). Override the host with
         * `-PCAPTCHA_HOST=<host>` — see build.gradle.kts.
         */
        private val backend = BackendVerifyOptions(
            getCaptchaUrl = "http://${BuildConfig.CAPTCHA_HOST}:3001/api/captcha",
            verifyUrl = "http://${BuildConfig.CAPTCHA_HOST}:3001/api/captcha/verify"
        )
    }

    private lateinit var content: FrameLayout

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        setSupportActionBar(findViewById(R.id.toolbar))
        title = "Captcha Pro · Android 示例"
        content = findViewById(R.id.content)

        val inflater = LayoutInflater.from(this)
        // IndexedStack equivalent: all tabs are built up front and only one is
        // visible at a time.
        val tabs = listOf(
            buildSliderTab(inflater),
            buildClickTab(inflater),
            buildPopupTab(inflater)
        )
        tabs.forEach { tab ->
            tab.visibility = View.GONE
            content.addView(tab)
        }
        tabs.first().visibility = View.VISIBLE

        findViewById<BottomNavigationView>(R.id.bottomNav).setOnItemSelectedListener { item ->
            val index = when (item.itemId) {
                R.id.tab_slider -> 0
                R.id.tab_click -> 1
                else -> 2
            }
            tabs.forEachIndexed { i, tab -> tab.visibility = if (i == index) View.VISIBLE else View.GONE }
            true
        }
    }

    private fun snack(message: String) {
        Snackbar.make(content, message, Snackbar.LENGTH_SHORT).show()
    }

    private fun buildSliderTab(inflater: LayoutInflater): View {
        val tab = inflater.inflate(R.layout.tab_slider, content, false)
        val captcha = CaptchaPro.createSliderView(
            this,
            backend,
            width = 300,
            height = 170,
            showRefresh = true,
            locale = CaptchaLocale.ZH_CN,
            callback = object : SliderCaptchaCallback {
                override fun onSuccess(data: VerifyResult?) { snack("✓ 验证成功") }
                override fun onFail() { snack("✕ 验证失败") }
                override fun onRefresh() { }
                override fun onError(error: Throwable) { snack("错误：${error.message}") }
                override fun onDrag(distance: Float) { }
            }
        )
        tab.findViewById<LinearLayout>(R.id.captchaHost).addView(captcha)
        return tab
    }

    private fun buildClickTab(inflater: LayoutInflater): View {
        val tab = inflater.inflate(R.layout.tab_click, content, false)
        val captcha = CaptchaPro.createClickView(
            this,
            backend,
            width = 300,
            height = 170,
            clickCount = 3,
            showRefresh = true,
            locale = CaptchaLocale.ZH_CN,
            callback = object : ClickCaptchaCallback {
                override fun onSuccess(data: VerifyResult?) { snack("✓ 验证成功") }
                override fun onFail() { snack("✕ 验证失败") }
                override fun onRefresh() { }
                override fun onError(error: Throwable) { snack("错误：${error.message}") }
                override fun onClick(point: com.captcha.pro.core.CaptchaPoint, index: Int) { }
            }
        )
        tab.findViewById<LinearLayout>(R.id.captchaHost).addView(captcha)
        return tab
    }

    private fun buildPopupTab(inflater: LayoutInflater): View {
        val tab = inflater.inflate(R.layout.tab_popup, content, false)
        tab.findViewById<View>(R.id.btnSliderPopup).setOnClickListener {
            CaptchaPro.showSlider(
                this,
                backend,
                locale = CaptchaLocale.ZH_CN,
                onSuccess = { snack("✓ 弹窗验证成功") },
                onFail = { snack("✕ 弹窗验证失败") },
                onRefresh = { }
            ).setOnDismissListener { snack("弹窗已关闭") }
        }
        tab.findViewById<View>(R.id.btnClickPopup).setOnClickListener {
            CaptchaPro.showClick(
                this,
                backend,
                locale = CaptchaLocale.ZH_CN,
                onSuccess = { snack("✓ 点选验证成功") },
                onFail = { snack("✕ 点选验证失败") },
                onRefresh = { }
            ).setOnDismissListener { snack("弹窗已关闭") }
        }
        return tab
    }
}
