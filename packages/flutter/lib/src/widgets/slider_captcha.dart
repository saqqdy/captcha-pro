import 'package:flutter/material.dart';

import '../core/backend.dart';
import '../core/i18n.dart';

/// Slider captcha widget (backend-driven).
///
/// Mirrors packages/taro-vue slider-captcha.vue: fetches the captcha image
/// from the backend, tracks the drag offset, and verifies `[sliderX]` on
/// drag end. No client-side precision tolerance.
class SliderCaptcha extends StatefulWidget {
  final double width;
  final double height;
  final double sliderWidth;
  final double sliderHeight;
  final bool showRefresh;
  final BackendConfig backend;
  final String locale;

  /// Success callback; receives the verify result data (with `verifiedAt`).
  final void Function(BackendVerifyData? data)? onSuccess;
  final VoidCallback? onFail;

  /// Fired after an auto-refresh triggered by a failed verify.
  final VoidCallback? onRefresh;
  final void Function(Object error)? onError;

  const SliderCaptcha({
    super.key,
    this.width = 300,
    this.height = 170,
    this.sliderWidth = 42,
    this.sliderHeight = 42,
    this.showRefresh = true,
    required this.backend,
    this.locale = defaultLocale,
    this.onSuccess,
    this.onFail,
    this.onRefresh,
    this.onError,
  });

  @override
  State<SliderCaptcha> createState() => _SliderCaptchaState();
}

class _SliderCaptchaState extends State<SliderCaptcha> {
  static const int _failRefreshDelay = 800;

  String _bgImage = '';
  String _sliderImage = '';
  double _sliderY = 0;
  double _sliderX = 0;
  String _captchaId = '';
  String _status = ''; // '' | 'success' | 'fail'
  bool _loading = false;
  String _errorMsg = '';
  bool _isDragging = false;

  @override
  void initState() {
    super.initState();
    _refresh();
  }

  String t(String key) => getLocaleMessage(widget.locale, key);

  Future<void> _refresh() async {
    setState(() {
      _loading = true;
      _errorMsg = '';
      _status = '';
      _sliderX = 0;
    });
    try {
      final res = await fetchCaptcha(
        widget.backend,
        BackendCaptchaParams(
          type: 'slider',
          width: widget.width.toInt(),
          height: widget.height.toInt(),
          sliderWidth: widget.sliderWidth.toInt(),
          sliderHeight: widget.sliderHeight.toInt(),
        ),
      );
      if (!res.success || res.data == null) {
        throw Exception(res.message ?? 'Failed to get captcha');
      }
      final d = res.data!;
      if (!mounted) return;
      setState(() {
        _captchaId = d.captchaId;
        _bgImage = d.bgImage;
        _sliderImage = d.sliderImage ?? '';
        _sliderY = d.sliderY ?? 0;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _errorMsg = e.toString());
      widget.onError?.call(e);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _onDragStart(DragStartDetails _) {
    if (_status.isNotEmpty || _loading) return;
    setState(() => _isDragging = true);
  }

  void _onDragUpdate(DragUpdateDetails d) {
    if (!_isDragging) return;
    final maxX = widget.width - widget.sliderWidth;
    setState(() {
      _sliderX = (_sliderX + d.delta.dx).clamp(0.0, maxX);
    });
  }

  Future<void> _onDragEnd(DragEndDetails _) async {
    if (!_isDragging) return;
    setState(() => _isDragging = false);
    if (_status.isNotEmpty || _loading || _captchaId.isEmpty) return;

    setState(() => _loading = true);
    try {
      final res = await verifyCaptcha(
        widget.backend,
        BackendVerifyRequest(
          captchaId: _captchaId,
          type: 'slider',
          target: [_sliderX],
        ),
      );
      if (res.success) {
        setState(() => _status = 'success');
        widget.onSuccess?.call(res.data);
      } else {
        setState(() => _status = 'fail');
        widget.onFail?.call();
        _scheduleReload();
      }
    } catch (e) {
      widget.onError?.call(e);
      if (!mounted) return;
      setState(() => _status = 'fail');
      _scheduleReload();
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _scheduleReload() {
    Future.delayed(const Duration(milliseconds: _failRefreshDelay), () {
      _refresh();
      widget.onRefresh?.call();
    });
  }

  @override
  Widget build(BuildContext context) {
    const barHeight = 40.0;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildCaptchaArea(),
          const SizedBox(height: 5),
          _buildSliderBar(barHeight),
        ],
      ),
    );
  }

  Widget _buildCaptchaArea() {
    return Container(
      width: widget.width,
      height: widget.height,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(8),
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF667EEA), Color(0xFF764BA2)],
        ),
        boxShadow: const [
          BoxShadow(
            color: Color(0x26000000),
            offset: Offset(0, 4),
            blurRadius: 16,
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(8),
        child: Stack(
          fit: StackFit.expand,
          children: [
            if (_bgImage.isNotEmpty)
              Positioned.fill(
                child: Image(
                  image: resolveCaptchaImage(_bgImage),
                  fit: BoxFit.fill,
                ),
              )
            else
              Center(
                child: Semantics(
                  label: t('loading'),
                  child: Text(
                    _errorMsg.isNotEmpty ? _errorMsg : t('loading'),
                    style: const TextStyle(color: Colors.white, fontSize: 14),
                  ),
                ),
              ),
            if (_sliderImage.isNotEmpty && !_loading)
              Positioned(
                left: _sliderX,
                top: _sliderY,
                child: Image(
                  image: resolveCaptchaImage(_sliderImage),
                  width: widget.sliderWidth,
                  height: widget.sliderHeight,
                  fit: BoxFit.fill,
                ),
              ),
            if (widget.showRefresh && !_loading)
              Positioned(
                top: 8,
                right: 8,
                child: _buildRefreshButton(),
              ),
            if (_status.isNotEmpty) _buildStatusOverlay(),
          ],
        ),
      ),
    );
  }

