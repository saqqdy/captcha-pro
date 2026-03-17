// Package captcha provides a captcha verification service for Gin framework.
//
// Example usage:
//
//	func main() {
//	    r := gin.Default()
//
//	    // Create captcha server
//	    server := captcha.New(captcha.Config{
//	        SecretKey:  "your-secret-key",
//	        ExpireTime: 60000,
//	    })
//
//	    // Register routes
//	    server.RegisterRoutes(r)
//
//	    r.Run(":8080")
//	}
package captcha

import "time"

// Config represents captcha server configuration
type Config struct {
	// Secret key for AES-GCM encryption (must match frontend)
	SecretKey string

	// Captcha expiration time in milliseconds
	ExpireTime int64

	// Timestamp tolerance for signature validation in milliseconds
	TimestampTolerance int64

	// Security configuration
	Security SecurityConfig
}

// SecurityConfig represents security configuration
type SecurityConfig struct {
	// Enable rate limiting
	EnableRateLimit bool

	// Maximum requests per window
	RateLimitMax int

	// Rate limit window in milliseconds
	RateLimitWindow int64

	// Rate limit block duration in milliseconds
	RateLimitBlockDuration int64

	// Enable IP blacklist
	EnableBlacklist bool

	// Default blacklist duration in milliseconds (0 = permanent)
	BlacklistDuration int64

	// Enable brute-force protection
	EnableBruteForce bool

	// Maximum failed attempts before blocking
	MaxFailedAttempts int

	// Failed attempts window in milliseconds
	FailedAttemptsWindow int64

	// Brute-force block duration in milliseconds
	BruteForceBlockDuration int64
}

// DefaultConfig returns default configuration
func DefaultConfig() Config {
	return Config{
		SecretKey:           "captcha-pro-secret-key",
		ExpireTime:          60000,
		TimestampTolerance:  60000,
		Security: SecurityConfig{
			EnableRateLimit:          true,
			RateLimitMax:             60,
			RateLimitWindow:          60000,
			RateLimitBlockDuration:   300000,
			EnableBlacklist:          true,
			BlacklistDuration:        0,
			EnableBruteForce:         true,
			MaxFailedAttempts:        10,
			FailedAttemptsWindow:     300000,
			BruteForceBlockDuration:  900000,
		},
	}
}

// ApplyDefaults applies default values to empty fields
func (c *Config) ApplyDefaults() {
	defaults := DefaultConfig()

	if c.SecretKey == "" {
		c.SecretKey = defaults.SecretKey
	}
	if c.ExpireTime == 0 {
		c.ExpireTime = defaults.ExpireTime
	}
	if c.TimestampTolerance == 0 {
		c.TimestampTolerance = defaults.TimestampTolerance
	}
	if c.Security.RateLimitMax == 0 {
		c.Security.RateLimitMax = defaults.Security.RateLimitMax
	}
	if c.Security.RateLimitWindow == 0 {
		c.Security.RateLimitWindow = defaults.Security.RateLimitWindow
	}
	if c.Security.RateLimitBlockDuration == 0 {
		c.Security.RateLimitBlockDuration = defaults.Security.RateLimitBlockDuration
	}
	if c.Security.MaxFailedAttempts == 0 {
		c.Security.MaxFailedAttempts = defaults.Security.MaxFailedAttempts
	}
	if c.Security.FailedAttemptsWindow == 0 {
		c.Security.FailedAttemptsWindow = defaults.Security.FailedAttemptsWindow
	}
	if c.Security.BruteForceBlockDuration == 0 {
		c.Security.BruteForceBlockDuration = defaults.Security.BruteForceBlockDuration
	}
}

// SecurityStatus represents IP security status
type SecurityStatus struct {
	IP            string `json:"ip"`
	RateLimited   bool   `json:"rateLimited"`
	Blacklisted   bool   `json:"blacklisted"`
	FailedAttempts int   `json:"failedAttempts"`
}

// BlacklistRecord represents a blacklist entry
type BlacklistRecord struct {
	IP        string `json:"ip"`
	Reason    string `json:"reason"`
	BlockedAt int64  `json:"blockedAt"`
	ExpiresAt *int64 `json:"expiresAt,omitempty"`
}

// BlacklistRequest represents a blacklist add request
type BlacklistRequest struct {
	IP       string `json:"ip" binding:"required"`
	Reason   string `json:"reason"`
	Duration *int64 `json:"duration"` // Duration in milliseconds
}

// ServerInfo represents server information
type ServerInfo struct {
	Name           string   `json:"name"`
	Version        string   `json:"version"`
	Description    string   `json:"description"`
	SupportedTypes []string `json:"supportedTypes"`
	Features       []string `json:"features"`
	Config         ConfigInfo `json:"config"`
}

// ConfigInfo represents config information
type ConfigInfo struct {
	ExpireTime          int64        `json:"expireTime"`
	TimestampTolerance  int64        `json:"timestampTolerance"`
	Security            SecurityConfig `json:"security"`
}

// HealthStatus represents health check status
type HealthStatus struct {
	Status    string `json:"status"`
	Timestamp int64  `json:"timestamp"`
	CacheSize int    `json:"cacheSize"`
}

// cleanupTicker manages periodic cleanup
type cleanupTicker struct {
	ticker *time.Ticker
	done   chan bool
}
