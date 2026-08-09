# captcha_pro

Flutter package for Captcha Pro, providing backend-driven captcha widgets
(slider + click) with built-in i18n.

## Installation

Add to your `pubspec.yaml`:

```yaml
dependencies:
  captcha_pro: ^2.0.0
```

## Features

- **Slider Captcha** — drag the slider to complete puzzle verification.
- **Click Captcha** — click the characters in the displayed order.
- **Popup Captcha** — modal overlay wrapping either captcha type.
- **Backend Verification** — images and verification come from your backend;
  no client-side generation or precision tolerance.
- **i18n** — `zh-CN` and `en-US` locales included.
- **Cross-platform** — iOS, Android.

## Usage

### Backend configuration

All widgets require a [BackendConfig].

```dart
import 'package:captcha_pro/captcha_pro.dart';

final backend = BackendConfig(
  getCaptcha: 'https://your-api.com/captcha/get',
  verify: 'https://your-api.com/captcha/verify',
  headers: {'Authorization': 'Bearer token'},
  timeout: 10000,
);
```

- `getCaptcha`: `GET ?type=&width=&height=&sliderWidth=&sliderHeight=&clickCount=`
  → `{success, data:{captchaId, type, bgImage, sliderImage?, sliderY?, clickTexts?, clickCharImages?, width, height, expiresAt}}`
- `verify`: `POST {captchaId, type, target}` (no timestamp)
  → `{success, message?, data?:{verifiedAt}}`
  - slider `target` is `[sliderX]`; click `target` is `[{x, y}, ...]`.
- Image sources may be an HTTP(S) URL, a `data:` URL, or raw base64.

### Slider Captcha

```dart
SliderCaptcha(
  backend: backend,
  width: 300,
  height: 170,
  sliderWidth: 42,
  sliderHeight: 42,
  locale: 'zh-CN',
  onSuccess: (verifiedAt) => print('Passed! @ $verifiedAt'),
  onFail: () => print('Failed'),
  onError: (err) => print('Error: $err'),
)
```

### Click Captcha

```dart
ClickCaptcha(
  backend: backend,
  width: 300,
  height: 170,
  locale: 'en-US',
  onSuccess: (verifiedAt) => print('Passed! @ $verifiedAt'),
)
```

The required click count defaults to 3 and is inferred from the backend
`clickTexts` length.

### Popup Captcha

```dart
PopupCaptcha.show(
  context,
  type: 'slider', // or 'click'
  backend: backend,
  locale: 'zh-CN',
  title: '',            // empty falls back to the localized popup title
  autoClose: true,
  closeDelay: 500,
  sliderOptions: SliderCaptchaOptions(width: 300, height: 170),
  onSuccess: (verifiedAt) => print('Passed! @ $verifiedAt'),
  onClose: () => print('Closed'),
);
```

The popup renders a custom card overlay (not a system dialog) with a
semi-transparent mask, a close button, and the embedded captcha. On success it
auto-closes after `closeDelay` (500ms); on fail the embedded captcha
auto-refreshes after 800ms.

## Components

### BackendConfig

| Field        | Type                                         | Default | Description                          |
|--------------|----------------------------------------------|---------|--------------------------------------|
| getCaptcha   | `String` \| `FetchCaptchaFn`                | -       | Required, URL or custom fetch function |
| verify       | `String` \| `VerifyCaptchaFn`               | -       | Required, URL or custom verify function |
| headers      | `Map<String, String>?`                       | -       | Optional request headers             |
| timeout      | `int?`                                       | 10000   | Timeout in milliseconds              |

### SliderCaptcha

| Parameter      | Type                              | Default  | Description                          |
|----------------|-----------------------------------|----------|--------------------------------------|
| backend        | `BackendConfig`                   | -        | **Required**                        |
| width          | `double`                          | 300      | Captcha area width                   |
| height         | `double`                          | 170      | Captcha area height                  |
| sliderWidth    | `double`                          | 42       | Slider piece width                   |
| sliderHeight   | `double`                          | 42       | Slider piece height                  |
| showRefresh    | `bool`                            | true     | Show the refresh button              |
| locale         | `String`                          | 'zh-CN'  | Locale ('zh-CN' or 'en-US')          |
| onSuccess      | `void Function(int)?`            | -        | Success callback (`verifiedAt`)     |
| onFail         | `VoidCallback?`                  | -        | Fail callback                       |
| onRefresh      | `VoidCallback?`                   | -        | Fired after an auto-refresh on fail |
| onError        | `void Function(Object)?`         | -        | Error callback                      |

### ClickCaptcha

Same as SliderCaptcha but without `sliderWidth`/`sliderHeight`. The click
count is inferred from the backend response.

### PopupCaptcha

| Parameter      | Type                              | Default  | Description                          |
|----------------|-----------------------------------|----------|--------------------------------------|
| backend        | `BackendConfig`                   | -        | **Required**                        |
| type           | `String`                          | 'slider' | `'slider'` or `'click'`             |
| title          | `String`                          | ''       | Custom title (empty → localized)     |
| maskClosable   | `bool`                            | true     | Tap mask to close                    |
| showClose      | `bool`                            | true     | Show the × close button              |
| autoClose      | `bool`                            | true     | Auto-close on success                |
| closeDelay     | `int`                             | 500      | Auto-close delay in ms               |
| sliderOptions  | `SliderCaptchaOptions`            | -        | Slider visual options                |
| clickOptions   | `ClickCaptchaOptions`             | -        | Click visual options                 |
| locale         | `String`                          | 'zh-CN'  | Locale                              |
| onSuccess      | `void Function(int)?`            | -        | Success callback (`verifiedAt`)     |
| onFail         | `VoidCallback?`                  | -        | Fail callback (from embedded captcha) |
| onOpen         | `VoidCallback?`                   | -        | Fired when the popup opens          |
| onClose        | `VoidCallback?`                   | -        | Fired when the popup closes          |

Show it via `PopupCaptcha.show(context, ...)`.

## License

MIT
