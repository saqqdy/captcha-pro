// Package main provides a standalone captcha server
package main

import (
	"log"
	"os"
	"strconv"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/saqqdy/captcha-pro/server/go/pkg/captcha"
)

func main() {
	// Load configuration from environment
	config := captcha.Config{
		SecretKey:          getEnv("SECRET_KEY", "captcha-pro-secret-key"),
		ExpireTime:         getEnvInt64("EXPIRE_TIME", 60000),
		TimestampTolerance: getEnvInt64("TIMESTAMP_TOLERANCE", 60000),
		Security: captcha.SecurityConfig{
			EnableRateLimit:          getEnvBool("ENABLE_RATE_LIMIT", true),
			RateLimitMax:             getEnvInt("RATE_LIMIT_MAX", 60),
			RateLimitWindow:          getEnvInt64("RATE_LIMIT_WINDOW", 60000),
			RateLimitBlockDuration:   getEnvInt64("RATE_LIMIT_BLOCK_DURATION", 300000),
			EnableBlacklist:          getEnvBool("ENABLE_BLACKLIST", true),
			BlacklistDuration:        getEnvInt64("BLACKLIST_DURATION", 0),
			EnableBruteForce:         getEnvBool("ENABLE_BRUTE_FORCE", true),
			MaxFailedAttempts:        getEnvInt("MAX_FAILED_ATTEMPTS", 10),
			FailedAttemptsWindow:     getEnvInt64("FAILED_ATTEMPTS_WINDOW", 300000),
			BruteForceBlockDuration:  getEnvInt64("BRUTE_FORCE_BLOCK_DURATION", 900000),
		},
	}

	// Create captcha server
	server := captcha.New(config)

	// Create gin engine
	r := gin.Default()

	// Enable CORS
	r.Use(cors.Default())

	// Apply security middleware
	r.Use(server.Middleware())

	// Register routes
	server.RegisterRoutes(r)

	// Start server
	host := getEnv("HOST", "localhost")
	port := getEnv("PORT", "8082")

	log.Printf("Captcha Pro Server running at http://%s:%s", host, port)
	log.Println("API endpoints:")
	log.Println("  GET  /api/captcha              - Generate captcha")
	log.Println("  POST /api/captcha/verify       - Verify captcha")
	log.Println("  GET  /api/health               - Health check")
	log.Println("  GET  /api/info                 - Server info")
	log.Println("Security endpoints:")
	log.Println("  GET  /api/security/status/:ip  - Get IP security status")
	log.Println("  GET  /api/security/blacklist   - Get blacklist entries")
	log.Println("  POST /api/security/blacklist   - Add IP to blacklist")
	log.Println("  DELETE /api/security/blacklist/:ip - Remove IP from blacklist")

	if err := r.Run(host + ":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

// Environment variable helpers
func getEnv(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}

func getEnvInt(key string, defaultVal int) int {
	if val := os.Getenv(key); val != "" {
		if i, err := strconv.Atoi(val); err == nil {
			return i
		}
	}
	return defaultVal
}

func getEnvInt64(key string, defaultVal int64) int64 {
	if val := os.Getenv(key); val != "" {
		if i, err := strconv.ParseInt(val, 10, 64); err == nil {
			return i
		}
	}
	return defaultVal
}

func getEnvBool(key string, defaultVal bool) bool {
	if val := os.Getenv(key); val != "" {
		if b, err := strconv.ParseBool(val); err == nil {
			return b
		}
	}
	return defaultVal
}
