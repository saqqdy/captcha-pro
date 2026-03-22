import Foundation
import CoreGraphics
import UIKit

/// Point representation
public struct CaptchaPoint: Codable {
    public let x: CGFloat
    public let y: CGFloat
    public let text: String?

    public init(x: CGFloat, y: CGFloat, text: String? = nil) {
        self.x = x
        self.y = y
        self.text = text
    }
}

/// Captcha type
public enum CaptchaType: String, Codable {
    case slider
    case click
}

/// Captcha generation options
public struct CaptchaOptions {
    public var type: CaptchaType = .slider
    public var width: Int = 300
    public var height: Int = 170
    public var sliderWidth: Int = 42
    public var sliderHeight: Int = 42
    public var precision: Int = 5
    public var clickCount: Int = 3

    public init(
        type: CaptchaType = .slider,
        width: Int = 300,
        height: Int = 170,
        sliderWidth: Int = 42,
        sliderHeight: Int = 42,
        precision: Int = 5,
        clickCount: Int = 3
    ) {
        self.type = type
        self.width = width
        self.height = height
        self.sliderWidth = sliderWidth
        self.sliderHeight = sliderHeight
        self.precision = precision
        self.clickCount = clickCount
    }
}

/// Captcha generation result
public struct CaptchaResult {
    public let bgImage: UIImage
    public let sliderImage: UIImage?
    public let targetPoints: [CaptchaPoint]
    public let sliderY: CGFloat
    public let clickTexts: [String]?

    public init(
        bgImage: UIImage,
        sliderImage: UIImage? = nil,
        targetPoints: [CaptchaPoint],
        sliderY: CGFloat = 0,
        clickTexts: [String]? = nil
    ) {
        self.bgImage = bgImage
        self.sliderImage = sliderImage
        self.targetPoints = targetPoints
        self.sliderY = sliderY
        self.clickTexts = clickTexts
    }
}

/// Verification result
public struct VerifyResult {
    public let success: Bool
    public let message: String

    public init(success: Bool, message: String = "") {
        self.success = success
        self.message = message
    }
}

/// Captcha callback protocol
public protocol CaptchaCallback: AnyObject {
    func onSuccess()
    func onFail()
    func onRefresh()
}

/// Default implementation for optional methods
extension CaptchaCallback {
    public func onSuccess() {}
    public func onFail() {}
    public func onRefresh() {}
}

/// Slider captcha callback
public protocol SliderCaptchaCallback: CaptchaCallback {
    func onDrag(distance: CGFloat)
}

extension SliderCaptchaCallback {
    public func onDrag(distance: CGFloat) {}
}

/// Click captcha callback
public protocol ClickCaptchaCallback: CaptchaCallback {
    func onClick(point: CaptchaPoint, index: Int)
}

extension ClickCaptchaCallback {
    public func onClick(point: CaptchaPoint, index: Int) {}
}
