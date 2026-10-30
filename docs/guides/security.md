# Security Features

captcha-pro provides multi-layer security mechanisms to prevent captcha cracking and abuse.

## 📋 Table of Contents

- [Data Encryption](#data-encryption)
- [Timestamp Verification](#timestamp-verification)
- [Rate Limiting](#rate-limiting)
- [IP Blacklist](#ip-blacklist)
- [Brute Force Protection](#brute-force-protection)
- [Best Practices](#best-practices)

---

## Data Encryption

### AES-GCM Encryption

captcha-pro uses the AES-GCM algorithm to encrypt verification data, preventing tampering.

**Frontend configuration:**

```javascript
import { SliderCaptcha } from '@captcha-pro/core'

const captcha = new SliderCaptcha({
  el: '#captcha',
  security: {
    secretKey: 'your-secret-key',  // shared with backend
    enableSign: true,
    timestampTolerance: 60000      // 60 seconds
  },
  onSuccess: async () => {
    // Get encrypted data
    const encryptedData = await captcha.getSignedData()

    // Send to backend for verification
    await fetch('/api/verify', {
      method: 'POST',
      body: JSON.stringify(encryptedData)
    })
  }
})
```

**Backend decryption (Node.js):**

```javascript
import { decryptCaptchaData, validateTimestamp } from '@captcha-pro/core'

async function verifyCaptcha(encryptedData, secretKey) {
  try {
    // Decrypt data
    const data = await decryptCaptchaData(encryptedData.signature, secretKey)

    // Validate timestamp
    if (!validateTimestamp(data.timestamp, 60000)) {
      return { valid: false, error: 'Timestamp expired' }
    }

    return { valid: true, data }
  } catch (error) {
    return { valid: false, error: 'Invalid encrypted data' }
  }
}
```

### Encrypted Data Structure

```typescript
interface EncryptedData {
  type: 'slider' | 'click'     // captcha type
  target: number | number[]    // target position
  timestamp: number            // timestamp
  nonce: string                // random nonce
  signature: string            // encrypted signature
}
```

---

## Timestamp Verification

### Preventing Replay Attacks

Timestamp verification prevents attackers from intercepting verification data and reusing it.

**Verification flow:**

1. The frontend adds the current timestamp when generating verification data
2. The data is encrypted and sent to the backend
3. After decryption, the backend checks whether the timestamp is within tolerance
4. Requests exceeding the tolerance are rejected

**Configuration:**

```javascript
security: {
  timestampTolerance: 60000  // 60 seconds tolerance
}
```

**Backend verification:**

```javascript
import { validateTimestamp } from '@captcha-pro/core'

const isValid = validateTimestamp(data.timestamp, 60000)
if (!isValid) {
  return { valid: false, error: 'Timestamp expired' }
}
```

---

## Rate Limiting

### Preventing API Abuse

Limit the request frequency of a single IP or user to prevent brute force attacks.

**Backend configuration (Node.js):**

```javascript
const captchaBackend = new SliderCaptchaBackend({
  rateLimit: {
    maxRequests: 100,    // maximum number of requests
    windowMs: 60000      // time window (ms)
  }
})
```

**Default limits:**
- 60 requests/minute (per IP)
- Customizable based on business needs

**Response when limit is exceeded:**

```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "retryAfter": 30
}
```

---

## IP Blacklist

### Blocking Malicious IPs

IPs exhibiting abnormal behavior are added to a blacklist, temporarily or permanently blocking access.

**Add to blacklist:**

```javascript
// backend code
await captchaBackend.addToBlacklist('192.168.1.100', {
  reason: 'Brute force',
  duration: 3600000  // 1 hour (ms)
})
```

**Remove from blacklist:**

```javascript
await captchaBackend.removeFromBlacklist('192.168.1.100')
```

**Query IP status:**

```javascript
const status = await captchaBackend.getIpStatus('192.168.1.100')
console.log({
  blacklisted: status.blacklisted,
  reason: status.reason,
  expiresAt: status.expiresAt
})
```

**Blacklist types:**

| Type | Description | Removal |
|------|-------------|---------|
| **Temporary blacklist** | Short-term ban (e.g., 1 hour) | Auto-expires |
| **Permanent blacklist** | Long-term ban | Manual removal |

---

## Brute Force Protection

### Automatic Detection and Blocking

captcha-pro automatically detects brute force behavior:

**Detection rules:**

1. **Consecutive failures** - N consecutive failures within a short period
2. **Abnormal drag trajectory** - drag trajectory that is too regular or mechanical
3. **Abnormal response time** - response time that is too fast (likely a bot)

**Automatic protection measures:**

```javascript
const captchaBackend = new SliderCaptchaBackend({
  bruteForceProtection: {
    maxFailures: 5,           // maximum consecutive failures
    banDuration: 1800000,     // ban duration (30 minutes)
    trackMouseMovement: true  // track mouse trajectory
  }
})
```

**After detecting brute force:**

1. Automatically add the IP to the temporary blacklist
2. Return an error message
3. Log the event for later analysis

---

## Best Practices

### Key Management

✅ **Recommended:**

```javascript
// Store keys in environment variables
const secretKey = process.env.CAPTCHA_SECRET_KEY

// Rotate keys periodically
// Replace every 90 days
```

❌ **Not recommended:**

```javascript
// Hardcoded key
const secretKey = 'my-secret-key-123'  // dangerous!
```

### Verification Precision Settings

Choose appropriate verification precision based on your business scenario:

| Precision | Value | Use Case |
|-----------|-------|----------|
| Loose | 10-15 | User experience first |
| Standard | 5-10 | Balance security and experience (recommended) |
| Strict | 1-5 | Security first |

```javascript
new SliderCaptcha({
  el: '#captcha',
  precision: 5  // standard precision
})
```

### HTTPS Deployment

✅ **You must use HTTPS** to prevent man-in-the-middle attacks:

```nginx
server {
    listen 443 ssl;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
}
```

### Logging

Record verification logs for security analysis:

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

### Regular Audits

It is recommended to regularly audit the following:

1. **Verification success rate** - abnormally low may indicate an attack
2. **Blacklist size** - abnormally large may indicate a large-scale attack
3. **API call volume** - abnormally high may indicate abuse
4. **Failure reason distribution** - analyze attack patterns

---

## 🔗 Related Links

- [Backend Integration Guide](./backend-integration.md)
- [Frontend Integration Guide](./frontend-integration.md)
- [API Reference](../api/README.md)
