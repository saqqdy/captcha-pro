# Java 后端

基于 **Spring Boot 3** 的参考实现，运行于端口 `8080`。

## 快速开始

```bash
cd server/java
./mvnw spring-boot:run
```

服务运行在 `http://localhost:8080`。

## 框架

- **运行时**：Java 17+
- **框架**：Spring Boot 3
- **端口**：`8080`（可用 `PORT` 覆盖）

## 接口

实现了共享的 [API 接口](/zh/backend/#api-接口)：

- `GET /api/captcha` — 生成验证码图片
- `POST /api/captcha/verify` — 验证验证码
- `GET /api/health` — 健康检查
- `GET /api/info` — 服务信息
- `GET/POST/DELETE /api/security/*` — IP 黑名单管理

## 环境变量

见[共享环境变量](/zh/backend/#环境变量)。Java 默认：`PORT=8080`、`HOST=localhost`。

::: tip
这是参考实现，不是发布的包。请将所需代码复制到自己的 Spring Boot 项目中。
:::
