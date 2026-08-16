import Foundation
import CoreGraphics
import UIKit

public enum CaptchaLocale: String, Codable {
    case zhCN = "zh-CN"
    case enUS = "en-US"
    public static func from(code: String) -> CaptchaLocale { CaptchaLocale(rawValue: code) ?? .zhCN }
}

public struct LocaleMessages {
    private static let messages: [CaptchaLocale: [String: String]] = [
        .zhCN: [
            "loading": "加载中...", "slider_slide": "请拖动滑块完成验证", "slider_hint": "→ 按住滑块，拖动完成验证", "slider_success": "验证成功", "slider_fail": "验证失败",
            "click_prompt": "请依次点击：", "click_success": "验证成功", "click_fail": "验证失败",
            "popup_title": "请完成安全验证", "popup_close": "关闭", "refresh": "刷新",
            "error_network": "网络错误", "error_expired": "验证码已过期", "error_invalid": "验证失败", "error_not_found": "验证码不存在"
        ],
        .enUS: [
            "loading": "Loading...", "slider_slide": "Please slide to verify", "slider_hint": "→ Hold and drag the slider to verify", "slider_success": "Verification successful", "slider_fail": "Verification failed",
            "click_prompt": "Please click in order: ", "click_success": "Verification successful", "click_fail": "Verification failed",
            "popup_title": "Please complete security verification", "popup_close": "Close", "refresh": "Refresh",
            "error_network": "Network error", "error_expired": "Captcha expired", "error_invalid": "Verification failed", "error_not_found": "Captcha not found"
        ]
    ]
    public static func get(_ locale: CaptchaLocale, key: String) -> String { messages[locale]?[key] ?? messages[.zhCN]?[key] ?? key }
}

public struct CaptchaPoint: Codable {
    public let x: CGFloat, y: CGFloat, text: String?
    public init(x: CGFloat, y: CGFloat, text: String? = nil) { self.x = x; self.y = y; self.text = text }
}

public enum CaptchaType: String, Codable { case slider, click }

/// getCaptcha endpoint — URL string (SDK does HTTP) or async closure.
/// Mirrors taro-vue BackendConfig.getCaptcha: string | function
public enum GetCaptchaEndpoint {
    case url(String)
    case function(() async throws -> BackendCaptchaResponse)
}

/// verify endpoint — URL string (SDK does HTTP) or async closure.
/// Mirrors taro-vue BackendConfig.verify: string | function
public enum VerifyEndpoint {
    case url(String)
    case function((CaptchaData) async throws -> BackendVerifyResponse)
}

public struct BackendVerifyOptions {
    public var getCaptcha: GetCaptchaEndpoint
    public var verify: VerifyEndpoint
    public var headers: [String: String]?
    public var timeout: TimeInterval
    /// Closure overload — matches taro-vue function config.
    public init(getCaptcha: @escaping (() async throws -> BackendCaptchaResponse), verify: @escaping ((CaptchaData) async throws -> BackendVerifyResponse), headers: [String: String]? = nil, timeout: TimeInterval = 10) {
        self.getCaptcha = .function(getCaptcha); self.verify = .function(verify); self.headers = headers; self.timeout = timeout
    }
    /// URL string overload — matches taro-vue string config.
    public init(getCaptchaUrl: String, verifyUrl: String, headers: [String: String]? = nil, timeout: TimeInterval = 10) {
        self.getCaptcha = .url(getCaptchaUrl); self.verify = .url(verifyUrl); self.headers = headers; self.timeout = timeout
    }
    /// Full endpoint overload.
    public init(getCaptcha: GetCaptchaEndpoint, verify: VerifyEndpoint, headers: [String: String]? = nil, timeout: TimeInterval = 10) {
        self.getCaptcha = getCaptcha; self.verify = verify; self.headers = headers; self.timeout = timeout
    }
}

public struct BackendCaptchaResponse { public let data: CaptchaResponseData; public init(data: CaptchaResponseData) { self.data = data } }

public struct CaptchaResponseData {
    public let captchaId: String, bgImage: String, sliderImage: String?, sliderY: CGFloat?, clickTexts: [String]?, clickCharImages: [String]?, width: Int?, height: Int?, timestamp: TimeInterval?
    public init(captchaId: String, bgImage: String, sliderImage: String? = nil, sliderY: CGFloat? = nil, clickTexts: [String]? = nil, clickCharImages: [String]? = nil, width: Int? = nil, height: Int? = nil, timestamp: TimeInterval? = nil) {
        self.captchaId = captchaId; self.bgImage = bgImage; self.sliderImage = sliderImage; self.sliderY = sliderY; self.clickTexts = clickTexts; self.clickCharImages = clickCharImages; self.width = width; self.height = height; self.timestamp = timestamp
    }
}

public struct BackendVerifyResponse {
    public let success: Bool, message: String?, data: [String: Any]?
    public init(success: Bool, message: String? = nil, data: [String: Any]? = nil) { self.success = success; self.message = message; self.data = data }
}
public extension BackendVerifyResponse {
    /// `verifiedAt` timestamp from the verify response data (mirrors taro-vue `verifiedAt: number`).
    var verifiedAt: Int? {
        if let v = data?["verifiedAt"] as? Int { return v }
        if let v = data?["verifiedAt"] as? Double { return Int(v) }
        if let v = data?["verifiedAt"] as? NSNumber { return v.intValue }
        return nil
    }
}

