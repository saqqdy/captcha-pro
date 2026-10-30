# 安全特性详解

captcha-pro 提供了多层安全机制，防止验证码被破解和滥用。

## 📋 目录

- [数据加密](#数据加密)
- [时间戳验证](#时间戳验证)
- [频率限制](#频率限制)
- [IP 黑名单](#ip-黑名单)
- [暴力破解防护](#暴力破解防护)
- [最佳实践](#最佳实践)

---

## 数据加密

### AES-GCM 加密

captcha-pro 使用 AES-GCM 算法对验证数据进行加密，防止数据被篡改。

**前端配置：**

```javascript
import { SliderCaptcha } from '@captcha-pro/core'

const captcha = new SliderCaptcha({
  el: '#captcha',
  security: {
    secretKey: 'your-secret-key',  // 与后端共享的密钥
    enableSign: true,
    timestampTolerance: 60000      // 60 秒
  },
  onSuccess: async () => {
    // 获取加密数据
    const encryptedData = await captcha.getSignedData()

    // 发送到后端验证
    await fetch('/api/verify', {
      method: 'POST',
      body: JSON.stringify(encryptedData)
    })
  }
})
```

**后端解密（Node.js）：**

```javascript
import { decryptCaptchaData, validateTimestamp } from '@captcha-pro/core'

async function verifyCaptcha(encryptedData, secretKey) {
  try {
    // 解密数据
    const data = await decryptCaptchaData(encryptedData.signature, secretKey)

    // 验证时间戳
    if (!validateTimestamp(data.timestamp, 60000)) {
      return { valid: false, error: 'Timestamp expired' }
    }

    return { valid: true, data }
  } catch (error) {
    return { valid: false, error: 'Invalid encrypted data' }
  }
}
```

### 加密数据结构

```typescript
interface EncryptedData {
  type: 'slider' | 'click'     // 验证码类型
  target: number | number[]    // 目标位置
  timestamp: number            // 时间戳
  nonce: string                // 随机数
  signature: string            // 加密签名
}
```

---

## 时间戳验证

### 防止重放攻击

通过时间戳验证，防止攻击者截获验证数据后重复使用。

**验证流程：**

1. 前端生成验证数据时添加当前时间戳
2. 数据加密后发送到后端
3. 后端解密后检查时间戳是否在容差范围内
4. 超过容差时间的请求被拒绝

**配置：**

```javascript
security: {
  timestampTolerance: 60000  // 60 秒容差
}
```

**后端验证：**

```javascript
import { validateTimestamp } from '@captcha-pro/core'

const isValid = validateTimestamp(data.timestamp, 60000)
if (!isValid) {
  return { valid: false, error: 'Timestamp expired' }
}
```

---

## 频率限制

### 防止 API 滥用

限制单个 IP 或用户的请求频率，防止暴力破解。

**后端配置（Node.js）：**

```javascript
const captchaBackend = new SliderCaptchaBackend({
  rateLimit: {
    maxRequests: 100,    // 最大请求数
    windowMs: 60000      // 时间窗口（毫秒）
  }
})
```

**默认限制：**
- 60 次/分钟（单 IP）
- 可根据业务需求自定义

**超过限制的响应：**

```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "retryAfter": 30
}
```

---

## IP 黑名单

### 阻止恶意 IP

将检测到异常行为的 IP 加入黑名单，临时或永久阻止其访问。

**添加到黑名单：**

```javascript
// 后端代码
await captchaBackend.addToBlacklist('192.168.1.100', {
  reason: '暴力破解',
  duration: 3600000  // 1 小时（毫秒）
})
```

**从黑名单移除：**

```javascript
await captchaBackend.removeFromBlacklist('192.168.1.100')
```

**查询 IP 状态：**

```javascript
const status = await captchaBackend.getIpStatus('192.168.1.100')
console.log({
  blacklisted: status.blacklisted,
  reason: status.reason,
  expiresAt: status.expiresAt
})
```

**黑名单类型：**

| 类型 | 说明 | 解除方式 |
|------|------|----------|
| **临时黑名单** | 短期封禁（如 1 小时） | 自动过期解除 |
| **永久黑名单** | 长期封禁 | 手动移除 |

---

## 暴力破解防护

### 自动检测与阻止

captcha-pro 会自动检测暴力破解行为：

**检测规则：**

1. **连续失败次数** - 短时间内连续失败 N 次
2. **异常拖动轨迹** - 拖动轨迹过于规律或机械
3. **响应时间异常** - 响应时间过快（可能是机器人）

**自动防护措施：**

```javascript
const captchaBackend = new SliderCaptchaBackend({
  bruteForceProtection: {
    maxFailures: 5,           // 最大连续失败次数
    banDuration: 1800000,     // 封禁时长（30 分钟）
    trackMouseMovement: true  // 追踪鼠标轨迹
  }
})
```

**检测到暴力破解后：**

1. 自动将 IP 加入临时黑名单
2. 返回错误提示
3. 记录日志供后续分析

---

## 最佳实践

### 密钥管理

✅ **推荐做法：**

```javascript
// 使用环境变量存储密钥
const secretKey = process.env.CAPTCHA_SECRET_KEY

// 定期轮换密钥
// 每 90 天更换一次
```

❌ **不推荐做法：**

```javascript
// 硬编码密钥
const secretKey = 'my-secret-key-123'  // 危险！
```

### 验证精度设置

根据业务场景选择合适的验证精度：

| 精度 | 值 | 适用场景 |
|------|-----|---------|
| 宽松 | 10-15 | 用户体验优先 |
| 标准 | 5-10 | 平衡安全与体验（推荐）|
| 严格 | 1-5 | 安全优先 |

```javascript
new SliderCaptcha({
  el: '#captcha',
  precision: 5  // 标准精度
})
```

### HTTPS 部署

✅ **必须使用 HTTPS**，防止中间人攻击：

```nginx
server {
    listen 443 ssl;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
}
```

### 日志记录

记录验证日志用于安全分析：

```javascript
const captchaBackend = new SliderCaptchaBackend({
  logging: {
    enabled: true,
    level: 'info',  // 'debug' | 'info' | 'warn' | 'error'
    includeIp: true,
    includeUserAgent: true
  }
})
```

### 定期审计

建议定期审计以下内容：

1. **验证成功率** - 异常低可能表示被攻击
2. **黑名单数量** - 异常多可能表示大规模攻击
3. **API 调用量** - 异常高可能表示滥用
4. **失败原因分布** - 分析攻击模式

---

## 🔗 相关链接

- [后端集成指南](./backend-integration.md)
- [前端集成指南](./frontend-integration.md)
- [API 参考手册](../api/)