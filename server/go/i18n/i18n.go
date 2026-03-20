// Package i18n provides internationalization support for captcha-pro.
// Currently supports zh-CN (Chinese Simplified) and en-US (English).
package i18n

import "strings"

// Locale type for supported languages
type Locale string

const (
	// LocaleZhCN is Chinese Simplified
	LocaleZhCN Locale = "zh-CN"
	// LocaleEnUS is English
	LocaleEnUS Locale = "en-US"
)

// messages contains all locale messages
var messages = map[Locale]map[string]string{
	LocaleZhCN: zhCN,
	LocaleEnUS: enUS,
}

// ParseLocale parses Accept-Language header and returns the locale.
// Defaults to zh-CN if not specified or invalid.
func ParseLocale(acceptLanguage string) Locale {
	if acceptLanguage == "" {
		return LocaleZhCN
	}

	// Parse Accept-Language: zh-CN, en-US;q=0.9
	lang := strings.Split(acceptLanguage, ",")[0]
	lang = strings.TrimSpace(strings.Split(lang, "-")[0])

	if lang == "zh" {
		return LocaleZhCN
	}
	return LocaleEnUS
}

// T returns the translated message for the given key and locale.
// Falls back to zh-CN if locale not found.
func T(key string, locale Locale) string {
	if msgs, ok := messages[locale]; ok {
		if msg, ok := msgs[key]; ok {
			return msg
		}
	}
	// Fallback to zh-CN
	if msgs, ok := messages[LocaleZhCN]; ok {
		if msg, ok := msgs[key]; ok {
			return msg
		}
	}
	return key
}

// GetMessages returns all messages for the given locale.
func GetMessages(locale Locale) map[string]string {
	if msgs, ok := messages[locale]; ok {
		return msgs
	}
	return messages[LocaleZhCN]
}
