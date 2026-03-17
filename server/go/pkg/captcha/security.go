package captcha

import (
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// SecurityManager handles rate limiting, IP blacklist, and brute-force protection
type SecurityManager struct {
	config SecurityConfig

	mu                sync.RWMutex
	rateLimitStore    map[string]*rateLimitRecord
	blacklistStore    map[string]*blacklistRecord
	failedAttempts    map[string]*failedAttemptRecord
}

type rateLimitRecord struct {
	count       int
	resetAt     int64
	blocked     bool
	blockedUntil *int64
}

type blacklistRecord struct {
	reason    string
	blockedAt int64
	expiresAt *int64
}

type failedAttemptRecord struct {
	count           int
	firstAttemptAt  int64
	lastAttemptAt   int64
}

// NewSecurityManager creates a new security manager
func NewSecurityManager(config SecurityConfig) *SecurityManager {
	sm := &SecurityManager{
		config:          config,
		rateLimitStore:  make(map[string]*rateLimitRecord),
		blacklistStore:  make(map[string]*blacklistRecord),
		failedAttempts:  make(map[string]*failedAttemptRecord),
	}

	// Start cleanup goroutine
	go sm.cleanupLoop()

	return sm
}

// GetClientIP extracts client IP from request
func (sm *SecurityManager) GetClientIP(c *gin.Context) string {
	forwarded := c.GetHeader("X-Forwarded-For")
	if forwarded != "" {
		// Take first IP in chain
		for i, ch := range forwarded {
			if ch == ',' {
				return forwarded[:i]
			}
		}
		return forwarded
	}

	realIP := c.GetHeader("X-Real-IP")
	if realIP != "" {
		return realIP
	}

	return c.ClientIP()
}

// IsRateLimited checks if IP is rate limited
func (sm *SecurityManager) IsRateLimited(ip string) (limited bool, retryAfter int, remaining int) {
	if !sm.config.EnableRateLimit {
		return false, 0, 0
	}

	sm.mu.Lock()
	defer sm.mu.Unlock()

	now := time.Now().UnixMilli()
	record, exists := sm.rateLimitStore[ip]

	// Check if currently blocked
	if exists && record.blocked && record.blockedUntil != nil && now < *record.blockedUntil {
		retry := int((*record.blockedUntil - now) / 1000)
		return true, retry, 0
	}

	// Create new record or reset expired one
	if !exists || now > record.resetAt {
		sm.rateLimitStore[ip] = &rateLimitRecord{
			count:   1,
			resetAt: now + sm.config.RateLimitWindow,
			blocked: false,
		}
		return false, 0, sm.config.RateLimitMax - 1
	}

	// Increment count
	record.count++

	// Check if limit exceeded
	if record.count > sm.config.RateLimitMax {
		blockedUntil := now + sm.config.RateLimitBlockDuration
		record.blocked = true
		record.blockedUntil = &blockedUntil

		// Auto-add to blacklist
		if sm.config.EnableBlacklist {
			sm.addToBlacklistLocked(ip, "Rate limit exceeded multiple times", nil)
		}

		return true, int(sm.config.RateLimitBlockDuration / 1000), 0
	}

	return false, 0, sm.config.RateLimitMax - record.count
}

// IsBlacklisted checks if IP is blacklisted
func (sm *SecurityManager) IsBlacklisted(ip string) (blocked bool, reason string) {
	if !sm.config.EnableBlacklist {
		return false, ""
	}

	sm.mu.RLock()
	defer sm.mu.RUnlock()

	record, exists := sm.blacklistStore[ip]
	if !exists {
		return false, ""
	}

	// Check if temporary blacklist expired
	if record.expiresAt != nil && time.Now().UnixMilli() > *record.expiresAt {
		return false, ""
	}

	return true, record.reason
}

// AddToBlacklist adds IP to blacklist
func (sm *SecurityManager) AddToBlacklist(ip, reason string, duration *int64) {
	sm.mu.Lock()
	defer sm.mu.Unlock()
	sm.addToBlacklistLocked(ip, reason, duration)
}

func (sm *SecurityManager) addToBlacklistLocked(ip, reason string, duration *int64) {
	var expiresAt *int64
	if duration != nil {
		exp := time.Now().UnixMilli() + *duration
		expiresAt = &exp
	} else if sm.config.BlacklistDuration > 0 {
		exp := time.Now().UnixMilli() + sm.config.BlacklistDuration
		expiresAt = &exp
	}

	sm.blacklistStore[ip] = &blacklistRecord{
		reason:    reason,
		blockedAt: time.Now().UnixMilli(),
		expiresAt: expiresAt,
	}
}

// RemoveFromBlacklist removes IP from blacklist
func (sm *SecurityManager) RemoveFromBlacklist(ip string) bool {
	sm.mu.Lock()
	defer sm.mu.Unlock()

	_, exists := sm.blacklistStore[ip]
	if exists {
		delete(sm.blacklistStore, ip)
		return true
	}
	return false
}

// RecordFailedAttempt records a failed verification attempt
func (sm *SecurityManager) RecordFailedAttempt(ip string) (blocked bool, retryAfter int) {
	if !sm.config.EnableBruteForce {
		return false, 0
	}

	sm.mu.Lock()
	defer sm.mu.Unlock()

	now := time.Now().UnixMilli()
	record, exists := sm.failedAttempts[ip]

	// Create new record or reset expired one
	if !exists || now-record.firstAttemptAt > sm.config.FailedAttemptsWindow {
		sm.failedAttempts[ip] = &failedAttemptRecord{
			count:          1,
			firstAttemptAt: now,
			lastAttemptAt:  now,
		}
		return false, 0
	}

	// Update record
	record.count++
	record.lastAttemptAt = now

	// Check if threshold reached
	if record.count >= sm.config.MaxFailedAttempts {
		// Add to blacklist
		if sm.config.EnableBlacklist {
			duration := sm.config.BruteForceBlockDuration
			sm.addToBlacklistLocked(ip, "Brute-force attack detected", &duration)
		}

		// Clear failed attempts
		delete(sm.failedAttempts, ip)

		return true, int(sm.config.BruteForceBlockDuration / 1000)
	}

	return false, 0
}

// RecordSuccessfulAttempt clears failed attempts for IP
func (sm *SecurityManager) RecordSuccessfulAttempt(ip string) {
	sm.mu.Lock()
	defer sm.mu.Unlock()
	delete(sm.failedAttempts, ip)
}

// GetStatus returns security status for IP
func (sm *SecurityManager) GetStatus(ip string) SecurityStatus {
	limited, _, _ := sm.IsRateLimited(ip)
	blocked, _ := sm.IsBlacklisted(ip)

	sm.mu.RLock()
	attempts := 0
	if record, exists := sm.failedAttempts[ip]; exists {
		attempts = record.count
	}
	sm.mu.RUnlock()

	return SecurityStatus{
		IP:             ip,
		RateLimited:    limited,
		Blacklisted:    blocked,
		FailedAttempts: attempts,
	}
}

// GetBlacklist returns all blacklist entries
func (sm *SecurityManager) GetBlacklist() []BlacklistRecord {
	sm.mu.RLock()
	defer sm.mu.RUnlock()

	records := make([]BlacklistRecord, 0, len(sm.blacklistStore))
	for ip, record := range sm.blacklistStore {
		records = append(records, BlacklistRecord{
			IP:        ip,
			Reason:    record.reason,
			BlockedAt: record.blockedAt,
			ExpiresAt: record.expiresAt,
		})
	}
	return records
}

// Clear clears all security stores
func (sm *SecurityManager) Clear() {
	sm.mu.Lock()
	defer sm.mu.Unlock()
	sm.rateLimitStore = make(map[string]*rateLimitRecord)
	sm.blacklistStore = make(map[string]*blacklistRecord)
	sm.failedAttempts = make(map[string]*failedAttemptRecord)
}

func (sm *SecurityManager) cleanupLoop() {
	ticker := time.NewTicker(5 * time.Minute)
	for range ticker.C {
		sm.cleanup()
	}
}

func (sm *SecurityManager) cleanup() {
	sm.mu.Lock()
	defer sm.mu.Unlock()

	now := time.Now().UnixMilli()

	// Cleanup rate limit records
	for ip, record := range sm.rateLimitStore {
		if now > record.resetAt && (record.blockedUntil == nil || now > *record.blockedUntil) {
			delete(sm.rateLimitStore, ip)
		}
	}

	// Cleanup blacklist
	for ip, record := range sm.blacklistStore {
		if record.expiresAt != nil && now > *record.expiresAt {
			delete(sm.blacklistStore, ip)
		}
	}

	// Cleanup failed attempts
	for ip, record := range sm.failedAttempts {
		if now-record.firstAttemptAt > sm.config.FailedAttemptsWindow {
			delete(sm.failedAttempts, ip)
		}
	}
}
