# Captcha Pro Spring Boot Starter

中文 | [English](./README.md)

基于 Spring Boot 3 的验证码生成与验证服务 Starter。

> **注意**：这是一个演示/参考实现。您可以将其作为本地依赖使用，或将代码复制到自己的项目中。

## 功能特性

- 🖼️ **服务端图片生成** - 使用 Java AWT 在后端生成验证码图片
- 🔐 **AES-GCM 数据加密** - 使用 PBKDF2 密钥派生的安全加密传输
- 🛡️ **安全防护** - 请求限流、IP黑名单、防暴力破解
- 📦 **多种验证码类型** - 滑动拼图、点选文字、旋转验证
- ⚡ **内存缓存** - 快速的内存缓存存储
- 🔄 **自动过期** - 验证码自动过期清理
- 🍃 **Spring Boot 3** - 基于 Spring Boot 3.2+
- 🔧 **自动配置** - 零配置即可使用
- 🌍 **多语言支持** - 通过 `Accept-Language` 请求头支持中英文国际化

## 环境要求

- Java 17+
- Spring Boot 3.2+

## 安装

### 方式一：本地安装

克隆并安装到本地：

```bash
# 克隆仓库
git clone https://github.com/saqqdy/captcha-pro.git
cd captcha-pro/server/java

# 安装到本地 Maven 仓库
mvn clean install
```

然后在项目中添加依赖：

```xml
<dependency>
    <groupId>com.captcha</groupId>
    <artifactId>captcha-pro-spring-boot-starter</artifactId>
    <version>2.0.0</version>
</dependency>
```

### 方式二：复制源代码

将以下目录复制到您的项目中：
- `src/main/java/com/captcha/pro/crypto/` - AES-GCM 加密工具
- `src/main/java/com/captcha/pro/autoconfigure/` - 自动配置（可选）

## 快速开始

### 1. 添加依赖

```xml
<dependency>
    <groupId>com.captcha</groupId>
    <artifactId>captcha-pro-spring-boot-starter</artifactId>
    <version>2.0.0</version>
</dependency>
```

### 2. 配置（可选）

```yaml
# application.yml
captcha:
  pro:
    captcha:
      expire-time: 60000           # 验证码过期时间 (ms)
      timestamp-tolerance: 60000   # 时间戳容忍度 (ms)
      secret-key: your-secret-key  # AES-GCM 加密密钥
    security:
      enable-rate-limit: true
      rate-limit-max: 60
      rate-limit-window: 60000
      rate-limit-block-duration: 300000
      enable-blacklist: true
      blacklist-duration: 0        # 0 = 永久
      enable-brute-force: true
      max-failed-attempts: 10
      failed-attempts-window: 300000
      brute-force-block-duration: 900000
```

### 3. 运行演示应用

```bash
# 进入服务端目录
cd server/java

# 构建
mvn clean package

# 运行
java -jar target/captcha-pro-spring-boot-starter-2.0.0.jar
```

服务将在 `http://localhost:8080` 启动。

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
| type | string | slider | 验证码类型: slider, click |
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
import com.captcha.pro.crypto.AesCrypto;
import com.captcha.pro.crypto.CaptchaData;
import com.fasterxml.jackson.databind.ObjectMapper;

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
import { SliderCaptcha } from '@captcha-pro/core'

const captcha = new SliderCaptcha({
  el: '#captcha-container',
  verifyMode: 'backend',
  backendVerify: {
    getCaptcha: 'http://localhost:8080/api/captcha?type=slider',
    verify: 'http://localhost:8080/api/captcha/verify'
  },
  security: {
    secretKey: 'your-secret-key',
    enableSign: true
  }
})
```

## 项目结构

```
server/java/
├── src/main/java/com/captcha/pro/
│   ├── CaptchaProApplication.java       # 演示应用
│   ├── autoconfigure/
│   │   └── CaptchaProAutoConfiguration.java  # 自动配置
│   ├── config/
│   │   ├── CaptchaProProperties.java    # 配置属性
│   │   └── I18nConfig.java              # i18n 配置
│   ├── controller/
│   │   ├── CaptchaController.java       # 验证码接口
│   │   └── SecurityController.java      # 安全接口
│   ├── crypto/
│   │   ├── AesCrypto.java               # AES-GCM 加密
│   │   └── CaptchaData.java             # 解密数据模型
│   ├── i18n/
│   │   ├── I18nMessages.java            # i18n 工具类
│   │   └── CaptchaLocaleResolver.java   # 语言解析器
│   ├── model/
│   │   ├── CaptchaModels.java           # 验证码模型
│   │   └── SecurityModels.java          # 安全模型
│   ├── security/
│   │   └── SecurityManager.java         # 安全管理器
│   └── service/
│       ├── CaptchaCache.java            # 缓存服务
│       └── CaptchaGenerator.java        # 生成器服务
├── src/main/resources/
│   ├── i18n/
│   │   ├── messages_zh_CN.properties    # 中文语言包
│   │   └── messages_en_US.properties    # 英文语言包
│   ├── META-INF/
│   │   ├── additional-spring-configuration-metadata.json
│   │   └── spring/
│   │       └── org.springframework.boot.autoconfigure.AutoConfiguration.imports
│   └── application.yml
├── pom.xml
└── README.md
```

## 多语言支持 (i18n)

服务端通过 `Accept-Language` HTTP 请求头支持国际化。

### 支持的语言

| 语言 | 代码 |
|------|------|
| 简体中文 | `zh-CN` |
| English | `en-US` |

### 使用方式

```bash
# 中文响应
curl -H "Accept-Language: zh-CN" http://localhost:8080/api/captcha?type=slider

