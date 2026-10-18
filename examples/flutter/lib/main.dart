import 'dart:io' show Platform;

import 'package:flutter/material.dart';
import 'package:captcha_pro/captcha_pro.dart';

/// Host address of the demo backend (`server/node` on :3001).
///
/// The iOS Simulator shares the host loopback, so `localhost` works there.
/// The Android emulator has its own loopback and reaches the host through the
/// `10.0.2.2` alias, so pick the host per platform instead of editing this
/// file each time you switch targets.
final String _host = Platform.isAndroid ? '10.0.2.2' : 'localhost';

final _backend = BackendConfig(
  getCaptcha: 'http://$_host:3001/api/captcha',
  verify: 'http://$_host:3001/api/captcha/verify',
);

void main() => runApp(const CaptchaProExampleApp());

class CaptchaProExampleApp extends StatelessWidget {
  const CaptchaProExampleApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      title: 'Captcha Pro Example',
      debugShowCheckedModeBanner: false,
      home: HomeScreen(),
    );
  }
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _tab = 0;
  bool _showSliderPopup = false;
  bool _showClickPopup = false;

  void _snack(String msg) {
    ScaffoldMessenger.maybeOf(context)?.showSnackBar(
      SnackBar(content: Text(msg), duration: const Duration(seconds: 2)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Captcha Pro · Flutter 示例')),
      body: IndexedStack(
        index: _tab,
        children: [
          SliderTab(backend: _backend, onResult: _snack),
          ClickTab(backend: _backend, onResult: _snack),
          PopupTab(
            showSliderPopup: _showSliderPopup,
            showClickPopup: _showClickPopup,
            backend: _backend,
            onResult: _snack,
          ),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tab,
        onDestinationSelected: (i) => setState(() {
          _tab = i;
          _showSliderPopup = false;
          _showClickPopup = false;
        }),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.tune),
            label: 'Slider',
          ),
          NavigationDestination(
            icon: Icon(Icons.touch_app_outlined),
            label: 'Click',
          ),
          NavigationDestination(
            icon: Icon(Icons.picture_in_picture_alt_outlined),
            label: 'Popup',
          ),
        ],
      ),
    );
  }
}

class SliderTab extends StatelessWidget {
  final BackendConfig backend;
  final void Function(String) onResult;
  const SliderTab({required this.backend, required this.onResult, super.key});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text('SliderCaptcha', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 16),
          SliderCaptcha(
            backend: backend,
            locale: 'zh-CN',
            onSuccess: (_) => onResult('✓ 验证成功'),
            onFail: () => onResult('✕ 验证失败'),
            onError: (e) => onResult('错误：$e'),
          ),
        ],
      ),
    );
  }
}

class ClickTab extends StatelessWidget {
  final BackendConfig backend;
  final void Function(String) onResult;
  const ClickTab({required this.backend, required this.onResult, super.key});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text('ClickCaptcha', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 16),
          ClickCaptcha(
            backend: backend,
            locale: 'zh-CN',
            onSuccess: (_) => onResult('✓ 验证成功'),
            onFail: () => onResult('✕ 验证失败'),
            onError: (e) => onResult('错误：$e'),
          ),
        ],
      ),
    );
  }
}

class PopupTab extends StatelessWidget {
  final bool showSliderPopup;
  final bool showClickPopup;
  final BackendConfig backend;
  final void Function(String) onResult;
  const PopupTab({
    required this.showSliderPopup,
    required this.showClickPopup,
    required this.backend,
    required this.onResult,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text('PopupCaptcha', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 24),
          FilledButton.icon(
            icon: const Icon(Icons.tune),
            label: const Text('弹出滑动验证码'),
            onPressed: () => PopupCaptcha.show(
              context,
              type: 'slider',
              backend: backend,
              locale: 'zh-CN',
              onSuccess: (_) => onResult('✓ 弹窗验证成功'),
              onFail: () => onResult('✕ 弹窗验证失败'),
              onClose: () => onResult('弹窗已关闭'),
            ),
          ),
          const SizedBox(height: 12),
          FilledButton.icon(
            icon: const Icon(Icons.touch_app_outlined),
            label: const Text('弹出点选验证码'),
            onPressed: () => PopupCaptcha.show(
              context,
              type: 'click',
              backend: backend,
              locale: 'zh-CN',
              onSuccess: (_) => onResult('✓ 点选验证成功'),
              onFail: () => onResult('✕ 点选验证失败'),
              onClose: () => onResult('弹窗已关闭'),
            ),
          ),
        ],
      ),
    );
  }
}