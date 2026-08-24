# captcha-pro 2.6.0 — native 单测基建 + CI 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 flutter/android/ios 三端建立单测基建（i18n 回退链 + serializeCaptchaData + URL/签名），CI（build.yml）接入三端 test job，为 3.0.0 major 重构提供回归网。无 API 破坏、无功能代码改动。

**Architecture:** 三端各用原生测试框架（flutter test / JUnit 4 / XCTest），测纯逻辑模块（i18n + backend/CaptchaGenerator）。ios 已有 placeholder + testTarget，替换实质测试；flutter/android 新建 test 目录。CI 在现有 build.yml 加 3 个 test job。

**Tech Stack:** Dart/flutter_test、Kotlin/JUnit4、Swift/XCTest、GitHub Actions。

**Design spec:** `docs/superpowers/specs/2026-08-11-captcha-pro-2.6.0-native-tests-design.md`（三端方案 §4、CI §4.4、风险 §6 见此）。

## Global Constraints

- **不改功能代码**：仅加测试文件 + 可能补 `@VisibleForTesting` 注解；不改 CaptchaGenerator/i18n 逻辑。
- **测纯逻辑**：i18n 回退链、serializeCaptchaData（无 timestamp）、URL/签名。不测 UI。
- **跨端契约对齐**：serializeCaptchaData 无 timestamp、字段集 `{captchaId, type, target}` 是三端共同断言（与 core `packages/core/test/` 基线一致）。
- **node**：JS 侧构建用 node 18（`fnm use`）。
- **CI runner**：ios 用 macOS（ubuntu 不支持 XCTest）；android/flutter 用 ubuntu。

## 现状审计（已确认，勿重复）

| 端 | 测试目录 | 现状 |
|---|---|---|
| flutter | 无 | 零测试；可测 `lib/src/core/i18n.dart` + `backend.dart` |
| android | 无 | 零测试；可测 `core/CaptchaGenerator.kt` + `Types.kt`（LocaleMessages） |
| ios | `Tests/CaptchaProTests/` | placeholder（`XCTAssertTrue(true)`）；可测 `Core/CaptchaGenerator.swift` + `Types.swift` |
| CI | `build.yml` | JS build+test + SonarCloud；native 未接入 |

> core JS 基线：`packages/core/test/` 8 文件，`vitest run`。

---

### Task 1: flutter test 基建

**Files:**
- Create: `packages/flutter/test/i18n_test.dart`
- Create: `packages/flutter/test/backend_test.dart`

**Interfaces:** flutter test 框架（dart test）。

- [ ] **Step 1: 确认 2.4/2.5 i18n 落地状态（语言数决定断言）**

Run:
```bash
grep -oE "zh-CN|zh-TW|en-US|fr-FR|de-DE|es-ES|ja-JP|ko-KR|ar-SA" packages/flutter/lib/src/core/i18n.dart | sort -u | wc -l
```
记录语言数 L（2/6/9 视前序版本落地），断言键数 = L × 14(或15)。

- [ ] **Step 2: 新建 `i18n_test.dart`**

```dart
import 'package:test/test.dart';
import 'package:captcha_pro_flutter/src/core/i18n.dart';

void main() {
  test('getLocaleMessage returns correct value for zh-CN', () {
    expect(getLocaleMessage('zh-CN', 'loading'), '加载中...');
  });
  test('getLocaleMessage fallback to defaultLocale for unknown locale', () {
    expect(getLocaleMessage('xx-XX', 'loading'), '加载中...'); // 回退 zh-CN
  });
  test('getLocaleMessage fallback to key for unknown key', () {
    expect(getLocaleMessage('zh-CN', 'nonexistent_key'), 'nonexistent_key');
  });
  // 每语言 × 关键键 断言（视 L）
}
```

- [ ] **Step 3: 新建 `backend_test.dart`**

```dart
import 'package:test/test.dart';
import 'package:captcha_pro_flutter/src/core/backend.dart';

void main() {
  test('serializeCaptchaData has no timestamp', () {
    final data = serializeCaptchaData(captchaId: 'cap_1', type: 'slider', target: [100]);
    final json = data; // 假设返回 Map 或 JSON 字符串
    expect(json, isNot(contains('timestamp')));
    expect(json, contains('captchaId'));
    expect(json, contains('type'));
    expect(json, contains('target'));
  });
  // URL 构建 / 签名 断言（若 backend.dart 暴露）
}
```
> Step 3 须先 Read `backend.dart` 确认 `serializeCaptchaData` 签名（返回 Map/JSON/object）与是否暴露 `buildUrl`/`generateSignature`。

- [ ] **Step 4: 跑测试**

Run:
```bash
cd packages/flutter && flutter test 2>&1 | tail -5
```
Expected: 全绿。

- [ ] **Step 5: 提交**

```bash
git add packages/flutter/test
git commit -m "test(flutter): add i18n + backend unit tests"
```

---

### Task 2: android JUnit 基建

**Files:**
- Create: `packages/android/captcha-sdk/src/test/java/com/captcha/pro/core/CaptchaGeneratorTest.kt`
- Create: `packages/android/captcha-sdk/src/test/java/com/captcha/pro/core/LocaleMessagesTest.kt`
- Modify（若需）: `packages/android/captcha-sdk/build.gradle`（test 依赖 JUnit4）

