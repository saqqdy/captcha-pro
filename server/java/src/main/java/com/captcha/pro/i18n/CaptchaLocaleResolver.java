package com.captcha.pro.i18n;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.i18n.AcceptHeaderLocaleResolver;

import java.util.Locale;

/**
 * Locale resolver for captcha-pro.
 * Resolves locale from Accept-Language header.
 */
@Component
public class CaptchaLocaleResolver extends AcceptHeaderLocaleResolver {

    @Override
    public Locale resolveLocale(HttpServletRequest request) {
        String acceptLanguage = request.getHeader("Accept-Language");

        if (acceptLanguage == null || acceptLanguage.isEmpty()) {
            return Locale.SIMPLIFIED_CHINESE;
        }

        // Parse Accept-Language: zh-CN, en-US;q=0.9
        String lang = acceptLanguage.split(",")[0].trim();
        if (lang.startsWith("zh")) {
            return Locale.SIMPLIFIED_CHINESE;
        }
        return Locale.US;
    }
}
