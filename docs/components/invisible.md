# Invisible Captcha

Risk-based invisible verification. Behavior is tracked and analyzed; a slider or click challenge is shown only when the risk score exceeds a threshold.

## Example

```javascript
import { InvisibleCaptcha } from '@captcha-pro/core'

const captcha = new InvisibleCaptcha({
  el: '#submit-btn',
  trigger: 'click',
  riskAssessment: {
    threshold: 0.7, // Show challenge if risk score > 0.7
    behaviorCheck: {
      minInteractionTime: 500,
      trackAnalysis: true
    }
  },
  challengeType: 'slider', // 'slider' | 'click'
  onChallenge: () => console.log('Showing captcha challenge...'),
  onSuccess: () => form.submit(),
  onFail: () => console.log('Verification failed')
})

const score = captcha.getRiskScore()
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `el` | `string \| HTMLElement` | - | Trigger element or selector |
| `trigger` | `'click' \| 'submit' \| 'focus'` | `'click'` | Trigger event |
| `riskAssessment` | `RiskAssessmentOptions` | - | Risk assessment config |
| `challengeType` | `'slider' \| 'click'` | `'slider'` | Challenge captcha type |
| `challengeOptions` | `object` | - | Options for challenge captcha |
| `onChallenge` | `() => void` | - | Called when challenge is shown |
| `onSuccess` | `() => void` | - | Success callback |
| `onFail` | `() => void` | - | Fail callback |

## Instance Methods

| Method | Description |
|--------|-------------|
| `getRiskScore()` | Get current risk score (0-1) |
| `showChallenge()` | Manually show challenge |
| `destroy()` | Destroy instance |
