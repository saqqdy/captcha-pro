package com.captcha.pro.controller;

import com.captcha.pro.config.CaptchaProProperties;
import com.captcha.pro.crypto.AesCrypto;
import com.captcha.pro.crypto.CaptchaData;
import com.captcha.pro.model.*;
import com.captcha.pro.security.SecurityManager;
import com.captcha.pro.service.CaptchaCache;
import com.captcha.pro.service.CaptchaGenerator;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Captcha API Controller
 */
@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CaptchaController {

    private final CaptchaGenerator generator;
    private final CaptchaCache cache;
    private final SecurityManager securityManager;
    private final CaptchaProProperties properties;

    /**
     * Generate captcha
     * GET /api/captcha?type=slider&width=280&height=155
     */
    @GetMapping("/captcha")
    public ResponseEntity<ApiResponse<CaptchaResponse>> generateCaptcha(
            @RequestParam(defaultValue = "SLIDER") CaptchaType type,
            @RequestParam(defaultValue = "280") int width,
            @RequestParam(defaultValue = "155") int height,
            @RequestParam(defaultValue = "50") int sliderWidth,
            @RequestParam(defaultValue = "50") int sliderHeight,
            @RequestParam(defaultValue = "5") int precision,
            @RequestParam(defaultValue = "3") int clickCount,
            @RequestParam(required = false) String clickText,
            HttpServletRequest request) {

        String ip = securityManager.getClientIP(request);

        // Check blacklist
        SecurityManager.BlacklistResult blacklistResult = securityManager.isBlacklisted(ip);
        if (blacklistResult.blocked()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.<CaptchaResponse>builder()
                            .success(false)
                            .message("Access denied: " + blacklistResult.reason())
                            .build());
        }

        // Check rate limit
        SecurityManager.RateLimitResult rateLimitResult = securityManager.isRateLimited(ip);
        if (rateLimitResult.limited()) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .header("Retry-After", String.valueOf(rateLimitResult.retryAfter()))
                    .body(ApiResponse.<CaptchaResponse>builder()
                            .success(false)
                            .message("Too many requests")
                            .build());
        }

        try {
            CaptchaGenerateOptions options = CaptchaGenerateOptions.builder()
                    .type(type)
                    .width(width)
                    .height(height)
                    .sliderWidth(sliderWidth)
                    .sliderHeight(sliderHeight)
                    .precision(precision)
                    .clickCount(clickCount)
                    .clickText(clickText)
                    .build();

            CaptchaGenerateResult result = generator.generate(options);

            // Store in cache
            cache.set(result.getCache().getId(), result.getCache(), properties.getCaptcha().getExpireTime());

            return ResponseEntity.ok()
                    .header("X-RateLimit-Remaining", String.valueOf(rateLimitResult.remaining()))
                    .body(ApiResponse.<CaptchaResponse>builder()
                            .success(true)
                            .data(result.getResponse())
                            .build());
        } catch (Exception e) {
            log.error("Failed to generate captcha", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<CaptchaResponse>builder()
                            .success(false)
                            .message("Failed to generate captcha")
                            .build());
        }
    }

    /**
     * Verify captcha
     * POST /api/captcha/verify
     *
     * Supports two modes:
     * 1. Plain mode: captchaId + type + target
     * 2. Encrypted mode: signature (AES-GCM encrypted data)
     */
    @PostMapping("/captcha/verify")
    public ResponseEntity<VerifyResponse> verifyCaptcha(@RequestBody VerifyRequest request, HttpServletRequest httpRequest) {
        String ip = securityManager.getClientIP(httpRequest);

        // Handle encrypted signature mode
        if (request.getSignature() != null && !request.getSignature().isEmpty()) {
            try {
                String decrypted = AesCrypto.decrypt(request.getSignature(), properties.getCaptcha().getSecretKey());
                ObjectMapper mapper = new ObjectMapper();
                CaptchaData captchaData = mapper.readValue(decrypted, CaptchaData.class);

                // Validate timestamp
                if (!AesCrypto.validateTimestamp(captchaData.getTimestamp(), properties.getCaptcha().getTimestampTolerance())) {
                    return ResponseEntity.badRequest()
                            .body(VerifyResponse.builder()
                                    .success(false)
                                    .message("Timestamp expired")
                                    .build());
                }

                // Use decrypted data for verification
                request.setTarget(captchaData.getTarget());
                request.setType(CaptchaType.valueOf(captchaData.getType().toUpperCase()));
            } catch (Exception e) {
                log.error("Decryption failed", e);
                return ResponseEntity.badRequest()
                        .body(VerifyResponse.builder()
                                .success(false)
                                .message("Invalid encrypted data")
                                .build());
            }
        }

        // Validate required fields
        if (request.getCaptchaId() == null || request.getType() == null || request.getTarget() == null) {
            return ResponseEntity.badRequest()
                    .body(VerifyResponse.builder()
                            .success(false)
                            .message("Missing required fields")
                            .build());
        }

        // Get cached captcha data
        CaptchaCache cached = cache.get(request.getCaptchaId());
        if (cached == null) {
            securityManager.recordFailedAttempt(ip);
            return ResponseEntity.badRequest()
                    .body(VerifyResponse.builder()
                            .success(false)
                            .message("Captcha expired or not found")
                            .build());
        }

        // Check if expired
        if (System.currentTimeMillis() > cached.getExpiresAt()) {
            cache.delete(request.getCaptchaId());
            securityManager.recordFailedAttempt(ip);
            return ResponseEntity.badRequest()
                    .body(VerifyResponse.builder()
                            .success(false)
                            .message("Captcha expired")
                            .build());
        }

        // Validate type match
        if (cached.getType() != request.getType()) {
            securityManager.recordFailedAttempt(ip);
            return ResponseEntity.badRequest()
                    .body(VerifyResponse.builder()
                            .success(false)
                            .message("Captcha type mismatch")
                            .build());
        }

        // Verify based on type
        boolean success = false;
        int precision = 5;

        switch (request.getType()) {
            case SLIDER -> {
                List<?> targetList = (List<?>) cached.getTarget();
                List<?> requestList = (List<?>) request.getTarget();
                double targetX = ((Number) targetList.get(0)).doubleValue();
                double userX = ((Number) requestList.get(0)).doubleValue();
                success = Math.abs(targetX - userX) <= precision;
            }
            case CLICK -> {
                List<Point> targetPoints = (List<Point>) cached.getTarget();
                List<?> requestPoints = (List<?>) request.getTarget();
                int clickPrecision = 25;

                if (requestPoints.size() != targetPoints.size()) {
                    success = false;
                } else {
                    success = true;
                    for (int i = 0; i < targetPoints.size(); i++) {
                        Point target = targetPoints.get(i);
                        Map<?, ?> user = (Map<?, ?>) requestPoints.get(i);
                        double userX = ((Number) user.get("x")).doubleValue();
                        double userY = ((Number) user.get("y")).doubleValue();
                        double distance = Math.sqrt(Math.pow(userX - target.getX(), 2) + Math.pow(userY - target.getY(), 2));
                        if (distance > clickPrecision) {
                            success = false;
                            break;
                        }
                    }
                }
            }
            case ROTATE -> {
                double targetAngle = cached.getTargetAngle() != null ? cached.getTargetAngle() : ((Number) ((List<?>) cached.getTarget()).get(0)).doubleValue();
                List<?> requestList = (List<?>) request.getTarget();
                double userAngle = ((Number) requestList.get(0)).doubleValue();
                double diff = Math.abs(userAngle - targetAngle);
                if (diff > 180) diff = 360 - diff;
                success = diff <= precision;
            }
        }

        // Delete used captcha
        cache.delete(request.getCaptchaId());

        if (success) {
            securityManager.recordSuccessfulAttempt(ip);
        } else {
            SecurityManager.BruteForceResult bruteForceResult = securityManager.recordFailedAttempt(ip);
            if (bruteForceResult.blocked()) {
                return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                        .body(VerifyResponse.builder()
                                .success(false)
                                .message("Too many failed attempts. Please try again later.")
                                .build());
            }
        }

        return ResponseEntity.ok(VerifyResponse.builder()
                .success(success)
                .message(success ? "Verification successful" : "Verification failed")
                .data(success ? new VerifyResponse.VerifyData(System.currentTimeMillis()) : null)
                .build());
    }

    /**
     * Health check
     */
    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of(
                "status", "ok",
                "timestamp", System.currentTimeMillis(),
                "cacheSize", cache.size()
        );
    }

    /**
     * Server info
     */
    @GetMapping("/info")
    public ServerInfoResponse info() {
        return ServerInfoResponse.builder()
                .name("captcha-pro-spring-boot-starter")
                .version("1.0.0")
                .description("Captcha Pro Spring Boot Starter - Backend verification service")
                .supportedTypes(List.of("slider", "click", "rotate"))
                .features(List.of("rate-limit", "ip-blacklist", "brute-force-protection"))
                .config(new ServerInfoResponse.ConfigInfo(
                        properties.getCaptcha().getExpireTime(),
                        properties.getCaptcha().getTimestampTolerance(),
                        securityManager.getConfig()
                ))
                .build();
    }
}
