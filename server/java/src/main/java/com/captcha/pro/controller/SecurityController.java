package com.captcha.pro.controller;

import com.captcha.pro.model.*;
import com.captcha.pro.security.SecurityManager;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Security API Controller
 */
@RestController
@RequestMapping("/api/security")
public class SecurityController {

    private final SecurityManager securityManager;

    /**
     * Create security controller with security manager
     */
    public SecurityController(SecurityManager securityManager) {
        this.securityManager = securityManager;
    }

    /**
     * Get security status for an IP
     */
    @GetMapping("/status/{ip}")
    public SecurityStatus getStatus(@PathVariable String ip) {
        return securityManager.getStatus(ip);
    }

    /**
     * Get blacklist entries
     */
    @GetMapping("/blacklist")
    public ApiResponse<List<BlacklistRecord>> getBlacklist() {
        return ApiResponse.<List<BlacklistRecord>>builder()
                .success(true)
                .data(securityManager.getBlacklist())
                .build();
    }

    /**
     * Add IP to blacklist
     */
    @PostMapping("/blacklist")
    public ApiResponse<BlacklistRecord> addToBlacklist(@RequestBody BlacklistRequest request) {
        if (request.getIp() == null || request.getIp().isEmpty()) {
            return ApiResponse.<BlacklistRecord>builder()
                    .success(false)
                    .message("IP address is required")
                    .build();
        }

        Long expiresAt = request.getDuration() != null ? System.currentTimeMillis() + request.getDuration() : null;
        securityManager.addToBlacklist(request.getIp(), request.getReason() != null ? request.getReason() : "Manual block", expiresAt);

        return ApiResponse.<BlacklistRecord>builder()
                .success(true)
                .message("IP added to blacklist")
                .data(BlacklistRecord.builder()
                        .ip(request.getIp())
                        .reason(request.getReason())
                        .blockedAt(System.currentTimeMillis())
                        .expiresAt(expiresAt)
                        .build())
                .build();
    }

    /**
     * Remove IP from blacklist
     */
    @DeleteMapping("/blacklist/{ip}")
    public ApiResponse<Void> removeFromBlacklist(@PathVariable String ip) {
        boolean removed = securityManager.removeFromBlacklist(ip);
        return ApiResponse.<Void>builder()
                .success(removed)
                .message(removed ? "IP removed from blacklist" : "IP not found in blacklist")
                .build();
    }
}
