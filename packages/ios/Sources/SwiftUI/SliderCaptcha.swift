import SwiftUI
import UIKit

/// Slider captcha view for SwiftUI — backend verification only.
@available(iOS 14.0, *)
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
        onSuccess: @escaping (VerifyResult?) -> Void = { _ in },
        onFail: @escaping () -> Void = {},
        onRefresh: @escaping () -> Void = {},
        onError: @escaping (Error) -> Void = { _ in }
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
                // Gradient background (shows on loading / no-image)
                LinearGradient(
                    colors: [
                        Color(red: 102/255, green: 126/255, blue: 234/255),
                        Color(red: 118/255, green: 75/255, blue: 162/255),
                    ],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )

                if let bgImage = viewModel.bgImage {
                    Image(uiImage: bgImage)
                        .resizable()
                        .frame(width: CGFloat(viewModel.width), height: CGFloat(viewModel.height))
                } else if let msg = viewModel.errorMsg {
                    Text(msg)
                        .foregroundColor(.white)
                        .font(.system(size: 14))
                } else {
                    Text(LocaleMessages.get(viewModel.locale, key: "loading"))
                        .foregroundColor(.white)
                        .font(.system(size: 14))
                }

                // Slider piece
                if let sliderImage = viewModel.sliderImage, !viewModel.loading {
                    Image(uiImage: sliderImage)
                        .resizable()
                        .frame(width: CGFloat(viewModel.sliderWidth), height: CGFloat(viewModel.sliderHeight))
                        .offset(x: viewModel.currentX, y: viewModel.sliderY)
                }

                // Refresh button
                if viewModel.showRefresh, !viewModel.loading {
                    Button(action: { viewModel.refresh() }) {
                        Text("⟳")
                            .foregroundColor(Color(white: 0.4))
                            .font(.system(size: 20, weight: .bold))
                            .frame(width: 28, height: 28)
                            .background(Color.white.opacity(0.9))
                            .cornerRadius(8)
                    }
                    .frame(width: 44, height: 44)
                    .contentShape(Rectangle())
                    .accessibilityLabel(LocaleMessages.get(viewModel.locale, key: "refresh"))
                    .accessibilityAddTraits(.isButton)
                }

                // Status overlay (centered)
                if let status = viewModel.status {
                    VStack(spacing: 12) {
                        ZStack {
                            Circle()
                                .fill(status == .success
                                      ? Color(red: 82/255, green: 196/255, blue: 26/255, opacity: 0.85)
                                      : Color(red: 255/255, green: 77/255, blue: 79/255, opacity: 0.85))
                                .frame(width: 32, height: 32)
                            Text(status == .success ? "✓" : "✕")
                                .foregroundColor(.white)
                                .font(.system(size: 18, weight: .bold))
                        }
                        Text(status == .success
                             ? LocaleMessages.get(viewModel.locale, key: "slider_success")
                             : LocaleMessages.get(viewModel.locale, key: "slider_fail"))
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(status == .success
                                             ? Color(red: 56/255, green: 158/255, blue: 13/255)
                                             : Color(red: 207/255, green: 19/255, blue: 34/255))
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .background(Color.white.opacity(0.75))
                    .transition(.opacity.combined(with: .scale(scale: 0.9)))
                }
            }
            .frame(width: CGFloat(viewModel.width), height: CGFloat(viewModel.height))
            .cornerRadius(16)
            .shadow(color: Color.black.opacity(0.15), radius: 16, x: 0, y: 4)
            .animation(.easeInOut(duration: 0.2), value: viewModel.status)
            .onChange(of: viewModel.status) { newValue in
                guard let status = newValue else { return }
                let message = status == .success
                    ? LocaleMessages.get(viewModel.locale, key: "slider_success")
                    : LocaleMessages.get(viewModel.locale, key: "slider_fail")
                UIAccessibility.post(notification: .announcement, argument: message)
            }

            // Slider bar
            ZStack(alignment: .leading) {
                Color(red: 247/255, green: 249/255, blue: 250/255)
                    .cornerRadius(8)

                Text(LocaleMessages.get(viewModel.locale, key: "slider_hint"))
                    .foregroundColor(Color(white: 0.4))
                    .font(.system(size: 14))
                    .frame(maxWidth: .infinity)

                RoundedRectangle(cornerRadius: 8)
                    .fill(Color.white)
                    .overlay(
                        RoundedRectangle(cornerRadius: 8)
                            .stroke(Color(red: 225/255, green: 228/255, blue: 232/255), lineWidth: 1)
                    )
                    .frame(width: 36, height: 36)
                    .overlay(
                        Text("→")
                            .foregroundColor(Color(red: 25/255, green: 145/255, blue: 250/255))
                            .font(.system(size: 20, weight: .bold))
                    )
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
                    .accessibilityLabel(LocaleMessages.get(viewModel.locale, key: "slider_hint"))
                    .accessibilityValue("\(Int(viewModel.currentX))")
                    .accessibilityAdjustableAction { direction in
                        let maxX = CGFloat(viewModel.width - viewModel.sliderWidth)
                        switch direction {
                        case .increment:
                            viewModel.currentX = min(viewModel.currentX + 10, maxX)
                        case .decrement:
                            viewModel.currentX = max(viewModel.currentX - 10, 0)
                        @unknown default:
                            break
                        }
                    }
            }
            .frame(width: CGFloat(viewModel.width), height: 40)
        }
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
    let onSuccess: (VerifyResult?) -> Void
    let onFail: () -> Void
    let onRefresh: () -> Void
    let onError: (Error) -> Void

    enum Status: Equatable {
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
        onSuccess: @escaping (VerifyResult?) -> Void,
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
                    onSuccess(VerifyResult(verifiedAt: response.verifiedAt))
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
