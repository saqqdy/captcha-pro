import SwiftUI

/// Popup captcha view for SwiftUI — presents slider or click captcha in a modal overlay.
///
/// Mirrors the UIKit `PopupCaptchaView` so callers can use either paradigm.
public struct PopupCaptcha: View {
    public enum CaptchaType {
        case slider, click
    }

    // MARK: - Configuration
    public let type: CaptchaType
    public let title: String
    public let maskClosable: Bool
    public let showCloseButton: Bool
    public let autoClose: Bool
    public let closeDelay: TimeInterval

    public let sliderConfig: SliderConfig
    public let clickConfig: ClickConfig

    public let onSuccess: () -> Void
    public let onFail: () -> Void
    public let onClose: () -> Void

    // MARK: - State
    @State private var isVisible: Bool
    @State private var isClosing = false

    public struct SliderConfig {
        public let width: Int
        public let height: Int
        public let sliderWidth: Int
        public let sliderHeight: Int
        public let precision: Int
        public let showRefresh: Bool

        public init(
            width: Int = 300,
            height: Int = 170,
            sliderWidth: Int = 42,
            sliderHeight: Int = 42,
            precision: Int = 5,
            showRefresh: Bool = true
        ) {
            self.width = width
            self.height = height
            self.sliderWidth = sliderWidth
            self.sliderHeight = sliderHeight
            self.precision = precision
            self.showRefresh = showRefresh
        }
    }

    public struct ClickConfig {
        public let width: Int
        public let height: Int
        public let count: Int
        public let precision: CGFloat
        public let showRefresh: Bool

        public init(
            width: Int = 300,
            height: Int = 170,
            count: Int = 3,
            precision: CGFloat = 20,
            showRefresh: Bool = true
        ) {
            self.width = width
            self.height = height
            self.count = count
            self.precision = precision
            self.showRefresh = showRefresh
        }
    }

    public init(
        type: CaptchaType = .slider,
        title: String = "请完成安全验证",
        maskClosable: Bool = true,
        showCloseButton: Bool = true,
        autoClose: Bool = true,
        closeDelay: TimeInterval = 0.5,
        sliderConfig: SliderConfig = SliderConfig(),
        clickConfig: ClickConfig = ClickConfig(),
        isVisible: Bool = false,
        onSuccess: @escaping () -> Void = {},
        onFail: @escaping () -> Void = {},
        onClose: @escaping () -> Void = {}
    ) {
        self.type = type
        self.title = title
        self.maskClosable = maskClosable
        self.showCloseButton = showCloseButton
        self.autoClose = autoClose
        self.closeDelay = closeDelay
        self.sliderConfig = sliderConfig
        self.clickConfig = clickConfig
        self.onSuccess = onSuccess
        self.onFail = onFail
        self.onClose = onClose
        self._isVisible = State(initialValue: isVisible)
    }

    public var body: some View {
        ZStack {
            if isVisible {
                Color.black.opacity(0.5)
                    .ignoresSafeArea()
                    .onTapGesture { if maskClosable { hide() } }
                    .transition(.opacity)

                VStack(spacing: 0) {
                    header
                    Divider().background(Color(white: 0.94))
                    captchaContent
                        .padding(12)
                }
                .frame(width: cardWidth)
                .background(Color.white)
                .cornerRadius(8)
                .shadow(radius: 12)
                .transition(.opacity.combined(with: .scale(scale: 0.9)))
            }
        }
        .animation(.easeInOut(duration: 0.25), value: isVisible)
    }

    // MARK: - Header
    private var header: some View {
        HStack {
            Text(title)
                .font(.system(size: 16, weight: .medium))
                .foregroundColor(.primary)
            Spacer()
            if showCloseButton {
                Button(action: { hide() }) {
                    Image(systemName: "xmark")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(.gray)
                        .frame(width: 28, height: 28)
                }
            }
        }
        .padding(.horizontal, 16)
        .frame(height: 44)
    }

    // MARK: - Captcha content
    @ViewBuilder
    private var captchaContent: some View {
        switch type {
        case .slider:
            SliderCaptcha(
                width: sliderConfig.width,
                height: sliderConfig.height,
                sliderWidth: sliderConfig.sliderWidth,
                sliderHeight: sliderConfig.sliderHeight,
                precision: sliderConfig.precision,
                showRefresh: sliderConfig.showRefresh,
                onSuccess: handleSuccess,
                onFail: handleFail,
                onRefresh: {}
            )
        case .click:
            ClickCaptcha(
                width: clickConfig.width,
                height: clickConfig.height,
                count: clickConfig.count,
                precision: clickConfig.precision,
                showRefresh: clickConfig.showRefresh,
                onSuccess: handleSuccess,
                onFail: handleFail,
                onRefresh: {}
            )
        }
    }

    private var cardWidth: CGFloat {
        let base = type == .slider ? sliderConfig.width : clickConfig.width
        return CGFloat(base + 24)
    }

    // MARK: - Handlers
    private func handleSuccess() {
        onSuccess()
        if autoClose { scheduleClose(after: closeDelay) }
    }

    private func handleFail() {
        onFail()
    }

    private func scheduleClose(after delay: TimeInterval) {
        guard !isClosing else { return }
        isClosing = true
        DispatchQueue.main.asyncAfter(deadline: .now() + delay) { hide() }
    }

    private func hide() {
        isVisible = false
        isClosing = false
        onClose()
    }

    // MARK: - Public API
    public func show() -> PopupCaptcha {
        var copy = self
        copy._isVisible = State(initialValue: true)
        return copy
    }

    public func dismiss() { hide() }

    public func visible() -> Bool { isVisible }
}

// MARK: - View modifier convenience
public extension View {
    /// Presents a popup captcha bound to a Boolean binding.
    func popupCaptcha(
        isPresented: Binding<Bool>,
        configuration: PopupCaptcha,
        onClose: @escaping () -> Void = {}
    ) -> some View {
        self.overlay(
            PopupCaptcha(
                type: configuration.type,
                title: configuration.title,
                maskClosable: configuration.maskClosable,
                showCloseButton: configuration.showCloseButton,
                autoClose: configuration.autoClose,
                closeDelay: configuration.closeDelay,
                sliderConfig: configuration.sliderConfig,
                clickConfig: configuration.clickConfig,
                isVisible: isPresented.wrappedValue,
                onSuccess: configuration.onSuccess,
                onFail: configuration.onFail,
                onClose: { isPresented.wrappedValue = false; onClose() }
            )
            .animation(.easeInOut(duration: 0.25), value: isPresented.wrappedValue)
        )
    }
}
