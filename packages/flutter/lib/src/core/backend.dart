import 'dart:convert';

import 'package:flutter/painting.dart';
import 'package:http/http.dart' as http;

/// Backend API configuration (required).
///
/// [getCaptcha] / [verify] accept either a URL string or a custom function,
/// mirroring `BackendConfig` in @captcha-pro/mp-shared.
class BackendConfig {
  /// URL string or [FetchCaptchaFn].
  final Object getCaptcha;

  /// URL string or [VerifyCaptchaFn].
  final Object verify;

  /// Optional request headers.
  final Map<String, String>? headers;

  /// Timeout in milliseconds. Defaults to 10000 when null.
  final int? timeout;

  const BackendConfig({
    required this.getCaptcha,
    required this.verify,
    this.headers,
    this.timeout,
  });
}

/// Custom captcha-fetch function signature.
typedef FetchCaptchaFn = Future<BackendCaptchaResponse> Function(
    BackendCaptchaParams params);

/// Custom captcha-verify function signature.
typedef VerifyCaptchaFn = Future<BackendVerifyResponse> Function(
    BackendVerifyRequest data);

/// getCaptcha request params.
class BackendCaptchaParams {
  final String type;
  final int? width;
  final int? height;
  final int? sliderWidth;
  final int? sliderHeight;
  final int? clickCount;

  const BackendCaptchaParams({
    required this.type,
    this.width,
    this.height,
    this.sliderWidth,
    this.sliderHeight,
    this.clickCount,
  });

  Map<String, String> toQueryMap() {
    final m = <String, String>{'type': type};
    if (width != null) m['width'] = width.toString();
    if (height != null) m['height'] = height.toString();
    if (sliderWidth != null) m['sliderWidth'] = sliderWidth.toString();
    if (sliderHeight != null) m['sliderHeight'] = sliderHeight.toString();
    if (clickCount != null) m['clickCount'] = clickCount.toString();
    return m;
  }
}

/// A click point used as the verify target for click captcha.
class CaptchaPoint {
  final double x;
  final double y;
  const CaptchaPoint(this.x, this.y);
  Map<String, dynamic> toJson() => {'x': x, 'y': y};
}

/// getCaptcha response `data` payload.
class BackendCaptchaData {
  final String captchaId;
  final String type;
  final String bgImage;
  final String? sliderImage;
  final double? sliderY;
  final List<String>? clickTexts;
  final List<String>? clickCharImages;
  final int width;
  final int height;
  final int expiresAt;

  const BackendCaptchaData({
    required this.captchaId,
    required this.type,
    required this.bgImage,
    this.sliderImage,
    this.sliderY,
    this.clickTexts,
    this.clickCharImages,
    required this.width,
    required this.height,
    required this.expiresAt,
  });

  factory BackendCaptchaData.fromJson(Map<String, dynamic> json) {
    return BackendCaptchaData(
      captchaId: json['captchaId'] as String,
      type: json['type'] as String? ?? '',
      bgImage: json['bgImage'] as String? ?? '',
      sliderImage: json['sliderImage'] as String?,
      sliderY: (json['sliderY'] as num?)?.toDouble(),
      clickTexts: (json['clickTexts'] as List?)
          ?.map((e) => e.toString())
          .toList(),
      clickCharImages: (json['clickCharImages'] as List?)
          ?.map((e) => e.toString())
          .toList(),
      width: json['width'] as int? ?? 0,
      height: json['height'] as int? ?? 0,
      expiresAt: json['expiresAt'] as int? ?? 0,
    );
  }
}

/// getCaptcha response.
class BackendCaptchaResponse {
  final bool success;
  final BackendCaptchaData? data;
  final String? message;

  const BackendCaptchaResponse({required this.success, this.data, this.message});

