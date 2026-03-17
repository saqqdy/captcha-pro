package com.captcha.pro.config;

import com.captcha.pro.model.SecurityConfig;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Captcha Pro configuration properties.
 *
 * <p>Bind to {@code captcha.pro} prefix in application.yml/properties:</p>
 * <pre>
 * captcha:
 *   pro:
 *     captcha:
 *       expire-time: 60000
 *       timestamp-tolerance: 60000
 *       secret-key: your-secret-key
 *     security:
 *       enable-rate-limit: true
 *       rate-limit-max: 60
 * </pre>
 */
@Data
@ConfigurationProperties(prefix = "captcha.pro")
public class CaptchaProProperties {
    private CaptchaConfig captcha = new CaptchaConfig();
    private SecurityConfig security = new SecurityConfig();

    @Data
    public static class CaptchaConfig {
        /**
         * Captcha expiration time in milliseconds.
         */
        private long expireTime = 60000;

        /**
         * Timestamp tolerance for signature validation in milliseconds.
         */
        private long timestampTolerance = 60000;

        /**
         * Secret key for AES-GCM encryption.
         */
        private String secretKey = "captcha-pro-secret-key";
    }
}
