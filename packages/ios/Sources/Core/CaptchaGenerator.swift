import Foundation
import CoreGraphics
import UIKit

/// Captcha generator for iOS - Backend only
public class CaptchaGenerator {

    private var currentCaptchaId: String?
    private var currentTimestamp: TimeInterval = 0

    /// Generate captcha from backend
    public func generate(options: CaptchaOptions) async throws -> CaptchaResult {
        let response = try await resolveGetCaptcha(options: options)

        let data = response.data
        currentCaptchaId = data.captchaId
        currentTimestamp = data.timestamp ?? Date().timeIntervalSince1970 * 1000

        let bgImage = try await loadImage(from: data.bgImage)
        let sliderImage = try await data.sliderImage.map { try await loadImage(from: $0) }

        var targetPoints: [CaptchaPoint] = []
        if let sliderY = data.sliderY {
            targetPoints.append(CaptchaPoint(x: 0, y: sliderY))
        }

        return CaptchaResult(
            bgImage: bgImage,
            sliderImage: sliderImage,
            targetPoints: targetPoints,
            sliderY: data.sliderY ?? 0,
            clickTexts: data.clickTexts,
            clickCharImages: data.clickCharImages,
            captchaId: data.captchaId,
            timestamp: currentTimestamp
        )
    }

    /// Resolve getCaptcha endpoint: URL -> HTTP GET, function -> invoke.
    private func resolveGetCaptcha(options: CaptchaOptions) async throws -> BackendCaptchaResponse {
        switch options.backendVerify.getCaptcha {
        case .url(let url):
            let data = try await httpRequest(url: url, method: "GET", body: nil, headers: options.backendVerify.headers, timeout: options.backendVerify.timeout)
            return try parseCaptchaResponse(json: data)
        case .function(let fn):
            return try await fn()
        }
    }

    /// Resolve verify endpoint: URL -> HTTP POST, function -> invoke.
    private func resolveVerify(data: CaptchaData, options: CaptchaOptions) async throws -> BackendVerifyResponse {
        switch options.backendVerify.verify {
        case .url(let url):
            let body = try serializeCaptchaData(data: data)
            let json = try await httpRequest(url: url, method: "POST", body: body, headers: options.backendVerify.headers, timeout: options.backendVerify.timeout)
            return try parseVerifyResponse(json: json)
        case .function(let fn):
            return try await fn(data)
        }
    }

    private func httpRequest(url: String, method: String, body: Data?, headers: [String: String]?, timeout: TimeInterval) async throws -> Data {
        guard let url = URL(string: url) else { throw CaptchaError.invalidURL }
        var req = URLRequest(url: url)
        req.httpMethod = method
        req.timeoutInterval = timeout
        req.setValue("application/json", forHTTPHeaderField: "Accept")
        if method == "POST" { req.setValue("application/json", forHTTPHeaderField: "Content-Type") }
        req.httpBody = body
        headers?.forEach { req.setValue($1, forHTTPHeaderField: $0) }
        let (data, _) = try await URLSession.shared.data(for: req)
        return data
    }

    private func parseCaptchaResponse(json: Data) throws -> BackendCaptchaResponse {
        guard let obj = try JSONSerialization.jsonObject(with: json) as? [String: Any] else {
            throw CaptchaError.networkError
        }
        if let success = obj["success"] as? Bool, !success {
            throw CaptchaError.networkError
        }
        let d = obj["data"] as? [String: Any] ?? obj
        let data = CaptchaResponseData(
            captchaId: d["captchaId"] as? String ?? "",
            bgImage: d["bgImage"] as? String ?? "",
            sliderImage: d["sliderImage"] as? String,
            sliderY: (d["sliderY"] as? Double).map { CGFloat($0) },
            clickTexts: d["clickTexts"] as? [String],
            clickCharImages: d["clickCharImages"] as? [String],
            width: d["width"] as? Int,
            height: d["height"] as? Int,
            timestamp: d["timestamp"] as? Double
        )
        return BackendCaptchaResponse(data: data)
    }

    private func parseVerifyResponse(json: Data) throws -> BackendVerifyResponse {
        guard let obj = try JSONSerialization.jsonObject(with: json) as? [String: Any] else {
            throw CaptchaError.networkError
        }
        return BackendVerifyResponse(
            success: obj["success"] as? Bool ?? false,
            message: obj["message"] as? String,
            data: obj["data"] as? [String: Any]
        )
    }

    private func serializeCaptchaData(data: CaptchaData) throws -> Data {
        var target: [Any] = []
        for item in data.target {
            if let p = item as? CaptchaPoint {
                var dict: [String: Any] = ["x": p.x, "y": p.y]
                if let t = p.text { dict["text"] = t }
                target.append(dict)
            } else if let n = item as? CGFloat {
                target.append(n)
            } else if let n = item as? Double {
                target.append(n)
            }
        }
        let body: [String: Any] = [
            "captchaId": data.captchaId,
            "type": data.type.rawValue,
            "target": target,
            "timestamp": data.timestamp,
        ]
        return try JSONSerialization.data(withJSONObject: body)
    }

    /// Load image from URL or base64 string (public for views rendering char images)
    public func loadImage(from source: String) async throws -> UIImage {
        if source.starts(with: "http://") || source.starts(with: "https://") {
            guard let url = URL(string: source) else {
                throw CaptchaError.invalidURL
            }
            let (data, _) = try await URLSession.shared.data(from: url)
            guard let image = UIImage(data: data) else {
                throw CaptchaError.invalidImage
            }
            return image
        } else if source.starts(with: "data:image") {
            let base64Data = source.split(separator: ",").last?.data(using: .utf8) ?? Data()
            guard let data = Data(base64Encoded: base64Data),
                  let image = UIImage(data: data) else {
                throw CaptchaError.invalidImage
            }
            return image
        } else {
            // Try base64 directly
            guard let data = Data(base64Encoded: source),
                  let image = UIImage(data: data) else {
                throw CaptchaError.invalidImage
            }
            return image
        }
    }

    /// Get captcha data for verification.
    /// target is polymorphic: slider -> [sliderX] (CGFloat); click -> targetPoints.
    /// Mirrors taro-vue target: number[] | Point[]
    public func getCaptchaData(type: CaptchaType, targetPoints: [CaptchaPoint] = [], sliderX: CGFloat = 0) -> CaptchaData {
        let target: [Any]
        switch type {
        case .slider: target = [sliderX]
        case .click: target = targetPoints
        }
        return CaptchaData(
            type: type,
            captchaId: currentCaptchaId ?? "",
            target: target,
            timestamp: currentTimestamp
        )
    }

    /// Backend verify - resolve endpoint (URL -> HTTP, function -> invoke)
    public func backendVerify(data: CaptchaData, options: CaptchaOptions) async throws -> BackendVerifyResponse {
        return try await resolveVerify(data: data, options: options)
    }
}

public enum CaptchaError: Error {
    case invalidURL
    case invalidImage
    case networkError
    case verificationFailed
}
