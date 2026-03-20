# Captcha Pro 多语言支持方案

## 一、需要国际化的文本

| 模块 | Key | 中文 (zh-CN) | 英文 (en-US) |
|------|-----|--------------|--------------|
| common | success | 操作成功 | Success |
| common | fail | 操作失败 | Failed |
| captcha | verifySuccess | 验证成功 | Verification passed |
| captcha | verifyFailed | 验证失败 | Verification failed |
| captcha | expired | 验证码已过期 | Captcha expired |
| captcha | notFound | 验证码不存在 | Captcha not found |
| captcha | invalid | 验证码无效 | Invalid captcha |
| captcha | typeInvalid | 验证码类型无效 | Invalid captcha type |
| error | network | 网络错误 | Network error |
| error | paramMissing | 参数缺失 | Missing parameter |
| error | paramInvalid | 参数无效 | Invalid parameter |
| error | ipBlocked | IP 已被封禁 | IP has been blocked |
| error | rateLimited | 请求过于频繁 | Too many requests |
| slider | slideToVerify | 向右滑动完成验证 | Slide to verify |
| click | clickInOrder | 请依次点击 | Click in order |
| popup | title | 安全验证 | Security Verification |
| popup | close | 关闭 | Close |

---

## 二、前端实现

### 2.1 目录结构

```
src/
├── locales/
│   ├── index.ts          # i18n 核心模块
│   ├── zh-CN.ts          # 简体中文
│   └── en-US.ts          # 英文
├── slider.ts
├── click.ts
├── popup.ts
└── ...
```

### 2.2 语言包定义

```typescript
// src/locales/zh-CN.ts
export default {
  slider: {
    success: '验证成功',
    fail: '验证失败',
    slide: '向右滑动完成验证',
  },
  click: {
    prompt: '请依次点击',
    success: '验证成功',
    fail: '验证失败',
  },
  popup: {
    title: '安全验证',
    close: '关闭',
  },
  errors: {
    network: '网络错误',
    expired: '验证码已过期',
    invalid: '验证码无效',
  },
}
```

```typescript
// src/locales/en-US.ts
export default {
  slider: {
    success: 'Verification passed',
    fail: 'Verification failed',
    slide: 'Slide to verify',
  },
  click: {
    prompt: 'Click in order',
    success: 'Verification passed',
    fail: 'Verification failed',
  },
  popup: {
    title: 'Security Verification',
    close: 'Close',
  },
  errors: {
    network: 'Network error',
    expired: 'Captcha expired',
    invalid: 'Invalid captcha',
  },
}
```

### 2.3 i18n 核心模块

```typescript
// src/locales/index.ts
import zhCN from './zh-CN'
import enUS from './en-US'

export type Locale = 'zh-CN' | 'en-US'

export interface LocaleMessages {
  slider: { success: string; fail: string; slide: string }
  click: { prompt: string; success: string; fail: string }
  popup: { title: string; close: string }
  errors: { network: string; expired: string; invalid: string }
}

const messages: Record<Locale, LocaleMessages> = {
  'zh-CN': zhCN,
  'en-US': enUS,
}

let currentLocale: Locale = 'zh-CN'

export function setLocale(locale: Locale): void {
  currentLocale = locale
}

export function getLocale(): Locale {
  return currentLocale
}

export function t(key: string, locale?: Locale): string {
  const targetLocale = locale || currentLocale
  const keys = key.split('.')
  let result: unknown = messages[targetLocale]
  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = (result as Record<string, unknown>)[k]
    } else {
      return key
    }
  }
  return typeof result === 'string' ? result : key
}

export function detectBrowserLocale(): Locale {
  if (typeof navigator === 'undefined') return 'zh-CN'
  const lang = navigator.language || (navigator as any).userLanguage
  return lang?.startsWith('zh') ? 'zh-CN' : 'en-US'
}

if (typeof window !== 'undefined') {
  currentLocale = detectBrowserLocale()
}

export const i18n = { setLocale, getLocale, t, detectBrowserLocale }
export default i18n
```

### 2.4 前端使用方式

```javascript
import { SliderCaptcha, setLocale } from 'captcha-pro'

// 设置为英文
setLocale('en-US')

// 或组件级别设置
const captcha = new SliderCaptcha({
  el: '#captcha',
  locale: 'en-US',
})
```

