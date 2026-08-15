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

    private var captchaAreaView = UIView()
    private var captchaClipView = UIView()
    private var gradientLayer = CAGradientLayer()
    private var bgImageView = UIImageView()
    private var loadingLabel = UILabel()
    private var clickPointViews: [UIView] = []
    private var statusView = UIView()
    private var statusStackView = UIStackView()
    private var statusIconView = UIView()
    private var statusIconLabel = UILabel()
    private var statusTextLabel = UILabel()
    private var refreshButton = UIButton()
    private var infoBarView = UIView()
    private var tipLabel = UILabel()
    private var progressLabel = UILabel()
    private var charStackView = UIStackView()

    private var targetPoints: [CaptchaPoint] = []
    private var clickPoints: [CGPoint] = []
    private var clickTexts: [String] = []
    private var clickCharImages: [String] = []

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
        backgroundColor = .clear

        // Captcha area — shadow carrier
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

        // Clip container
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

        gradientLayer.colors = [
            UIColor(red: 102/255, green: 126/255, blue: 234/255, alpha: 1).cgColor,
            UIColor(red: 118/255, green: 75/255, blue: 162/255, alpha: 1).cgColor,
        ]
        gradientLayer.startPoint = CGPoint(x: 0, y: 0)
        gradientLayer.endPoint = CGPoint(x: 1, y: 1)
        captchaClipView.layer.insertSublayer(gradientLayer, at: 0)

        bgImageView.contentMode = .scaleAspectFill
        bgImageView.clipsToBounds = true
        bgImageView.isUserInteractionEnabled = true
        captchaClipView.addSubview(bgImageView)
        bgImageView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            bgImageView.topAnchor.constraint(equalTo: captchaClipView.topAnchor),
            bgImageView.leadingAnchor.constraint(equalTo: captchaClipView.leadingAnchor),
            bgImageView.trailingAnchor.constraint(equalTo: captchaClipView.trailingAnchor),
            bgImageView.bottomAnchor.constraint(equalTo: captchaClipView.bottomAnchor),
        ])

        let tapGesture = UITapGestureRecognizer(target: self, action: #selector(handleTap(_:)))
        bgImageView.addGestureRecognizer(tapGesture)

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

        // Prompt bar
        infoBarView.backgroundColor = UIColor(red: 247/255, green: 249/255, blue: 250/255, alpha: 1)
        infoBarView.layer.cornerRadius = 16
        infoBarView.layer.borderWidth = 1
        infoBarView.layer.borderColor = UIColor(red: 232/255, green: 232/255, blue: 232/255, alpha: 1).cgColor
        addSubview(infoBarView)
        infoBarView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            infoBarView.topAnchor.constraint(equalTo: captchaAreaView.bottomAnchor, constant: 12),
            infoBarView.leadingAnchor.constraint(equalTo: leadingAnchor),
            infoBarView.trailingAnchor.constraint(equalTo: trailingAnchor),
            infoBarView.heightAnchor.constraint(equalToConstant: 56),
        ])

        tipLabel.font = .systemFont(ofSize: 14)
        tipLabel.textColor = UIColor(white: 0.4, alpha: 1)
        infoBarView.addSubview(tipLabel)
        tipLabel.translatesAutoresizingMaskIntoConstraints = false
        tipLabel.leadingAnchor.constraint(equalTo: infoBarView.leadingAnchor, constant: 12).isActive = true
        tipLabel.centerYAnchor.constraint(equalTo: infoBarView.centerYAnchor).isActive = true

        progressLabel.font = .systemFont(ofSize: 14)
        progressLabel.textColor = UIColor(red: 25/255, green: 145/255, blue: 250/255, alpha: 1)
        infoBarView.addSubview(progressLabel)
        progressLabel.translatesAutoresizingMaskIntoConstraints = false
        progressLabel.trailingAnchor.constraint(equalTo: infoBarView.trailingAnchor, constant: -12).isActive = true
        progressLabel.centerYAnchor.constraint(equalTo: infoBarView.centerYAnchor).isActive = true

        charStackView.axis = .horizontal
        charStackView.spacing = 6
        charStackView.alignment = .center
        infoBarView.addSubview(charStackView)
        charStackView.translatesAutoresizingMaskIntoConstraints = false
        charStackView.leadingAnchor.constraint(equalTo: tipLabel.trailingAnchor, constant: 8).isActive = true
        charStackView.centerYAnchor.constraint(equalTo: infoBarView.centerYAnchor).isActive = true
        charStackView.heightAnchor.constraint(equalToConstant: 28).isActive = true
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
        clickPointViews.forEach { $0.removeFromSuperview() }
        clickPointViews.removeAll()
        clickPoints.removeAll()
        loadingLabel.text = LocaleMessages.get(locale, key: "loading")

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
            tipLabel.text = prompt
            if clickCharImages.isEmpty {
                for char in clickTexts {
                    let cell = makeCharCell()
                    let label = UILabel()
                    label.text = char
                    label.textColor = .white
                    label.font = .systemFont(ofSize: 16, weight: .medium)
                    label.textAlignment = .center
                    label.translatesAutoresizingMaskIntoConstraints = false
                    cell.addSubview(label)
                    NSLayoutConstraint.activate([
                        label.centerXAnchor.constraint(equalTo: cell.centerXAnchor),
                        label.centerYAnchor.constraint(equalTo: cell.centerYAnchor),
                    ])
                    charStackView.addArrangedSubview(cell)
                }
            } else {
                for src in clickCharImages {
                    let cell = makeCharCell()
                    let iv = UIImageView()
                    iv.contentMode = .scaleAspectFit
                    iv.translatesAutoresizingMaskIntoConstraints = false
                    cell.addSubview(iv)
                    NSLayoutConstraint.activate([
                        iv.topAnchor.constraint(equalTo: cell.topAnchor),
                        iv.leadingAnchor.constraint(equalTo: cell.leadingAnchor),
                        iv.trailingAnchor.constraint(equalTo: cell.trailingAnchor),
                        iv.bottomAnchor.constraint(equalTo: cell.bottomAnchor),
                    ])
                    charStackView.addArrangedSubview(cell)
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

    private func makeCharCell() -> UIView {
        let cell = UIView()
        cell.translatesAutoresizingMaskIntoConstraints = false
        cell.layer.cornerRadius = 8
        cell.layer.masksToBounds = true
        let grad = CAGradientLayer()
        grad.colors = [
            UIColor(red: 102/255, green: 126/255, blue: 234/255, alpha: 1).cgColor,
            UIColor(red: 118/255, green: 75/255, blue: 162/255, alpha: 1).cgColor,
        ]
        grad.startPoint = CGPoint(x: 0, y: 0)
        grad.endPoint = CGPoint(x: 1, y: 1)
        grad.frame = CGRect(x: 0, y: 0, width: 28, height: 28)
        cell.layer.insertSublayer(grad, at: 0)
        cell.widthAnchor.constraint(equalToConstant: 28).isActive = true
        cell.heightAnchor.constraint(equalToConstant: 28).isActive = true
        return cell
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
                    handleSuccess(verifiedAt: response.verifiedAt)
                } else {
                    handleFail()
                }
            } catch {
                showStatus(success: false, message: LocaleMessages.get(locale, key: "error_network"))
                callback?.onError(error)
            }
        }
    }

    private func handleSuccess(verifiedAt: Int?) {
        statisticsData.successCount += 1
        showStatus(success: true, message: LocaleMessages.get(locale, key: "click_success"))
        delegate?.clickCaptchaDidSucceed(self)
        callback?.onSuccess(data: VerifyResult(verifiedAt: verifiedAt))
    }

    private func handleFail() {
        statisticsData.failCount += 1
        showStatus(success: false, message: LocaleMessages.get(locale, key: "click_fail"))
        delegate?.clickCaptchaDidFail(self)
        callback?.onFail()
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) { [weak self] in self?.refresh() }
    }

    private func addClickPointView(at point: CGPoint, index: Int) {
        let size: CGFloat = 24
        let pointView = UIView(frame: CGRect(x: point.x - size / 2, y: point.y - size / 2, width: size, height: size))
        pointView.backgroundColor = UIColor(red: 25/255, green: 145/255, blue: 250/255, alpha: 1)
        pointView.layer.cornerRadius = size / 2
        pointView.layer.borderWidth = 3
        pointView.layer.borderColor = UIColor.white.cgColor
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
        statusIconView.backgroundColor = success
            ? UIColor(red: 82/255, green: 196/255, blue: 26/255, alpha: 0.85)
            : UIColor(red: 255/255, green: 77/255, blue: 79/255, alpha: 0.85)
        statusIconLabel.text = success ? "✓" : "✕"
        statusTextLabel.text = message ?? (success ? LocaleMessages.get(locale, key: "click_success") : LocaleMessages.get(locale, key: "click_fail"))
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
        let captchaPoints = clickPoints.map { CaptchaPoint(x: $0.x, y: $0.y) }
        return generator.getCaptchaData(type: .click, targetPoints: captchaPoints)
    }

    public func getStatistics() -> CaptchaStatistics { statisticsData.toStatistics() }
    public func resetStatistics() { statisticsData.reset() }
}
