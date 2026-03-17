package com.captcha.pro.config;

import com.captcha.pro.model.SecurityConfig;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Captcha Pro configuration properties
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "captcha.pro")
public class CaptchaProProperties {
    private CaptchaConfig captcha = new CaptchaConfig();
    private SecurityConfig security = new SecurityConfig();

    @Data
    public static class CaptchaConfig {
        private long expireTime = 60000;
        private long timestampTolerance = 60000;
        private String secretKey = "captcha-pro-secret-key";
    }
}