---

## 三、后端实现

### 3.1 获取语言的方式

后端通过 HTTP Header `Accept-Language` 获取客户端语言偏好：

```http
Accept-Language: zh-CN
Accept-Language: en-US
```

前端请求时自动携带：

```javascript
const captcha = new SliderCaptcha({
  el: '#captcha',
  verifyMode: 'backend',
  backendVerify: {
    getCaptcha: '/api/captcha',
    verify: '/api/verify',
    headers: {
      'Accept-Language': navigator.language || 'zh-CN',
    },
  },
})
```

---

### 3.2 Node.js 后端

#### 目录结构

```
server/node/
├── src/
│   ├── locales/
│   │   ├── index.ts        # i18n 核心模块
│   │   ├── zh-CN.ts        # 中文
│   │   └── en-US.ts        # 英文
│   ├── index.ts
│   └── ...
```

#### 语言包定义

```typescript
// server/node/src/locales/zh-CN.ts
export default {
  common: {
    success: '操作成功',
    fail: '操作失败',
  },
  captcha: {
    verifySuccess: '验证成功',
    verifyFailed: '验证失败',
    expired: '验证码已过期',
    notFound: '验证码不存在',
    invalid: '验证码无效',
    typeInvalid: '验证码类型无效',
  },
  error: {
    paramMissing: '参数缺失',
    paramInvalid: '参数无效',
    ipBlocked: 'IP 已被封禁',
    rateLimited: '请求过于频繁',
  },
}
```

```typescript
// server/node/src/locales/en-US.ts
export default {
  common: {
    success: 'Success',
    fail: 'Failed',
  },
  captcha: {
    verifySuccess: 'Verification passed',
    verifyFailed: 'Verification failed',
    expired: 'Captcha expired',
    notFound: 'Captcha not found',
    invalid: 'Invalid captcha',
    typeInvalid: 'Invalid captcha type',
  },
  error: {
    paramMissing: 'Missing parameter',
    paramInvalid: 'Invalid parameter',
    ipBlocked: 'IP has been blocked',
    rateLimited: 'Too many requests',
  },
}
```

#### i18n 核心模块

```typescript
// server/node/src/locales/index.ts
import zhCN from './zh-CN'
import enUS from './en-US'

export type Locale = 'zh-CN' | 'en-US'

const messages: Record<Locale, Record<string, any>> = {
  'zh-CN': zhCN,
  'en-US': enUS,
}

/**
 * 从请求头解析语言
 */
export function parseLocale(acceptLanguage?: string): Locale {
  if (!acceptLanguage) return 'zh-CN'
  const lang = acceptLanguage.split(',')[0].trim().split('-')[0]
  return lang === 'zh' ? 'zh-CN' : 'en-US'
}

/**
 * 获取翻译文本
 */
export function t(key: string, locale: Locale = 'zh-CN'): string {
  const keys = key.split('.')
  let result: any = messages[locale]
  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = result[k]
    } else {
      return key
    }
  }
  return typeof result === 'string' ? result : key
}

/**
 * 获取完整语言包
 */
export function getMessages(locale: Locale = 'zh-CN') {
  return messages[locale]
}

export { messages }
```

#### Express 中间件

```typescript
// server/node/src/middleware/i18n.ts
import { Request, Response, NextFunction } from 'express'
import { parseLocale, t, Locale } from '../locales'

declare global {
  namespace Express {
    interface Request {
      locale: Locale
      t: (key: string) => string
    }
  }
}

export function i18nMiddleware(req: Request, res: Response, next: NextFunction) {
  req.locale = parseLocale(req.headers['accept-language'])
  req.t = (key: string) => t(key, req.locale)
  next()
}
```

#### Controller 使用

