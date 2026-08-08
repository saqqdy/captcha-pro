import SwiftUI
import UIKit

/// Click captcha view for SwiftUI — backend verification only.
public struct ClickCaptcha: View {
    @StateObject private var viewModel: ClickCaptchaViewModel

    public init(
        width: Int = 300,
        height: Int = 170,
        count: Int = 3,
        showRefresh: Bool = true,
        backendVerify: BackendVerifyOptions,
        locale: CaptchaLocale = .zhCN,
        onSuccess: @escaping () -> Void = {},
        onFail: @escaping () -> Void = {},
        onRefresh: @escaping () -> Void = {},
        onError: @escaping (Error) -> Void = {}
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
        VStack(spacing: 10) {
            // Captcha area
            ZStack(alignment: .topTrailing) {
                // Background image
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
                } else if viewModel.loading {
                    ProgressView()
                        .frame(width: CGFloat(viewModel.width), height: CGFloat(viewModel.height))
                } else if let msg = viewModel.errorMsg {
                    Text(msg)
                        .foregroundColor(.gray)
                        .frame(width: CGFloat(viewModel.width), height: CGFloat(viewModel.height))
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
                             ? LocaleMessages.get(viewModel.locale, key: "click_success")
                             : LocaleMessages.get(viewModel.locale, key: "click_fail"))
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
                if !viewModel.clickCharImages.isEmpty {
                    Text(LocaleMessages.get(viewModel.locale, key: "click_prompt"))
                    ForEach(viewModel.clickCharImages.indices, id: \.self) { i in
                        if i < viewModel.charImages.count, let img = viewModel.charImages[i] {
                            Image(uiImage: img)
                                .resizable()
                                .frame(width: 28, height: 28)
                                .background(Color(red: 0.94, green: 0.97, blue: 1))
                                .cornerRadius(4)
                        } else {
                            Color(red: 0.94, green: 0.97, blue: 1)
                                .frame(width: 28, height: 28)
                                .cornerRadius(4)
                        }
                    }
                } else {
                    Text(LocaleMessages.get(viewModel.locale, key: "click_prompt")
                         + viewModel.clickTexts.joined(separator: " "))
                        .font(.system(size: 14))
                        .foregroundColor(.primary)
                }

                Spacer()

                Text("\(viewModel.clickPoints.count)/\(viewModel.targetCount)")
                    .font(.system(size: 14))
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
    let onSuccess: () -> Void
    let onFail: () -> Void
    let onRefresh: () -> Void
    let onError: (Error) -> Void

    enum Status {
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
        onSuccess: @escaping () -> Void,
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
