import SwiftUI
import UIKit

// MARK: - UIKit Dynamic Colors

extension UIColor {
    // Slider colors
    static let captchaSliderBarBg = UIColor { traitCollection in
        traitCollection.userInterfaceStyle == .dark
            ? UIColor(red: 31/255, green: 31/255, blue: 31/255, alpha: 1)
            : UIColor(red: 247/255, green: 249/255, blue: 250/255, alpha: 1)
    }

    static let captchaSliderHintText = UIColor { traitCollection in
        traitCollection.userInterfaceStyle == .dark
            ? UIColor(red: 170/255, green: 170/255, blue: 170/255, alpha: 1)
            : UIColor(red: 102/255, green: 102/255, blue: 102/255, alpha: 1)
    }

    static let captchaSliderThumbBg = UIColor { traitCollection in
        traitCollection.userInterfaceStyle == .dark
            ? UIColor(red: 42/255, green: 42/255, blue: 42/255, alpha: 1)
            : UIColor.white
    }

    static let captchaSliderThumbBorder = UIColor { traitCollection in
        traitCollection.userInterfaceStyle == .dark
            ? UIColor(red: 58/255, green: 58/255, blue: 58/255, alpha: 1)
            : UIColor(red: 225/255, green: 228/255, blue: 232/255, alpha: 1)
    }

    // Prompt bar colors
    static let captchaPromptBarBg = UIColor { traitCollection in
        traitCollection.userInterfaceStyle == .dark
            ? UIColor(red: 31/255, green: 31/255, blue: 31/255, alpha: 1)
            : UIColor(red: 247/255, green: 249/255, blue: 250/255, alpha: 1)
    }

    static let captchaPromptBarBorder = UIColor { traitCollection in
        traitCollection.userInterfaceStyle == .dark
            ? UIColor(red: 58/255, green: 58/255, blue: 58/255, alpha: 1)
            : UIColor(red: 232/255, green: 232/255, blue: 232/255, alpha: 1)
    }

    static let captchaPromptText = UIColor { traitCollection in
        traitCollection.userInterfaceStyle == .dark
            ? UIColor(red: 170/255, green: 170/255, blue: 170/255, alpha: 1)
            : UIColor(red: 102/255, green: 102/255, blue: 102/255, alpha: 1)
    }

    // Refresh button colors
    static let captchaRefreshBtnBg = UIColor { traitCollection in
        traitCollection.userInterfaceStyle == .dark
            ? UIColor(red: 60/255, green: 60/255, blue: 60/255, alpha: 0.9)
            : UIColor.white.withAlphaComponent(0.9)
    }

    static let captchaRefreshIcon = UIColor { traitCollection in
        traitCollection.userInterfaceStyle == .dark
            ? UIColor(red: 170/255, green: 170/255, blue: 170/255, alpha: 1)
            : UIColor(red: 102/255, green: 102/255, blue: 102/255, alpha: 1)
    }

    // Status overlay colors
    static let captchaStatusOverlayBg = UIColor { traitCollection in
        traitCollection.userInterfaceStyle == .dark
            ? UIColor.black.withAlphaComponent(0.6)
            : UIColor.white.withAlphaComponent(0.75)
    }

    static let captchaSuccessText = UIColor { traitCollection in
        traitCollection.userInterfaceStyle == .dark
            ? UIColor(red: 92/255, green: 184/255, blue: 92/255, alpha: 1)
            : UIColor(red: 56/255, green: 158/255, blue: 13/255, alpha: 1)
    }

    static let captchaFailText = UIColor { traitCollection in
        traitCollection.userInterfaceStyle == .dark
            ? UIColor(red: 255/255, green: 120/255, blue: 117/255, alpha: 1)
            : UIColor(red: 207/255, green: 19/255, blue: 34/255, alpha: 1)
    }

    static let captchaSuccessIconBg = UIColor { traitCollection in
        traitCollection.userInterfaceStyle == .dark
            ? UIColor(red: 82/255, green: 196/255, blue: 26/255, alpha: 0.9)
            : UIColor(red: 82/255, green: 196/255, blue: 26/255, alpha: 0.85)
    }

    static let captchaFailIconBg = UIColor { traitCollection in
        traitCollection.userInterfaceStyle == .dark
            ? UIColor(red: 255/255, green: 77/255, blue: 79/255, alpha: 0.9)
            : UIColor(red: 255/255, green: 77/255, blue: 79/255, alpha: 0.85)
    }

    // Popup colors
    static let captchaPopupCard = UIColor { traitCollection in
        traitCollection.userInterfaceStyle == .dark
            ? UIColor(red: 31/255, green: 31/255, blue: 31/255, alpha: 1)
            : UIColor.white
    }

    static let captchaPopupTitle = UIColor { traitCollection in
        traitCollection.userInterfaceStyle == .dark
            ? UIColor(red: 238/255, green: 238/255, blue: 238/255, alpha: 1)
            : UIColor(red: 51/255, green: 51/255, blue: 51/255, alpha: 1)
    }

    static let captchaPopupClose = UIColor { traitCollection in
        traitCollection.userInterfaceStyle == .dark
            ? UIColor(red: 170/255, green: 170/255, blue: 170/255, alpha: 1)
            : UIColor(red: 153/255, green: 153/255, blue: 153/255, alpha: 1)
    }

    static let captchaPopupSeparator = UIColor { traitCollection in
        traitCollection.userInterfaceStyle == .dark
            ? UIColor(red: 58/255, green: 58/255, blue: 58/255, alpha: 1)
            : UIColor(red: 238/255, green: 238/255, blue: 238/255, alpha: 1)
    }

    static let captchaPopupMask = UIColor { traitCollection in
        traitCollection.userInterfaceStyle == .dark
            ? UIColor.black.withAlphaComponent(0.7)
            : UIColor.black.withAlphaComponent(0.5)
    }
}

// MARK: - SwiftUI Color Bridge

extension Color {
    static let captchaSliderBarBg = Color(UIColor.captchaSliderBarBg)
    static let captchaSliderHintText = Color(UIColor.captchaSliderHintText)
    static let captchaSliderThumbBg = Color(UIColor.captchaSliderThumbBg)
    static let captchaSliderThumbBorder = Color(UIColor.captchaSliderThumbBorder)

    static let captchaPromptBarBg = Color(UIColor.captchaPromptBarBg)
    static let captchaPromptBarBorder = Color(UIColor.captchaPromptBarBorder)
    static let captchaPromptText = Color(UIColor.captchaPromptText)

    static let captchaRefreshBtnBg = Color(UIColor.captchaRefreshBtnBg)
    static let captchaRefreshIcon = Color(UIColor.captchaRefreshIcon)

    static let captchaStatusOverlayBg = Color(UIColor.captchaStatusOverlayBg)
    static let captchaSuccessText = Color(UIColor.captchaSuccessText)
    static let captchaFailText = Color(UIColor.captchaFailText)
    static let captchaSuccessIconBg = Color(UIColor.captchaSuccessIconBg)
    static let captchaFailIconBg = Color(UIColor.captchaFailIconBg)

    static let captchaPopupCard = Color(UIColor.captchaPopupCard)
    static let captchaPopupTitle = Color(UIColor.captchaPopupTitle)
    static let captchaPopupClose = Color(UIColor.captchaPopupClose)
    static let captchaPopupSeparator = Color(UIColor.captchaPopupSeparator)
    static let captchaPopupMask = Color(UIColor.captchaPopupMask)
}
