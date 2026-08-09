# 智能无感验证

基于风险评估的隐形验证。追踪并分析用户行为，仅在风险分数超过阈值时显示滑动或点选挑战。

## 示例

```javascript
import { InvisibleCaptcha } from '@captcha-pro/core'

const captcha = new InvisibleCaptcha({
  el: '#submit-btn',
  trigger: 'click',
  riskAssessment: {
    threshold: 0.7, // 风险分数 > 0.7 时显示验证码
    behaviorCheck: {
      minInteractionTime: 500,
      trackAnalysis: true
    }
  },
  challengeType: 'slider', // 'slider' | 'click'
  onChallenge: () => console.log('显示验证码挑战...'),
  onSuccess: () => form.submit(),
  onFail: () => console.log('验证失败')
})

const score = captcha.getRiskScore()
```

## 选项

| 参数 | 类型 | 默认值 | 描述 |
|------|------|---------|------|
| `el` | `string \| HTMLElement` | - | 触发元素或选择器 |
| `trigger` | `'click' \| 'submit' \| 'focus'` | `'click'` | 触发事件 |
| `riskAssessment` | `RiskAssessmentOptions` | - | 风险评估配置 |
| `challengeType` | `'slider' \| 'click'` | `'slider'` | 挑战验证码类型 |
| `challengeOptions` | `object` | - | 挑战验证码配置 |
| `onChallenge` | `() => void` | - | 显示挑战时回调 |
| `onSuccess` | `() => void` | - | 验证成功回调 |
| `onFail` | `() => void` | - | 验证失败回调 |

## 实例方法

| 方法 | 描述 |
|------|------|
| `getRiskScore()` | 获取当前风险分数（0-1） |
| `showChallenge()` | 手动显示挑战 |
| `destroy()` | 销毁实例 |
