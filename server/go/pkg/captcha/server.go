package captcha

import (
	"math"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/saqqdy/captcha-pro/server/go/internal/crypto"
	"github.com/saqqdy/captcha-pro/server/go/internal/types"
)

// Server represents captcha server
type Server struct {
	config    Config
	cache     *Cache
	generator *Generator
	security  *SecurityManager
}

// New creates a new captcha server
func New(config Config) *Server {
	config.ApplyDefaults()

	return &Server{
		config:    config,
		cache:     NewCache(),
		generator: NewGenerator(),
		security:  NewSecurityManager(config.Security),
	}
}

// RegisterRoutes registers captcha routes to gin engine
func (s *Server) RegisterRoutes(r *gin.Engine) {
	api := r.Group("/api")
	{
		// Captcha endpoints
		api.GET("/captcha", s.handleGenerate)
		api.POST("/captcha/verify", s.handleVerify)
		api.GET("/health", s.handleHealth)
		api.GET("/info", s.handleInfo)

		// Security endpoints
		security := api.Group("/security")
		{
			security.GET("/status/:ip", s.handleSecurityStatus)
			security.GET("/blacklist", s.handleGetBlacklist)
			security.POST("/blacklist", s.handleAddBlacklist)
			security.DELETE("/blacklist/:ip", s.handleRemoveBlacklist)
		}
	}
}

// Middleware returns a security middleware
func (s *Server) Middleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := s.security.GetClientIP(c)

		// Check blacklist
		if blocked, reason := s.security.IsBlacklisted(ip); blocked {
			c.JSON(http.StatusForbidden, ApiResponse{
				Success: false,
				Message: "Access denied: " + reason,
			})
			c.Abort()
			return
		}

		// Check rate limit
		limited, retryAfter, remaining := s.security.IsRateLimited(ip)
		if limited {
			c.Header("Retry-After", string(rune(retryAfter)))
			c.JSON(http.StatusTooManyRequests, ApiResponse{
				Success: false,
				Message: "Too many requests",
			})
			c.Abort()
			return
		}

		c.Header("X-RateLimit-Remaining", string(rune(remaining)))
		c.Next()
	}
}

// handleGenerate handles captcha generation
func (s *Server) handleGenerate(c *gin.Context) {
	// Parse query parameters
	captchaType := types.CaptchaType(c.DefaultQuery("type", "slider"))
	width := parseIntDefault(c.Query("width"), 280)
	height := parseIntDefault(c.Query("height"), 155)
	sliderWidth := parseIntDefault(c.Query("sliderWidth"), 50)
	sliderHeight := parseIntDefault(c.Query("sliderHeight"), 50)
	precision := parseIntDefault(c.Query("precision"), 5)
	// Don't set default clickCount - let generator randomly generate 3-4
	clickCount, _ := strconv.Atoi(c.Query("clickCount"))
	clickText := c.Query("clickText")

	opts := types.CaptchaGenerateOptions{
		Type:         captchaType,
		Width:        width,
		Height:       height,
		SliderWidth:  sliderWidth,
		SliderHeight: sliderHeight,
		Precision:    precision,
		ClickCount:   clickCount,
		ClickText:    clickText,
	}

	result := s.generator.Generate(opts, s.config.ExpireTime)

	// Store in cache
	s.cache.Set(result.Cache.ID, &result.Cache, s.config.ExpireTime)

	c.JSON(http.StatusOK, ApiResponse{
		Success: true,
		Data:    result.Response,
	})
}

// handleVerify handles captcha verification
func (s *Server) handleVerify(c *gin.Context) {
	ip := s.security.GetClientIP(c)

	var req types.VerifyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ApiResponse{
			Success: false,
			Message: "Invalid request",
		})
		return
	}

	// Handle encrypted signature mode
	if req.Signature != "" {
		data, err := crypto.DecryptCaptchaData(req.Signature, s.config.SecretKey)
		if err != nil {
			c.JSON(http.StatusBadRequest, ApiResponse{
				Success: false,
				Message: "Invalid encrypted data",
			})
			return
		}

		// Validate timestamp
		if !crypto.ValidateTimestamp(data.Timestamp, s.config.TimestampTolerance) {
			c.JSON(http.StatusBadRequest, ApiResponse{
				Success: false,
				Message: "Timestamp expired",
			})
			return
		}

		req.Target = data.Target
		req.Type = data.Type
	}

	// Validate required fields
	if req.CaptchaID == "" || req.Type == "" || req.Target == nil {
		c.JSON(http.StatusBadRequest, ApiResponse{
			Success: false,
			Message: "Missing required fields",
		})
		return
	}

	// Get cached captcha
	cached := s.cache.Get(req.CaptchaID)
	if cached == nil {
		s.security.RecordFailedAttempt(ip)
		c.JSON(http.StatusBadRequest, ApiResponse{
			Success: false,
			Message: "Captcha expired or not found",
		})
		return
	}

	// Check expiration
	if time.Now().UnixMilli() > cached.ExpiresAt {
		s.cache.Delete(req.CaptchaID)
		s.security.RecordFailedAttempt(ip)
		c.JSON(http.StatusBadRequest, ApiResponse{
			Success: false,
			Message: "Captcha expired",
		})
		return
	}

	// Validate type match
	if cached.Type != req.Type {
		s.security.RecordFailedAttempt(ip)
		c.JSON(http.StatusBadRequest, ApiResponse{
			Success: false,
			Message: "Captcha type mismatch",
		})
		return
	}

	// Verify based on type
	success := s.verifyCaptcha(cached, req)

	// Delete used captcha
	s.cache.Delete(req.CaptchaID)

	if success {
		s.security.RecordSuccessfulAttempt(ip)
		c.JSON(http.StatusOK, types.VerifyResponse{
			Success: true,
			Message: "Verification successful",
			Data: &types.VerifyData{
				VerifiedAt: time.Now().UnixMilli(),
			},
		})
	} else {
		if blocked, _ := s.security.RecordFailedAttempt(ip); blocked {
			c.JSON(http.StatusTooManyRequests, types.VerifyResponse{
				Success: false,
				Message: "Too many failed attempts. Please try again later.",
			})
			return
		}
		c.JSON(http.StatusOK, types.VerifyResponse{
			Success: false,
			Message: "Verification failed",
		})
	}
}

