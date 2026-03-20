package middleware

import (
	"github.com/gin-gonic/gin"
	"server/i18n"
)

// LocaleKey is the context key for storing locale
const LocaleKey = "locale"

// I18nMiddleware is a Gin middleware for i18n support.
// It parses the Accept-Language header and stores the locale in context.
func I18nMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		acceptLanguage := c.GetHeader("Accept-Language")
		locale := i18n.ParseLocale(acceptLanguage)
		c.Set(LocaleKey, locale)
		c.Next()
	}
}

// GetLocale returns the locale from context.
func GetLocale(c *gin.Context) i18n.Locale {
	if locale, exists := c.Get(LocaleKey); exists {
		return locale.(i18n.Locale)
	}
	return i18n.LocaleZhCN
}

// T returns the translated message for the given key using context locale.
func T(c *gin.Context, key string) string {
	locale := GetLocale(c)
	return i18n.T(key, locale)
}
