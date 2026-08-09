import { CaptchaGenerator } from './server/node/src/index'

const gen = new CaptchaGenerator()

// Test slider captcha
const sliderResult = gen.generateSlider()
const bgSize = Buffer.from(sliderResult.response.bgImage.split(',')[1], 'base64').length
const sliderSize = Buffer.from(sliderResult.response.sliderImage.split(',')[1], 'base64').length

console.info('=== Slider Captcha ===')
console.info('Background image size:', bgSize, `bytes (~${  Math.round(bgSize/1024)  }KB)`)
console.info('Slider image size:', sliderSize, `bytes (~${  Math.round(sliderSize/1024)  }KB)`)
console.info('Total base64 string length:', (sliderResult.response.bgImage.length + sliderResult.response.sliderImage.length), 'chars')
console.info('Default dimensions: 300x170 (bg), 42x42 (slider)')

// Test click captcha
const clickResult = gen.generateClick()
const clickBgSize = Buffer.from(clickResult.response.bgImage.split(',')[1], 'base64').length

console.info('\n=== Click Captcha ===')
console.info('Background image size:', clickBgSize, `bytes (~${  Math.round(clickBgSize/1024)  }KB)`)
console.info('Total base64 string length:', clickResult.response.bgImage.length, 'chars')
console.info('Default dimensions: 300x170')