```typescript
// server/node/src/index.ts
import express from 'express'
import { i18nMiddleware } from './middleware/i18n'
import { t } from './locales'

const app = express()
app.use(i18nMiddleware)

// 生成验证码
app.get('/api/captcha', (req, res) => {
  const locale = req.locale

  try {
    const captcha = generateCaptcha()

    res.json({
      success: true,
      data: captcha,
      message: t('captcha.verifySuccess', locale),
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: t('error.network', locale),
    })
  }
})

// 验证验证码
app.post('/api/captcha/verify', (req, res) => {
  const { captchaId, type, target } = req.body
  const locale = req.locale

  if (!captchaId) {
    return res.status(400).json({
      success: false,
      message: t('error.paramMissing', locale),
    })
  }

  const captcha = cache.get(captchaId)
  if (!captcha) {
    return res.status(404).json({
      success: false,
      message: t('captcha.notFound', locale),
    })
  }

  if (Date.now() > captcha.expiresAt) {
    return res.status(410).json({
      success: false,
      message: t('captcha.expired', locale),
    })
  }

  // 验证逻辑...
  const verified = verifyCaptcha(captcha, target)

  if (verified) {
    res.json({
      success: true,
      message: t('captcha.verifySuccess', locale),
    })
  } else {
    res.status(400).json({
      success: false,
      message: t('captcha.verifyFailed', locale),
    })
  }
})
```

---

### 3.3 Java 后端 (Spring Boot)

#### 目录结构

```
server/java/
├── src/main/java/com/captcha/pro/
│   ├── i18n/
│   │   ├── I18nMessages.java      # i18n 工具类
│   │   └── LocaleResolver.java    # 语言解析器
│   ├── controller/
│   ├── service/
│   └── ...
├── src/main/resources/
│   └── i18n/
│       ├── messages_zh_CN.properties
│       └── messages_en_US.properties
```

#### 语言包定义

```properties
# src/main/resources/i18n/messages_zh_CN.properties
common.success=操作成功
common.fail=操作失败
captcha.verifySuccess=验证成功
captcha.verifyFailed=验证失败
captcha.expired=验证码已过期
captcha.notFound=验证码不存在
captcha.invalid=验证码无效
captcha.typeInvalid=验证码类型无效
error.paramMissing=参数缺失
error.paramInvalid=参数无效
error.ipBlocked=IP 已被封禁
error.rateLimited=请求过于频繁
```

```properties
# src/main/resources/i18n/messages_en_US.properties
common.success=Success
common.fail=Failed
captcha.verifySuccess=Verification passed
captcha.verifyFailed=Verification failed
captcha.expired=Captcha expired
captcha.notFound=Captcha not found
captcha.invalid=Invalid captcha
captcha.typeInvalid=Invalid captcha type
error.paramMissing=Missing parameter
error.paramInvalid=Invalid parameter
error.ipBlocked=IP has been blocked
error.rateLimited=Too many requests
```

#### 语言解析器

```java
// src/main/java/com/captcha/pro/i18n/LocaleResolver.java
package com.captcha.pro.i18n;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.i18n.AcceptHeaderLocaleResolver;

import java.util.Locale;

@Component
public class CaptchaLocaleResolver extends AcceptHeaderLocaleResolver {

    @Override
    public Locale resolveLocale(HttpServletRequest request) {
        String acceptLanguage = request.getHeader("Accept-Language");

        if (acceptLanguage == null || acceptLanguage.isEmpty()) {
            return Locale.SIMPLIFIED_CHINESE;
        }

        // 解析 Accept-Language: zh-CN 或 en-US
        String lang = acceptLanguage.split(",")[0].trim();
        if (lang.startsWith("zh")) {
            return Locale.SIMPLIFIED_CHINESE;
        }
        return Locale.US;
    }
}
```

#### i18n 工具类

```java
// src/main/java/com/captcha/pro/i18n/I18nMessages.java
package com.captcha.pro.i18n;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Component;

import java.util.Locale;

@Component
public class I18nMessages {

    private static MessageSource messageSource;

    @Autowired
    public void setMessageSource(MessageSource messageSource) {
        I18nMessages.messageSource = messageSource;
    }

    /**
     * 获取翻译文本
     * @param key 消息 key
     * @param locale 语言
     * @return 翻译后的文本
     */
    public static String get(String key, Locale locale) {
        try {
            return messageSource.getMessage(key, null, locale);
        } catch (Exception e) {
            return key;
        }
    }

    /**
     * 获取翻译文本（带参数）
     */
    public static String get(String key, Locale locale, Object... args) {
        try {
            return messageSource.getMessage(key, args, locale);
        } catch (Exception e) {
            return key;
        }
    }
}
```

#### 配置类

