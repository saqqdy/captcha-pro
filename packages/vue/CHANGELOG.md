# @captcha-pro/vue

## 2.3.0

### Minor Changes

- Dark mode support across all platforms
  - Web: CSS `@media (prefers-color-scheme: dark)` media query
  - Flutter: `CaptchaColorScheme` with `MediaQuery.platformBrightness`
  - Android: `values-night/colors.xml` (View) + `isSystemInDarkTheme()` (Compose)
  - iOS: Dynamic `UIColor` providers + `@Environment(\.colorScheme)` (SwiftUI)
  - Popup focus trap for web (WCAG 2.2 compliance)
  - All dark mode text colors meet WCAG 2.2 Level AA contrast requirements (≥ 4.5:1)

  No API changes - follows system preference automatically.

### Patch Changes

- Updated dependencies
  - @captcha-pro/core@2.3.0

## 2.2.0

### Minor Changes

- WCAG 2.2 Level AA accessibility compliance across all platforms (aria labels, role, keyboard, live region, 44px/44pt/48dp touch targets).

### Patch Changes

- Updated dependencies
  - @captcha-pro/core@2.2.0

## 2.1.0

### Minor Changes

- Align android/ios/flutter to taro-vue functional contract; unify all packages to 2.1.0.

### Patch Changes

- Updated dependencies
  - @captcha-pro/core@2.1.0
