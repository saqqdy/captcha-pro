import { CaptchaGenerator } from './server/node/src/index'

const gen = new CaptchaGenerator()

// Test slider captcha
const sliderResult = gen.generateSlider()
const bgSize = Buffer.from(sliderResult.response.bgImage.split(',')[1], 'base64').length
const sliderSize = Buffer.from(sliderResult.response.sliderImage.split(',')[1], 'base64').length

console.log('=== Slider Captcha ===')
console.log('Background image size:', bgSize, `bytes (~${  Math.round(bgSize/1024)  }KB)`)
console.log('Slider image size:', sliderSize, `bytes (~${  Math.round(sliderSize/1024)  }KB)`)
console.log('Total base64 string length:', (sliderResult.response.bgImage.length + sliderResult.response.sliderImage.length), 'chars')
console.log('Default dimensions: 300x170 (bg), 42x42 (slider)')

// Test click captcha
const clickResult = gen.generateClick()
const clickBgSize = Buffer.from(clickResult.response.bgImage.split(',')[1], 'base64').length

console.log('\n=== Click Captcha ===')
console.log('Background image size:', clickBgSize, `bytes (~${  Math.round(clickBgSize/1024)  }KB)`)
console.log('Total base64 string length:', clickResult.response.bgImage.length, 'chars')
console.log('Default dimensions: 300x170')
