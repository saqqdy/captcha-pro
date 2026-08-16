import UIKit

/// Popup captcha view delegate
public protocol PopupCaptchaViewDelegate: AnyObject {
    func popupCaptchaDidSucceed(_ view: PopupCaptchaView)
    func popupCaptchaDidFail(_ view: PopupCaptchaView)
    func popupCaptchaDidClose(_ view: PopupCaptchaView)
}

/// Popup captcha view — presents slider or click captcha in a modal dialog
public class PopupCaptchaView: UIView {
    // MARK: - Properties
    private var overlayView = UIView()
    private var containerView = UIView()
    private var headerView = UIView()
    private var titleLabel = UILabel()
    private var closeButton = UIButton()
    private var contentView = UIView()

    /// The inner captcha view (slider or click)
    public private(set) var captchaView: UIView?

    public var captchaType: CaptchaType = .slider
    public var title: String = "" {
        didSet { titleLabel.text = title.isEmpty ? LocaleMessages.get(locale, key: "popup_title") : title }
    }
    public var maskClosable: Bool = true
    public var showCloseButton: Bool = true {
        didSet { closeButton.isHidden = !showCloseButton }
    }
    public var autoClose: Bool = true
    public var closeDelay: TimeInterval = 0.5

    public weak var delegate: PopupCaptchaViewDelegate?

    /// Backend verification configuration - Required
    public var backendVerify: BackendVerifyOptions!
    public var locale: CaptchaLocale = .zhCN

    // Captcha config
    public var captchaWidth: Int = 300
    public var captchaHeight: Int = 170
    public var sliderWidth: Int = 42
    public var sliderHeight: Int = 42
    public var clickCount: Int = 3

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
        // Overlay
        overlayView.backgroundColor = UIColor.black.withAlphaComponent(0.5)
        overlayView.alpha = 0
        overlayView.addGestureRecognizer(UITapGestureRecognizer(target: self, action: #selector(overlayTapped)))
        addSubview(overlayView)
        overlayView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            overlayView.topAnchor.constraint(equalTo: topAnchor),
            overlayView.leadingAnchor.constraint(equalTo: leadingAnchor),
            overlayView.trailingAnchor.constraint(equalTo: trailingAnchor),
            overlayView.bottomAnchor.constraint(equalTo: bottomAnchor),
        ])

