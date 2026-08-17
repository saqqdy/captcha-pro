# Accessibility

captcha-pro targets **WCAG 2.2 Level AA** conformance for the captcha interaction flow — fetching an image, interacting (drag / click), verifying, and receiving feedback — across every platform: web (Vue / Vue 2 / React), the six mini-program targets, and native (Flutter / Android / iOS).

Every interactive element exposes an accessible name and role; state changes (success / failure) are announced via a live region; touch targets meet platform minimums; and the web targets are fully keyboard operable.

## Conformance Scope

Conformance covers the **captcha interaction flow only**:

- Fetch captcha → interact → verify → feedback.
- Refresh, close, slider thumb, click markers, and status overlays.
- Per-platform semantics: `aria-label` / `role` (web & mini-programs), `Semantics` (Flutter), `Modifier.semantics` / `contentDescription` (Android), `accessibilityLabel` / `accessibilityTraits` (iOS).

Out of scope for 2.2.0: a high-contrast / dark theme and a complete focus trap for popups (the popup uses `role="dialog"` + initial focus only; a full trap is planned for a later release).

## Keyboard Support (Web)

The Vue, Vue 2, and React wrappers are fully keyboard operable.

| Key | Action |
| --- | --- |
| `Tab` | Move focus in order: refresh → slider thumb / click area → close (popup) |
| `Enter` / `Space` | Activate the focused control (refresh, submit, click center) |
| `←` / `→` | Adjust the slider thumb (web slider) |
| `Enter` | Submit the slider after adjusting |

A visible focus ring (`outline: 2px solid #1991fa; outline-offset: 2px`) is shown on `:focus-visible` for `.refresh-btn`, `.slider-thumb`, `.popup-close`, and `.click-marker`.

## Screen Reader Support

| Platform | Screen reader | Semantics used |
| --- | --- | --- |
| Web (Vue/Vue2/React) | VoiceOver / NVDA / Narrator | `aria-label`, `role`, `aria-live`, `aria-valuenow/min/max` |
| Mini-programs | Platform reader (WeChat/Taro) | `aria-label` / accessible attributes where supported |
| Flutter | TalkBack / VoiceOver | `Semantics(button/slider:, label:, value:, liveRegion:)` |
| Android | TalkBack | `Modifier.semantics { role, contentDescription, liveRegion }` / `contentDescription` |
| iOS | VoiceOver | `accessibilityLabel`, `accessibilityTraits`, `accessibilityValue`, `UIAccessibility.post(.announcement)` |

Status changes (success / failure) are announced politely without stealing focus:

- Web: `aria-live="polite" aria-atomic="true"` on the status overlay.
- Flutter: `Semantics(liveRegion: true)`.
- Android: `LiveRegionMode.Polite` / `ViewCompat.announceForAccessibility`.
- iOS: `UIAccessibility.post(notification: .announcement, ...)`.

## Touch Targets

Refresh (and other small) controls keep their visual size but expose a larger transparent hit area so the tappable region meets each platform's minimum:

| Platform | Minimum | Visual |
| --- | --- | --- |
| Web | 44 × 44 CSS px | 28 px icon, 44 px transparent `::before` / padding |
| iOS | 44 × 44 pt | 28 pt icon, 44 pt transparent overlay |
| Android | 48 × 48 dp | 28 dp icon, 48 dp `TouchDelegate` / `Modifier.size` |
| Flutter | 44 × 44 pt | 28 px icon, 44 × 44 `SizedBox` (`HitTestBehavior.opaque`) |

Visual sizes and colors are unchanged from 2.1.0; only the transparent hit area is enlarged.

## Internationalization

Accessibility labels reuse the existing i18n keys (`slider_hint`, `click_prompt`, `popup_close`, `popup_title`, `slider_success`, `slider_fail`, `click_success`, `click_fail`, `loading`). 2.2.0 adds one key, `refresh` (`刷新` / `Refresh`), giving each icon button a localized accessible name. See [Internationalization](./guide/i18n.md).

## Known Deviations

- **`slider_hint` contrast**: the hint text was `#999999` on a light background (≈ 2.85:1, below the 4.5:1 minimum). It is now `#666666` (≈ 5.7:1).
- **iOS close-button × contrast**: the popup close-button × was `#999999` (white 0.6) on a white header (≈ 2.85:1); it is now `#666666` (white 0.4, ≈ 5.44:1) in both the SwiftUI (`PopupCaptcha`) and UIKit (`PopupCaptchaView`) paradigms.
- These are the only explicit overrides of the 2.1.0 style token table, applied for contrast compliance (WCAG 1.4.3).
- **Popup focus trap**: only `role="dialog" aria-modal="true"` + initial focus move is implemented; a full focus trap is deferred.

## Integrator Checklist

To verify accessibility in your integration:

- **Web**: run an axe-core / Lighthouse a11y audit on a live example (≥ 95, no critical violations); manually test the keyboard order (`Tab`, `Enter`, `←`/`→`).
- **Flutter**: enable TalkBack / VoiceOver and confirm the refresh button, slider, and status are announced by name (not as raw glyphs like `⟳ → ✓ ✕`).
- **Android**: enable TalkBack and verify the same; check `contentDescription` is present.
- **iOS**: enable VoiceOver or Xcode Accessibility Inspector and verify labels/traits with no warnings.
- **Contract check**: every platform's accessibility attribute count is > 0 — grep for `aria-label|role=`, `Semantics`, `contentDescription|semantics`, `accessibilityLabel`.

To report an accessibility issue, open an issue with the platform, screen reader, and the element whose announcement or operability is incorrect.
