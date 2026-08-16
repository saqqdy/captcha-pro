import SwiftUI
import UIKit

/// Click captcha view for SwiftUI — backend verification only.
@available(iOS 14.0, *)
public struct ClickCaptcha: View {
    @StateObject private var viewModel: ClickCaptchaViewModel

    public init(
        width: Int = 300,
        height: Int = 170,
        count: Int = 3,
        showRefresh: Bool = true,
        backendVerify: BackendVerifyOptions,
        locale: CaptchaLocale = .zhCN,
        onSuccess: @escaping (VerifyResult?) -> Void = { _ in },
        onFail: @escaping () -> Void = {},
        onRefresh: @escaping () -> Void = {},
        onError: @escaping (Error) -> Void = { _ in }
    ) {
        _viewModel = StateObject(wrappedValue: ClickCaptchaViewModel(
            width: width,
            height: height,
            count: count,
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
        VStack(spacing: 12) {
            // Captcha area
            ZStack(alignment: .topTrailing) {
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
                        .contentShape(Rectangle())
                        .gesture(
                            DragGesture(minimumDistance: 0)
                                .onEnded { value in
                                    viewModel.handleClick(at: value.location)
                                }
                        )
                        .accessibilityLabel(LocaleMessages.get(viewModel.locale, key: "click_prompt"))
                        .accessibilityAddTraits(.isButton)
                } else if let msg = viewModel.errorMsg {
                    Text(msg)
                        .foregroundColor(.white)
                        .font(.system(size: 14))
                } else {
                    Text(LocaleMessages.get(viewModel.locale, key: "loading"))
                        .foregroundColor(.white)
                        .font(.system(size: 14))
                }

                // Click markers
                ForEach(viewModel.clickPoints.indices, id: \.self) { index in
                    let point = viewModel.clickPoints[index]
                    Circle()
                        .fill(Color(red: 25/255, green: 145/255, blue: 250/255))
                        .frame(width: 24, height: 24)
                        .overlay(Circle().stroke(Color.white, lineWidth: 3))
                        .overlay(
                            Text("\(index + 1)")
                                .foregroundColor(.white)
                                .font(.system(size: 12))
                                .fontWeight(.bold)
                        )
                        .offset(x: point.x - 12, y: point.y - 12)
                        .accessibilityLabel("\(index + 1)")
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
                    .padding(8)
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
                             ? LocaleMessages.get(viewModel.locale, key: "click_success")
                             : LocaleMessages.get(viewModel.locale, key: "click_fail"))
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

            // Prompt bar
            HStack(spacing: 8) {
                Text(LocaleMessages.get(viewModel.locale, key: "click_prompt"))
                    .font(.system(size: 14))
                    .foregroundColor(Color(white: 0.4))

                if !viewModel.clickCharImages.isEmpty {
                    HStack(spacing: 6) {
                        ForEach(viewModel.clickCharImages.indices, id: \.self) { i in
                            if i < viewModel.charImages.count {
                                let img = viewModel.charImages[i]
                                Image(uiImage: img)
                                    .resizable()
                                    .frame(width: 28, height: 28)
                                    .clipShape(RoundedRectangle(cornerRadius: 8))
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 8)
                                            .stroke(
                                                LinearGradient(
                                                    colors: [
                                                        Color(red: 102/255, green: 126/255, blue: 234/255),
                                                        Color(red: 118/255, green: 75/255, blue: 162/255),
                                                    ],
                                                    startPoint: .topLeading,
                                                    endPoint: .bottomTrailing
                                                ),
                                                lineWidth: 1
                                            )
                                    )
                            } else {
                                LinearGradient(
                                    colors: [
                                        Color(red: 102/255, green: 126/255, blue: 234/255),
                                        Color(red: 118/255, green: 75/255, blue: 162/255),
                                    ],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                                .frame(width: 28, height: 28)
                                .cornerRadius(8)
                            }
                        }
                    }
                } else {
                    HStack(spacing: 6) {
                        ForEach(viewModel.clickTexts.indices, id: \.self) { i in
                            LinearGradient(
                                colors: [
                                    Color(red: 102/255, green: 126/255, blue: 234/255),
                                    Color(red: 118/255, green: 75/255, blue: 162/255),
                                ],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                            .frame(width: 28, height: 28)
                            .cornerRadius(8)
                            .shadow(color: Color(red: 102/255, green: 126/255, blue: 234/255, opacity: 0.3), radius: 4)
                            .overlay(
                                Text(viewModel.clickTexts[i])
                                    .foregroundColor(.white)
                                    .font(.system(size: 16, weight: .medium))
                            )
                        }
                    }
                }

                Spacer()

                Text("\(viewModel.clickPoints.count)/\(viewModel.targetCount)")
                    .font(.system(size: 14))
                    .foregroundColor(Color(red: 25/255, green: 145/255, blue: 250/255))
            }
            .padding(.horizontal, 12)
            .frame(width: CGFloat(viewModel.width), height: 56)
            .background(Color(red: 247/255, green: 249/255, blue: 250/255))
            .cornerRadius(16)
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .stroke(Color(red: 232/255, green: 232/255, blue: 232/255), lineWidth: 1)
            )
        }
        .onAppear { viewModel.refresh() }
    }
}

/// Click captcha view model — backend verification only.
@MainActor
final class ClickCaptchaViewModel: ObservableObject {
    @Published var bgImage: UIImage?
    @Published var clickPoints: [CGPoint] = []
    @Published var clickTexts: [String] = []
    @Published var clickCharImages: [String] = []
    @Published var charImages: [UIImage] = []
    @Published var status: Status?
    @Published var loading = false
    @Published var errorMsg: String?