**Interfaces:** JUnit 4，Gradle `test` task（JVM 单测）。

- [ ] **Step 1: 确认 CaptchaGenerator/Types 是纯 Kotlin（不依赖 android.*）**

Run:
```bash
grep -n "^import" packages/android/captcha-sdk/src/main/java/com/captcha/pro/core/CaptchaGenerator.kt packages/android/captcha-sdk/src/main/java/com/captcha/pro/core/Types.kt | grep -i "android\." || echo "OK: 纯 Kotlin"
```
Expected: `OK: 纯 Kotlin`（无 `android.*` import）→ JVM 单测可直接跑。若有 `android.*` → 判断点：用 Robolectric 或抽纯函数（spec §6）。

- [ ] **Step 2: build.gradle 加 JUnit4 依赖**

`captcha-sdk/build.gradle`（`dependencies` 块加）：
```gradle
testImplementation 'junit:junit:4.13.2'
```
（若 `testImplementation` 已配则跳过。）

- [ ] **Step 3: 新建 `CaptchaGeneratorTest.kt`**

```kotlin
package com.captcha.pro.core
import org.junit.Test
import org.junit.Assert.*

class CaptchaGeneratorTest {
    @Test
    fun serializeCaptchaData_hasNoTimestamp() {
        val json = serializeCaptchaData(captchaId = "cap_1", type = "slider", target = listOf(100))
        assertFalse(json.contains("timestamp"))
        assertTrue(json.contains("captchaId"))
        assertTrue(json.contains("type"))
        assertTrue(json.contains("target"))
    }
}
```
> 先 Read `CaptchaGenerator.kt` 确认 `serializeCaptchaData` 签名（参数/返回类型）。

- [ ] **Step 4: 新建 `LocaleMessagesTest.kt`**

```kotlin
package com.captcha.pro.core
import org.junit.Test
import org.junit.Assert.*

class LocaleMessagesTest {
    @Test
    fun get_returnsCorrectValue() {
        assertEquals("加载中...", LocaleMessages.get(CaptchaLocale.ZH_CN, "loading"))
    }
    @Test
    fun get_fallbackForUnknownLocale() {
        // unknown locale → 回退（视 from(code) 逻辑）
    }
}
```

- [ ] **Step 5: 跑测试**

Run:
```bash
cd packages/android && ./gradlew :captcha-sdk:test 2>&1 | tail -5
```
Expected: BUILD SUCCESSFUL + 测试全绿。

- [ ] **Step 6: 提交**

```bash
git add packages/android/captcha-sdk/src/test packages/android/captcha-sdk/build.gradle
git commit -m "test(android): add CaptchaGenerator + LocaleMessages unit tests (JUnit4)"
```

---

### Task 3: ios XCTest 实质测试（替换 placeholder）

**Files:**
- Modify: `packages/ios/Tests/CaptchaProTests/CaptchaProTests.swift`（替换 placeholder）
- Create: `packages/ios/Tests/CaptchaProTests/CaptchaGeneratorTests.swift`
- Create: `packages/ios/Tests/CaptchaProTests/LocaleMessagesTests.swift`

**Interfaces:** XCTest（Package.swift testTarget 已有）。

- [ ] **Step 1: Read CaptchaGenerator.swift 确认 serialize 签名**

Run:
```bash
grep -n "func serialize\|static func" packages/ios/Sources/Core/CaptchaGenerator.swift | head
```

- [ ] **Step 2: 新建 `CaptchaGeneratorTests.swift`**

```swift
import XCTest
@testable import CaptchaPro

final class CaptchaGeneratorTests: XCTestCase {
    func testSerializeHasNoTimestamp() {
        // 视 serialize 签名调用，断言产物无 timestamp、含 captchaId/type/target
    }
}
```

- [ ] **Step 3: 新建 `LocaleMessagesTests.swift`**

```swift
import XCTest
@testable import CaptchaPro

final class LocaleMessagesTests: XCTestCase {
    func testGetReturnsCorrectValue() {
        XCTAssertEqual(LocaleMessages.get(.zhCN, key: "loading"), "加载中...")
    }
    func testGetFallback() {
        // 回退链断言
    }
}
```

- [ ] **Step 4: 删除 placeholder（CaptchaProTests.swift 的 testPlaceholder）**

`CaptchaProTests.swift` 移除 `XCTAssertTrue(true)` placeholder（或整个文件删除，由新测试文件替代）。

- [ ] **Step 5: 跑测试**

Run:
```bash
cd packages/ios && swift test 2>&1 | tail -5
```
Expected: 编译 + 测试全绿。

- [ ] **Step 6: 提交**

```bash
git add packages/ios/Tests
git commit -m "test(ios): replace placeholder with CaptchaGenerator + LocaleMessages tests"
```

---

### Task 4: CI 接入（build.yml）

**Files:**
- Modify: `.github/workflows/build.yml`

**Interfaces:** 3 个新 test job（flutter/android/ios）。

