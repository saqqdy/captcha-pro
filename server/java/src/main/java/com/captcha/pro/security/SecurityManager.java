package com.captcha.pro.security;

import com.captcha.pro.model.*;
import lombok.extern.slf4j.Slf4j;

import jakarta.servlet.http.HttpServletRequest;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Security manager for rate limiting, IP blacklist, and brute-force protection
 */
@Slf4j
public class SecurityManager {

    private SecurityConfig config;

    private final Map<String, RateLimitRecord> rateLimitStore = new ConcurrentHashMap<>();
    private final Map<String, BlacklistRecord> blacklistStore = new ConcurrentHashMap<>();
    private final Map<String, FailedAttemptRecord> failedAttemptsStore = new ConcurrentHashMap<>();

    /**
     * Create security manager with configuration
     */
    public SecurityManager(SecurityConfig config) {
        this.config = config != null ? config : new SecurityConfig();

        // Cleanup interval (every 5 minutes)
        Timer timer = new Timer(true);
        timer.scheduleAtFixedRate(new TimerTask() {
            @Override
            public void run() {
                cleanup();
            }
        }, 300000, 300000);
    }

    /**
     * Update security config
     */
    public void updateConfig(SecurityConfig config) {
        this.config = config;
    }

    /**
     * Get security config
     */
    public SecurityConfig getConfig() {
        return config;
    }

    /**
     * Get client IP from request
     */
    public String getClientIP(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isEmpty()) {
            return forwarded.split(",")[0].trim();
        }

        String realIP = request.getHeader("X-Real-IP");
        if (realIP != null && !realIP.isEmpty()) {
            return realIP;
        }

