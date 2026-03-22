import SwiftUI
import UIKit

/// Click captcha view for SwiftUI
public struct ClickCaptcha: View {
    @StateObject private var viewModel: ClickCaptchaViewModel

    public init(
        width: Int = 300,
        height: Int = 170,
        count: Int = 3,
        precision: CGFloat = 20,
        showRefresh: Bool = true,
        onSuccess: @escaping () -> Void = {},
        onFail: @escaping () -> Void = {},
        onRefresh: @escaping () -> Void = {}
    ) {
        _viewModel = StateObject(wrappedValue: ClickCaptchaViewModel(
            width: width,
            height: height,
            count: count,
            precision: precision,
            showRefresh: showRefresh,
            onSuccess: onSuccess,
            onFail: onFail,
            onRefresh: onRefresh
        ))
    }

    public var body: some View {
        VStack(spacing: 10) {
            // Captcha area
            ZStack(alignment: .topTrailing) {
                // Background image
                if let bgImage = viewModel.bgImage {
                    Image(uiImage: bgImage)
                        .resizable()
                        .frame(width: CGFloat(viewModel.width), height: CGFloat(viewModel.height))
                        .contentShape(Rectangle())
                        .onTapGesture { location in
                            // Handle tap
                        }
                }

                // Click point indicators
                ForEach(viewModel.clickPoints.indices, id: \.self) { index in
                    let point = viewModel.clickPoints[index]
                    Circle()
                        .fill(Color.blue.opacity(0.9))
                        .frame(width: 24, height: 24)
                        .overlay(
                            Text("\(index + 1)")
                                .foregroundColor(.white)
                                .font(.caption)
                                .fontWeight(.bold)
                        )
                        .offset(x: point.x - 12, y: point.y - 12)
                }

                // Refresh button
                if viewModel.showRefresh {
                    Button(action: { viewModel.refresh() }) {
                        Image(systemName: "arrow.clockwise")
                            .foregroundColor(.gray)
                            .frame(width: 28, height: 28)
                            .background(Color.white.opacity(0.9))
                            .cornerRadius(4)
                    }
                    .padding(10)
                }

                // Status overlay
                if let status = viewModel.status {
                    HStack {
                        Image(systemName: status == .success ? "checkmark" : "xmark")
                        Text(status == .success ? "验证成功" : "验证失败")
                    }
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .frame(height: 28)
                    .background(status == .success ? Color.green.opacity(0.9) : Color.red.opacity(0.9))
                    .frame(maxHeight: .infinity, alignment: .bottom)
                }
            }
            .frame(width: CGFloat(viewModel.width), height: CGFloat(viewModel.height))
            .cornerRadius(4)

            // Info bar
            HStack {
                Text("请依次点击: \(viewModel.clickTexts.joined(separator: " "))")
                    .font(.systemFont(ofSize: 14))
                    .foregroundColor(.primary)

                Spacer()

                Text("\(viewModel.clickPoints.count)/\(viewModel.count)")
                    .font(.systemFont(ofSize: 14))
                    .foregroundColor(Color.blue)
            }
            .padding(.horizontal, 12)
            .frame(height: 40)
            .background(Color(white: 0.97))
            .cornerRadius(4)
        }
        .padding(10)
        .background(Color.white)
        .cornerRadius(8)
        .shadow(radius: 2)
        .onAppear { viewModel.refresh() }
    }
}

/// Click captcha view model
class ClickCaptchaViewModel: ObservableObject {
    @Published var bgImage: UIImage?
    @Published var clickPoints: [CGPoint] = []
    @Published var clickTexts: [String] = []
    @Published var status: Status?

    private let generator = CaptchaGenerator()
    private var targetPoints: [CaptchaPoint] = []

    let width: Int
    let height: Int
    let count: Int
    let precision: CGFloat
    let showRefresh: Bool
    let onSuccess: () -> Void
    let onFail: () -> Void
    let onRefresh: () -> Void

    enum Status {
        case success, fail
    }

    init(
        width: Int,
        height: Int,
        count: Int,
        precision: CGFloat,
        showRefresh: Bool,
        onSuccess: @escaping () -> Void,
        onFail: @escaping () -> Void,
        onRefresh: @escaping () -> Void
    ) {
        self.width = width
        self.height = height
        self.count = count
        self.precision = precision
        self.showRefresh = showRefresh
        self.onSuccess = onSuccess
        self.onFail = onFail
        self.onRefresh = onRefresh
    }

    func refresh() {
        clickPoints.removeAll()

        let result = generator.generate(options: CaptchaOptions(
            type: .click,
            width: width,
            height: height,
            clickCount: count
        ))

        bgImage = result.bgImage
        targetPoints = result.targetPoints
        clickTexts = result.clickTexts
        status = nil

        onRefresh()
    }

    func verify(offsetX: CGFloat, offsetY: CGFloat) {
        guard status == nil else { return }

        let currentTargetIndex = clickPoints.count
        guard currentTargetIndex < count else { return }

        let target = targetPoints[currentTargetIndex]
        let distance = sqrt(pow(offsetX - target.x, 2) + pow(offsetY - target.y, 2))

        if distance <= precision {
            // Correct click
            clickPoints.append(CGPoint(x: offsetX, y: offsetY))

            if clickPoints.count == count {
                // All points clicked correctly
                status = .success
                onSuccess()
            }
        } else {
            // Wrong click
            status = .fail
            onFail()
            DispatchQueue.main.asyncAfter(deadline: .now() + 1) { [weak self] in
                self?.refresh()
            }
        }
    }
}
