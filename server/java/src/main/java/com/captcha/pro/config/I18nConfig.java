package com.captcha.pro.config;

import com.captcha.pro.i18n.CaptchaLocaleResolver;
import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.ResourceBundleMessageSource;
import org.springframework.web.servlet.LocaleResolver;

import java.nio.charset.StandardCharsets;
import java.util.Locale;

/**
 * Internationalization configuration.
 */
@Configuration
public class I18nConfig {

    /**
     * Locale resolver bean.
     */
    @Bean
    public LocaleResolver localeResolver() {
        return new CaptchaLocaleResolver();
    }

    /**
     * Message source bean for i18n.
     */
    @Bean
    public MessageSource messageSource() {
        ResourceBundleMessageSource messageSource = new ResourceBundleMessageSource();
        messageSource.setBasename("i18n/messages");
        messageSource.setDefaultEncoding(StandardCharsets.UTF_8.name());
        messageSource.setDefaultLocale(Locale.SIMPLIFIED_CHINESE);
        return messageSource;
    }
}
