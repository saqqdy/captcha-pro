import Foundation
import CoreGraphics
import UIKit

/// Captcha generator for iOS
public class CaptchaGenerator {

    /// Chinese vocabulary for click captcha
    private static let chineseWords = [
        "一帆风顺", "二龙腾飞", "三阳开泰", "四季平安", "五福临门",
        "七星高照", "八方来财", "万事如意", "心想事成", "步步高升",
        "财源广进", "恭喜发财", "龙马精神", "马到成功", "金玉满堂",
        "花开富贵", "锦绣前程", "吉祥如意", "瑞气盈门", "紫气东来",
        "风调雨顺", "国泰民安", "繁荣昌盛", "万象更新", "春回大地",
        "阳光明媚", "奋发图强", "自强不息", "勇往直前", "坚持不懈",
        "厚德载物", "海纳百川", "宁静致远", "淡泊明志", "天道酬勤",
        "实事求是", "与时俱进", "开拓创新", "继往开来", "励精图治",
        "安居乐业", "幸福美满", "和谐共处", "德才兼备", "品学兼优",
        "诚实守信", "勤劳致富", "艰苦奋斗", "团结友爱", "尊老爱幼",
        "学无止境", "勤奋好学", "刻苦钻研", "博览群书", "学以致用",
        "融会贯通", "举一反三", "触类旁通", "温故知新", "循序渐进",
        "厚积薄发", "持之以恒", "孜孜不倦", "废寝忘食", "夜以继日",
        "春暖花开", "秋高气爽", "山清水秀", "鸟语花香", "绿树成荫",
        "风和日丽", "云淡风轻", "晴空万里", "皓月当空", "繁星闪烁",
        "科技创新", "人工智能", "云计算", "大数据", "物联网",
        "智慧城市", "数字经济", "智能制造", "绿色发展", "生态环保"
    ]

    /// Generate captcha
    public func generate(options: CaptchaOptions) -> CaptchaResult {
        switch options.type {
        case .slider:
            return generateSlider(options: options)
        case .click:
            return generateClick(options: options)
        }
    }

    /// Generate slider captcha
    private func generateSlider(options: CaptchaOptions) -> CaptchaResult {
        let width = CGFloat(options.width)
        let height = CGFloat(options.height)
        let sliderWidth = CGFloat(options.sliderWidth)
        let sliderHeight = CGFloat(options.sliderHeight)

        // Create background image
        UIGraphicsBeginImageContextWithOptions(CGSize(width: width, height: height), false, UIScreen.main.scale)
        guard let bgContext = UIGraphicsGetCurrentContext() else {
            fatalError("Failed to create graphics context")
        }

        // Generate gradient background
        let hue1 = CGFloat.random(in: 0...360)
        let hue2 = (hue1 + CGFloat.random(in: 30...60)).truncatingRemainder(dividingBy: 360)

        drawGradientBackground(
            context: bgContext,
            width: width,
            height: height,
            hue1: hue1,
            hue2: hue2
        )

        // Random target position
        let targetX = Int.random(in: (options.sliderWidth + 20)..<(options.width - options.sliderWidth - 20))
        let targetY = Int.random(in: 10..<(options.height - options.sliderHeight - 10))

        // Draw target hole (shadow area)
        bgContext.setFillColor(UIColor(white: 0, alpha: 0.3).cgColor)
        bgContext.fill(CGRect(x: targetX, y: targetY, width: options.sliderWidth, height: options.sliderHeight))

        // Draw target hole border
        bgContext.setStrokeColor(UIColor(white: 1, alpha: 0.8).cgColor)
        bgContext.setLineWidth(2)
        bgContext.stroke(CGRect(x: targetX, y: targetY, width: options.sliderWidth, height: options.sliderHeight))

        guard let bgImage = UIGraphicsGetImageFromCurrentImageContext() else {
            fatalError("Failed to get background image")
        }
        UIGraphicsEndImageContext()

        // Create slider image
        UIGraphicsBeginImageContextWithOptions(CGSize(width: sliderWidth, height: sliderHeight), false, UIScreen.main.scale)
        guard let sliderContext = UIGraphicsGetCurrentContext() else {
            fatalError("Failed to create slider graphics context")
        }

        drawGradientBackground(
            context: sliderContext,
            width: sliderWidth,
            height: sliderHeight,
            hue1: hue1,
            hue2: hue2
        )

        guard let sliderImage = UIGraphicsGetImageFromCurrentImageContext() else {
            fatalError("Failed to get slider image")
        }
        UIGraphicsEndImageContext()

        return CaptchaResult(
            bgImage: bgImage,
            sliderImage: sliderImage,
            targetPoints: [CaptchaPoint(x: CGFloat(targetX), y: CGFloat(targetY))],
            sliderY: CGFloat(targetY)
        )
    }

