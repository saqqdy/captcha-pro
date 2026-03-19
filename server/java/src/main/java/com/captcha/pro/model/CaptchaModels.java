package com.captcha.pro.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Captcha types
 */
public enum CaptchaType {
    SLIDER,
    CLICK,
    ROTATE
}

/**
 * Point coordinate
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Point {
    private double x;
    private double y;
}

/**
 * Captcha data stored in cache
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CaptchaCache {
    private String id;
    private CaptchaType type;
    private Object target;
    private Double targetAngle;
    private List<String> clickTexts;
    private long createdAt;
    private long expiresAt;
}

/**
 * Captcha generation options
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CaptchaGenerateOptions {
    private CaptchaType type;
    private int width = 280;
    private int height = 155;
    private int sliderWidth = 50;
    private int sliderHeight = 50;
    private int precision = 5;
    private int clickCount = 3;
    private String clickText;
}

/**
 * Captcha response for frontend
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CaptchaResponse {
    private String captchaId;
    private CaptchaType type;
    private String bgImage;
    private String sliderImage;
    private Integer sliderY;
    private Double targetAngle;
    private List<String> clickTexts;
    private List<String> clickCharImages;
    private int width;
    private int height;
    private long expiresAt;
}

/**
 * Captcha generation result
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CaptchaGenerateResult {
    private CaptchaCache cache;
    private CaptchaResponse response;
}

/**
 * Verify request from frontend
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class VerifyRequest {
    private String captchaId;
    private CaptchaType type;
    private Object target;
    private Long timestamp;
    private String signature;
    private String nonce;
}

/**
 * Verify response
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class VerifyResponse {
    private boolean success;
    private String message;
    private VerifyData data;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class VerifyData {
        private long verifiedAt;
    }
}

/**
 * API response wrapper
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
}
