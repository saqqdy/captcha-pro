package captcha

import (
	"sync"
	"time"

	"github.com/saqqdy/captcha-pro/server/go/internal/types"
)

// Cache represents captcha cache store
type Cache struct {
	mu      sync.RWMutex
	store   map[string]*types.CaptchaCache
	timers  map[string]int64
}

// NewCache creates a new cache instance
func NewCache() *Cache {
	return &Cache{
		store:  make(map[string]*types.CaptchaCache),
		timers: make(map[string]int64),
	}
}

// Get retrieves captcha data by ID
func (c *Cache) Get(id string) *types.CaptchaCache {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.store[id]
}

// Set stores captcha data with TTL
func (c *Cache) Set(id string, data *types.CaptchaCache, ttl int64) {
	c.mu.Lock()
	defer c.mu.Unlock()

	// Remove existing timer if any
	delete(c.timers, id)

	// Store value
	c.store[id] = data

	// Track expiration time
	c.timers[id] = time.Now().UnixMilli() + ttl
}

// Delete removes captcha data
func (c *Cache) Delete(id string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	delete(c.store, id)
	delete(c.timers, id)
}

// Has checks if key exists
func (c *Cache) Has(id string) bool {
	c.mu.RLock()
	defer c.mu.RUnlock()
	_, exists := c.store[id]
	return exists
}

// Size returns cache size
func (c *Cache) Size() int {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return len(c.store)
}

// Clear removes all cache entries
func (c *Cache) Clear() {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.store = make(map[string]*types.CaptchaCache)
	c.timers = make(map[string]int64)
}

// Cleanup removes expired entries
func (c *Cache) Cleanup() {
	c.mu.Lock()
	defer c.mu.Unlock()

	now := time.Now().UnixMilli()
	for id, expiresAt := range c.timers {
		if now > expiresAt {
			delete(c.store, id)
			delete(c.timers, id)
		}
	}
}