    private let generator = CaptchaGenerator()

    let width: Int
    let height: Int
    let count: Int
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

    var targetCount: Int {
        if !clickCharImages.isEmpty { return clickCharImages.count }
        if !clickTexts.isEmpty { return clickTexts.count }
        return count
    }

    init(
        width: Int,
        height: Int,
        count: Int,
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
        self.count = count
        self.showRefresh = showRefresh
        self.backendVerify = backendVerify
        self.locale = locale
        self.onSuccess = onSuccess
        self.onFail = onFail
        self.onRefresh = onRefresh
        self.onError = onError
    }

    func refresh() {
        clickPoints.removeAll()
        loading = true
        errorMsg = nil
        let options = CaptchaOptions(
            type: .click,
            width: width,
            height: height,
            clickCount: count,
            backendVerify: backendVerify,
            locale: locale
        )
        Task {
            do {
                let result = try await generator.generate(options: options)
                bgImage = result.bgImage
                clickTexts = result.clickTexts ?? []
                clickCharImages = result.clickCharImages ?? []
                status = nil
                loading = false
                onRefresh()

                // Load char images off the main actor when present.
                if !clickCharImages.isEmpty {
                    var images: [UIImage?] = Array(repeating: nil, count: clickCharImages.count)
                    for (i, src) in clickCharImages.enumerated() {
                        if let img = try? await generator.loadImage(from: src) {
                            images[i] = img
                        }
                    }
                    charImages = images.compactMap { $0 }
                } else {
                    charImages = []
                }
            } catch {
                loading = false
                errorMsg = LocaleMessages.get(locale, key: "error_network")
                onError(error)
            }
        }
    }

    func handleClick(at location: CGPoint) {
        guard status == nil, clickPoints.count < targetCount else { return }
        clickPoints.append(location)
        if clickPoints.count == targetCount {
            verify()
        }
    }

    private func verify() {
        let points = clickPoints.map { CaptchaPoint(x: $0.x, y: $0.y) }
        let data = generator.getCaptchaData(type: .click, targetPoints: points)
        let options = CaptchaOptions(type: .click, backendVerify: backendVerify, locale: locale)
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
