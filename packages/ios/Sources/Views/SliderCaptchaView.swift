import UIKit

/// Slider captcha view delegate
public protocol SliderCaptchaViewDelegate: AnyObject {
    func sliderCaptchaDidSucceed(_ view: SliderCaptchaView)
    func sliderCaptchaDidFail(_ view: SliderCaptchaView)
    func sliderCaptchaDidRefresh(_ view: SliderCaptchaView)
}

/// Slider captcha view
public class SliderCaptchaView: UIView {
    // MARK: - Properties
    private let generator = CaptchaGenerator()

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

    public weak var delegate: SliderCaptchaViewDelegate?

    public var captchaWidth: Int = 300 {
        didSet { refresh() }
    }
    public var captchaHeight: Int = 170 {
        didSet { refresh() }
    }
    public var sliderWidth: Int = 42
    public var sliderHeight: Int = 42
    public var precision: Int = 5
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
        addSubview(bgImageView)
        bgImageView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            bgImageView.topAnchor.constraint(equalTo: topAnchor, constant: 10),
            bgImageView.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 10),
            bgImageView.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -10),
            bgImageView.heightAnchor.constraint(equalToConstant: CGFloat(captchaHeight))
        ])

        // Slider image
        sliderImageView.contentMode = .scaleAspectFill
        sliderImageView.clipsToBounds = true
        addSubview(sliderImageView)
        sliderImageView.translatesAutoresizingMaskIntoConstraints = false
        sliderImageView.widthAnchor.constraint(equalToConstant: CGFloat(sliderWidth)).isActive = true
        sliderImageView.heightAnchor.constraint(equalToConstant: CGFloat(sliderHeight)).isActive = true

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

        // Slider bar
        sliderBarView.backgroundColor = UIColor(white: 0.97, alpha: 1)
        sliderBarView.layer.cornerRadius = 4
        addSubview(sliderBarView)
        sliderBarView.translatesAutoresizingMaskIntoConstraints = false
        sliderBarView.topAnchor.constraint(equalTo: bgImageView.bottomAnchor, constant: 10).isActive = true
        sliderBarView.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 10).isActive = true
        sliderBarView.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -10).isActive = true
        sliderBarView.heightAnchor.constraint(equalToConstant: 40).isActive = true

        // Slider thumb
        sliderThumbView.frame = CGRect(x: 2, y: 2, width: 36, height: 36)
        sliderThumbView.backgroundColor = .white
        sliderThumbView.layer.cornerRadius = 4
        sliderThumbView.layer.borderWidth = 1
        sliderThumbView.layer.borderColor = UIColor(white: 0.9, alpha: 1).cgColor
        sliderBarView.addSubview(sliderThumbView)

        // Add pan gesture
        let panGesture = UIPanGestureRecognizer(target: self, action: #selector(handlePan(_:)))
        sliderThumbView.addGestureRecognizer(panGesture)

        refresh()
    }

    // MARK: - Public Methods
    @objc public func refresh() {
        let result = generator.generate(options: CaptchaOptions(
            type: .slider,
            width: captchaWidth,
            height: captchaHeight,
            sliderWidth: sliderWidth,
            sliderHeight: sliderHeight
        ))

        bgImageView.image = result.bgImage
        sliderImageView.image = result.sliderImage
        targetX = result.targetPoints.first?.x ?? 0
        sliderY = result.sliderY ?? 0
        currentX = 0
        statusView.isHidden = true

        sliderImageView.frame = CGRect(x: 10, y: 10 + Int(sliderY), width: sliderWidth, height: sliderHeight)
        sliderThumbView.frame = CGRect(x: 2, y: 2, width: 36, height: 36)

        delegate?.sliderCaptchaDidRefresh(self)
    }

    // MARK: - Private Methods
    @objc private func handlePan(_ gesture: UIPanGestureRecognizer) {
        let translation = gesture.translation(in: sliderBarView)

        switch gesture.state {
        case .changed:
            let maxX = CGFloat(captchaWidth - sliderWidth)
            currentX = max(0, min(currentX + translation.x, maxX))
            sliderThumbView.frame.origin.x = currentX + 2
            sliderImageView.frame.origin.x = currentX + 10
            gesture.setTranslation(.zero, in: sliderBarView)

        case .ended:
            verify()

        default:
            break
        }
    }

    private func verify() {
        let diff = abs(currentX - targetX)

        if diff <= CGFloat(precision) {
            statusView.backgroundColor = UIColor(red: 0.32, green: 0.77, blue: 0.1, alpha: 0.9)
            statusLabel.text = "验证成功"
            statusView.isHidden = false
            delegate?.sliderCaptchaDidSucceed(self)
        } else {
            statusView.backgroundColor = UIColor(red: 0.96, green: 0.13, blue: 0.18, alpha: 0.9)
            statusLabel.text = "验证失败"
            statusView.isHidden = false
            delegate?.sliderCaptchaDidFail(self)

            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) { [weak self] in
                self?.refresh()
            }
        }
    }
}