- [ ] **Step 1: flutter-test job**

```yaml
  flutter-test:
    name: Flutter Test
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v4
      - uses: subosito/flutter-action@v2
        with:
          channel: stable
          cache: true
      - run: cd packages/flutter && flutter pub get && flutter test
```

- [ ] **Step 2: android-test job**

```yaml
  android-test:
    name: Android Test
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: 17
      - run: cd packages/android && ./gradlew :captcha-sdk:test :captcha-compose:test
```

- [ ] **Step 3: ios-test job（macOS runner）**

```yaml
  ios-test:
    name: iOS Test
    runs-on: macos-latest
    needs: build
    steps:
      - uses: actions/checkout@v4
      - run: cd packages/ios && swift test
```

- [ ] **Step 4: 验证 CI（push 后看 Actions）**

push 分支后 GitHub Actions：build + flutter-test + android-test + ios-test 四 job 全绿。
（本地无法直接验证 CI，须 push 触发；或用 `act` 本地模拟。）

- [ ] **Step 5: 提交**

```bash
git add .github/workflows/build.yml
git commit -m "ci: add flutter/android/ios test jobs to build workflow"
```

---

### Task 5: 版本 bump + changeset + CHANGELOG

**Files:**
- Create: `.changeset/captcha-pro-2.6.0.md`
- Modify: 14 包版本源 + root `package.json` + `CHANGELOG.md`

- [ ] **Step 1: changeset + 应用** — `.changeset/captcha-pro-2.6.0.md`：11 JS 包 `minor`。`pnpm changeset version`。
- [ ] **Step 2: native 版本 → 2.6.0** — flutter pubspec / android versionName / ios Package.swift + podspec。
- [ ] **Step 3: root package.json + CHANGELOG** — `"version": "2.6.0"`；CHANGELOG 顶部 `[2.6.0]` 条目（native 单测基建 + CI 接入）。
- [ ] **Step 4: 校验 + 提交**

```bash
grep -rn "2.6.0" package.json packages/flutter/pubspec.yaml packages/ios/Package.swift packages/android/captcha-sdk/build.gradle packages/android/captcha-compose/build.gradle
git add -A && git commit -m "chore: bump all packages to 2.6.0 + changelog"
```

---

### Task 6: 全端测试与回归验证

- [ ] **Step 1: JS 回归** — `fnm use 18 && pnpm turbo build && pnpm turbo test`，全绿（core 未改，零回归）。
- [ ] **Step 2: flutter test** — `cd packages/flutter && flutter test 2>&1 | tail -3`。
- [ ] **Step 3: android test** — `./gradlew :captcha-sdk:test :captcha-compose:test 2>&1 | tail -3`。
- [ ] **Step 4: ios test** — `swift test 2>&1 | tail -3`。
- [ ] **Step 5: 测试文件 grep 终检**:
```bash
echo "== flutter ==" && find packages/flutter/test -name "*_test.dart" | wc -l
echo "== android ==" && find packages/android -path "*/src/test/*" -name "*Test.kt" | grep -v "/build/" | wc -l
echo "== ios ==" && find packages/ios/Tests -name "*Tests.swift" | wc -l
echo "== ios placeholder 清除 ==" && grep -c "XCTAssertTrue(true)" packages/ios/Tests/CaptchaProTests/*.swift || echo "0（已清除）"
```
Expected: flutter ≥2、android ≥2、ios ≥2；placeholder = 0。
- [ ] **Step 6: CI 验证（push 后）** — GitHub Actions 四 test job 全绿。
- [ ] **Step 7: 提交（若有修复）**

```bash
git add -A && git commit -m "chore: verify 2.6.0 native tests green across flutter/android/ios + CI"
```

---

## 发版

Task 1-6 完成、三端测试本地 + CI 全绿、grep 终检通过后：
- `git tag v2.6.0`
- `pnpm pub`（JS 包，`--no-git-checks`）
- native 按各平台渠道发布

## 风险

- **android CaptchaGenerator 依赖 android.* 框架**：Task 2 Step 1 grep 确认。若依赖，用 Robolectric 或抽纯 Kotlin 函数（`@VisibleForTesting`）。spec §6 判断点。
- **ios CI macOS runner 成本**：macOS 分钟贵 ~3×。单 job 可接受；或 linux + `swift test`（XCTest linux 支持有限，复杂）——推荐 macOS。
- **flutter CI 时长**：Flutter SDK setup ~2min。可缓存或仅 PR 跑减成本。
- **3.0.0 会删被测代码**：2.6.0 测的客户端生成逻辑，3.0.0 重构须同步更新测试。2.6.0 测试是 3.0.0 起点非终点。
- **测试不覆盖 UI**：UI 仍目视（2.1/2.2/2.3 风险延续）。UI 测试留后续。
- **native 三端框架差异**：flutter test / JUnit / XCTest 语法不同，断言逻辑对齐（serializeCaptchaData 无 timestamp 跨端契约）。
- **serializeCaptchaData 签名**：Task 1/2/3 各端 Step 须先 Read 源码确认函数签名（参数/返回类型），断言才能正确。spec 假设返回 Map/JSON，实际可能返回 object。
