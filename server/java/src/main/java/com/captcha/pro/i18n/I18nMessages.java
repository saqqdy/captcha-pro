package com.captcha.pro.i18n;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Component;

import java.util.Locale;

/**
 * Internationalization messages utility.
 * Provides methods to get translated messages.
 */
@Component
public class I18nMessages {

    private static MessageSource messageSource;

    @Autowired
    public void setMessageSource(MessageSource messageSource) {
        I18nMessages.messageSource = messageSource;
    }

    /**
     * Get translated message by key.
     *
     * @param key    The message key (e.g., "captcha.verifySuccess")
     * @param locale The locale to use
     * @return The translated message
     */
    public static String get(String key, Locale locale) {
        try {
            return messageSource.getMessage(key, null, locale);
        } catch (Exception e) {
            return key;
        }
    }

    /**
     * Get translated message by key with arguments.
     *
     * @param key    The message key
     * @param locale The locale to use
     * @param args   The arguments to substitute
     * @return The translated message
     */
    public static String get(String key, Locale locale, Object... args) {
        try {
            return messageSource.getMessage(key, args, locale);
        } catch (Exception e) {
            return key;
        }
    }
}
