# Captcha Pro Spring Boot Starter

中文 | [English](./README.md)

基于 Spring Boot 的验证码生成与验证服务。

## 功能特性

- 🖼️ **服务端图片生成** - 使用 Java AWT 在后端生成验证码图片
- 🔐 **服务端验证** - 防止前端绕过验证
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

```bash
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

```json
{
  "captchaId": "uuid-string",
  "type": "SLIDER",
  "target": [123]
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

## License

MIT
