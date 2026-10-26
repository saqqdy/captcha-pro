package com.captcha.pro.compose

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

/**
 * Captcha color scheme for light and dark modes
 */
data class CaptchaColorScheme(
    // Slider colors
    val sliderBarBg: Color,
    val sliderHintText: Color,
    val sliderThumbBg: Color,
    val sliderThumbBorder: Color,

    // Prompt bar colors
    val promptBarBg: Color,
    val promptBarBorder: Color,
    val promptText: Color,

    // Refresh button colors
    val refreshBtnBg: Color,
    val refreshIcon: Color,

    // Status overlay colors
    val statusOverlayBg: Color,
    val successText: Color,
    val failText: Color,
    val successIconBg: Color,
    val failIconBg: Color,

    // Popup colors
    val popupCard: Color,
    val popupTitle: Color,
    val popupClose: Color,
    val popupSeparator: Color,
    val popupMask: Color
) {
    companion object {
        val Light = CaptchaColorScheme(
            sliderBarBg = Color(0xFFF7F9FA),
            sliderHintText = Color(0xFF666666),
            sliderThumbBg = Color(0xFFFFFFFF),
            sliderThumbBorder = Color(0xFFE1E4E8),
            promptBarBg = Color(0xFFF7F9FA),
            promptBarBorder = Color(0xFFE8E8E8),
            promptText = Color(0xFF666666),
            refreshBtnBg = Color(0xE6FFFFFF),
            refreshIcon = Color(0xFF666666),
            statusOverlayBg = Color(0xBFFFFFFF),
            successText = Color(0xFF389E0D),
            failText = Color(0xFFCF1322),
            successIconBg = Color(0xD952C41A),
            failIconBg = Color(0xD9FF4D4F),
            popupCard = Color(0xFFFFFFFF),
            popupTitle = Color(0xFF333333),
            popupClose = Color(0xFF999999),
            popupSeparator = Color(0xFFEEEEEE),
            popupMask = Color(0x80000000)
        )

        val Dark = CaptchaColorScheme(
            sliderBarBg = Color(0xFF1F1F1F),
            sliderHintText = Color(0xFFAAAAAA),
            sliderThumbBg = Color(0xFF2A2A2A),
            sliderThumbBorder = Color(0xFF3A3A3A),
            promptBarBg = Color(0xFF1F1F1F),
            promptBarBorder = Color(0xFF3A3A3A),
            promptText = Color(0xFFAAAAAA),
            refreshBtnBg = Color(0xE63C3C3C),
            refreshIcon = Color(0xFFAAAAAA),
            statusOverlayBg = Color(0x99000000),
            successText = Color(0xFF5CB85C),
            failText = Color(0xFFFF7875),
            successIconBg = Color(0xE652C41A),
            failIconBg = Color(0xE6FF4D4F),
            popupCard = Color(0xFF1F1F1F),
            popupTitle = Color(0xFFEEEEEE),
            popupClose = Color(0xFFAAAAAA),
            popupSeparator = Color(0xFF3A3A3A),
            popupMask = Color(0xB3000000)
        )

        @Composable
        fun get(): CaptchaColorScheme {
            return if (isSystemInDarkTheme()) Dark else Light
        }
    }
}
