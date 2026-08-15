import UIKit

/// Slider captcha view delegate
public protocol SliderCaptchaViewDelegate: AnyObject {
    func sliderCaptchaDidSucceed(_ view: SliderCaptchaView)
    func sliderCaptchaDidFail(_ view: SliderCaptchaView)
    func sliderCaptchaDidRefresh(_ view: SliderCaptchaView)
}

/// Slider captcha view - Backend verification only
public class SliderCaptchaView: UIView {
    private let generator = CaptchaGenerator()
    private let statisticsData = StatisticsData()

    private var captchaAreaView = UIView()
    private var captchaClipView = UIView()
    private var gradientLayer = CAGradientLayer()
    private var bgImageView = UIImageView()
    private var loadingLabel = UILabel()
    private var sliderImageView = UIImageView()
    private var statusView = UIView()
    private var statusStackView = UIStackView()
    private var statusIconView = UIView()
    private var statusIconLabel = UILabel()
    private var statusTextLabel = UILabel()
    private var refreshButton = UIButton()
    private var sliderBarView = UIView()
    private var sliderHintLabel = UILabel()
    private var sliderThumbView = UIView()
    private var sliderArrowLabel = UILabel()

    private var targetX: CGFloat = 0
    private var sliderY: CGFloat = 0
    private var currentX: CGFloat = 0
    private var isDragging = false
    private var dragStartTime: TimeInterval = 0

    public weak var delegate: SliderCaptchaViewDelegate?
    public weak var callback: SliderCaptchaCallback?

    public var captchaWidth: Int = 300 { didSet { refresh() } }
    public var captchaHeight: Int = 170 { didSet { refresh() } }
    public var sliderWidth: Int = 42
    public var sliderHeight: Int = 42
    public var showRefresh: Bool = true { didSet { refreshButton.isHidden = !showRefresh } }

    /// Backend verification configuration - Required
    public var backendVerify: BackendVerifyOptions!
    public var locale: CaptchaLocale = .zhCN

    public override init(frame: CGRect) {
        super.init(frame: frame)
        setupViews()
    }

    public required init?(coder: NSCoder) {
        super.init(coder: coder)
        setupViews()
    }

