import CoreGraphics
import UIKit

/// Renderer protocol for captcha drawing
public protocol CaptchaRenderer {
    func render(in context: CGContext, size: CGSize)
}

/// Render data for drawing
public struct RenderData {
    public var bgImage: UIImage?
    public var sliderImage: UIImage?
    public var sliderX: CGFloat
    public var sliderY: CGFloat
    public var targetX: CGFloat
    public var targetY: CGFloat
    public var sliderWidth: CGFloat
    public var sliderHeight: CGFloat

    public init(
        bgImage: UIImage? = nil,
        sliderImage: UIImage? = nil,
        sliderX: CGFloat = 0,
        sliderY: CGFloat = 0,
        targetX: CGFloat = 0,
        targetY: CGFloat = 0,
        sliderWidth: CGFloat = 42,
        sliderHeight: CGFloat = 42
    ) {
        self.bgImage = bgImage
        self.sliderImage = sliderImage
        self.sliderX = sliderX
        self.sliderY = sliderY
        self.targetX = targetX
        self.targetY = targetY
        self.sliderWidth = sliderWidth
        self.sliderHeight = sliderHeight
    }
}

/// Canvas renderer for slider captcha
public class SliderCanvasRenderer: CaptchaRenderer {
    private let data: RenderData

    public init(data: RenderData) {
        self.data = data
    }

    public func render(in context: CGContext, size: CGSize) {
        // Draw background
        if let bgImage = data.bgImage {
            bgImage.draw(in: CGRect(origin: .zero, size: size))
        }

        // Draw target hole
        context.setFillColor(UIColor(white: 0, alpha: 0.3).cgColor)
        context.fill(CGRect(
            x: data.targetX,
            y: data.targetY,
            width: data.sliderWidth,
            height: data.sliderHeight
        ))

        // Draw target hole border
        context.setStrokeColor(UIColor(white: 1, alpha: 0.8).cgColor)
        context.setLineWidth(2)
        context.stroke(CGRect(
            x: data.targetX,
            y: data.targetY,
            width: data.sliderWidth,
            height: data.sliderHeight
        ))

        // Draw slider
        if let sliderImage = data.sliderImage {
            sliderImage.draw(in: CGRect(
                x: data.sliderX,
                y: data.sliderY,
                width: data.sliderWidth,
                height: data.sliderHeight
            ))
        }
    }
}

/// Shape drawer for drawing various shapes
public class ShapeDrawer {
    private let context: CGContext

    public init(context: CGContext) {
        self.context = context
    }

    /// Draw rounded rectangle
    public func drawRoundedRect(
        x: CGFloat,
        y: CGFloat,
        width: CGFloat,
        height: CGFloat,
        radius: CGFloat,
        fillColor: UIColor? = nil,
        strokeColor: UIColor? = nil,
        strokeWidth: CGFloat = 2
    ) {
        let rect = CGRect(x: x, y: y, width: width, height: height)
        let path = UIBezierPath(roundedRect: rect, cornerRadius: radius)

        if let color = fillColor {
            color.setFill()
            path.fill()
        }

        if let color = strokeColor {
            color.setStroke()
            path.lineWidth = strokeWidth
            path.stroke()
        }
    }

    /// Draw circle
    public func drawCircle(
        centerX: CGFloat,
        centerY: CGFloat,
        radius: CGFloat,
        fillColor: UIColor? = nil,
        strokeColor: UIColor? = nil,
        strokeWidth: CGFloat = 2
    ) {
        let path = UIBezierPath(arcCenter: CGPoint(x: centerX, y: centerY), radius: radius, startAngle: 0, endAngle: .pi * 2, clockwise: true)

        if let color = fillColor {
            color.setFill()
            path.fill()
        }

        if let color = strokeColor {
            color.setStroke()
            path.lineWidth = strokeWidth
            path.stroke()
        }
    }

    /// Draw text
    public func drawText(
        text: String,
        x: CGFloat,
        y: CGFloat,
        fontSize: CGFloat,
        color: UIColor,
        alignment: NSTextAlignment = .center
    ) {
        let attributes: [NSAttributedString.Key: Any] = [
            .font: UIFont.boldSystemFont(ofSize: fontSize),
            .foregroundColor: color
        ]

        let attributedString = NSAttributedString(string: text, attributes: attributes)
        let size = attributedString.size()

        let drawX: CGFloat
        switch alignment {
        case .center:
            drawX = x - size.width / 2
        case .right:
            drawX = x - size.width
        default:
            drawX = x
        }

        attributedString.draw(at: CGPoint(x: drawX, y: y - size.height / 2))
    }

    /// Draw rotated text
    public func drawRotatedText(
        text: String,
        x: CGFloat,
        y: CGFloat,
        fontSize: CGFloat,
        color: UIColor,
        rotation: CGFloat
    ) {
        context.saveGState()
        context.translateBy(x: x, y: y)
        context.rotate(by: rotation * .pi / 180)
        drawText(text: text, x: 0, y: 0, fontSize: fontSize, color: color)
        context.restoreGState()
    }
}