func (s *Server) verifyCaptcha(cached *types.CaptchaCache, req types.VerifyRequest) bool {
	precision := 5.0

	switch cached.Type {
	case types.CaptchaTypeSlider:
		targetSlice, ok := cached.Target.([]int)
		if !ok {
			return false
		}
		targetX := float64(targetSlice[0])

		reqSlice, ok := req.Target.([]interface{})
		if !ok || len(reqSlice) == 0 {
			return false
		}
		userX := toFloat64(reqSlice[0])

		return math.Abs(targetX-userX) <= precision

	case types.CaptchaTypeClick:
		targetPoints, ok := cached.Target.([]map[string]float64)
		if !ok {
			return false
		}

		reqPoints, ok := req.Target.([]interface{})
		if !ok || len(reqPoints) != len(targetPoints) {
			return false
		}

		clickPrecision := 25.0
		for i, target := range targetPoints {
			user, ok := reqPoints[i].(map[string]interface{})
			if !ok {
				return false
			}
			userX := toFloat64(user["x"])
			userY := toFloat64(user["y"])
			dist := math.Sqrt(math.Pow(userX-target["x"], 2) + math.Pow(userY-target["y"], 2))
			if dist > clickPrecision {
				return false
			}
		}
		return true
	}

	return false
}

// handleHealth handles health check
func (s *Server) handleHealth(c *gin.Context) {
	c.JSON(http.StatusOK, HealthStatus{
		Status:    "ok",
		Timestamp: time.Now().UnixMilli(),
		CacheSize: s.cache.Size(),
	})
}

// handleInfo handles server info
func (s *Server) handleInfo(c *gin.Context) {
	c.JSON(http.StatusOK, ServerInfo{
		Name:           "captcha-pro-server",
		Version:        "1.0.0",
		Description:    "Captcha Pro Go Server (Gin)",
		SupportedTypes: []string{"slider", "click"},
		Features:       []string{"rate-limit", "ip-blacklist", "brute-force-protection"},
		Config: ConfigInfo{
			ExpireTime:         s.config.ExpireTime,
			TimestampTolerance: s.config.TimestampTolerance,
			Security:           s.config.Security,
		},
	})
}

// handleSecurityStatus handles security status request
func (s *Server) handleSecurityStatus(c *gin.Context) {
	ip := c.Param("ip")
	status := s.security.GetStatus(ip)
	c.JSON(http.StatusOK, status)
}

// handleGetBlacklist handles get blacklist request
func (s *Server) handleGetBlacklist(c *gin.Context) {
	records := s.security.GetBlacklist()
	c.JSON(http.StatusOK, ApiResponse{
		Success: true,
		Data:    records,
	})
}

// handleAddBlacklist handles add to blacklist request
func (s *Server) handleAddBlacklist(c *gin.Context) {
	var req BlacklistRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ApiResponse{
			Success: false,
			Message: "Invalid request",
		})
		return
	}

	if req.IP == "" {
		c.JSON(http.StatusBadRequest, ApiResponse{
			Success: false,
			Message: "IP address is required",
		})
		return
	}

	var expiresAt *int64
	if req.Duration != nil {
		exp := time.Now().UnixMilli() + *req.Duration
		expiresAt = &exp
	}

	s.security.AddToBlacklist(req.IP, req.Reason, req.Duration)

	c.JSON(http.StatusOK, ApiResponse{
		Success: true,
		Message: "IP added to blacklist",
		Data: BlacklistRecord{
			IP:        req.IP,
			Reason:    req.Reason,
			BlockedAt: time.Now().UnixMilli(),
			ExpiresAt: expiresAt,
		},
	})
}

// handleRemoveBlacklist handles remove from blacklist request
func (s *Server) handleRemoveBlacklist(c *gin.Context) {
	ip := c.Param("ip")
	removed := s.security.RemoveFromBlacklist(ip)

	c.JSON(http.StatusOK, ApiResponse{
		Success: removed,
		Message: map[bool]string{true: "IP removed from blacklist", false: "IP not found in blacklist"}[removed],
	})
}

// Helper functions
func parseIntDefault(s string, defaultVal int) int {
	if s == "" {
		return defaultVal
	}
	var val int
	for _, c := range s {
		if c >= '0' && c <= '9' {
			val = val*10 + int(c-'0')
		} else {
			return defaultVal
		}
	}
	return val
}

func toFloat64(v interface{}) float64 {
	switch val := v.(type) {
	case float64:
		return val
	case float32:
		return float64(val)
	case int:
		return float64(val)
	case int64:
		return float64(val)
	default:
		return 0
	}
}
