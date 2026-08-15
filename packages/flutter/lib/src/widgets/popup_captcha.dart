import 'package:flutter/material.dart';

import '../core/backend.dart';
import '../core/i18n.dart';
import 'click_captcha.dart';
import 'slider_captcha.dart';

/// Visual options for [SliderCaptcha] when used inside [PopupCaptcha].
///
/// Excludes [BackendConfig], [locale], and the success/fail callbacks, which
/// are provided by the popup itself.
class SliderCaptchaOptions {
  final double width;
  final double height;
  final double sliderWidth;
  final double sliderHeight;
  final bool showRefresh;
  final VoidCallback? onRefresh;
  final void Function(Object error)? onError;

  const SliderCaptchaOptions({
    this.width = 300,
    this.height = 170,
    this.sliderWidth = 42,
    this.sliderHeight = 42,
    this.showRefresh = true,
    this.onRefresh,
    this.onError,
  });
}

/// Visual options for [ClickCaptcha] when used inside [PopupCaptcha].
class ClickCaptchaOptions {
  final double width;
  final double height;
  final bool showRefresh;
  final VoidCallback? onRefresh;
  final void Function(Object error)? onError;

  const ClickCaptchaOptions({
    this.width = 300,
    this.height = 170,
    this.showRefresh = true,
    this.onRefresh,
    this.onError,
  });
}

/// Popup captcha widget using a custom card overlay (NOT showDialog).
///
/// Mirrors packages/taro-vue popup-captcha.vue: a full-screen mask
/// (rgba(0,0,0,.5)) with a centered white card (radius 12, shadow), a header
/// with a title and × close button, and the embedded slider/click captcha.
/// On success the popup auto-closes after [closeDelay] (default 500ms); on
/// fail the embedded captcha auto-refreshes after 800ms.
class PopupCaptcha extends StatefulWidget {
  /// `'slider'` or `'click'`.
  final String type;
  final String title;
  final bool maskClosable;
  final bool showClose;
  final bool autoClose;

  /// Auto-close delay in ms after success.
  final int closeDelay;
  final SliderCaptchaOptions sliderOptions;
  final ClickCaptchaOptions clickOptions;
  final BackendConfig backend;
  final String locale;
  final void Function(BackendVerifyData? data)? onSuccess;
  final VoidCallback? onFail;

  /// Fired when the popup opens.
  final VoidCallback? onOpen;

  /// Fired when the popup closes (close button, mask tap, or auto-close).
  final VoidCallback? onClose;

  const PopupCaptcha({
    super.key,
    this.type = 'slider',
    this.title = '',
    this.maskClosable = true,
    this.showClose = true,
    this.autoClose = true,
    this.closeDelay = 500,
    this.sliderOptions = const SliderCaptchaOptions(),
    this.clickOptions = const ClickCaptchaOptions(),
    required this.backend,
    this.locale = defaultLocale,
    this.onSuccess,
    this.onFail,
    this.onOpen,
    this.onClose,
  });

  /// Show the popup as a custom overlay route (not showDialog).
  ///
  /// The route is transparent and non-opaque so the mask + card are painted
  /// by this widget. Dismissal is handled by [PopupCaptcha.hide] (close
  /// button / mask tap / auto-close on success).
  static Future<void> show(
    BuildContext context, {
    String type = 'slider',
    String title = '',
    bool maskClosable = true,
    bool showClose = true,
    bool autoClose = true,
    int closeDelay = 500,
    SliderCaptchaOptions sliderOptions = const SliderCaptchaOptions(),
    ClickCaptchaOptions clickOptions = const ClickCaptchaOptions(),
    required BackendConfig backend,
    String locale = defaultLocale,
    void Function(BackendVerifyData? data)? onSuccess,
    VoidCallback? onFail,
    VoidCallback? onOpen,
    VoidCallback? onClose,
  }) {
    return Navigator.of(context).push(
      PageRouteBuilder<void>(
        opaque: false,
        barrierColor: Colors.transparent,
        barrierDismissible: false,
        pageBuilder: (ctx, anim, secAnim) => PopupCaptcha(
          type: type,
          title: title,
          maskClosable: maskClosable,
          showClose: showClose,
          autoClose: autoClose,
          closeDelay: closeDelay,
          sliderOptions: sliderOptions,
          clickOptions: clickOptions,
          backend: backend,
          locale: locale,
          onSuccess: onSuccess,
          onFail: onFail,
          onOpen: onOpen,
          onClose: onClose,
        ),
        transitionsBuilder: (ctx, anim, secAnim, child) =>
            FadeTransition(opacity: anim, child: child),
      ),
    );
  }

  @override
  State<PopupCaptcha> createState() => _PopupCaptchaState();
}

class _PopupCaptchaState extends State<PopupCaptcha> {
  @override
  void initState() {
    super.initState();
    widget.onOpen?.call();
  }

  String get _displayTitle => widget.title.isNotEmpty
      ? widget.title
      : getLocaleMessage(widget.locale, 'popup_title');

  void hide() {
    final nav = Navigator.of(context);
    if (nav.canPop()) nav.pop();
    widget.onClose?.call();
  }

  void handleSuccess(BackendVerifyData? data) {
    widget.onSuccess?.call(data);
    if (widget.autoClose) {
      Future.delayed(Duration(milliseconds: widget.closeDelay), () {
        if (mounted) hide();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox.expand(
      child: Material(
        color: Colors.transparent,
        child: Stack(
          children: [
            Positioned.fill(
              child: GestureDetector(
                onTap: () {
                  if (widget.maskClosable) hide();
                },
                child: Container(color: const Color(0x80000000)),
              ),
            ),
            Center(
              child: Container(
                constraints: const BoxConstraints(maxWidth: 320),
                margin: const EdgeInsets.symmetric(horizontal: 24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: const [
                    BoxShadow(
                      color: Color(0x33000000),
                      offset: Offset(0, 4),
                      blurRadius: 16,
                    ),
                  ],
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _buildHeader(),
                    Padding(
                      padding: const EdgeInsets.all(16),
                      child: _buildBody(),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: const BoxDecoration(
        border: Border(
          bottom: BorderSide(color: Color(0xFFEEEEEE)),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            _displayTitle,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: Color(0xFF333333),
            ),
          ),
          if (widget.showClose)
            GestureDetector(
              onTap: hide,
              child: SizedBox(
                width: 24,
                height: 24,
                child: const Center(
                  child: Text(
                    '×',
                    style: TextStyle(
                      fontSize: 20,
                      color: Color(0xFF999999),
                      height: 1.0,
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildBody() {
    final o = widget.sliderOptions;
    final c = widget.clickOptions;
    if (widget.type == 'click') {
      return ClickCaptcha(
        backend: widget.backend,
        locale: widget.locale,
        width: c.width,
        height: c.height,
        showRefresh: c.showRefresh,
        onSuccess: handleSuccess,
        onFail: widget.onFail,
        onRefresh: c.onRefresh,
        onError: c.onError,
      );
    }
    return SliderCaptcha(
      backend: widget.backend,
      locale: widget.locale,
      width: o.width,
      height: o.height,
      sliderWidth: o.sliderWidth,
      sliderHeight: o.sliderHeight,
      showRefresh: o.showRefresh,
      onSuccess: handleSuccess,
      onFail: widget.onFail,
      onRefresh: o.onRefresh,
      onError: o.onError,
    );
  }
}
