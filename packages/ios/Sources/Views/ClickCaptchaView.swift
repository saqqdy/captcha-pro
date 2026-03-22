import UIKit

/// Click captcha view delegate
public protocol ClickCaptchaViewDelegate: AnyObject {
    func clickCaptchaDidSucceed(_ view: ClickCaptchaView)
    func clickCaptchaDidFail(_ view: ClickCaptchaView)
    func clickCaptchaDidRefresh(_ view: ClickCaptchaView)
}

/// Click captcha view
public class ClickCaptchaView: UIView {
    // MARK: - Properties
    private let generator = CaptchaGenerator()

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

    public weak var delegate: ClickCaptchaViewDelegate?

    public var captchaWidth: Int = 300 {
        didSet { refresh() }
    }
    public var captchaHeight: Int = 170 {
        didSet { refresh() }
    }
    public var clickCount: Int = 3
    public var precision: CGFloat = 20
    public var showRefresh: Bool = true {
        didSet { refreshButton.isHidden = !showRefresh }
    }

    // MARK: - Initialization
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

        // Background image
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

        // Add tap gesture
        let tapGesture = UITapGestureRecognizer(target: self, action: #selector(handleTap(_:)))
        bgImageView.addGestureRecognizer(tapGesture)

        // Refresh button
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

        // Status view
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

        // Info bar
        infoBarView.backgroundColor = UIColor(white: 0.97, alpha: 1)
        infoBarView.layer.cornerRadius = 4
        addSubview(infoBarView)
        infoBarView.translatesAutoresizingMaskIntoConstraints = false
        infoBarView.topAnchor.constraint(equalTo: bgImageView.bottomAnchor, constant: 10).isActive = true
        infoBarView.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 10).isActive = true
        infoBarView.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -10).isActive = true
        infoBarView.heightAnchor.constraint(equalToConstant: 40).isActive = true

        // Tip label
        tipLabel.font = .systemFont(ofSize: 14)
        tipLabel.textColor = .darkText
        infoBarView.addSubview(tipLabel)
        tipLabel.translatesAutoresizingMaskIntoConstraints = false
        tipLabel.leadingAnchor.constraint(equalTo: infoBarView.leadingAnchor, constant: 12).isActive = true
        tipLabel.centerYAnchor.constraint(equalTo: infoBarView.centerYAnchor).isActive = true

        // Progress label
        progressLabel.font = .systemFont(ofSize: 14)
        progressLabel.textColor = UIColor(red: 0.1, green: 0.57, blue: 0.98, alpha: 1)
        infoBarView.addSubview(progressLabel)
        progressLabel.translatesAutoresizingMaskIntoConstraints = false
        progressLabel.trailingAnchor.constraint(equalTo: infoBarView.trailingAnchor, constant: -12).isActive = true
        progressLabel.centerYAnchor.constraint(equalTo: infoBarView.centerYAnchor).isActive = true

        refresh()
    }

    // MARK: - Public Methods
    @objc public func refresh() {
        // Clear previous click points
        clickPointViews.forEach { $0.removeFromSuperview() }
        clickPointViews.removeAll()
        clickPoints.removeAll()

        let result = generator.generate(options: CaptchaOptions(
            type: .click,
            width: captchaWidth,
            height: captchaHeight,
            clickCount: clickCount
        ))

        bgImageView.image = result.bgImage
        targetPoints = result.targetPoints
        clickTexts = result.clickTexts
        statusView.isHidden = true

        tipLabel.text = "请依次点击: " + clickTexts.joined(separator: " ")
        progressLabel.text = "0/\(clickCount)"

        delegate?.clickCaptchaDidRefresh(self)
    }

    // MARK: - Private Methods
    @objc private func handleTap(_ gesture: UITapGestureRecognizer) {
        guard statusView.isHidden else { return }

        let location = gesture.location(in: bgImageView)
        let currentTargetIndex = clickPoints.count

        guard currentTargetIndex < clickCount else { return }

        let target = targetPoints[currentTargetIndex]
        let distance = sqrt(pow(location.x - target.x, 2) + pow(location.y - target.y, 2))

        if distance <= precision {
            // Correct click
            clickPoints.append(location)
            addClickPointView(at: location, index: currentTargetIndex)
            progressLabel.text = "\(clickPoints.count)/\(clickCount)"

            if clickPoints.count == clickCount {
                // All points clicked correctly
                showStatus(success: true)
                delegate?.clickCaptchaDidSucceed(self)
            }
        } else {
            // Wrong click
            showStatus(success: false)
            delegate?.clickCaptchaDidFail(self)

            DispatchQueue.main.asyncAfter(deadline: .now() + 1) { [weak self] in
                self?.refresh()
            }
        }
    }

    private func addClickPointView(at point: CGPoint, index: Int) {
        let pointView = UIView(frame: CGRect(x: point.x - 12, y: point.y - 12, width: 24, height: 24))
        pointView.backgroundColor = UIColor(red: 0.1, green: 0.57, blue: 0.98, alpha: 0.9)
        pointView.layer.cornerRadius = 12
        pointView.clipsToBounds = true

        let label = UILabel(frame: pointView.bounds)
        label.text = "\(index + 1)"
        label.textColor = .white
        label.font = .boldSystemFont(ofSize: 12)
        label.textAlignment = .center
        pointView.addSubview(label)

        bgImageView.addSubview(pointView)
        clickPointViews.append(pointView)
    }

    private func showStatus(success: Bool) {
        statusView.backgroundColor = success
            ? UIColor(red: 0.32, green: 0.77, blue: 0.1, alpha: 0.9)
            : UIColor(red: 0.96, green: 0.13, blue: 0.18, alpha: 0.9)
        statusLabel.text = success ? "验证成功" : "验证失败"
        statusView.isHidden = false
    }
}
