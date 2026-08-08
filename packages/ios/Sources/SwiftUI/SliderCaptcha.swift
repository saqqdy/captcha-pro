import SwiftUI
import UIKit

/// Slider captcha view for SwiftUI — backend verification only.
public struct SliderCaptcha: View {
    @StateObject private var viewModel: SliderCaptchaViewModel

    public init(
        width: Int = 300,
        height: Int = 170,
        sliderWidth: Int = 42,
        sliderHeight: Int = 42,
        showRefresh: Bool = true,
        backendVerify: BackendVerifyOptions,
        locale: CaptchaLocale = .zhCN,
        onSuccess: @escaping () -> Void = {},
        onFail: @escaping () -> Void = {},
        onRefresh: @escaping () -> Void = {},
        onError: @escaping (Error) -> Void = {}
    ) {
        _viewModel = StateObject(wrappedValue: SliderCaptchaViewModel(
            width: width,
            height: height,
            sliderWidth: sliderWidth,
            sliderHeight: sliderHeight,
            showRefresh: showRefresh,
            backendVerify: backendVerify,
            locale: locale,
            onSuccess: onSuccess,
            onFail: onFail,
            onRefresh: onRefresh,
            onError: onError
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
                } else if viewModel.loading {
                    ProgressView()
                        .frame(width: CGFloat(viewModel.width), height: CGFloat(viewModel.height))
                } else if let msg = viewModel.errorMsg {
                    Text(msg)
                        .foregroundColor(.gray)
                        .frame(width: CGFloat(viewModel.width), height: CGFloat(viewModel.height))
                }

                // Slider
                if let sliderImage = viewModel.sliderImage, !viewModel.loading {
                    Image(uiImage: sliderImage)
                        .resizable()
                        .frame(width: CGFloat(viewModel.sliderWidth), height: CGFloat(viewModel.sliderHeight))
                        .offset(x: viewModel.currentX, y: viewModel.sliderY)
                }

                // Refresh button
                if viewModel.showRefresh, !viewModel.loading {
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
                        Text(status == .success
                             ? LocaleMessages.get(viewModel.locale, key: "slider_success")
                             : LocaleMessages.get(viewModel.locale, key: "slider_fail"))
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
            GeometryReader { _ in
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

/// Slider captcha view model — backend verification only.
@MainActor
final class SliderCaptchaViewModel: ObservableObject {
    @Published var bgImage: UIImage?
    @Published var sliderImage: UIImage?
    @Published var currentX: CGFloat = 0
    @Published var sliderY: CGFloat = 0
    @Published var status: Status?
    @Published var loading = false
    @Published var errorMsg: String?

    private let generator = CaptchaGenerator()

    let width: Int
    let height: Int
    let sliderWidth: Int
    let sliderHeight: Int
    let showRefresh: Bool
    let backendVerify: BackendVerifyOptions
    let locale: CaptchaLocale
    let onSuccess: () -> Void
    let onFail: () -> Void
    let onRefresh: () -> Void
    let onError: (Error) -> Void

    enum Status {
        case success, fail
    }

    init(
        width: Int,
        height: Int,
        sliderWidth: Int,
        sliderHeight: Int,
        showRefresh: Bool,
        backendVerify: BackendVerifyOptions,
        locale: CaptchaLocale,
        onSuccess: @escaping () -> Void,
        onFail: @escaping () -> Void,
        onRefresh: @escaping () -> Void,
        onError: @escaping (Error) -> Void
    ) {
        self.width = width
        self.height = height
        self.sliderWidth = sliderWidth
        self.sliderHeight = sliderHeight
        self.showRefresh = showRefresh
        self.backendVerify = backendVerify
        self.locale = locale
        self.onSuccess = onSuccess
        self.onFail = onFail
        self.onRefresh = onRefresh
        self.onError = onError
    }

    func refresh() {
        loading = true
        errorMsg = nil
        let options = CaptchaOptions(
            type: .slider,
            width: width,
            height: height,
            sliderWidth: sliderWidth,
            sliderHeight: sliderHeight,
            backendVerify: backendVerify,
            locale: locale
        )
        Task {
            do {
                let result = try await generator.generate(options: options)
                bgImage = result.bgImage
                sliderImage = result.sliderImage
                sliderY = result.sliderY
                currentX = 0
                status = nil
                loading = false
                onRefresh()
            } catch {
                loading = false
                errorMsg = LocaleMessages.get(locale, key: "error_network")
                onError(error)
            }
        }
    }

    func verify() {
        let data = generator.getCaptchaData(type: .slider, sliderX: currentX)
        let options = CaptchaOptions(type: .slider, backendVerify: backendVerify, locale: locale)
        Task {
            do {
                let response = try await generator.backendVerify(data: data, options: options)
                if response.success {
                    status = .success
                    onSuccess()
                } else {
                    status = .fail
                    onFail()
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) { [weak self] in
                        self?.refresh()
                    }
                }
            } catch {
                status = .fail
                errorMsg = LocaleMessages.get(locale, key: "error_network")
                onError(error)
            }
        }
    }
}
