import 'package:flutter/material.dart';

import '../core/backend.dart';
import '../core/i18n.dart';

/// Click captcha widget (backend-driven).
///
/// Mirrors packages/taro-vue click-captcha.vue: collects click points on the
/// background image, and when the required count (inferred from the backend
/// `clickTexts` length, default 3) is reached, verifies `[{x,y}]` with the
/// backend. No client-side precision tolerance.
class ClickCaptcha extends StatefulWidget {
  final double width;
  final double height;
  final bool showRefresh;
  final BackendConfig backend;
  final String locale;
  final void Function(BackendVerifyData? data)? onSuccess;
  final VoidCallback? onFail;
  final VoidCallback? onRefresh;
  final void Function(Object error)? onError;

  const ClickCaptcha({
    super.key,
    this.width = 300,
    this.height = 170,
    this.showRefresh = true,
    required this.backend,
    this.locale = defaultLocale,
    this.onSuccess,
    this.onFail,
    this.onRefresh,
    this.onError,
  });

  @override
  State<ClickCaptcha> createState() => _ClickCaptchaState();
}

class _ClickCaptchaState extends State<ClickCaptcha> {
  static const int _defaultClickCount = 3;
  static const int _failRefreshDelay = 800;

  final GlobalKey _areaKey = GlobalKey();

  String _bgImage = '';
  List<String> _clickTexts = [];
  List<String> _clickCharImages = [];
  String _captchaId = '';
  String _status = '';
  bool _loading = false;
  String _errorMsg = '';
  final List<Offset> _clickPoints = [];

  @override
  void initState() {
    super.initState();
    _refresh();
  }

  String t(String key) => getLocaleMessage(widget.locale, key);

  int get _maxClicks =>
      _clickTexts.isNotEmpty ? _clickTexts.length : _defaultClickCount;

  Future<void> _refresh() async {
    setState(() {
      _loading = true;
      _errorMsg = '';
      _status = '';
      _clickPoints.clear();
      _clickTexts = [];
      _clickCharImages = [];
    });
    try {
      final res = await fetchCaptcha(
        widget.backend,
        BackendCaptchaParams(
          type: 'click',
          width: widget.width.toInt(),
          height: widget.height.toInt(),
          clickCount: _defaultClickCount,
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
        _clickTexts = d.clickTexts ?? [];
        _clickCharImages = d.clickCharImages ?? [];
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _errorMsg = e.toString());
      widget.onError?.call(e);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _onTapDown(TapDownDetails details) {
    if (_status.isNotEmpty || _loading) return;
    if (_clickPoints.length >= _maxClicks) return;
    final box = _areaKey.currentContext?.findRenderObject() as RenderBox?;
    if (box == null) return;
    final local = box.globalToLocal(details.globalPosition);
    setState(() => _clickPoints.add(local));
    if (_clickPoints.length >= _maxClicks) {
      _verify();
    }
  }

  Future<void> _verify() async {
    if (_loading || _captchaId.isEmpty) return;
    setState(() => _loading = true);
    try {
      final target =
          _clickPoints.map((p) => CaptchaPoint(p.dx, p.dy)).toList();
      final res = await verifyCaptcha(
        widget.backend,
        BackendVerifyRequest(
          captchaId: _captchaId,
          type: 'click',
          target: target,
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
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildCaptchaArea(),
          const SizedBox(height: 12),
          _buildPromptBar(),
        ],
      ),
    );
  }

  Widget _buildCaptchaArea() {
    return Semantics(
      button: true,
      label: t('click_prompt'),
      value: '${_clickPoints.length}/$_maxClicks',
      child: GestureDetector(
        key: _areaKey,
        onTapDown: _onTapDown,
      child: Container(
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
                  child: Text(
                    _errorMsg.isNotEmpty ? _errorMsg : t('loading'),
                    style: const TextStyle(color: Colors.white, fontSize: 14),
                  ),
                ),
              ..._buildMarkers(),
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
      ),
      ),
    );
  }

  List<Widget> _buildMarkers() {
    final markers = <Widget>[];
    for (var i = 0; i < _clickPoints.length; i++) {
      final p = _clickPoints[i];
      markers.add(
        Positioned(
          left: p.dx,
          top: p.dy,
          child: Transform.translate(
            offset: const Offset(-12, -12),
            child: Container(
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFF1991FA),
                border: Border.all(color: Colors.white, width: 3),
              ),
              child: Center(
                child: Text(
                  '${i + 1}',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ),
        ),
      );
    }
    return markers;
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
                success ? t('click_success') : t('click_fail'),
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

  Widget _buildPromptBar() {
    return Container(
      width: widget.width,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: const Color(0xFFF7F9FA),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE8E8E8)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Flexible(
            child: Text(
              t('click_prompt'),
              style: const TextStyle(color: Color(0xFF666666), fontSize: 14),
            ),
          ),
          const SizedBox(width: 8),
          ..._buildCharCells(),
        ],
      ),
    );
  }

  List<Widget> _buildCharCells() {
    final cells = <Widget>[];
    final useImages = _clickCharImages.isNotEmpty;
    final items = useImages ? _clickCharImages : _clickTexts;
    for (var i = 0; i < items.length; i++) {
      if (i > 0) cells.add(const SizedBox(width: 6));
      final child = useImages
          ? Image(
              image: resolveCaptchaImage(items[i]),
              width: 28,
              height: 28,
              fit: BoxFit.contain,
            )
          : Text(
              items[i],
              style: const TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.w500,
              ),
            );
      cells.add(_charCell(child));
    }
    return cells;
  }

  Widget _charCell(Widget child) {
    return Container(
      width: 28,
      height: 28,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF667EEA), Color(0xFF764BA2)],
        ),
        borderRadius: BorderRadius.circular(8),
        boxShadow: const [
          BoxShadow(
            color: Color(0x4D667EEA),
            offset: Offset(0, 1),
            blurRadius: 4,
          ),
        ],
      ),
      child: Center(child: child),
    );
  }
}
