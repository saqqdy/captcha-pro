package com.captcha.pro.autoconfigure;

import com.captcha.pro.config.CaptchaProProperties;
import com.captcha.pro.controller.CaptchaController;
import com.captcha.pro.controller.SecurityController;
import com.captcha.pro.security.SecurityManager;
import com.captcha.pro.service.CaptchaCache;
import com.captcha.pro.service.CaptchaGenerator;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;

/**
 * Auto-configuration for Captcha Pro Spring Boot Starter.
 *
 * <p>This auto-configuration is activated when the application is a web application.
 * It registers the following beans:</p>
 * <ul>
 *   <li>{@link CaptchaProProperties} - Configuration properties</li>
 *   <li>{@link CaptchaCache} - In-memory cache for captcha data</li>
 *   <li>{@link CaptchaGenerator} - Captcha image generator</li>
 *   <li>{@link SecurityManager} - Security manager for rate limiting and blacklist</li>
 *   <li>{@link CaptchaController} - REST controller for captcha operations</li>
 *   <li>{@link SecurityController} - REST controller for security management</li>
 * </ul>
 *
 * <p>Configuration properties are bound to the {@code captcha.pro} prefix:</p>
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
 *       # ... other security options
 * </pre>
 */
@AutoConfiguration
@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
@EnableConfigurationProperties(CaptchaProProperties.class)
public class CaptchaProAutoConfiguration {

    /**
     * Creates the captcha cache bean.
     */
    @Bean
    @ConditionalOnMissingBean
    public CaptchaCache captchaCache() {
        return new CaptchaCache();
    }

    /**
     * Creates the captcha generator bean.
     */
    @Bean
    @ConditionalOnMissingBean
    public CaptchaGenerator captchaGenerator() {
        return new CaptchaGenerator();
    }

    /**
     * Creates the security manager bean.
     */
    @Bean
    @ConditionalOnMissingBean
    public SecurityManager securityManager(CaptchaProProperties properties) {
        return new SecurityManager(properties.getSecurity());
    }

    /**
     * Creates the captcha controller bean.
     */
    @Bean
    @ConditionalOnMissingBean
    public CaptchaController captchaController(
            CaptchaGenerator generator,
            CaptchaCache cache,
            SecurityManager securityManager,
            CaptchaProProperties properties) {
        return new CaptchaController(generator, cache, securityManager, properties);
    }

    /**
     * Creates the security controller bean.
     */
    @Bean
    @ConditionalOnMissingBean
    public SecurityController securityController(SecurityManager securityManager) {
        return new SecurityController(securityManager);
    }
}
