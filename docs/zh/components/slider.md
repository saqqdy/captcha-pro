# 滑动拼图验证码

随机形状（方形/三角形/梯形/五边形）与随机旋转的迷惑坑位的拼图验证。

## 示例

```javascript
import { SliderCaptcha } from 'captcha-pro'

const captcha = new SliderCaptcha({
  el: '#slider-captcha',
  width: 300,
  height: 170,
  precision: 5,
  showRefresh: true,
  onSuccess: () => console.log('验证通过!'),
  onFail: () => console.log('验证失败!')
})

const data = captcha.getData()
console.log('目标位置:', data.target)
```

## 选项

| 参数 | 类型 | 默认值 | 描述 |
|------|------|---------|------|
| `el` | `string \| HTMLElement` | - | 容器元素或选择器 |
| `bgImage` | `string` | - | 背景图片 URL |
| `sliderImage` | `string` | - | 滑块图片 URL |
| `width` | `number` | `300` | 容器宽度 |
| `height` | `number` | `170` | 容器高度 |
| `sliderWidth` | `number` | `42` | 滑块宽度 |
| `sliderHeight` | `number` | `42` | 滑块高度 |
| `precision` | `number` | `5` | 验证精度（像素） |
| `showRefresh` | `boolean` | `true` | 显示刷新按钮 |
| `className` | `string` | `'captcha-slider'` | 自定义类名 |
| `verifyMode` | `'frontend' \| 'backend'` | `'frontend'` | 验证模式 |
| `backendVerify` | `BackendVerifyOptions` | - | 后端验证配置 |
| `security` | `SecurityOptions` | - | 安全选项 |
| `onSuccess` | `() => void` | - | 验证成功回调 |
| `onFail` | `() => void` | - | 验证失败回调 |
| `onRefresh` | `() => void` | - | 刷新回调 |

`BackendVerifyOptions` 与 `SecurityOptions` 详见 [API 选项](/zh/api/options)。

## 实例方法

| 方法 | 描述 |
|------|------|
| `verify(data)` | 手动验证 |
| `reset()` | 重置验证码状态 |
| `refresh()` | 生成新的验证码 |
| `destroy()` | 销毁验证码实例 |
| `getData()` | 获取验证码数据 |
| `getSignedData()` | 获取带签名的数据用于后端验证 |
| `getStatistics()` | 获取验证统计 |
| `resetStatistics()` | 重置统计数据 |