# 英文响应
curl -H "Accept-Language: en-US" http://localhost:8080/api/captcha?type=slider
```

## 自定义

### 覆盖 Bean

您可以通过定义自己的 Bean 来覆盖默认实现：

```java
@Configuration
public class MyCaptchaConfig {

    @Bean
    @Primary
    public CaptchaCache captchaCache() {
        // 使用 Redis 替代内存缓存
        return new RedisCaptchaCache();
    }
}
```

### 禁用自动配置

```java
@SpringBootApplication(exclude = CaptchaProAutoConfiguration.class)
public class MyApplication {
    // ...
}
```

## 其他后端示例

- **Node.js (Express)**: 参见 [server/node](../node/)
- **Go (Gin)**: 参见 [server/go](../go/)

## License

MIT

## 启动服务与验证指南（零基础也能跟着做）

这一节专门写给从没跑过后端服务的朋友。照着一步步来，就能在浏览器里把验证码服务跑起来。

### 1. 要装什么软件

1. **JDK 17** —— 打开 https://adoptium.net ，下载 **Temurin 17 LTS**（macOS 是 `.pkg`，Windows 是 `.msi`），双击默认安装。本项目指定要 Java 17。
2. **Maven** —— 本项目没有自带 `mvnw` 包装器，所以需要单独装 Maven。
   - macOS（有 Homebrew）：`brew install maven`
   - Windows：去 https://maven.apache.org/download.cgi 下载压缩包，解压后把它的 `bin` 目录加到环境变量 PATH 里（下载页上有说明）。
   - 如果你用 IntelliJ IDEA 或装了 Java 扩展的 VS Code，一般自带 Maven，不用单独装。

怎么确认装好了：打开终端（macOS 用"终端"App，Windows 用 PowerShell），输 `java -version` 回车（应显示版本 `17`），再输 `mvn -v` 回车（应显示一个 Maven 版本号）。

### 2. 起服务

终端里依次输入：

```bash
# 进入服务端目录（路径换成你自己的）
cd /你的路径/captcha-pro/server/java

# 直接启动 Spring Boot 服务（第一次会下载依赖，可能要好几分钟）
mvn spring-boot:run
```

看到 Spring Boot 的图标和类似 `Tomcat started on port 8080` 的一行字（地址就是 `http://localhost:8080`），就说明起来了。这个终端窗口别关，关了服务就停了。

> 端口在 `src/main/resources/application.yml` 里配置（`server.port: 8080`）。

### 3. 验证服务

打开浏览器（Chrome、Safari、Edge 都行），地址栏粘下面这串，回车：

```
http://localhost:8080/api/captcha?type=slider
```

看到一屏字，开头类似 `{"success":true,"data":{"captchaId":...,"bgImage":...}}`，就成了——这段 JSON 就是服务刚生成的验证码数据。

也可以试下健康检查：打开 `http://localhost:8080/api/health`。

### 4. 构建（可选）

只是本地起服务的话，`mvn spring-boot:run` 就够了，不用构建。想要一个独立可运行的 jar：

```bash
# 构建
mvn clean package

# 运行打好的 jar
java -jar target/captcha-pro-spring-boot-starter-2.0.0.jar
```

jar 文件在 `target/` 目录下。

### 5. 常见报错

- **`java: command not found` 或 Java 版本不对** —— JDK 17 没装或没生效。从 https://adoptium.net 重装 Temurin 17，重开终端。
- **`mvn: command not found`** —— Maven 没装或没进环境变量。看上面第 1 步装 Maven。
- **`Web server failed to start. Port 8080 was already in use.`（8080 端口被占）** —— 有别的程序占着 8080。要么关了它，要么换个端口起：`mvn spring-boot:run -Dspring-boot.run.arguments=--server.port=8081`。
- **第一次很慢** —— Maven 在下载依赖，第一次正常，可能要好几分钟。

### 6. 跟前端示例联调

本仓库的前端示例（比如 `examples/vue`）可以连这个服务。在前端示例里把后端地址配成 `http://localhost:8080`，验证码取图地址就是 `http://localhost:8080/api/captcha?type=slider`，校验地址就是 `http://localhost:8080/api/captcha/verify`。具体配置项字段名看各前端示例自己的 README。
