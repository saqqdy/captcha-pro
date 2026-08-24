# captcha-pro 2.6.0 — native 单测基建 + CI 设计规格

- **日期**：2026-08-11
- **状态**：已批准，待写实施计划
- **前置**：2.5.0（RTL）落地后开展。2.6.0 不改 API 契约、不改功能代码，仅加测试基建 + CI 接入。是 3.0.0（major breaking：移除客户端生成，大量删除）前最后一个 minor——为 major 重构提供回归网。
- **承接**：2.1.0/2.2.0/2.3.0 spec 三次将"native 无单测基建"列为风险（"验证 = build 通过 + 目视，无自动化兜底"）；2.4.0/2.5.0 候选时未选。2.6.0 兑现此债务。

## 1. 背景与目标

native 三端（flutter/android/ios）当前测试基建：
- **ios**：`Tests/CaptchaProTests/CaptchaProTests.swift` 是 placeholder（`XCTAssertTrue(true)` + 注释"Real tests will be added in a future phase"），`Package.swift` 有 testTarget manifest——基建在，缺实质测试。
- **flutter**：无 `test/` 目录，零测试。
- **android**：无 `src/test/` 目录，零测试。
- **CI**（`.github/workflows/build.yml`）：仅跑 JS `pnpm build` + `pnpm test`（node 20）+ SonarCloud；native 三端未接入 CI。

3.0.0 即将移除客户端生成代码（slider.ts ~300 行、click.ts ~250 行删除 + native CaptchaGenerator 重构），无 native 单测网则重构后只能靠目视回归，风险高。

**目标**：
1. 三端建立单测基建——flutter `test/`、android `src/test/`、ios 替换 placeholder。
2. 覆盖纯逻辑模块（i18n 回退链、serializeCaptchaData 请求体、URL 构建/签名）——不测 UI（无合适框架，UI 仍目视）。
3. CI（build.yml）接入三端测试 job。
4. 无 API 破坏、无功能代码改动。

**非目标**：
- 不测 UI 组件（flutter widget test / android UI test / ios UI test——复杂度高、收益低，留后续）
- 不做截图测试 / golden test（留后续）
- 不改功能代码（仅加测试 + 可能补 `@VisibleForTesting` 注解）
- 不接入 e2e（examples 的端到端测试，留后续）
- 不改 core JS 测试（vitest 已就绪）

## 2. 决策

| 维度 | 决策 |
|---|---|
| 主题 | native 单测基建 + CI 接入 |
| 范围 | flutter test + android JUnit + ios XCTest + build.yml CI |
| 测试对象 | 纯逻辑：i18n 回退链、serializeCaptchaData、URL 构建/签名 |
| 不测 | UI 组件、截图、e2e |
| ios CI runner | macOS（ubuntu 不支持 XCTest） |
| android CI | ubuntu（gradle `test` 是 JVM 单测，不需 Android SDK，前提：CaptchaGenerator 纯 Kotlin） |
| flutter CI | ubuntu + Flutter SDK setup action |
| 版本 | 2.6.0 minor bump 全 14 包 + root（无 API 破坏） |

## 3. 现状（审计已确认）

| 端 | 测试目录 | 现有测试 | 可测纯逻辑模块 |
|---|---|---|---|
| flutter | 无 | 无 | `lib/src/core/i18n.dart`（getLocaleMessage 回退）、`lib/src/core/backend.dart`（serializeCaptchaData 无 timestamp、URL、签名） |
| android | 无 | 无 | `core/CaptchaGenerator.kt`（serializeCaptchaData）、`core/Types.kt`（LocaleMessages.get） |
| ios | `Tests/CaptchaProTests/` | placeholder（`XCTAssertTrue(true)`） | `Sources/Core/CaptchaGenerator.swift`（serialize）、`Sources/Core/Types.swift`（LocaleMessages.get） |
| CI | `.github/workflows/build.yml` | JS build+test + SonarCloud | native 未接入 |

**core JS 基线**：`packages/core/test/` 8 个 vitest 文件（`vitest run`），作为 native 测试范例参考。

## 4. 详细设计

### 4.1 flutter 测试

- 新建 `packages/flutter/test/`。
- 框架：flutter test（内置，基于 dart test）。
- 测试文件：
  - `i18n_test.dart`：`getLocaleMessage('zh-CN','loading')` === 值；回退（`'ja-JP'` → zh-CN → key）；6/9 语言键数（视 2.4/2.5 落地）。
  - `backend_test.dart`：`serializeCaptchaData(captchaId, type, target)` 产物**无 timestamp**、字段集 = `{captchaId, type, target}`；URL 构建（`buildUrl`）含 query 参数；签名生成（若有，`generateSignature` 输入/输出稳定）。
- 运行：`cd packages/flutter && flutter test`。
- CI：ubuntu + `subosito/flutter-action@v2` setup Flutter SDK + `flutter test`。

### 4.2 android 测试

