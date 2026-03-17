# Captcha Pro 服务端示例 (Java/Spring Boot)

中文 | [English](./README.md)

基于 Spring Boot 3 的验证码生成与验证服务示例实现。这是一个参考实现，帮助您将 captcha-pro 集成到自己的后端服务中。

> **注意**：这是一个演示/参考实现，不会作为 Maven 依赖发布。您可以复制并根据需要修改代码来构建自己的后端服务。

## 功能特性

- 🖼️ **服务端图片生成** - 使用 Java AWT 在后端生成验证码图片
- 🔐 **AES-GCM 数据加密** - 使用 PBKDF2 密钥派生的安全加密传输
- 🛡️ **安全防护** - 请求限流、IP黑名单、防暴力破解
- 📦 **多种验证码类型** - 滑动拼图、点选文字、旋转验证
- ⚡ **内存缓存** - 快速的内存缓存存储
- 🔄 **自动过期** - 验证码自动过期清理
- 🍃 **Spring Boot 3** - 基于 Spring Boot 3.2+

## 环境要求

- Java 17+
- Spring Boot 3.2+

## 安装

### Maven

```xml
<dependency>
    <groupId>com.captcha</groupId>
    <artifactId>captcha-pro-spring-boot-starter</artifactId>
    <version>1.0.0</version>
</dependency>
```

### Gradle

```groovy
implementation 'com.captcha:captcha-pro-spring-boot-starter:1.0.0'
```

## 快速开始

这是一个演示项目，克隆仓库并在本地运行：

```bash
# 进入服务端目录
cd server/java

# 构建
mvn clean package

# 运行
java -jar target/captcha-pro-spring-boot-starter-1.0.0.jar
```

服务将在 `http://localhost:8080` 启动。

## 配置说明

```yaml
# application.yml
captcha:
  pro:
    security:
      enable-rate-limit: true
      rate-limit-max: 60
      rate-limit-window: 60000
      rate-limit-block-duration: 300000
      enable-blacklist: true
      blacklist-duration: 0
      enable-brute-force: true
      max-failed-attempts: 10
      failed-attempts-window: 300000
      brute-force-block-duration: 900000
    captcha:
      expire-time: 60000
      timestamp-tolerance: 60000
      secret-key: captcha-pro-secret-key
```

## API 接口

### 验证码接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/captcha` | 生成验证码 |
| POST | `/api/captcha/verify` | 验证验证码 |
| GET | `/api/health` | 健康检查 |
| GET | `/api/info` | 服务信息 |

### 安全管理接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/security/status/{ip}` | 获取 IP 安全状态 |
| GET | `/api/security/blacklist` | 获取黑名单列表 |
| POST | `/api/security/blacklist` | 添加 IP 到黑名单 |
| DELETE | `/api/security/blacklist/{ip}` | 移除 IP 黑名单 |

## 生成验证码

**GET** `/api/captcha?type=slider&width=280&height=155`

查询参数：

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| type | string | slider | 验证码类型: slider, click, rotate |
| width | number | 280 | 图片宽度 |
| height | number | 155 | 图片高度 |
| sliderWidth | number | 50 | 滑块宽度 (仅slider) |
| sliderHeight | number | 50 | 滑块高度 (仅slider) |
| precision | number | 5 | 验证精度 |
| clickCount | number | 3 | 点击数量 (仅click) |
| clickText | string | - | 自定义点击文字 (仅click) |

## 验证验证码

**POST** `/api/captcha/verify`

### 明文模式

```json
{
  "captchaId": "uuid-string",
  "type": "SLIDER",
  "target": [123]
}
```

### 加密模式 (AES-GCM)

当前端启用 `security.enableSign` 时，发送加密数据：

```json
{
  "captchaId": "uuid-string",
  "signature": "base64编码的加密数据"
}
```

签名包含 AES-GCM 加密的 JSON 数据：
- `type`: 验证码类型
- `target`: 验证目标
- `timestamp`: Unix 时间戳 (会验证 `timestamp-tolerance`)
- `nonce`: 随机字符串，防止重放攻击

## AES-GCM 加密

### 算法详情

| 参数 | 值 |
|------|-----|
| 加密算法 | AES-256-GCM |
| 密钥派生 | PBKDF2 |
| 哈希算法 | SHA-256 |
| 迭代次数 | 100,000 |
| 盐值长度 | 16 字节 |
| IV 长度 | 12 字节 |
| GCM 标签长度 | 128 位 |

### 数据格式

```
base64(salt[16] + iv[12] + ciphertext + authTag[16])
```

### 使用示例

```java
// 解密并验证
import com.captcha.pro.crypto.AesCrypto;
import com.captcha.pro.crypto.CaptchaData;

public CaptchaData verifyEncrypted(String signature, String secretKey) throws Exception {
    String decrypted = AesCrypto.decrypt(signature, secretKey);
    ObjectMapper mapper = new ObjectMapper();
    CaptchaData data = mapper.readValue(decrypted, CaptchaData.class);

    if (!AesCrypto.validateTimestamp(data.getTimestamp(), 60000)) {
        throw new Exception("时间戳已过期");
    }

    return data;
}
```

## 安全功能

### 请求限流
- 默认限制：每分钟 60 次请求
- 封锁时长：5 分钟

### IP 黑名单
```bash
# 添加 IP 到黑名单
curl -X POST http://localhost:8080/api/security/blacklist \
  -H "Content-Type: application/json" \
  -d '{"ip": "192.168.1.100", "reason": "可疑活动", "duration": 3600000}'
```

### 防暴力破解
- 最大失败尝试次数：10 次
- 统计窗口：5 分钟
- 封锁时长：15 分钟

## 前端集成示例

```javascript
import { SliderCaptcha } from 'captcha-pro'

const captcha = new SliderCaptcha({
  el: '#captcha-container',
  verifyMode: 'backend',
  backendVerify: {
    getCaptcha: 'http://localhost:8080/api/captcha?type=slider',
    verify: 'http://localhost:8080/api/captcha/verify'
  },
  security: {
    secretKey: 'captcha-pro-secret-key',
    enableSign: true
  }
})
```

## 项目结构

```
server/java/
├── src/main/java/com/captcha/pro/
│   ├── CaptchaProApplication.java    # 主应用
│   ├── config/
│   │   └── CaptchaProProperties.java # 配置类
│   ├── controller/
│   │   ├── CaptchaController.java    # 验证码接口
│   │   └── SecurityController.java   # 安全接口
│   ├── crypto/
│   │   ├── AesCrypto.java            # AES-GCM 加密 (可复制到您的项目)
│   │   └── CaptchaData.java          # 解密数据模型
│   ├── model/
│   │   ├── CaptchaModels.java        # 验证码模型
│   │   └── SecurityModels.java       # 安全模型
│   ├── security/
│   │   └── SecurityManager.java      # 安全管理器
│   └── service/
│       ├── CaptchaCache.java         # 缓存服务
│       └── CaptchaGenerator.java     # 生成器服务
├── src/main/resources/
│   └── application.yml               # 配置文件
├── pom.xml
└── README.md
```

## 集成指南

将此示例集成到您自己的 Java 后端：

1. 将 `src/main/java/com/captcha/pro/crypto/` 复制到您的项目
2. 使用 `AesCrypto.decrypt()` 验证前端传来的加密签名
3. 实现您自己的验证码存储（Redis、数据库等）
4. 在 `application.yml` 中自定义安全设置

## 其他后端示例

- **Node.js (Express)**: 参见 [server/node](../node/)
- **Go (Gin)**: 参见 [server/go](../go/)

## License

MIT
