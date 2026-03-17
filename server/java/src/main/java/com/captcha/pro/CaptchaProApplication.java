package com.captcha.pro;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Captcha Pro Spring Boot Demo Application.
 *
 * <p>This is a demo application showcasing the Captcha Pro Starter.
 * You can run this application to test the captcha APIs locally.</p>
 *
 * <p>To use the starter in your own application, simply add the dependency:</p>
 * <pre>
 * &lt;dependency&gt;
 *     &lt;groupId&gt;com.captcha&lt;/groupId&gt;
 *     &lt;artifactId&gt;captcha-pro-spring-boot-starter&lt;/artifactId&gt;
 *     &lt;version&gt;1.0.0&lt;/version&gt;
 * &lt;/dependency&gt;
 * </pre>
 *
 * <p>And configure in application.yml:</p>
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
@SpringBootApplication
public class CaptchaProApplication {

    public static void main(String[] args) {
        SpringApplication.run(CaptchaProApplication.class, args);
    }
}
