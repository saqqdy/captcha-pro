import SwiftUI
import UIKit

/// Slider captcha view for SwiftUI
public struct SliderCaptcha: View {
    @StateObject private var viewModel: SliderCaptchaViewModel

    public init(
        width: Int = 300,
        height: Int = 170,
        sliderWidth: Int = 42,
        sliderHeight: Int = 42,
        precision: Int = 5,
        showRefresh: Bool = true,
        onSuccess: @escaping () -> Void = {},
        onFail: @escaping () -> Void = {},
        onRefresh: @escaping () -> Void = {}
    ) {
        _viewModel = StateObject(wrappedValue: SliderCaptchaViewModel(
            width: width,
            height: height,
            sliderWidth: sliderWidth,
            sliderHeight: sliderHeight,
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
                }

                // Slider
                if let sliderImage = viewModel.sliderImage {
                    Image(uiImage: sliderImage)
                        .resizable()
                        .frame(width: CGFloat(viewModel.sliderWidth), height: CGFloat(viewModel.sliderHeight))
                        .offset(x: viewModel.currentX, y: viewModel.sliderY)
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

            // Slider bar
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    Color(white: 0.97)
                        .cornerRadius(4)

                    RoundedRectangle(cornerRadius: 4)
                        .fill(viewModel.currentX > 0 ? Color.blue.opacity(0.08) : Color.clear)
                        .frame(width: viewModel.currentX + 40)

                    RoundedRectangle(cornerRadius: 4)
                        .stroke(viewModel.currentX > 0 ? Color.blue : Color.clear, lineWidth: 1)
                        .frame(width: viewModel.currentX + 40)

                    Capsule()
                        .fill(Color.white)
                        .frame(width: 36, height: 36)
                        .overlay(
                            Image(systemName: "chevron.right")
                                .foregroundColor(.blue)
                        )
                        .shadow(radius: 1)
                        .offset(x: viewModel.currentX + 2)
                        .gesture(
                            DragGesture()
                                .onChanged { value in
                                    let maxX = CGFloat(viewModel.width - viewModel.sliderWidth)
                                    viewModel.currentX = max(0, min(viewModel.currentX + value.translation.width, maxX))
                                }
                                .onEnded { _ in
                                    viewModel.verify()
                                }
                        )
                }
            }
            .frame(height: 40)
        }
        .padding(10)
        .background(Color.white)
        .cornerRadius(8)
        .shadow(radius: 2)
        .onAppear { viewModel.refresh() }
    }
}

/// Slider captcha view model
class SliderCaptchaViewModel: ObservableObject {
    @Published var bgImage: UIImage?
    @Published var sliderImage: UIImage?
    @Published var currentX: CGFloat = 0
    @Published var sliderY: CGFloat = 0
    @Published var status: Status?

    private let generator = CaptchaGenerator()
    private var targetX: CGFloat = 0

    let width: Int
    let height: Int
    let sliderWidth: Int
    let sliderHeight: Int
    let precision: Int
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
        sliderWidth: Int,
        sliderHeight: Int,
        precision: Int,
        showRefresh: Bool,
        onSuccess: @escaping () -> Void,
        onFail: @escaping () -> Void,
        onRefresh: @escaping () -> Void
    ) {
        self.width = width
        self.height = height
        self.sliderWidth = sliderWidth
        self.sliderHeight = sliderHeight
        self.precision = precision
        self.showRefresh = showRefresh
        self.onSuccess = onSuccess
        self.onFail = onFail
        self.onRefresh = onRefresh
    }

    func refresh() {
        let result = generator.generate(options: CaptchaOptions(
            type: .slider,
            width: width,
            height: height,
            sliderWidth: sliderWidth,
            sliderHeight: sliderHeight
        ))

        bgImage = result.bgImage
        sliderImage = result.sliderImage
        targetX = result.targetPoints.first?.x ?? 0
        sliderY = result.sliderY ?? 0
        currentX = 0
        status = nil

        onRefresh()
    }

    func verify() {
        let diff = abs(currentX - targetX)

        if diff <= CGFloat(precision) {
            status = .success
            onSuccess()
        } else {
            status = .fail
            onFail()
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) { [weak self] in
                self?.refresh()
            }
        }
    }
}