- 新建 `packages/android/captcha-sdk/src/test/java/com/captcha/pro/core/`。
- 框架：JUnit 4（Gradle `test` task，JVM 单测，不需 Android SDK/Robolectric——前提：CaptchaGenerator/Types 是纯 Kotlin，不 import `android.*`）。
- 测试文件：
  - `CaptchaGeneratorTest.kt`：`serializeCaptchaData` 产物无 timestamp、字段集；JSON 结构断言。
  - `LocaleMessagesTest.kt`：`get(ZH_CN, 'loading')` === 值；`get(UNKNOWN, key)` 回退链；键数。
- 运行：`./gradlew :captcha-sdk:test`。
- CI：ubuntu + `actions/setup-java@v4` (JDK 17) + `./gradlew :captcha-sdk:test`。
- **判断点**：若 CaptchaGenerator 依赖 `android.*`（Context 等），改用 Robolectric 或抽出纯 Kotlin 模块。Task 须先 grep 确认。

### 4.3 ios 测试

- 替换 `packages/ios/Tests/CaptchaProTests/CaptchaProTests.swift` placeholder。
- 框架：XCTest（`Package.swift` testTarget 已有）。
- 测试文件：
  - `CaptchaGeneratorTests.swift`：`serialize` 产物无 timestamp、字段集。
  - `LocaleMessagesTests.swift`：`get(.zhCN, 'loading')` === 值；回退；键数。
- 运行：`cd packages/ios && swift test`。
- CI：**macOS runner**（`runs-on: macos-latest`，ubuntu 不支持 XCTest）+ `swift test`。

### 4.4 CI 接入（build.yml）

在现有 `build` job 后追加 3 个 job（或合并为矩阵）：
- `flutter-test`：ubuntu + Flutter SDK + `flutter test`。
- `android-test`：ubuntu + JDK 17 + `./gradlew :captcha-sdk:test :captcha-compose:test`。
- `ios-test`：macOS + `swift test`。
- `needs: build`（在 JS build 后跑，避免重复 checkout 依赖）。
- 失败则 CI 红，阻断 merge。

### 4.5 core JS 测试（基线对照）
- `packages/core/test/` 已 8 文件（vitest）。2.6.0 不改 core 测试，但 native 测试断言应与 core 对齐（serializeCaptchaData 无 timestamp 是跨端契约）。

## 5. 验证与发版

### 验证
- **本地三端测试**：
```bash
cd packages/flutter && flutter test 2>&1 | tail -3
cd packages/android && ./gradlew :captcha-sdk:test 2>&1 | tail -3
cd packages/ios && swift test 2>&1 | tail -3
```
Expected: 全绿。
- **测试文件 grep 终检**：
```bash
echo "== flutter ==" && find packages/flutter/test -name "*_test.dart" | wc -l
echo "== android ==" && find packages/android -path "*/src/test/*" -name "*Test.kt" | grep -v "/build/" | wc -l
echo "== ios ==" && find packages/ios/Tests -name "*Tests.swift" | wc -l
```
Expected: flutter ≥2、android ≥2、ios ≥2（含替换后的实质测试）。
- **CI 验证**：push 后 GitHub Actions 三端 test job 全绿。
- **JS 回归**：`fnm use 18 && pnpm turbo build && pnpm turbo test`（core 未改，应零回归）。
- **ios placeholder 清除**：`CaptchaProTests.swift` 不再含 `XCTAssertTrue(true)` placeholder。

### 发版
- changeset：14 包 + root 一律 2.5.0 → 2.6.0（minor）。
- CHANGELOG 顶部 `[2.6.0]` 条目（native 单测基建 + CI 接入）。

## 6. 风险与判断点

- **android CaptchaGenerator 依赖 android.* 框架**：若 `serializeCaptchaData` 依赖 `Context`/`JSONObject`（android 包），JVM 单测不可直接跑。**判断点**：Task 2 Step 1 grep 确认；若依赖，用 Robolectric 或抽纯 Kotlin 函数（`@VisibleForTesting` 纯函数 + 重构）。
- **ios CI macOS runner 成本**：macOS 分钟数比 ubuntu 贵 ~3×。判断点：可接受（单 job，单 test target）；或用 linux + `swift test` 但 XCTest 在 linux 支持有限（需 LinuxMain.swift，复杂）——推荐 macOS。
- **flutter CI 时长**：Flutter SDK setup 慢（~2min）。判断点：可缓存 SDK；或仅 PR 跑（push 不跑）减成本。
- **测试不覆盖 UI**：UI 仍靠目视（2.1/2.2/2.3 风险延续）。判断点：2.6.0 仅逻辑层兜底；UI 测试留后续（golden test 或 e2e）。
- **3.0.0 重构会删被测代码**：2.6.0 测的 `serializeCaptchaData`/客户端生成逻辑，3.0.0 会删/改。**判断点**：测试本身在 3.0.0 须同步更新（删测客户端生成的用例，加测后端 fetch/verify）。2.6.0 测试是 3.0.0 重构的起点，非终点。
- **native 三端测试框架差异**：flutter test / JUnit / XCTest 语法不同，断言逻辑对齐（同一 serializeCaptchaData 契约）。