        return request.getRemoteAddr();
    }

    /**
     * Check if IP is rate limited
     */
    public RateLimitResult isRateLimited(String ip) {
        if (!config.isEnableRateLimit()) {
            return new RateLimitResult(false, null, null);
        }

        long now = System.currentTimeMillis();
        RateLimitRecord record = rateLimitStore.get(ip);

        // Check if currently blocked
        if (record != null && record.isBlocked() && record.getBlockedUntil() != null && now < record.getBlockedUntil()) {
            return new RateLimitResult(true, (int) ((record.getBlockedUntil() - now) / 1000), null);
        }

        // Create new record or reset expired one
        if (record == null || now > record.getResetAt()) {
            RateLimitRecord newRecord = RateLimitRecord.builder()
                    .count(1)
                    .resetAt(now + config.getRateLimitWindow())
                    .blocked(false)
                    .build();
            rateLimitStore.put(ip, newRecord);
            return new RateLimitResult(false, null, config.getRateLimitMax() - 1);
        }

        // Increment count
        record.setCount(record.getCount() + 1);

        // Check if limit exceeded
        if (record.getCount() > config.getRateLimitMax()) {
            record.setBlocked(true);
            record.setBlockedUntil(now + config.getRateLimitBlockDuration());

            // Auto-add to blacklist if repeatedly blocked
            if (config.isEnableBlacklist()) {
                addToBlacklist(ip, "Rate limit exceeded multiple times", now + 3600000);
            }

            return new RateLimitResult(true, (int) (config.getRateLimitBlockDuration() / 1000), null);
        }

        return new RateLimitResult(false, null, config.getRateLimitMax() - record.getCount());
    }

    /**
     * Check if IP is blacklisted
     */
    public BlacklistResult isBlacklisted(String ip) {
        if (!config.isEnableBlacklist()) {
            return new BlacklistResult(false, null);
        }

        BlacklistRecord record = blacklistStore.get(ip);
        if (record == null) {
            return new BlacklistResult(false, null);
        }

        // Check if temporary blacklist expired
        if (record.getExpiresAt() != null && System.currentTimeMillis() > record.getExpiresAt()) {
            blacklistStore.remove(ip);
            return new BlacklistResult(false, null);
        }

        return new BlacklistResult(true, record.getReason());
    }

    /**
     * Add IP to blacklist
     */
    public void addToBlacklist(String ip, String reason, Long expiresAt) {
        blacklistStore.put(ip, BlacklistRecord.builder()
                .ip(ip)
                .reason(reason)
                .blockedAt(System.currentTimeMillis())
                .expiresAt(expiresAt != null ? expiresAt : (config.getBlacklistDuration() > 0 ? System.currentTimeMillis() + config.getBlacklistDuration() : null))
                .build());
    }

    /**
     * Remove IP from blacklist
     */
    public boolean removeFromBlacklist(String ip) {
        return blacklistStore.remove(ip) != null;
    }

    /**
     * Record a failed verification attempt
     */
    public BruteForceResult recordFailedAttempt(String ip) {
        if (!config.isEnableBruteForce()) {
            return new BruteForceResult(false, null);
        }

        long now = System.currentTimeMillis();
        FailedAttemptRecord record = failedAttemptsStore.get(ip);

        // Create new record or reset expired one
        if (record == null || now - record.getFirstAttemptAt() > config.getFailedAttemptsWindow()) {
            failedAttemptsStore.put(ip, FailedAttemptRecord.builder()
                    .count(1)
                    .firstAttemptAt(now)
                    .lastAttemptAt(now)
                    .build());
            return new BruteForceResult(false, null);
        }

        // Update record
        record.setCount(record.getCount() + 1);
        record.setLastAttemptAt(now);

        // Check if brute-force threshold reached
        if (record.getCount() >= config.getMaxFailedAttempts()) {
            // Add to blacklist
            if (config.isEnableBlacklist()) {
                addToBlacklist(ip, "Brute-force attack detected", now + config.getBruteForceBlockDuration());
            }

            // Clear failed attempts
            failedAttemptsStore.remove(ip);

            return new BruteForceResult(true, (int) (config.getBruteForceBlockDuration() / 1000));
        }

        return new BruteForceResult(false, null);
    }

    /**
     * Record a successful verification
     */
    public void recordSuccessfulAttempt(String ip) {
        failedAttemptsStore.remove(ip);
    }

    /**
     * Get security status for IP
     */
    public SecurityStatus getStatus(String ip) {
        RateLimitResult rateLimit = isRateLimited(ip);
        BlacklistResult blacklist = isBlacklisted(ip);
        FailedAttemptRecord failedAttempts = failedAttemptsStore.get(ip);

        return SecurityStatus.builder()
                .ip(ip)
                .rateLimited(rateLimit.limited())
                .blacklisted(blacklist.blocked())
                .failedAttempts(failedAttempts != null ? failedAttempts.getCount() : 0)
                .build();
    }

    /**
     * Get blacklist entries
     */
    public List<BlacklistRecord> getBlacklist() {
        return new ArrayList<>(blacklistStore.values());
    }

    /**
     * Clear all stores
     */
    public void clear() {
        rateLimitStore.clear();
        blacklistStore.clear();
        failedAttemptsStore.clear();
    }

    /**
     * Cleanup expired records
     */
    private void cleanup() {
        long now = System.currentTimeMillis();

        // Cleanup rate limit records
        rateLimitStore.entrySet().removeIf(entry ->
                now > entry.getValue().getResetAt() &&
                        (entry.getValue().getBlockUntil() == null || now > entry.getValue().getBlockUntil())
        );

        // Cleanup blacklist
        blacklistStore.entrySet().removeIf(entry ->
                entry.getValue().getExpiresAt() != null && now > entry.getValue().getExpiresAt()
        );

        // Cleanup failed attempts
        failedAttemptsStore.entrySet().removeIf(entry ->
                now - entry.getValue().getFirstAttemptAt() > config.getFailedAttemptsWindow()
        );
    }

    /**
     * Rate limit result
     */
    public record RateLimitResult(boolean limited, Integer retryAfter, Integer remaining) {}

    /**
     * Blacklist result
     */
    public record BlacklistResult(boolean blocked, String reason) {}

    /**
     * Brute force result
     */
    public record BruteForceResult(boolean blocked, Integer retryAfter) {}
}
