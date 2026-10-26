package com.captcha.pro.core

import android.content.Context
import androidx.core.content.ContextCompat
import com.captcha.pro.R

/**
 * Helper class to get captcha colors based on system theme
 */
object CaptchaColors {
    fun getSliderBarBg(context: Context) = ContextCompat.getColor(context, R.color.captcha_slider_bar_bg)
    fun getSliderHintText(context: Context) = ContextCompat.getColor(context, R.color.captcha_slider_hint_text)
    fun getSliderThumbBg(context: Context) = ContextCompat.getColor(context, R.color.captcha_slider_thumb_bg)
    fun getSliderThumbBorder(context: Context) = ContextCompat.getColor(context, R.color.captcha_slider_thumb_border)
    
    fun getPromptBarBg(context: Context) = ContextCompat.getColor(context, R.color.captcha_prompt_bar_bg)
    fun getPromptBarBorder(context: Context) = ContextCompat.getColor(context, R.color.captcha_prompt_bar_border)
    fun getPromptText(context: Context) = ContextCompat.getColor(context, R.color.captcha_prompt_text)
    
    fun getRefreshBtnBg(context: Context) = ContextCompat.getColor(context, R.color.captcha_refresh_btn_bg)
    fun getRefreshIcon(context: Context) = ContextCompat.getColor(context, R.color.captcha_refresh_icon)
    
    fun getStatusOverlayBg(context: Context) = ContextCompat.getColor(context, R.color.captcha_status_overlay_bg)
    fun getSuccessText(context: Context) = ContextCompat.getColor(context, R.color.captcha_success_text)
    fun getFailText(context: Context) = ContextCompat.getColor(context, R.color.captcha_fail_text)
    fun getSuccessIconBg(context: Context) = ContextCompat.getColor(context, R.color.captcha_success_icon_bg)
    fun getFailIconBg(context: Context) = ContextCompat.getColor(context, R.color.captcha_fail_icon_bg)
    
    fun getPopupCard(context: Context) = ContextCompat.getColor(context, R.color.captcha_popup_card)
    fun getPopupTitle(context: Context) = ContextCompat.getColor(context, R.color.captcha_popup_title)
    fun getPopupClose(context: Context) = ContextCompat.getColor(context, R.color.captcha_popup_close)
    fun getPopupSeparator(context: Context) = ContextCompat.getColor(context, R.color.captcha_popup_separator)
    fun getPopupMask(context: Context) = ContextCompat.getColor(context, R.color.captcha_popup_mask)
}