```java
// src/main/java/com/captcha/pro/config/I18nConfig.java
package com.captcha.pro.config;

import com.captcha.pro.i18n.CaptchaLocaleResolver;
import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.ResourceBundleMessageSource;
import org.springframework.web.servlet.LocaleResolver;

import java.nio.charset.StandardCharsets;

@Configuration
public class I18nConfig {

    @Bean
    public LocaleResolver localeResolver() {
        return new CaptchaLocaleResolver();
    }

    @Bean
    public MessageSource messageSource() {
        ResourceBundleMessageSource messageSource = new ResourceBundleMessageSource();
        messageSource.setBasename("i18n/messages");
        messageSource.setDefaultEncoding(StandardCharsets.UTF_8.name());
        messageSource.setDefaultLocale(java.util.Locale.SIMPLIFIED_CHINESE);
        return messageSource;
    }
}
```

#### Controller 使用

```java
// src/main/java/com/captcha/pro/controller/CaptchaController.java
package com.captcha.pro.controller;

import com.captcha.pro.i18n.I18nMessages;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.LocaleResolver;

import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/captcha")
public class CaptchaController {

    private final LocaleResolver localeResolver;

    public CaptchaController(LocaleResolver localeResolver) {
        this.localeResolver = localeResolver;
    }

    @GetMapping
    public Map<String, Object> getCaptcha(HttpServletRequest request) {
        Locale locale = localeResolver.resolveLocale(request);

        try {
            // 生成验证码逻辑
            Object captchaData = generateCaptcha();

            return Map.of(
                "success", true,
                "data", captchaData,
                "message", I18nMessages.get("captcha.verifySuccess", locale)
            );
        } catch (Exception e) {
            return Map.of(
                "success", false,
                "message", I18nMessages.get("error.network", locale)
            );
        }
    }

    @PostMapping("/verify")
    public Map<String, Object> verify(
        @RequestBody Map<String, Object> body,
        HttpServletRequest request
    ) {
        Locale locale = localeResolver.resolveLocale(request);
        String captchaId = (String) body.get("captchaId");

        if (captchaId == null || captchaId.isEmpty()) {
            return Map.of(
                "success", false,
                "message", I18nMessages.get("error.paramMissing", locale)
            );
        }

        // 查找验证码
        Object captcha = findCaptcha(captchaId);
        if (captcha == null) {
            return Map.of(
                "success", false,
                "message", I18nMessages.get("captcha.notFound", locale)
            );
        }

        // 检查是否过期
        if (isExpired(captcha)) {
            return Map.of(
                "success", false,
                "message", I18nMessages.get("captcha.expired", locale)
            );
        }

        // 验证逻辑
        boolean verified = verifyCaptcha(captcha, body);

        if (verified) {
            return Map.of(
                "success", true,
                "message", I18nMessages.get("captcha.verifySuccess", locale)
            );
        } else {
            return Map.of(
                "success", false,
                "message", I18nMessages.get("captcha.verifyFailed", locale)
            );
        }
    }

    // ... 其他方法
}
```

---

### 3.4 Go 后端 (Gin)

#### 目录结构

```
server/go/
├── i18n/
│   ├── i18n.go           # i18n 核心模块
│   ├── zh-CN.go          # 中文
│   └── en-US.go          # 英文
├── controllers/
├── middleware/
│   └── i18n.go           # i18n 中间件
├── main.go
└── ...
```

#### 语言包定义

```go
// server/go/i18n/zh-CN.go
package i18n

var zhCN = map[string]string{
    "common.success":        "操作成功",
    "common.fail":           "操作失败",
    "captcha.verifySuccess": "验证成功",
    "captcha.verifyFailed":  "验证失败",
    "captcha.expired":       "验证码已过期",
    "captcha.notFound":      "验证码不存在",
    "captcha.invalid":       "验证码无效",
    "captcha.typeInvalid":   "验证码类型无效",
    "error.paramMissing":    "参数缺失",
    "error.paramInvalid":    "参数无效",
    "error.ipBlocked":       "IP 已被封禁",
    "error.rateLimited":     "请求过于频繁",
}
```