        // Container
        containerView.backgroundColor = .white
        containerView.layer.cornerRadius = 24
        containerView.clipsToBounds = true
        containerView.layer.shadowColor = UIColor.black.cgColor
        containerView.layer.shadowOpacity = 0.2
        containerView.layer.shadowOffset = CGSize(width: 0, height: 4)
        containerView.layer.shadowRadius = 16
        containerView.alpha = 0
        containerView.transform = CGAffineTransform(scaleX: 0.9, y: 0.9)
        containerView.accessibilityViewIsModal = true
        containerView.accessibilityLabel = title.isEmpty ? LocaleMessages.get(locale, key: "popup_title") : title
        addSubview(containerView)
        containerView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            containerView.centerYAnchor.constraint(equalTo: centerYAnchor),
            containerView.centerXAnchor.constraint(equalTo: centerXAnchor),
            containerView.widthAnchor.constraint(equalToConstant: CGFloat(captchaWidth + 20)),
        ])

        // Header
        headerView.backgroundColor = .white
        containerView.addSubview(headerView)
        headerView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            headerView.topAnchor.constraint(equalTo: containerView.topAnchor),
            headerView.leadingAnchor.constraint(equalTo: containerView.leadingAnchor),
            headerView.trailingAnchor.constraint(equalTo: containerView.trailingAnchor),
            headerView.heightAnchor.constraint(equalToConstant: 44),
        ])

        // Title
        titleLabel.text = title
        titleLabel.font = .systemFont(ofSize: 16, weight: .medium)
        titleLabel.textColor = .darkText
        headerView.addSubview(titleLabel)
        titleLabel.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            titleLabel.leadingAnchor.constraint(equalTo: headerView.leadingAnchor, constant: 16),
            titleLabel.centerYAnchor.constraint(equalTo: headerView.centerYAnchor),
        ])

        // Close button
        closeButton.setTitle("×", for: .normal)
        closeButton.setTitleColor(UIColor(white: 0.4, alpha: 1), for: .normal)
        closeButton.titleLabel?.font = .systemFont(ofSize: 24)
        closeButton.addTarget(self, action: #selector(hide), for: .touchUpInside)
        closeButton.accessibilityLabel = LocaleMessages.get(locale, key: "popup_close")
        headerView.addSubview(closeButton)
        closeButton.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            closeButton.trailingAnchor.constraint(equalTo: headerView.trailingAnchor, constant: -12),
            closeButton.centerYAnchor.constraint(equalTo: headerView.centerYAnchor),
            closeButton.widthAnchor.constraint(equalToConstant: 28),
            closeButton.heightAnchor.constraint(equalToConstant: 28),
        ])

        // Separator
        let separator = UIView()
        separator.backgroundColor = UIColor(white: 0.94, alpha: 1)
        headerView.addSubview(separator)
        separator.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            separator.bottomAnchor.constraint(equalTo: headerView.bottomAnchor),
            separator.leadingAnchor.constraint(equalTo: headerView.leadingAnchor),
            separator.trailingAnchor.constraint(equalTo: headerView.trailingAnchor),
            separator.heightAnchor.constraint(equalToConstant: 0.5),
        ])

        // Content area
        containerView.addSubview(contentView)
        contentView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            contentView.topAnchor.constraint(equalTo: headerView.bottomAnchor),
            contentView.leadingAnchor.constraint(equalTo: containerView.leadingAnchor),
            contentView.trailingAnchor.constraint(equalTo: containerView.trailingAnchor),
            contentView.bottomAnchor.constraint(equalTo: containerView.bottomAnchor),
        ])
    }

    public override func layoutSubviews() {
        super.layoutSubviews()
        // Rounded shadow path matching the card corners.
        containerView.layer.shadowPath = UIBezierPath(
            roundedRect: containerView.bounds,
            cornerRadius: 24
        ).cgPath
    }

    // MARK: - Public
    public func show(in parentView: UIView? = nil) {
        let target = parentView ?? {
            var window: UIView?
            if #available(iOS 13, *) {
                window = UIApplication.shared.connectedScenes
                    .compactMap { $0 as? UIWindowScene }
                    .flatMap { $0.windows }
                    .first { $0.isKeyWindow }
            } else {
                window = UIApplication.shared.keyWindow
            }
            return window ?? self
        }()

        if superview == nil {
            target.addSubview(self)
            translatesAutoresizingMaskIntoConstraints = false
            NSLayoutConstraint.activate([
                topAnchor.constraint(equalTo: target.topAnchor),
                leadingAnchor.constraint(equalTo: target.leadingAnchor),
                trailingAnchor.constraint(equalTo: target.trailingAnchor),
                bottomAnchor.constraint(equalTo: target.bottomAnchor),
            ])
        }

        isHidden = false
        buildCaptchaView()
        titleLabel.text = title.isEmpty ? LocaleMessages.get(locale, key: "popup_title") : title
        containerView.accessibilityLabel = titleLabel.text
        UIAccessibility.post(notification: .screenChanged, argument: containerView)

        UIView.animate(withDuration: 0.25) {
            self.overlayView.alpha = 1
            self.containerView.alpha = 1
            self.containerView.transform = .identity
        }
    }

    @objc public func hide() {
        UIView.animate(withDuration: 0.2, animations: {
            self.overlayView.alpha = 0
            self.containerView.alpha = 0
            self.containerView.transform = CGAffineTransform(scaleX: 0.9, y: 0.9)
        }) { _ in
            self.isHidden = true
            self.captchaView?.removeFromSuperview()
            self.captchaView = nil
            self.delegate?.popupCaptchaDidClose(self)
        }
    }

    public func isVisible() -> Bool {
        return !isHidden
    }

    // MARK: - Private
    private func buildCaptchaView() {
        captchaView?.removeFromSuperview()
        captchaView = nil

        if captchaType == .slider {
            let slider = SliderCaptchaView()
            slider.backendVerify = backendVerify
            slider.locale = locale
            slider.captchaWidth = captchaWidth
            slider.captchaHeight = captchaHeight
            slider.sliderWidth = sliderWidth
            slider.sliderHeight = sliderHeight
            slider.delegate = self
            slider.translatesAutoresizingMaskIntoConstraints = false
            contentView.addSubview(slider)
            NSLayoutConstraint.activate([
                slider.topAnchor.constraint(equalTo: contentView.topAnchor),
                slider.leadingAnchor.constraint(equalTo: contentView.leadingAnchor),
                slider.trailingAnchor.constraint(equalTo: contentView.trailingAnchor),
                slider.bottomAnchor.constraint(equalTo: contentView.bottomAnchor),
            ])
            captchaView = slider
        } else {
            let click = ClickCaptchaView()
            click.backendVerify = backendVerify
            click.locale = locale
            click.captchaWidth = captchaWidth
            click.captchaHeight = captchaHeight
            click.clickCount = clickCount
            click.delegate = self
            click.translatesAutoresizingMaskIntoConstraints = false
            contentView.addSubview(click)
            NSLayoutConstraint.activate([
                click.topAnchor.constraint(equalTo: contentView.topAnchor),
                click.leadingAnchor.constraint(equalTo: contentView.leadingAnchor),
                click.trailingAnchor.constraint(equalTo: contentView.trailingAnchor),
                click.bottomAnchor.constraint(equalTo: contentView.bottomAnchor),
            ])
            captchaView = click
        }
    }

    @objc private func overlayTapped() {
        if maskClosable { hide() }
    }
}

// MARK: - SliderCaptchaViewDelegate
extension PopupCaptchaView: SliderCaptchaViewDelegate {
    public func sliderCaptchaDidSucceed(_ view: SliderCaptchaView) {
        delegate?.popupCaptchaDidSucceed(self)
        if autoClose {
            DispatchQueue.main.asyncAfter(deadline: .now() + closeDelay) { [weak self] in
                self?.hide()
            }
        }
    }

    public func sliderCaptchaDidFail(_ view: SliderCaptchaView) {
        delegate?.popupCaptchaDidFail(self)
    }

    public func sliderCaptchaDidRefresh(_ view: SliderCaptchaView) {}
}

// MARK: - ClickCaptchaViewDelegate
extension PopupCaptchaView: ClickCaptchaViewDelegate {
    public func clickCaptchaDidSucceed(_ view: ClickCaptchaView) {
        delegate?.popupCaptchaDidSucceed(self)
        if autoClose {
            DispatchQueue.main.asyncAfter(deadline: .now() + closeDelay) { [weak self] in
                self?.hide()
            }
        }
    }

    public func clickCaptchaDidFail(_ view: ClickCaptchaView) {
        delegate?.popupCaptchaDidFail(self)
    }

    public func clickCaptchaDidRefresh(_ view: ClickCaptchaView) {}
}