    private func setupViews() {
        backgroundColor = .clear

        // Captcha area — shadow carrier (masksToBounds false to keep shadow)
        captchaAreaView.layer.cornerRadius = 16
        captchaAreaView.layer.shadowColor = UIColor.black.cgColor
        captchaAreaView.layer.shadowOpacity = 0.15
        captchaAreaView.layer.shadowOffset = CGSize(width: 0, height: 4)
        captchaAreaView.layer.shadowRadius = 8
        addSubview(captchaAreaView)
        captchaAreaView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            captchaAreaView.topAnchor.constraint(equalTo: topAnchor),
            captchaAreaView.leadingAnchor.constraint(equalTo: leadingAnchor),
            captchaAreaView.trailingAnchor.constraint(equalTo: trailingAnchor),
            captchaAreaView.heightAnchor.constraint(equalToConstant: CGFloat(captchaHeight)),
        ])

        // Clip container — rounded clip for gradient + image + overlay
        captchaClipView.layer.cornerRadius = 16
        captchaClipView.layer.masksToBounds = true
        captchaAreaView.addSubview(captchaClipView)
        captchaClipView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            captchaClipView.topAnchor.constraint(equalTo: captchaAreaView.topAnchor),
            captchaClipView.leadingAnchor.constraint(equalTo: captchaAreaView.leadingAnchor),
            captchaClipView.trailingAnchor.constraint(equalTo: captchaAreaView.trailingAnchor),
            captchaClipView.bottomAnchor.constraint(equalTo: captchaAreaView.bottomAnchor),
        ])

        // Gradient background (shows on loading / no-image)
        gradientLayer.colors = [
            UIColor(red: 102/255, green: 126/255, blue: 234/255, alpha: 1).cgColor,
            UIColor(red: 118/255, green: 75/255, blue: 162/255, alpha: 1).cgColor,
        ]
        gradientLayer.startPoint = CGPoint(x: 0, y: 0)
        gradientLayer.endPoint = CGPoint(x: 1, y: 1)
        captchaClipView.layer.insertSublayer(gradientLayer, at: 0)

        bgImageView.contentMode = .scaleAspectFill
        bgImageView.clipsToBounds = true
        captchaClipView.addSubview(bgImageView)
        bgImageView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            bgImageView.topAnchor.constraint(equalTo: captchaClipView.topAnchor),
            bgImageView.leadingAnchor.constraint(equalTo: captchaClipView.leadingAnchor),
            bgImageView.trailingAnchor.constraint(equalTo: captchaClipView.trailingAnchor),
            bgImageView.bottomAnchor.constraint(equalTo: captchaClipView.bottomAnchor),
        ])

        loadingLabel.text = LocaleMessages.get(locale, key: "loading")
        loadingLabel.textColor = .white
        loadingLabel.font = .systemFont(ofSize: 14)
        loadingLabel.textAlignment = .center
        captchaClipView.addSubview(loadingLabel)
        loadingLabel.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            loadingLabel.centerXAnchor.constraint(equalTo: captchaClipView.centerXAnchor),
            loadingLabel.centerYAnchor.constraint(equalTo: captchaClipView.centerYAnchor),
        ])

        sliderImageView.contentMode = .scaleAspectFill
        sliderImageView.clipsToBounds = true
        captchaClipView.addSubview(sliderImageView)

        refreshButton.backgroundColor = UIColor.white.withAlphaComponent(0.9)
        refreshButton.layer.cornerRadius = 8
        refreshButton.setTitle("⟳", for: .normal)
        refreshButton.setTitleColor(UIColor(white: 0.4, alpha: 1), for: .normal)
        refreshButton.titleLabel?.font = .systemFont(ofSize: 20, weight: .bold)
        refreshButton.addTarget(self, action: #selector(refresh), for: .touchUpInside)
        captchaClipView.addSubview(refreshButton)
        refreshButton.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            refreshButton.topAnchor.constraint(equalTo: captchaClipView.topAnchor, constant: 8),
            refreshButton.trailingAnchor.constraint(equalTo: captchaClipView.trailingAnchor, constant: -8),
            refreshButton.widthAnchor.constraint(equalToConstant: 28),
            refreshButton.heightAnchor.constraint(equalToConstant: 28),
        ])

        statusView.isHidden = true
        statusView.backgroundColor = UIColor.white.withAlphaComponent(0.75)
        captchaClipView.addSubview(statusView)
        statusView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            statusView.topAnchor.constraint(equalTo: captchaClipView.topAnchor),
            statusView.leadingAnchor.constraint(equalTo: captchaClipView.leadingAnchor),
            statusView.trailingAnchor.constraint(equalTo: captchaClipView.trailingAnchor),
            statusView.bottomAnchor.constraint(equalTo: captchaClipView.bottomAnchor),
        ])

        // Status content — vertical stack centered in the overlay
        statusStackView.axis = .vertical
        statusStackView.spacing = 12
        statusStackView.alignment = .center
        statusView.addSubview(statusStackView)
        statusStackView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            statusStackView.centerXAnchor.constraint(equalTo: statusView.centerXAnchor),
            statusStackView.centerYAnchor.constraint(equalTo: statusView.centerYAnchor),
        ])

        statusIconView.layer.cornerRadius = 32
        statusIconView.layer.masksToBounds = true
        statusStackView.addArrangedSubview(statusIconView)
        statusIconView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            statusIconView.widthAnchor.constraint(equalToConstant: 64),
            statusIconView.heightAnchor.constraint(equalToConstant: 64),
        ])

        statusIconLabel.font = .systemFont(ofSize: 36, weight: .bold)
        statusIconLabel.textColor = .white
        statusIconLabel.textAlignment = .center
        statusIconView.addSubview(statusIconLabel)
        statusIconLabel.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            statusIconLabel.centerXAnchor.constraint(equalTo: statusIconView.centerXAnchor),
            statusIconLabel.centerYAnchor.constraint(equalTo: statusIconView.centerYAnchor),
        ])

        statusTextLabel.font = .systemFont(ofSize: 14, weight: .medium)
        statusTextLabel.textAlignment = .center
        statusStackView.addArrangedSubview(statusTextLabel)
        statusTextLabel.translatesAutoresizingMaskIntoConstraints = false

        sliderBarView.backgroundColor = UIColor(red: 247/255, green: 249/255, blue: 250/255, alpha: 1)
        sliderBarView.layer.cornerRadius = 8
        addSubview(sliderBarView)
        sliderBarView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            sliderBarView.topAnchor.constraint(equalTo: captchaAreaView.bottomAnchor, constant: 10),
            sliderBarView.leadingAnchor.constraint(equalTo: leadingAnchor),
            sliderBarView.trailingAnchor.constraint(equalTo: trailingAnchor),
            sliderBarView.heightAnchor.constraint(equalToConstant: 40),
        ])

        sliderHintLabel.text = LocaleMessages.get(locale, key: "slider_hint")
        sliderHintLabel.textColor = UIColor(white: 0.6, alpha: 1)
        sliderHintLabel.font = .systemFont(ofSize: 14)
        sliderHintLabel.textAlignment = .center
        sliderBarView.addSubview(sliderHintLabel)
        sliderHintLabel.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            sliderHintLabel.centerXAnchor.constraint(equalTo: sliderBarView.centerXAnchor),
            sliderHintLabel.centerYAnchor.constraint(equalTo: sliderBarView.centerYAnchor),
        ])

        sliderThumbView.backgroundColor = .white
        sliderThumbView.layer.cornerRadius = 8
        sliderThumbView.layer.borderWidth = 1
        sliderThumbView.layer.borderColor = UIColor(red: 225/255, green: 228/255, blue: 232/255, alpha: 1).cgColor
        sliderBarView.addSubview(sliderThumbView)
        sliderThumbView.frame = CGRect(x: 2, y: 2, width: 36, height: 36)

        sliderArrowLabel.text = "→"
        sliderArrowLabel.textColor = UIColor(red: 25/255, green: 145/255, blue: 250/255, alpha: 1)
        sliderArrowLabel.font = .systemFont(ofSize: 20, weight: .bold)
        sliderArrowLabel.textAlignment = .center
        sliderThumbView.addSubview(sliderArrowLabel)
        sliderArrowLabel.frame = sliderThumbView.bounds

        let panGesture = UIPanGestureRecognizer(target: self, action: #selector(handlePan(_:)))
        sliderThumbView.addGestureRecognizer(panGesture)
    }

    public override func layoutSubviews() {
        super.layoutSubviews()
        gradientLayer.frame = captchaClipView.bounds
    }

    @objc public func refresh() {
        guard backendVerify != nil else {
            fatalError("backendVerify is required")
        }
        Task { await refreshAsync() }
    }

    private func refreshAsync() async {
        loadingLabel.text = LocaleMessages.get(locale, key: "loading")
        sliderHintLabel.text = LocaleMessages.get(locale, key: "slider_hint")

        let options = CaptchaOptions(
            type: .slider, width: captchaWidth, height: captchaHeight,
            sliderWidth: sliderWidth, sliderHeight: sliderHeight,
            backendVerify: backendVerify, locale: locale
        )

        do {
            let result = try await generator.generate(options: options)
            bgImageView.image = result.bgImage
            sliderImageView.image = result.sliderImage
            targetX = result.targetPoints.first?.x ?? 0
            sliderY = result.sliderY
            currentX = 0
            statusView.isHidden = true
            sliderImageView.frame = CGRect(x: 0, y: Int(sliderY), width: sliderWidth, height: sliderHeight)
            sliderThumbView.frame = CGRect(x: 2, y: 2, width: 36, height: 36)
            delegate?.sliderCaptchaDidRefresh(self)
            callback?.onRefresh()
        } catch {
            showStatus(success: false, message: LocaleMessages.get(locale, key: "error_network"))
            callback?.onError(error)
        }
    }

    @objc private func handlePan(_ gesture: UIPanGestureRecognizer) {
        let translation = gesture.translation(in: sliderBarView)
        switch gesture.state {
        case .began:
            dragStartTime = Date().timeIntervalSince1970
        case .changed:
            let maxX = CGFloat(captchaWidth - sliderWidth)
            currentX = max(0, min(currentX + translation.x, maxX))
            sliderThumbView.frame.origin.x = currentX + 2
            sliderImageView.frame.origin.x = currentX
            gesture.setTranslation(.zero, in: sliderBarView)
            callback?.onDrag(distance: currentX)
        case .ended:
            verify()
        default:
            break
        }
    }

    private func verify() {
        guard backendVerify != nil else {
            fatalError("backendVerify is required")
        }

        statisticsData.totalAttempts += 1
        statisticsData.totalDragTime += Date().timeIntervalSince1970 - dragStartTime
        statisticsData.totalDragDistance += currentX

        let captchaData = generator.getCaptchaData(type: .slider, sliderX: currentX)

        Task {
            do {
                let options = CaptchaOptions(type: .slider, backendVerify: backendVerify, locale: locale)
                let response = try await generator.backendVerify(data: captchaData, options: options)
                response.success ? handleSuccess(verifiedAt: response.verifiedAt) : handleFail()
            } catch {
                showStatus(success: false, message: LocaleMessages.get(locale, key: "error_network"))
                callback?.onError(error)
                callback?.onFail()
            }
        }
    }

    private func handleSuccess(verifiedAt: Int?) {
        statisticsData.successCount += 1
        showStatus(success: true, message: LocaleMessages.get(locale, key: "slider_success"))
        delegate?.sliderCaptchaDidSucceed(self)
        callback?.onSuccess(data: VerifyResult(verifiedAt: verifiedAt))
    }

    private func handleFail() {
        statisticsData.failCount += 1
        showStatus(success: false, message: LocaleMessages.get(locale, key: "slider_fail"))
        delegate?.sliderCaptchaDidFail(self)
        callback?.onFail()
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) { [weak self] in self?.refresh() }
    }

    private func showStatus(success: Bool, message: String?) {
        statusIconView.backgroundColor = success
            ? UIColor(red: 82/255, green: 196/255, blue: 26/255, alpha: 0.85)
            : UIColor(red: 255/255, green: 77/255, blue: 79/255, alpha: 0.85)
        statusIconLabel.text = success ? "✓" : "✕"
        statusTextLabel.text = message ?? (success ? LocaleMessages.get(locale, key: "slider_success") : LocaleMessages.get(locale, key: "slider_fail"))
        statusTextLabel.textColor = success
            ? UIColor(red: 56/255, green: 158/255, blue: 13/255, alpha: 1)
            : UIColor(red: 207/255, green: 19/255, blue: 34/255, alpha: 1)

        statusView.alpha = 0
        statusView.transform = CGAffineTransform(scaleX: 0.9, y: 0.9)
        statusView.isHidden = false
        UIView.animate(withDuration: 0.2) {
            self.statusView.alpha = 1
            self.statusView.transform = .identity
        }
    }

    public func getData() -> CaptchaData {
        generator.getCaptchaData(type: .slider, sliderX: currentX)
    }

    public func getStatistics() -> CaptchaStatistics { statisticsData.toStatistics() }
    public func resetStatistics() { statisticsData.reset() }
    public func destroy() {}
}
