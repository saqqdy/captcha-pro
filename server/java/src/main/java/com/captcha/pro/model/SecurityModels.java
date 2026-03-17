package com.captcha.pro.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Security configuration properties
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SecurityConfig {
    private boolean enableRateLimit = true;
    private int rateLimitMax = 60;
    private long rateLimitWindow = 60000;
    private long rateLimitBlockDuration = 300000;

    private boolean enableBlacklist = true;
    private long blacklistDuration = 0;

    private boolean enableBruteForce = true;
    private int maxFailedAttempts = 10;
    private long failedAttemptsWindow = 300000;
    private long bruteForceBlockDuration = 900000;
}

/**
 * Rate limit record
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RateLimitRecord {
    private int count;
    private long resetAt;
    private boolean blocked;
    private Long blockedUntil;
}

/**
 * Blacklist record
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BlacklistRecord {
    private String ip;
    private String reason;
    private long blockedAt;
    private Long expiresAt;
}

/**
 * Failed attempt record
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FailedAttemptRecord {
    private int count;
    private long firstAttemptAt;
    private long lastAttemptAt;
}

/**
 * Security status response
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SecurityStatus {
    private String ip;
    private boolean rateLimited;
    private boolean blacklisted;
    private int failedAttempts;
}

/**
 * Blacklist request
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class BlacklistRequest {
    private String ip;
    private String reason;
    private Long duration;
}

/**
 * Server info response
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ServerInfoResponse {
    private String name;
    private String version;
    private String description;
    private List<String> supportedTypes;
    private List<String> features;
    private ConfigInfo config;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ConfigInfo {
        private long expireTime;
        private long timestampTolerance;
        private SecurityConfig security;
    }
}
