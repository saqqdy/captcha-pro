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

    private var bgImageView = UIImageView()
    private var sliderImageView = UIImageView()
    private var sliderBarView = UIView()
    private var sliderThumbView = UIView()
    private var statusView = UIView()
    private var statusLabel = UILabel()
    private var refreshButton = UIButton()

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
    public var precision: Int = 5
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
        backgroundColor = .white
        layer.cornerRadius = 8
        clipsToBounds = true

        bgImageView.contentMode = .scaleAspectFill
        bgImageView.clipsToBounds = true
        addSubview(bgImageView)
        bgImageView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            bgImageView.topAnchor.constraint(equalTo: topAnchor, constant: 10),
            bgImageView.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 10),
            bgImageView.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -10),
            bgImageView.heightAnchor.constraint(equalToConstant: CGFloat(captchaHeight))
        ])

        sliderImageView.contentMode = .scaleAspectFill
        sliderImageView.clipsToBounds = true
        addSubview(sliderImageView)
        sliderImageView.translatesAutoresizingMaskIntoConstraints = false
        sliderImageView.widthAnchor.constraint(equalToConstant: CGFloat(sliderWidth)).isActive = true
        sliderImageView.heightAnchor.constraint(equalToConstant: CGFloat(sliderHeight)).isActive = true

        refreshButton.setImage(UIImage(systemName: "arrow.clockwise"), for: .normal)
        refreshButton.tintColor = .gray
        refreshButton.backgroundColor = UIColor.white.withAlphaComponent(0.9)
        refreshButton.layer.cornerRadius = 4
        refreshButton.addTarget(self, action: #selector(refresh), for: .touchUpInside)
        addSubview(refreshButton)
        refreshButton.translatesAutoresizingMaskIntoConstraints = false
        refreshButton.topAnchor.constraint(equalTo: bgImageView.topAnchor, constant: 10).isActive = true
        refreshButton.trailingAnchor.constraint(equalTo: bgImageView.trailingAnchor, constant: -10).isActive = true
        refreshButton.widthAnchor.constraint(equalToConstant: 28).isActive = true
        refreshButton.heightAnchor.constraint(equalToConstant: 28).isActive = true

        statusView.isHidden = true
        addSubview(statusView)
        statusView.translatesAutoresizingMaskIntoConstraints = false
        statusView.bottomAnchor.constraint(equalTo: bgImageView.bottomAnchor).isActive = true
        statusView.leadingAnchor.constraint(equalTo: bgImageView.leadingAnchor).isActive = true
        statusView.trailingAnchor.constraint(equalTo: bgImageView.trailingAnchor).isActive = true
        statusView.heightAnchor.constraint(equalToConstant: 28).isActive = true

        statusLabel.textAlignment = .center
        statusLabel.textColor = .white
        statusLabel.font = .systemFont(ofSize: 14)
        statusView.addSubview(statusLabel)
        statusLabel.translatesAutoresizingMaskIntoConstraints = false
        statusLabel.centerXAnchor.constraint(equalTo: statusView.centerXAnchor).isActive = true
        statusLabel.centerYAnchor.constraint(equalTo: statusView.centerYAnchor).isActive = true

        sliderBarView.backgroundColor = UIColor(white: 0.97, alpha: 1)
        sliderBarView.layer.cornerRadius = 4
        addSubview(sliderBarView)
        sliderBarView.translatesAutoresizingMaskIntoConstraints = false
        sliderBarView.topAnchor.constraint(equalTo: bgImageView.bottomAnchor, constant: 10).isActive = true
        sliderBarView.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 10).isActive = true
        sliderBarView.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -10).isActive = true
        sliderBarView.heightAnchor.constraint(equalToConstant: 40).isActive = true

        sliderThumbView.frame = CGRect(x: 2, y: 2, width: 36, height: 36)
        sliderThumbView.backgroundColor = .white
        sliderThumbView.layer.cornerRadius = 4
        sliderThumbView.layer.borderWidth = 1
        sliderThumbView.layer.borderColor = UIColor(white: 0.9, alpha: 1).cgColor
        sliderBarView.addSubview(sliderThumbView)

        let panGesture = UIPanGestureRecognizer(target: self, action: #selector(handlePan(_:)))
        sliderThumbView.addGestureRecognizer(panGesture)
    }

    @objc public func refresh() {
        guard backendVerify != nil else {
            fatalError("backendVerify is required")
        }
        Task { await refreshAsync() }
    }

    private func refreshAsync() async {
        let options = CaptchaOptions(
            type: .slider, width: captchaWidth, height: captchaHeight,
            sliderWidth: sliderWidth, sliderHeight: sliderHeight, precision: precision,
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
            sliderImageView.frame = CGRect(x: 10, y: 10 + Int(sliderY), width: sliderWidth, height: sliderHeight)
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
            sliderImageView.frame.origin.x = currentX + 10
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
                response.success ? handleSuccess() : handleFail()
            } catch {
                showStatus(success: false, message: LocaleMessages.get(locale, key: "error_network"))
                callback?.onError(error)
                callback?.onFail()
            }
        }
    }

    private func handleSuccess() {
        statisticsData.successCount += 1
        showStatus(success: true, message: LocaleMessages.get(locale, key: "slider_success"))
        delegate?.sliderCaptchaDidSucceed(self)
        callback?.onSuccess()
    }

    private func handleFail() {
        statisticsData.failCount += 1
        showStatus(success: false, message: LocaleMessages.get(locale, key: "slider_fail"))
        delegate?.sliderCaptchaDidFail(self)
        callback?.onFail()
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) { [weak self] in self?.refresh() }
    }

    private func showStatus(success: Bool, message: String?) {
        statusView.backgroundColor = success ? UIColor(red: 0.32, green: 0.77, blue: 0.1, alpha: 0.9) : UIColor(red: 0.96, green: 0.13, blue: 0.18, alpha: 0.9)
        statusLabel.text = message ?? (success ? LocaleMessages.get(locale, key: "slider_success") : LocaleMessages.get(locale, key: "slider_fail"))
        statusView.isHidden = false
    }

    public func getData() -> CaptchaData {
        generator.getCaptchaData(type: .slider, sliderX: currentX)
    }

    public func getStatistics() -> CaptchaStatistics { statisticsData.toStatistics() }
    public func resetStatistics() { statisticsData.reset() }
    public func destroy() {}
}
