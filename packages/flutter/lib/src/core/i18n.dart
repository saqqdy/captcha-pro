/// Captcha Pro i18n.
///
/// 15-key locale map copied verbatim from @captcha-pro/mp-shared `i18n.ts`.
/// Keys are identical across platforms (android/ios/flutter/mp-shared).

/// Default locale code.
const String defaultLocale = 'zh-CN';

/// Supported locales: 'zh-CN' | 'en-US'.
const Map<String, Map<String, String>> localeMessages = {
  'zh-CN': {
    'loading': '加载中...',
    'slider_slide': '请拖动滑块完成验证',
    'slider_hint': '→ 按住滑块，拖动完成验证',
    'slider_success': '验证成功',
    'slider_fail': '验证失败',
    'click_prompt': '请依次点击：',
    'click_success': '验证成功',
    'click_fail': '验证失败',
    'popup_title': '请完成安全验证',
    'popup_close': '关闭',
    'refresh': '刷新',
    'error_network': '网络错误',
    'error_expired': '验证码已过期',
    'error_invalid': '验证失败',
    'error_not_found': '验证码不存在',
  },
  'en-US': {
    'loading': 'Loading...',
    'slider_slide': 'Please slide to verify',
    'slider_hint': '→ Hold and drag the slider to verify',
    'slider_success': 'Verification successful',
    'slider_fail': 'Verification failed',
    'click_prompt': 'Please click in order: ',
    'click_success': 'Verification successful',
    'click_fail': 'Verification failed',
    'popup_title': 'Please complete security verification',
    'popup_close': 'Close',
    'refresh': 'Refresh',
    'error_network': 'Network error',
    'error_expired': 'Captcha expired',
    'error_invalid': 'Verification failed',
    'error_not_found': 'Captcha not found',
  },
};

/// Look up a localized message by [locale] and [key].
///
/// Falls back to [defaultLocale], then to the key itself.
String getLocaleMessage(String locale, String key) {
  return localeMessages[locale]?[key] ??
      localeMessages[defaultLocale]?[key] ??
      key;
}
