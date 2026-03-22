Pod::Spec.new do |s|
  s.name             = 'CaptchaPro'
  s.version          = '1.0.0'
  s.summary          = 'A powerful captcha library for iOS'
  s.description      = <<-DESC
CaptchaPro provides slider and click captcha components for iOS applications.
Supports both UIKit and SwiftUI with customizable options.
                       DESC

  s.homepage         = 'https://github.com/saqqdy/captcha-pro'
  s.license          = { :type => 'MIT', :file => 'LICENSE' }
  s.author           = { 'saqqdy' => 'saqqdy@qq.com' }
  s.source           = { :git => 'https://github.com/saqqdy/captcha-pro.git', :tag => s.version.to_s }

  s.ios.deployment_target = '12.0'
  s.swift_version = '5.9'

  s.source_files = 'Sources/**/*.{swift}'
  s.resources = 'Sources/**/*.{xcassets}'

  s.frameworks = 'UIKit', 'CoreGraphics', 'Foundation'

  s.subspec 'Core' do |core|
    core.source_files = 'Sources/Core/**/*.swift'
  end

  s.subspec 'Views' do |views|
    views.source_files = 'Sources/Views/**/*.swift'
    views.dependency 'CaptchaPro/Core'
  end

  s.subspec 'SwiftUI' do |swiftui|
    swiftui.source_files = 'Sources/SwiftUI/**/*.swift'
    swiftui.dependency 'CaptchaPro/Core'
    swiftui.ios.deployment_target = '13.0'
  end

  s.subspec 'Renderers' do |renderers|
    renderers.source_files = 'Sources/Renderers/**/*.swift'
  end
end
