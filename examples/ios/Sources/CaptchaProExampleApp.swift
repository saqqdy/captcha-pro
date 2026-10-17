import SwiftUI
import CaptchaPro

@main
struct CaptchaProExampleApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}

struct ContentView: View {
    @State private var selectedTab: Int
    @State private var showSliderPopup = false
    @State private var showClickPopup = false

    // Launch env (TAB / POPUP, set via `simctl launch --setenv`) drives the
    // initial tab / auto-popup so each view can be screenshotted without
    // manual tapping.
    init() {
        let env = ProcessInfo.processInfo.environment
        let tab: Int
        switch env["TAB"] {
        case "click": tab = 1
        case "popup": tab = 2
        default: tab = 0
        }
        _selectedTab = State(initialValue: tab)
    }

    // Demo backend running locally (server/node on :3001).
    // iOS Simulator shares the host loopback, so http://localhost works.
    private let backend = BackendVerifyOptions(
        getCaptchaUrl: "http://localhost:3001/api/captcha",
        verifyUrl: "http://localhost:3001/api/captcha/verify"
    )

    var body: some View {
        TabView(selection: $selectedTab) {
            sliderTab
                .tag(0)
                .tabItem { Label("Slider", systemImage: "slider.horizontal.3") }
            clickTab
                .tag(1)
                .tabItem { Label("Click", systemImage: "hand.tap.fill") }
            popupTab
                .tag(2)
                .tabItem { Label("Popup", systemImage: "rectangle.stack.badge.plus") }
        }
        .tint(.blue)
    }

    private var sliderTab: some View {
        VStack(spacing: 16) {
            Text("SliderCaptcha（SwiftUI）").font(.headline)
            SliderCaptcha(
                backendVerify: backend,
                locale: .zhCN,
                onSuccess: { _ in print("✅ slider success") },
                onFail: { print("❌ slider fail") },
                onError: { print("⚠️ slider error: \($0)") }
            )
            Spacer()
        }
        .padding()
        .frame(maxWidth: .infinity)
    }

    private var clickTab: some View {
        VStack(spacing: 16) {
            Text("ClickCaptcha（SwiftUI）").font(.headline)
            ClickCaptcha(
                backendVerify: backend,
                locale: .zhCN,
                onSuccess: { _ in print("✅ click success") },
                onFail: { print("❌ click fail") },
                onError: { print("⚠️ click error: \($0)") }
            )
            Spacer()
        }
        .padding()
        .frame(maxWidth: .infinity)
    }

    private var popupTab: some View {
        VStack(spacing: 24) {
            Spacer()
            Text("PopupCaptcha（SwiftUI）").font(.headline)
            Button("弹出滑动验证码") { showSliderPopup = true }
                .buttonStyle(.borderedProminent)
            Button("弹出点选验证码") { showClickPopup = true }
                .buttonStyle(.borderedProminent)
            Spacer()
        }
        .padding()
        .frame(maxWidth: .infinity)
        .onAppear {
            let env = ProcessInfo.processInfo.environment
            if env["POPUP"] == "slider" { showSliderPopup = true }
            if env["POPUP"] == "click" { showClickPopup = true }
        }
        .popupCaptcha(
            isPresented: $showSliderPopup,
            configuration: PopupCaptcha(
                type: .slider,
                backendVerify: backend,
                locale: .zhCN,
                onSuccess: { _ in print("✅ popup slider success") },
                onClose: { print("popup closed") }
            )
        )
        .popupCaptcha(
            isPresented: $showClickPopup,
            configuration: PopupCaptcha(
                type: .click,
                backendVerify: backend,
                locale: .zhCN,
                onSuccess: { _ in print("✅ popup click success") },
                onClose: { print("popup closed") }
            )
        )
    }
}
