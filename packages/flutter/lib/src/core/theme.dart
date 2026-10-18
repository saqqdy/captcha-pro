import 'package:flutter/material.dart';

/// Captcha color scheme for light and dark modes
class CaptchaColorScheme {
  // Slider colors
  final Color sliderBarBg;
  final Color sliderHintText;
  final Color sliderThumbBg;
  final Color sliderThumbBorder;

  // Prompt bar colors
  final Color promptBarBg;
  final Color promptBarBorder;
  final Color promptText;

  // Refresh button colors
  final Color refreshBtnBg;
  final Color refreshIcon;

  // Status overlay colors
  final Color statusOverlayBg;
  final Color successText;
  final Color failText;
  final Color successIconBg;
  final Color failIconBg;

  // Popup colors
  final Color popupCard;
  final Color popupTitle;
  final Color popupClose;
  final Color popupSeparator;
  final Color popupMask;

  const CaptchaColorScheme({
    required this.sliderBarBg,
    required this.sliderHintText,
    required this.sliderThumbBg,
    required this.sliderThumbBorder,
    required this.promptBarBg,
    required this.promptBarBorder,
    required this.promptText,
    required this.refreshBtnBg,
    required this.refreshIcon,
    required this.statusOverlayBg,
    required this.successText,
    required this.failText,
    required this.successIconBg,
    required this.failIconBg,
    required this.popupCard,
    required this.popupTitle,
    required this.popupClose,
    required this.popupSeparator,
    required this.popupMask,
  });

  /// Light mode colors
  static const light = CaptchaColorScheme(
    // Slider
    sliderBarBg: Color(0xFFF7F9FA),
    sliderHintText: Color(0xFF666666),
    sliderThumbBg: Color(0xFFFFFFFF),
    sliderThumbBorder: Color(0xFFE1E4E8),
    // Prompt bar
    promptBarBg: Color(0xFFF7F9FA),
    promptBarBorder: Color(0xFFE8E8E8),
    promptText: Color(0xFF666666),
    // Refresh button
    refreshBtnBg: Color(0xE6FFFFFF),
    refreshIcon: Color(0xFF666666),
    // Status overlay
    statusOverlayBg: Color(0xBFFFFFFF),
    successText: Color(0xFF389E0D),
    failText: Color(0xFFCF1322),
    successIconBg: Color(0xD952C41A),
    failIconBg: Color(0xD9FF4D4F),
    // Popup
    popupCard: Color(0xFFFFFFFF),
    popupTitle: Color(0xFF333333),
    popupClose: Color(0xFF999999),
    popupSeparator: Color(0xFFEEEEEE),
    popupMask: Color(0x80000000),
  );

  /// Dark mode colors
  static const dark = CaptchaColorScheme(
    // Slider
    sliderBarBg: Color(0xFF1F1F1F),
    sliderHintText: Color(0xFFAAAAAA),
    sliderThumbBg: Color(0xFF2A2A2A),
    sliderThumbBorder: Color(0xFF3A3A3A),
    // Prompt bar
    promptBarBg: Color(0xFF1F1F1F),
    promptBarBorder: Color(0xFF3A3A3A),
    promptText: Color(0xFFAAAAAA),
    // Refresh button
    refreshBtnBg: Color(0xE63C3C3C),
    refreshIcon: Color(0xFFAAAAAA),
    // Status overlay
    statusOverlayBg: Color(0x99000000),
    successText: Color(0xFF5CB85C),
    failText: Color(0xFFFF7875),
    successIconBg: Color(0xE652C41A),
    failIconBg: Color(0xE6FF4D4F),
    // Popup
    popupCard: Color(0xFF1F1F1F),
    popupTitle: Color(0xFFEEEEEE),
    popupClose: Color(0xFFAAAAAA),
    popupSeparator: Color(0xFF3A3A3A),
    popupMask: Color(0xB3000000),
  );

  /// Get color scheme based on current brightness
  static CaptchaColorScheme of(BuildContext context) {
    return MediaQuery.platformBrightnessOf(context) == Brightness.dark
        ? dark
        : light;
  }
}