```go
// server/go/i18n/en-US.go
package i18n

var enUS = map[string]string{
    "common.success":        "Success",
    "common.fail":           "Failed",
    "captcha.verifySuccess": "Verification passed",
    "captcha.verifyFailed":  "Verification failed",
    "captcha.expired":       "Captcha expired",
    "captcha.notFound":      "Captcha not found",
    "captcha.invalid":       "Invalid captcha",
    "captcha.typeInvalid":   "Invalid captcha type",
    "error.paramMissing":    "Missing parameter",
    "error.paramInvalid":    "Invalid parameter",
    "error.ipBlocked":       "IP has been blocked",
    "error.rateLimited":     "Too many requests",
}
```

#### i18n 核心模块

```go
// server/go/i18n/i18n.go
package i18n

import "strings"

// Locale 语言类型
type Locale string

const (
    LocaleZhCN Locale = "zh-CN"
    LocaleEnUS Locale = "en-US"
)

// messages 所有语言包
var messages = map[Locale]map[string]string{
    LocaleZhCN: zhCN,
    LocaleEnUS: enUS,
}

// ParseLocale 从 Accept-Language 解析语言
func ParseLocale(acceptLanguage string) Locale {
    if acceptLanguage == "" {
        return LocaleZhCN
    }

    // 解析 Accept-Language: zh-CN 或 en-US
    lang := strings.Split(acceptLanguage, ",")[0]
    lang = strings.TrimSpace(strings.Split(lang, "-")[0])

    if lang == "zh" {
        return LocaleZhCN
    }
    return LocaleEnUS
}

// T 获取翻译文本
func T(key string, locale Locale) string {
    if msgs, ok := messages[locale]; ok {
        if msg, ok := msgs[key]; ok {
            return msg
        }
    }
    // 回退到中文
    if msgs, ok := messages[LocaleZhCN]; ok {
        if msg, ok := msgs[key]; ok {
            return msg
        }
    }
    return key
}

// GetMessages 获取指定语言的所有消息
func GetMessages(locale Locale) map[string]string {
    if msgs, ok := messages[locale]; ok {
        return msgs
    }
    return messages[LocaleZhCN]
}
```

#### i18n 中间件

```go
// server/go/middleware/i18n.go
package middleware

import (
    "github.com/gin-gonic/gin"
    "server/i18n"
)

// LocaleKey 上下文中存储语言的 key
const LocaleKey = "locale"

// I18nMiddleware i18n 中间件
func I18nMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        acceptLanguage := c.GetHeader("Accept-Language")
        locale := i18n.ParseLocale(acceptLanguage)
        c.Set(LocaleKey, locale)
        c.Next()
    }
}

// GetLocale 从上下文获取语言
func GetLocale(c *gin.Context) i18n.Locale {
    if locale, exists := c.Get(LocaleKey); exists {
        return locale.(i18n.Locale)
    }
    return i18n.LocaleZhCN
}

// T 从上下文获取翻译
func T(c *gin.Context, key string) string {
    locale := GetLocale(c)
    return i18n.T(key, locale)
}
```

#### Controller 使用

```go
// server/go/controllers/captcha.go
package controllers

import (
    "net/http"

    "github.com/gin-gonic/gin"
    "server/i18n"
    "server/middleware"
)

// GetCaptcha 生成验证码
func GetCaptcha(c *gin.Context) {
    locale := middleware.GetLocale(c)

    // 生成验证码逻辑
    captcha, err := generateCaptcha()
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "success": false,
            "message": i18n.T("error.network", locale),
        })
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "success": true,
        "data":    captcha,
        "message": i18n.T("common.success", locale),
    })
}

// VerifyCaptcha 验证验证码
func VerifyCaptcha(c *gin.Context) {
    locale := middleware.GetLocale(c)

    var req struct {
        CaptchaID string      `json:"captchaId"`
        Type      string      `json:"type"`
        Target    interface{} `json:"target"`
    }

    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "success": false,
            "message": i18n.T("error.paramInvalid", locale),
        })
        return
    }

    if req.CaptchaID == "" {
        c.JSON(http.StatusBadRequest, gin.H{
            "success": false,
            "message": i18n.T("error.paramMissing", locale),
        })
        return
    }

    // 查找验证码
    captcha, exists := findCaptcha(req.CaptchaID)
    if !exists {
        c.JSON(http.StatusNotFound, gin.H{
            "success": false,
            "message": i18n.T("captcha.notFound", locale),
        })
        return
    }

    // 检查是否过期
    if isExpired(captcha) {
        c.JSON(http.StatusGone, gin.H{
            "success": false,
            "message": i18n.T("captcha.expired", locale),
        })
        return
    }

    // 验证逻辑
    verified := verifyCaptcha(captcha, req.Target)

    if verified {
        c.JSON(http.StatusOK, gin.H{
            "success": true,
            "message": i18n.T("captcha.verifySuccess", locale),
        })
    } else {
        c.JSON(http.StatusBadRequest, gin.H{
            "success": false,
            "message": i18n.T("captcha.verifyFailed", locale),
        })
    }
}
```

