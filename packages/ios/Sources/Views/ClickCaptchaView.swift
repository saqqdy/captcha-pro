import UIKit

/// Click captcha view delegate
public protocol ClickCaptchaViewDelegate: AnyObject {
    func clickCaptchaDidSucceed(_ view: ClickCaptchaView)
    func clickCaptchaDidFail(_ view: ClickCaptchaView)
    func clickCaptchaDidRefresh(_ view: ClickCaptchaView)
}

/// Click captcha view - Backend verification only
public class ClickCaptchaView: UIView {
    private let generator = CaptchaGenerator()
    private let statisticsData = StatisticsData()

    private var bgImageView = UIImageView()
    private var clickPointViews: [UIView] = []
    private var infoBarView = UIView()
    private var tipLabel = UILabel()
    private var progressLabel = UILabel()
    private var statusView = UIView()
    private var statusLabel = UILabel()
    private var refreshButton = UIButton()

    private var targetPoints: [CaptchaPoint] = []
    private var clickPoints: [CGPoint] = []
    private var clickTexts: [String] = []
    private var clickCharImages: [String] = []
    private var charStackView = UIStackView()

    public weak var delegate: ClickCaptchaViewDelegate?
    public weak var callback: ClickCaptchaCallback?

    public var captchaWidth: Int = 300 { didSet { refresh() } }
    public var captchaHeight: Int = 170 { didSet { refresh() } }
    public var clickCount: Int = 3
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
        bgImageView.isUserInteractionEnabled = true
        addSubview(bgImageView)
        bgImageView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            bgImageView.topAnchor.constraint(equalTo: topAnchor, constant: 10),
            bgImageView.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 10),
            bgImageView.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -10),
            bgImageView.heightAnchor.constraint(equalToConstant: CGFloat(captchaHeight))
        ])

        let tapGesture = UITapGestureRecognizer(target: self, action: #selector(handleTap(_:)))
        bgImageView.addGestureRecognizer(tapGesture)

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

        infoBarView.backgroundColor = UIColor(white: 0.97, alpha: 1)
        infoBarView.layer.cornerRadius = 4
        addSubview(infoBarView)
        infoBarView.translatesAutoresizingMaskIntoConstraints = false
        infoBarView.topAnchor.constraint(equalTo: bgImageView.bottomAnchor, constant: 10).isActive = true
        infoBarView.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 10).isActive = true
        infoBarView.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -10).isActive = true
        infoBarView.heightAnchor.constraint(equalToConstant: 40).isActive = true

        tipLabel.font = .systemFont(ofSize: 14)
        tipLabel.textColor = .darkText
        infoBarView.addSubview(tipLabel)
        tipLabel.translatesAutoresizingMaskIntoConstraints = false
        tipLabel.leadingAnchor.constraint(equalTo: infoBarView.leadingAnchor, constant: 12).isActive = true
        tipLabel.centerYAnchor.constraint(equalTo: infoBarView.centerYAnchor).isActive = true

        progressLabel.font = .systemFont(ofSize: 14)
        progressLabel.textColor = UIColor(red: 0.1, green: 0.57, blue: 0.98, alpha: 1)
        infoBarView.addSubview(progressLabel)
        progressLabel.translatesAutoresizingMaskIntoConstraints = false
        progressLabel.trailingAnchor.constraint(equalTo: infoBarView.trailingAnchor, constant: -12).isActive = true
        progressLabel.centerYAnchor.constraint(equalTo: infoBarView.centerYAnchor).isActive = true

        charStackView.axis = .horizontal
        charStackView.spacing = 4
        charStackView.alignment = .center
        infoBarView.addSubview(charStackView)
        charStackView.translatesAutoresizingMaskIntoConstraints = false
        charStackView.leadingAnchor.constraint(equalTo: tipLabel.trailingAnchor, constant: 8).isActive = true
        charStackView.centerYAnchor.constraint(equalTo: infoBarView.centerYAnchor).isActive = true
        charStackView.heightAnchor.constraint(equalToConstant: 28).isActive = true
    }

    @objc public func refresh() {
        guard backendVerify != nil else {
            fatalError("backendVerify is required")
        }
        Task { await refreshAsync() }
    }

    private func refreshAsync() async {
        clickPointViews.forEach { $0.removeFromSuperview() }
        clickPointViews.removeAll()
        clickPoints.removeAll()

        let options = CaptchaOptions(
            type: .click, width: captchaWidth, height: captchaHeight, clickCount: clickCount,
            backendVerify: backendVerify, locale: locale
        )

        do {
            let result = try await generator.generate(options: options)
            bgImageView.image = result.bgImage
            targetPoints = result.targetPoints
            clickTexts = result.clickTexts ?? []
            clickCharImages = result.clickCharImages ?? []
            statusView.isHidden = true

            charStackView.arrangedSubviews.forEach { $0.removeFromSuperview() }
            let prompt = LocaleMessages.get(locale, key: "click_prompt")
            if clickCharImages.isEmpty {
                tipLabel.text = prompt + clickTexts.joined(separator: " ")
            } else {
                tipLabel.text = prompt
                for src in clickCharImages {
                    let iv = UIImageView()
                    iv.contentMode = .scaleAspectFit
                    iv.backgroundColor = UIColor(red: 0.94, green: 0.97, blue: 1, alpha: 1)
                    iv.layer.cornerRadius = 4
                    iv.widthAnchor.constraint(equalToConstant: 28).isActive = true
                    iv.heightAnchor.constraint(equalToConstant: 28).isActive = true
                    charStackView.addArrangedSubview(iv)
                    Task {
                        if let img = try? await generator.loadImage(from: src) { iv.image = img }
                    }
                }
            }
            progressLabel.text = "0/\(targetCount)"

            delegate?.clickCaptchaDidRefresh(self)
        } catch {
            showStatus(success: false, message: LocaleMessages.get(locale, key: "error_network"))
            callback?.onError(error)
        }
    }

    private var targetCount: Int {
        if !clickCharImages.isEmpty { return clickCharImages.count }
        if !clickTexts.isEmpty { return clickTexts.count }
        return clickCount
    }

    @objc private func handleTap(_ gesture: UITapGestureRecognizer) {
        guard statusView.isHidden, clickPoints.count < targetCount, backendVerify != nil else { return }

        let location = gesture.location(in: bgImageView)
        clickPoints.append(location)
        addClickPointView(at: location, index: clickPoints.count)
        progressLabel.text = "\(clickPoints.count)/\(targetCount)"

        if clickPoints.count == targetCount {
            verify()
        }
    }

    private func verify() {
        statisticsData.totalAttempts += 1
        statisticsData.totalClickCount += clickPoints.count

        let captchaPoints = clickPoints.map { CaptchaPoint(x: $0.x, y: $0.y) }
        let captchaData = generator.getCaptchaData(type: .click, targetPoints: captchaPoints)

        Task {
            do {
                let options = CaptchaOptions(type: .click, backendVerify: backendVerify, locale: locale)
                let response = try await generator.backendVerify(data: captchaData, options: options)
                if response.success {
                    handleSuccess()
                } else {
                    handleFail()
                }
            } catch {
                showStatus(success: false, message: LocaleMessages.get(locale, key: "error_network"))
                callback?.onError(error)
            }
        }
    }

    private func handleSuccess() {
        statisticsData.successCount += 1
        showStatus(success: true, message: LocaleMessages.get(locale, key: "click_success"))
        delegate?.clickCaptchaDidSucceed(self)
        callback?.onSuccess()
    }

    private func handleFail() {
        statisticsData.failCount += 1
        showStatus(success: false, message: LocaleMessages.get(locale, key: "click_fail"))
        delegate?.clickCaptchaDidFail(self)
        callback?.onFail()
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) { [weak self] in self?.refresh() }
    }

    private func addClickPointView(at point: CGPoint, index: Int) {
        let pointView = UIView(frame: CGRect(x: point.x - 12, y: point.y - 12, width: 24, height: 24))
        pointView.backgroundColor = UIColor(red: 0.1, green: 0.57, blue: 0.98, alpha: 0.9)
        pointView.layer.cornerRadius = 12
        pointView.clipsToBounds = true

        let label = UILabel(frame: pointView.bounds)
        label.text = "\(index)"
        label.textColor = .white
        label.font = .boldSystemFont(ofSize: 12)
        label.textAlignment = .center
        pointView.addSubview(label)

        bgImageView.addSubview(pointView)
        clickPointViews.append(pointView)
    }

    private func showStatus(success: Bool, message: String?) {
        statusView.backgroundColor = success
            ? UIColor(red: 0.32, green: 0.77, blue: 0.1, alpha: 0.9)
            : UIColor(red: 0.96, green: 0.13, blue: 0.18, alpha: 0.9)
        statusLabel.text = message ?? (success ? LocaleMessages.get(locale, key: "click_success") : LocaleMessages.get(locale, key: "click_fail"))
        statusView.isHidden = false
    }

    public func getData() -> CaptchaData {
        let captchaPoints = clickPoints.map { CaptchaPoint(x: $0.x, y: $0.y) }
        return generator.getCaptchaData(type: .click, targetPoints: captchaPoints)
    }

    public func getStatistics() -> CaptchaStatistics { statisticsData.toStatistics() }
    public func resetStatistics() { statisticsData.reset() }
}