    /// Generate click captcha
    private func generateClick(options: CaptchaOptions) -> CaptchaResult {
        let width = CGFloat(options.width)
        let height = CGFloat(options.height)
        let count = options.clickCount
        let fontSize: CGFloat = 20
        let padding = fontSize + 10

        // Create background image
        UIGraphicsBeginImageContextWithOptions(CGSize(width: width, height: height), false, UIScreen.main.scale)
        guard let bgContext = UIGraphicsGetCurrentContext() else {
            fatalError("Failed to create graphics context")
        }

        // Generate gradient background
        let hue1 = CGFloat.random(in: 0...360)
        let hue2 = (hue1 + CGFloat.random(in: 30...60)).truncatingRemainder(dividingBy: 360)

        drawGradientBackground(
            context: bgContext,
            width: width,
            height: height,
            hue1: hue1,
            hue2: hue2
        )

        // Generate random text
        let randomWord = Self.chineseWords.randomElement() ?? "一帆风顺"
        var chars: String
        if randomWord.count >= count {
            chars = String(randomWord.prefix(count))
        } else {
            chars = randomWord
            while chars.count < count {
                let extraWord = Self.chineseWords.randomElement() ?? "心想事成"
                chars += String(extraWord.prefix(count - chars.count))
            }
        }

        let clickTexts = Array(chars.prefix(count)).map { String($0) }
        var targetPoints: [CaptchaPoint] = []

        // Generate target positions
        for text in clickTexts {
            var x: CGFloat
            var y: CGFloat
            var attempts = 0
            repeat {
                x = CGFloat.random(in: padding...(width - padding))
                y = CGFloat.random(in: padding...(height - padding))
                attempts += 1
            } while isOverlapping(x: x, y: y, size: fontSize, points: targetPoints) && attempts < 100

            targetPoints.append(CaptchaPoint(x: x, y: y, text: text))

            // Draw target character
            drawCharacter(
                context: bgContext,
                x: x,
                y: y,
                text: text,
                fontSize: fontSize,
                color: UIColor(white: 0.2, alpha: 1)
            )
        }

        // Generate and draw decoy characters
        let decoyCount = Int.random(in: 1...2)
        var usedChars = Set(clickTexts)
        var decoyPoints: [CaptchaPoint] = []

        for _ in 0..<decoyCount {
            var decoyChar: String?
            var attempts = 0
            while decoyChar == nil && attempts < 50 {
                let word = Self.chineseWords.randomElement() ?? "万事如意"
                for char in word {
                    let charString = String(char)
                    if !usedChars.contains(charString) {
                        decoyChar = charString
                        usedChars.insert(charString)
                        break
                    }
                }
                attempts += 1
            }

            if let char = decoyChar {
                var x: CGFloat
                var y: CGFloat
                var attempts = 0
                repeat {
                    x = CGFloat.random(in: padding...(width - padding))
                    y = CGFloat.random(in: padding...(height - padding))
                    attempts += 1
                } while isOverlapping(x: x, y: y, size: fontSize, points: targetPoints + decoyPoints) && attempts < 100

                decoyPoints.append(CaptchaPoint(x: x, y: y, text: char))

                // Draw decoy character (slightly lighter)
                drawCharacter(
                    context: bgContext,
                    x: x,
                    y: y,
                    text: char,
                    fontSize: fontSize,
                    color: UIColor(white: 0.33, alpha: 1)
                )
            }
        }

        guard let bgImage = UIGraphicsGetImageFromCurrentImageContext() else {
            fatalError("Failed to get background image")
        }
        UIGraphicsEndImageContext()

        return CaptchaResult(
            bgImage: bgImage,
            targetPoints: targetPoints,
            clickTexts: clickTexts
        )
    }