  factory BackendCaptchaResponse.fromJson(Map<String, dynamic> json) {
    return BackendCaptchaResponse(
      success: json['success'] as bool? ?? false,
      data: json['data'] is Map<String, dynamic>
          ? BackendCaptchaData.fromJson(json['data'] as Map<String, dynamic>)
          : null,
      message: json['message'] as String?,
    );
  }
}

/// verify request body (no timestamp).
class BackendVerifyRequest {
  final String captchaId;
  final String type;

  /// `[sliderX]` for slider; `[CaptchaPoint(x,y), ...]` for click.
  final List<dynamic> target;

  const BackendVerifyRequest({
    required this.captchaId,
    required this.type,
    required this.target,
  });

  Map<String, dynamic> toJson() => {
        'captchaId': captchaId,
        'type': type,
        'target': target
            .map((t) => t is CaptchaPoint ? t.toJson() : t)
            .toList(),
      };
}

/// verify response `data` payload.
class BackendVerifyData {
  final int verifiedAt;
  const BackendVerifyData(this.verifiedAt);
}

/// verify response.
class BackendVerifyResponse {
  final bool success;
  final String? message;
  final BackendVerifyData? data;

  const BackendVerifyResponse({required this.success, this.message, this.data});

  factory BackendVerifyResponse.fromJson(Map<String, dynamic> json) {
    return BackendVerifyResponse(
      success: json['success'] as bool? ?? false,
      message: json['message'] as String?,
      data: json['data'] is Map<String, dynamic>
          ? BackendVerifyData(
              (json['data']['verifiedAt'] as num?)?.toInt() ?? 0)
          : null,
    );
  }
}

/// Fetch a captcha from the backend (GET with query string).
Future<BackendCaptchaResponse> fetchCaptcha(
  BackendConfig config,
  BackendCaptchaParams params,
) async {
  if (config.getCaptcha is FetchCaptchaFn) {
    return (config.getCaptcha as FetchCaptchaFn)(params);
  }
  final base = Uri.parse(config.getCaptcha as String);
  final uri = base.replace(
    queryParameters: <String, String>{
      ...base.queryParameters,
      ...params.toQueryMap(),
    },
  );
  final res = await http
      .get(uri, headers: config.headers)
      .timeout(Duration(milliseconds: config.timeout ?? 10000));
  if (res.statusCode < 200 || res.statusCode >= 300) {
    throw Exception('Captcha request failed with status ${res.statusCode}');
  }
  final body = jsonDecode(res.body) as Map<String, dynamic>;
  return BackendCaptchaResponse.fromJson(body);
}

/// Verify a captcha submission (POST JSON, no timestamp).
Future<BackendVerifyResponse> verifyCaptcha(
  BackendConfig config,
  BackendVerifyRequest data,
) async {
  if (config.verify is VerifyCaptchaFn) {
    return (config.verify as VerifyCaptchaFn)(data);
  }
  final res = await http
      .post(
        Uri.parse(config.verify as String),
        headers: <String, String>{
          'Content-Type': 'application/json',
          ...?config.headers,
        },
        body: jsonEncode(data.toJson()),
      )
      .timeout(Duration(milliseconds: config.timeout ?? 10000));
  if (res.statusCode < 200 || res.statusCode >= 300) {
    throw Exception('Captcha verify failed with status ${res.statusCode}');
  }
  final body = jsonDecode(res.body) as Map<String, dynamic>;
  return BackendVerifyResponse.fromJson(body);
}

/// Resolve an image source (URL / data: URL / raw base64) to an [ImageProvider].
ImageProvider resolveCaptchaImage(String src) {
  if (src.startsWith('data:')) {
    final comma = src.indexOf(',');
    if (comma != -1 && comma + 1 < src.length) {
      return MemoryImage(base64Decode(src.substring(comma + 1)));
    }
  }
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return NetworkImage(src);
  }
  // Assume raw base64.
  try {
    return MemoryImage(base64Decode(src));
  } catch (_) {
    return NetworkImage(src);
  }
}