  Widget _buildRefreshButton() {
    return Semantics(
      button: true,
      label: t('refresh'),
      child: SizedBox(
        width: 44,
        height: 44,
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: _refresh,
          child: Center(
            child: Container(
              width: 28,
              height: 28,
              decoration: BoxDecoration(
                color: const Color(0xE6FFFFFF),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Center(
                child: Text(
                  '⟳',
                  style: TextStyle(
                    color: Color(0xFF666666),
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatusOverlay() {
    final success = _status == 'success';
    return Positioned.fill(
      child: Semantics(
        liveRegion: true,
        child: TweenAnimationBuilder<double>(
          tween: Tween(begin: 0.0, end: 1.0),
        duration: const Duration(milliseconds: 200),
        builder: (context, v, child) {
          return Opacity(
            opacity: v,
            child: Transform.scale(scale: 0.9 + 0.1 * v, child: child),
          );
        },
        child: Container(
          color: const Color(0xBFFFFFFF),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: success
                      ? const Color(0xD952C41A)
                      : const Color(0xD9FF4D4F),
                ),
                child: Center(
                  child: Text(
                    success ? '✓' : '✕',
                    style: const TextStyle(color: Colors.white, fontSize: 18),
                  ),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                success ? t('slider_success') : t('slider_fail'),
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: success
                      ? const Color(0xFF389E0D)
                      : const Color(0xFFCF1322),
                ),
              ),
            ],
          ),
        ),
      ),
      ),
    );
  }

  Widget _buildSliderBar(double barHeight) {
    return Container(
      width: widget.width,
      height: barHeight,
      decoration: BoxDecoration(
        color: const Color(0xFFF7F9FA),
        borderRadius: BorderRadius.circular(8),
      ),
      child: GestureDetector(
        onHorizontalDragStart: _onDragStart,
        onHorizontalDragUpdate: _onDragUpdate,
        onHorizontalDragEnd: _onDragEnd,
        child: Stack(
          fit: StackFit.expand,
          children: [
            Center(
              child: Text(
                t('slider_hint'),
                style: const TextStyle(color: Color(0xFF666666), fontSize: 14),
              ),
            ),
            Positioned(
              left: _sliderX,
              top: 0,
              bottom: 0,
              child: Semantics(
                button: true,
                label: t('slider_hint'),
                value: '${_sliderX.toInt()}',
                child: Container(
                  width: widget.sliderWidth,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    border: Border.all(color: const Color(0xFFE1E4E8)),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Center(
                    child: Text(
                      '→',
                      style: const TextStyle(
                        color: Color(0xFF1991FA),
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