/// Captcha data for verification.
/// target is polymorphic: slider -> [CGFloat] ([sliderX]); click -> [CaptchaPoint].
/// Mirrors taro-vue BackendVerifyRequest.target: number[] | Point[]
public struct CaptchaData {
    public let type: CaptchaType, captchaId: String, target: [Any], timestamp: TimeInterval
    public init(type: CaptchaType, captchaId: String, target: [Any] = [], timestamp: TimeInterval = Date().timeIntervalSince1970 * 1000) {
        self.type = type; self.captchaId = captchaId; self.target = target; self.timestamp = timestamp
    }
}

public struct CaptchaOptions {
    public var type: CaptchaType, width: Int, height: Int, sliderWidth: Int, sliderHeight: Int, clickCount: Int, backendVerify: BackendVerifyOptions, locale: CaptchaLocale
    public init(type: CaptchaType = .slider, width: Int = 300, height: Int = 170, sliderWidth: Int = 42, sliderHeight: Int = 42, clickCount: Int = 3, backendVerify: BackendVerifyOptions, locale: CaptchaLocale = .zhCN) {
        self.type = type; self.width = width; self.height = height; self.sliderWidth = sliderWidth; self.sliderHeight = sliderHeight; self.clickCount = clickCount; self.backendVerify = backendVerify; self.locale = locale
    }
}

public struct CaptchaResult {
    public let bgImage: UIImage, sliderImage: UIImage?, targetPoints: [CaptchaPoint], sliderY: CGFloat, clickTexts: [String]?, clickCharImages: [String]?, captchaId: String, timestamp: TimeInterval
    public init(bgImage: UIImage, sliderImage: UIImage? = nil, targetPoints: [CaptchaPoint], sliderY: CGFloat = 0, clickTexts: [String]? = nil, clickCharImages: [String]? = nil, captchaId: String, timestamp: TimeInterval = Date().timeIntervalSince1970 * 1000) {
        self.bgImage = bgImage; self.sliderImage = sliderImage; self.targetPoints = targetPoints; self.sliderY = sliderY; self.clickTexts = clickTexts; self.clickCharImages = clickCharImages; self.captchaId = captchaId; self.timestamp = timestamp
    }
}

public struct VerifyResult {
    public let verifiedAt: Int?
    public init(verifiedAt: Int? = nil) { self.verifiedAt = verifiedAt }
}

public struct CaptchaStatistics {
    public let totalAttempts: Int, successCount: Int, failCount: Int, successRate: Float, avgVerifyTime: TimeInterval, avgDragDistance: CGFloat, avgDragTime: TimeInterval, avgClickCount: Float
    public init(totalAttempts: Int = 0, successCount: Int = 0, failCount: Int = 0, successRate: Float = 0, avgVerifyTime: TimeInterval = 0, avgDragDistance: CGFloat = 0, avgDragTime: TimeInterval = 0, avgClickCount: Float = 0) {
        self.totalAttempts = totalAttempts; self.successCount = successCount; self.failCount = failCount; self.successRate = successRate; self.avgVerifyTime = avgVerifyTime; self.avgDragDistance = avgDragDistance; self.avgDragTime = avgDragTime; self.avgClickCount = avgClickCount
    }
}

internal class StatisticsData {
    var totalAttempts = 0, successCount = 0, failCount = 0, totalClickCount = 0
    var totalVerifyTime: TimeInterval = 0, totalDragDistance: CGFloat = 0, totalDragTime: TimeInterval = 0
    func toStatistics() -> CaptchaStatistics {
        let rate = totalAttempts > 0 ? Float(successCount) / Float(totalAttempts) * 100 : 0
        return CaptchaStatistics(totalAttempts: totalAttempts, successCount: successCount, failCount: failCount, successRate: rate, avgVerifyTime: totalAttempts > 0 ? totalVerifyTime / Double(totalAttempts) : 0, avgDragDistance: totalAttempts > 0 ? totalDragDistance / CGFloat(totalAttempts) : 0, avgDragTime: totalAttempts > 0 ? totalDragTime / Double(totalAttempts) : 0, avgClickCount: totalAttempts > 0 ? Float(totalClickCount) / Float(totalAttempts) : 0)
    }
    func reset() { totalAttempts = 0; successCount = 0; failCount = 0; totalVerifyTime = 0; totalDragDistance = 0; totalDragTime = 0; totalClickCount = 0 }
}

public protocol CaptchaCallback: AnyObject {
    func onSuccess(data: VerifyResult?); func onFail(); func onRefresh(); func onError(_ error: Error)
}
public extension CaptchaCallback { func onSuccess(data: VerifyResult?) {}; func onFail() {}; func onRefresh() {}; func onError(_ error: Error) {} }

public protocol SliderCaptchaCallback: CaptchaCallback { func onDrag(distance: CGFloat) }
public extension SliderCaptchaCallback { func onDrag(distance: CGFloat) {} }

public protocol ClickCaptchaCallback: CaptchaCallback { func onClick(point: CaptchaPoint, index: Int) }
public extension ClickCaptchaCallback { func onClick(point: CaptchaPoint, index: Int) {} }
