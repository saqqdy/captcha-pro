import UIKit

public struct RiskAssessmentResult {
    public let score: Float, isBot: Bool, reason: String?
    public init(score: Float, isBot: Bool, reason: String? = nil) {
        self.score = score; self.isBot = isBot; self.reason = reason
    }
}

public class BehaviorTracker {
    private var startTime: TimeInterval = 0, lastInteractionTime: TimeInterval = 0
    private var interactionCount = 0, mouseMoves = 0, clicks = 0, scrollEvents = 0, keyPresses = 0
    private var interactionIntervals: [TimeInterval] = []

    public func start() {
        startTime = Date().timeIntervalSince1970
        lastInteractionTime = startTime
    }

    public func recordMouseMove() { mouseMoves += 1; recordInteraction() }
    public func recordClick() { clicks += 1; recordInteraction() }
    public func recordScroll() { scrollEvents += 1; recordInteraction() }
    public func recordKeyPress() { keyPresses += 1; recordInteraction() }

    private func recordInteraction() {
        interactionCount += 1
        let now = Date().timeIntervalSince1970
        let interval = now - lastInteractionTime
        if interval > 0 && interval < 10 { interactionIntervals.append(interval) }
        lastInteractionTime = now
    }

    public func getDuration() -> TimeInterval { Date().timeIntervalSince1970 - startTime }

    public func getAverageInteractionInterval() -> Float {
        guard !interactionIntervals.isEmpty else { return 0 }
        return Float(interactionIntervals.reduce(0, +) / Double(interactionIntervals.count))
    }

    public func toDictionary() -> [String: Any] {
        ["duration": getDuration(), "interactionCount": interactionCount, "mouseMoves": mouseMoves,
         "clicks": clicks, "scrollEvents": scrollEvents, "keyPresses": keyPresses,
         "avgInteractionInterval": getAverageInteractionInterval()]
    }
}

public class InvisibleCaptcha {
    private let behaviorTracker = BehaviorTracker()
    private var isTracking = false
    private var deviceFingerprint: String

    public var threshold: Float, challengeType: CaptchaType
    public var onChallenge: (() -> Void)?, onSuccess: (() -> Void)?, onFail: (() -> Void)?

    public init(threshold: Float = 0.5, challengeType: CaptchaType = .slider,
                onChallenge: (() -> Void)? = nil, onSuccess: (() -> Void)? = nil, onFail: (() -> Void)? = nil) {
        self.threshold = threshold; self.challengeType = challengeType
        self.onChallenge = onChallenge; self.onSuccess = onSuccess; self.onFail = onFail
        self.deviceFingerprint = InvisibleCaptcha.generateDeviceFingerprint()
    }

    public func startTracking() {
        guard !isTracking else { return }
        isTracking = true
        behaviorTracker.start()
    }

    public func trigger() {
        assessRisk() <= threshold ? onSuccess?() : onChallenge?()
    }

    public func assessRisk() -> Float {
        let behavior = behaviorTracker.toDictionary()
        var score: Float = 0
        if let duration = behavior["duration"] as? TimeInterval, duration < 1 { score += 0.3 }
        if let mouseMoves = behavior["mouseMoves"] as? Int, mouseMoves < 5 { score += 0.2 }
        if let avgInterval = behavior["avgInteractionInterval"] as? Float, avgInterval > 0 && avgInterval < 0.05 { score += 0.3 }
        if let interactionCount = behavior["interactionCount"] as? Int, interactionCount == 0 { score += 0.4 }
        return min(score, 1.0)
    }

    public func getRiskAssessment() -> RiskAssessmentResult {
        let score = assessRisk()
        return RiskAssessmentResult(score: score, isBot: score > threshold, reason: score > threshold ? "High risk behavior detected" : nil)
    }

    public func getBehaviorData() -> [String: Any] { behaviorTracker.toDictionary() }
    public func getDeviceFingerprint() -> String { deviceFingerprint }

    private static func generateDeviceFingerprint() -> String {
        let components = [UIDevice.current.identifierForVendor?.uuidString ?? "", UIDevice.current.model, UIDevice.current.systemVersion,
                          String(UIScreen.main.scale), String(format: "%dx%d", Int(UIScreen.main.bounds.width), Int(UIScreen.main.bounds.height))]
        return components.joined(separator: "-").data(using: .utf8)?.base64EncodedString() ?? ""
    }
}
