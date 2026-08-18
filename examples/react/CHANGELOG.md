# example-react

## 2.3.0

### Minor Changes

- Dark mode support across all platforms
  - Web: CSS `@media (prefers-color-scheme: dark)` media query
  - Flutter: `CaptchaColorScheme` with `MediaQuery.platformBrightness`
  - Android: `values-night/colors.xml` (View) + `isSystemInDarkTheme()` (Compose)
  - iOS: Dynamic `UIColor` providers + `@Environment(\.colorScheme)` (SwiftUI)
  - Popup focus trap for web (WCAG 2.2 compliance)
  - All dark mode text colors meet WCAG 2.2 Level AA contrast requirements (≥ 4.5:1)
  - Theme toggle UI in examples (manual override + system detection)

### Patch Changes

- Updated dependencies
  - @captcha-pro/react@2.3.0

## 2.0.3

### Patch Changes

- Updated dependencies
  - @captcha-pro/react@2.2.0

## 2.0.2

### Patch Changes

- Updated dependencies
  - @captcha-pro/react@2.1.0

## 2.0.1

### Patch Changes

- Updated dependencies
  - @captcha-pro/react@2.1.0