    /// Draw gradient background with decorative shapes
    private func drawGradientBackground(
        context: CGContext,
        width: CGFloat,
        height: CGFloat,
        hue1: CGFloat,
        hue2: CGFloat
    ) {
        // Create gradient
        let color1 = HSLColor(h: hue1, s: 70, l: 85).toUIColor()
        let color2 = HSLColor(h: hue2, s: 70, l: 75).toUIColor()

        let gradient = CGGradient(
            colorsSpace: CGColorSpaceCreateDeviceRGB(),
            colors: [color1.cgColor, color2.cgColor] as CFArray,
            locations: [0, 1]
        )!

        context.drawLinearGradient(
            gradient,
            start: .zero,
            end: CGPoint(x: width, y: height),
            options: []
        )

        // Add decorative shapes
        for _ in 0..<8 {
            let shapeHue = (hue1 + CGFloat.random(in: 0...120)).truncatingRemainder(dividingBy: 360)
            let shapeColor = HSLColor(h: shapeHue, s: 60, l: 60).toUIColor().withAlphaComponent(0.15)

            context.setFillColor(shapeColor.cgColor)
            let x = CGFloat.random(in: -20...(width - 40))
            let y = CGFloat.random(in: -20...(height - 40))
            let size = CGFloat.random(in: 40...80)

            context.fillEllipse(in: CGRect(x: x, y: y, width: size, height: size))
        }

        // Add small dots
        for _ in 0..<30 {
            let dotHue = (hue1 + CGFloat.random(in: 0...180)).truncatingRemainder(dividingBy: 360)
            let dotColor = HSLColor(h: dotHue, s: 50, l: 50).toUIColor().withAlphaComponent(0.3)

            context.setFillColor(dotColor.cgColor)
            let x = CGFloat.random(in: 0...width)
            let y = CGFloat.random(in: 0...height)
            let radius = CGFloat.random(in: 2...6)

            context.fillEllipse(in: CGRect(x: x - radius, y: y - radius, width: radius * 2, height: radius * 2))
        }

        // Add lines
        for _ in 0..<5 {
            let lineHue = (hue1 + CGFloat.random(in: 0...180)).truncatingRemainder(dividingBy: 360)
            let lineColor = HSLColor(h: lineHue, s: 40, l: 50).toUIColor().withAlphaComponent(0.2)

            context.setStrokeColor(lineColor.cgColor)
            context.setLineWidth(CGFloat.random(in: 1...3))

            context.move(to: CGPoint(x: CGFloat.random(in: 0...width), y: CGFloat.random(in: 0...height)))
            context.addLine(to: CGPoint(x: CGFloat.random(in: 0...width), y: CGFloat.random(in: 0...height)))
            context.strokePath()
        }
    }

    /// Draw a character with rotation
    private func drawCharacter(
        context: CGContext,
        x: CGFloat,
        y: CGFloat,
        text: String,
        fontSize: CGFloat,
        color: UIColor
    ) {
        let attributes: [NSAttributedString.Key: Any] = [
            .font: UIFont.boldSystemFont(ofSize: fontSize),
            .foregroundColor: color
        ]

        let attributedString = NSAttributedString(string: text, attributes: attributes)
        let size = attributedString.size()

        context.saveGState()
        context.translateBy(x: x, y: y)
        context.rotate(by: CGFloat.random(in: -20...20) * .pi / 180)

        attributedString.draw(at: CGPoint(x: -size.width / 2, y: -size.height / 2))

        context.restoreGState()
    }

    /// Check if position overlaps with existing points
    private func isOverlapping(x: CGFloat, y: CGFloat, size: CGFloat, points: [CaptchaPoint]) -> Bool {
        for point in points {
            let distance = sqrt(pow(x - point.x, 2) + pow(y - point.y, 2))
            if distance < size * 1.5 {
                return true
            }
        }
        return false
    }
}

/// HSL Color helper
struct HSLColor {
    let h: CGFloat // 0-360
    let s: CGFloat // 0-100
    let l: CGFloat // 0-100

    func toUIColor() -> UIColor {
        let h = self.h / 360
        let s = self.s / 100
        let l = self.l / 100

        var r: CGFloat = 0
        var g: CGFloat = 0
        var b: CGFloat = 0

        if s == 0 {
            r = l
            g = l
            b = l
        } else {
            let q = l < 0.5 ? l * (1 + s) : l + s - l * s
            let p = 2 * l - q
            r = hueToRGB(p: p, q: q, t: h + 1/3)
            g = hueToRGB(p: p, q: q, t: h)
            b = hueToRGB(p: p, q: q, t: h - 1/3)
        }

        return UIColor(red: r, green: g, blue: b, alpha: 1)
    }

    private func hueToRGB(p: CGFloat, q: CGFloat, t: CGFloat) -> CGFloat {
        var t = t
        if t < 0 { t += 1 }
        if t > 1 { t -= 1 }
        if t < 1/6 { return p + (q - p) * 6 * t }
        if t < 1/2 { return q }
        if t < 2/3 { return p + (q - p) * (2/3 - t) * 6 }
        return p
    }
}