#### 路由配置

```go
// server/go/main.go
package main

import (
    "github.com/gin-gonic/gin"
    "server/controllers"
    "server/middleware"
)

func main() {
    r := gin.Default()

    // 使用 i18n 中间件
    r.Use(middleware.I18nMiddleware())

    // 路由
    api := r.Group("/api")
    {
        api.GET("/captcha", controllers.GetCaptcha)
        api.POST("/captcha/verify", controllers.VerifyCaptcha)
    }

    r.Run(":8082")
}
```

---

## 四、统一 API 响应格式

### 成功响应

```json
{
  "success": true,
  "message": "验证成功",
  "data": {
    "captchaId": "xxx",
    "verifiedAt": 1700000000000
  }
}
```

### 失败响应

```json
{
  "success": false,
  "message": "验证码已过期",
  "error": "CAPTCHA_EXPIRED"
}
```

### HTTP 状态码规范

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 参数错误 / 验证失败 |
| 404 | 验证码不存在 |
| 410 | 验证码已过期 |
| 429 | 请求过于频繁 |
| 500 | 服务器错误 |

---

## 五、测试示例

### curl 测试

```bash
# 中文请求
curl -H "Accept-Language: zh-CN" http://localhost:3001/api/captcha?type=slider

# 英文请求
curl -H "Accept-Language: en-US" http://localhost:3001/api/captcha?type=slider
```

### 响应对比

**中文响应：**
```json
{
  "success": true,
  "message": "操作成功",
  "data": {...}
}
```

**英文响应：**
```json
{
  "success": true,
  "message": "Success",
  "data": {...}
}
```

---

## 六、实施文件清单

### 前端

| 操作 | 文件 | 说明 |
|------|------|------|
| 新建 | `src/locales/index.ts` | i18n 核心模块 |
| 新建 | `src/locales/zh-CN.ts` | 中文语言包 |
| 新建 | `src/locales/en-US.ts` | 英文语言包 |
| 修改 | `src/types.ts` | 添加 locale 选项 |
| 修改 | `src/slider.ts` | 使用 t() |
| 修改 | `src/click.ts` | 使用 t() |
| 修改 | `src/popup.ts` | 使用 t() |
| 修改 | `src/index.ts` | 导出 i18n API |

### Node.js 后端

| 操作 | 文件 | 说明 |
|------|------|------|
| 新建 | `src/locales/index.ts` | i18n 核心模块 |
| 新建 | `src/locales/zh-CN.ts` | 中文语言包 |
| 新建 | `src/locales/en-US.ts` | 英文语言包 |
| 新建 | `src/middleware/i18n.ts` | i18n 中间件 |
| 修改 | `src/index.ts` | 集成中间件 |

### Java 后端

| 操作 | 文件 | 说明 |
|------|------|------|
| 新建 | `i18n/I18nMessages.java` | i18n 工具类 |
| 新建 | `i18n/LocaleResolver.java` | 语言解析器 |
| 新建 | `config/I18nConfig.java` | 配置类 |
| 新建 | `resources/i18n/messages_zh_CN.properties` | 中文语言包 |
| 新建 | `resources/i18n/messages_en_US.properties` | 英文语言包 |
| 修改 | `controller/CaptchaController.java` | 使用 i18n |

### Go 后端

| 操作 | 文件 | 说明 |
|------|------|------|
| 新建 | `i18n/i18n.go` | i18n 核心模块 |
| 新建 | `i18n/zh-CN.go` | 中文语言包 |
| 新建 | `i18n/en-US.go` | 英文语言包 |
| 新建 | `middleware/i18n.go` | i18n 中间件 |
| 修改 | `controllers/captcha.go` | 使用 i18n |
| 修改 | `main.go` | 注册中间件 |

---

*文档更新时间: 2026-03-20*
